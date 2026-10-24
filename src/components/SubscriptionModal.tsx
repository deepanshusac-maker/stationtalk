'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { isUserPremium, setUserPremium } from '@/lib/anonymousNames';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, callback: (response: unknown) => void) => void;
    };
  }
}

function subscribeToPremium(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('stationtalk_premium_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('stationtalk_premium_change', callback);
  };
}

function getPremiumSnapshot(): boolean {
  return isUserPremium();
}

function getServerSnapshot(): boolean {
  return false;
}

// Set to true to display the "In Development Mode" banner and pause real payments
const IS_DEV_MODE = true;

export function SubscriptionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isPremium = useSyncExternalStore(
    subscribeToPremium,
    getPremiumSnapshot,
    getServerSnapshot
  );

  // Dynamically load Razorpay checkout script
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.getElementById('razorpay-checkout-script')) return;

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setErrorMessage(null);
      setSuccessMessage(null);
    };
    window.addEventListener('stationtalk_open_subscription_modal', handleOpen);
    return () => window.removeEventListener('stationtalk_open_subscription_modal', handleOpen);
  }, []);

  const handleSubscribe = useCallback(async () => {
    if (IS_DEV_MODE) {
      setErrorMessage('Premium subscriptions are currently in development mode. Real payments are paused.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const peerId =
      sessionStorage.getItem('stationtalk_peer_id') ||
      `peer-${Math.random().toString(36).substring(2, 10)}`;

    try {
      // Step 1: Create Order on server
      const orderRes = await fetch('/api/subscription/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peerId }),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create subscription order');
      }

      const orderData = await orderRes.json();

      // Step 2: If live Razorpay client is available and not mock mode
      if (!orderData.isTestMode && window.Razorpay && orderData.keyId) {
        const options: RazorpayOptions = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'StationTalk',
          description: 'Premium Girls Filter (1 Month)',
          order_id: orderData.orderId,
          handler: async (response: RazorpayResponse) => {
            try {
              // Step 3: Verify payment signature with server
              const verifyRes = await fetch('/api/subscription/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  peerId,
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                }),
              });

              if (!verifyRes.ok) throw new Error('Payment verification failed');

              setUserPremium(true);
              setSuccessMessage('Payment verified! Girls-Only Filter is now active.');
              setTimeout(() => setIsOpen(false), 2000);
            } catch (err) {
              setErrorMessage('Payment verification failed. Please contact support.');
              console.error(err);
            } finally {
              setIsProcessing(false);
            }
          },
          theme: {
            color: '#4f46e5',
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (err: unknown) => {
          console.warn('Razorpay payment failed:', err);
          setErrorMessage('Payment was not completed. Please try again.');
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Step 2b: Sandbox / Instant Simulation Mode
        // Automatically completes verification for seamless testing
        const verifyRes = await fetch('/api/subscription/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            peerId,
            orderId: orderData.orderId,
            paymentId: `pay_mock_${Date.now()}`,
            signature: 'mock_signature',
          }),
        });

        if (!verifyRes.ok) throw new Error('Sandbox verification failed');

        setUserPremium(true);
        setSuccessMessage('Sandbox payment verified! Girls Filter unlocked.');
        setTimeout(() => setIsOpen(false), 1500);
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setErrorMessage((err as Error).message || 'Payment initiation failed.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleCancelSubscription = useCallback(() => {
    setUserPremium(false);
    setIsOpen(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white border border-slate-200/90 rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl glass-specular max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-modal-title"
      >
        {/* Mobile Swipe / Sheet Handle */}
        <div className="sm:hidden w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono uppercase tracking-wider mb-1.5 font-bold">
              <span>🛠️ IN DEVELOPMENT MODE</span>
            </div>
            <h2 id="subscription-modal-title" className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Match With Girls Only
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Connect exclusively with female co-passengers in 1:1 voice chat.
            </p>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* In Development Mode Alert Box */}
        <div className="mb-5 p-4 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-start gap-3 text-amber-900 shadow-sm">
          <span className="text-2xl shrink-0">🚧</span>
          <div className="text-xs space-y-1">
            <p className="font-extrabold text-amber-950 text-sm">
              Premium is in Development Mode
            </p>
            <p className="text-amber-900/90 leading-relaxed">
              The Girls-Only matching filter and payment gateway are currently in development mode. Real payment processing will go live soon!
            </p>
          </div>
        </div>

        {/* Error / Success Banners */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
            ⚠️ {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold">
            ✓ {successMessage}
          </div>
        )}

        {/* Pricing Card */}
        <div className="mb-5 p-5 rounded-2xl bg-gradient-to-br from-indigo-500/[0.08] via-teal-500/[0.04] to-transparent border border-indigo-200">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                ₹99
              </span>
              <span className="text-xs font-mono text-slate-500 ml-1">/ month</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200">
              UNLIMITED 1:1
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Cancel anytime with 1 click. Zero identity logging.
          </p>
        </div>

        {/* Feature List */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
              ✓
            </span>
            <span>
              <strong className="text-slate-900">Girls-Only Filter:</strong> Queue pairs you specifically with female travelers.
            </span>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
              ✓
            </span>
            <span>
              <strong className="text-slate-900">Priority Dispatch:</strong> Skip regular queues with sub-second pairing.
            </span>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
              ✓
            </span>
            <span>
              <strong className="text-slate-900">Unlimited ⏭ Skips:</strong> Move to the next person anytime with zero cooldowns.
            </span>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0 text-[10px]">
              ✓
            </span>
            <span>
              <strong className="text-slate-900">100% Anonymous:</strong> No real name or phone number shown to your match.
            </span>
          </div>
        </div>

        {/* Razorpay Badges */}
        <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500 mb-5 pb-3 border-b border-slate-200/80">
          <span>🔒 Secured via Razorpay</span>
          <span>•</span>
          <span>UPI / GPay / PhonePe / Cards</span>
        </div>

        {/* Action Button */}
        {isPremium ? (
          <div className="space-y-2">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs font-bold text-emerald-800">
              💎 Premium Active — Girls Filter Enabled!
            </div>
            <button
              onClick={handleCancelSubscription}
              className="w-full py-2.5 text-slate-500 hover:text-red-600 text-xs font-mono transition-colors"
            >
              Downgrade to Free Plan
            </button>
          </div>
        ) : IS_DEV_MODE ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full py-3.5 bg-slate-100 border border-slate-200 text-slate-600 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200/70 transition-all cursor-not-allowed"
            >
              <span>🚧 Feature in Development — Coming Soon</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 text-slate-600 hover:text-slate-900 text-xs font-medium text-center transition-colors"
            >
              Close & Continue Free 1:1 Voice Chat
            </button>
          </div>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full py-3.5 bg-indigo-600 text-white font-extrabold text-sm rounded-2xl hover:bg-indigo-500 transition-all shadow-[0_10px_25px_-5px_rgba(79,70,229,0.35)] hover:shadow-[0_15px_30px_-5px_rgba(79,70,229,0.5)] active:scale-95 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-indigo-400/40"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Connecting to Razorpay...
              </span>
            ) : (
              <>
                <span>🚀 Unlock Girls Filter for ₹99/mo</span>
                <span className="text-xs">➔</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function openSubscriptionModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('stationtalk_open_subscription_modal'));
  }
}
