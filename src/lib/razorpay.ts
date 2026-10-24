import Razorpay from 'razorpay';
import crypto from 'crypto';
import { persistSubscriptionToSupabase, querySubscriptionFromSupabase } from './supabase';

export interface SubscriptionRecord {
  peerId: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  createdAt: number;
  expiresAt: number; // 30 days from creation
}

interface SubscriptionStore {
  subscriptions: Map<string, SubscriptionRecord>; // peerId -> record
  claimedPaymentIds: Set<string>; // paymentId -> prevents replay across multiple peerIds
}

declare global {
  var __stationtalk_subscriptions: SubscriptionStore | undefined;
}

function getStore(): SubscriptionStore {
  if (!globalThis.__stationtalk_subscriptions) {
    globalThis.__stationtalk_subscriptions = {
      subscriptions: new Map(),
      claimedPaymentIds: new Set(),
    };
  }
  if (!globalThis.__stationtalk_subscriptions.claimedPaymentIds) {
    globalThis.__stationtalk_subscriptions.claimedPaymentIds = new Set();
  }
  return globalThis.__stationtalk_subscriptions;
}

export function isRazorpayConfigured(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return Boolean(keyId && keySecret);
}

export function getRazorpayClient(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Creates a Razorpay Order for ₹99 (9900 paise).
 * If test credentials are not set, falls back to a sandbox test order so development works seamlessly.
 */
export async function createSubscriptionOrder(params: {
  peerId: string;
  amountInPaise?: number; // defaults to 9900 (₹99)
}) {
  const amount = params.amountInPaise || 9900;
  const receipt = `st_${params.peerId.slice(0, 10)}_${Date.now()}`;
  const client = getRazorpayClient();

  if (client) {
    const order = await client.orders.create({
      amount,
      currency: 'INR',
      receipt,
      notes: {
        peerId: params.peerId,
        plan: 'premium_girls_filter_99',
      },
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      isTestMode: false,
    };
  }

  // Sandbox fallback for local dev when keys haven't been plugged in yet
  const fallbackOrderId = `order_mock_${crypto.randomBytes(8).toString('hex')}`;
  return {
    orderId: fallbackOrderId,
    amount,
    currency: 'INR',
    keyId: 'rzp_test_placeholder',
    isTestMode: true,
  };
}

/**
 * Verifies Razorpay payment signature using constant-time HMAC SHA256 comparison.
 */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    // SEC-04 FIX: Mock sandbox orders allowed ONLY during automated unit tests
    if (process.env.NODE_ENV === 'test' && params.orderId.startsWith('order_mock_')) {
      return true;
    }
    return false;
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest('hex');

  // SEC-05 FIX: Constant-time comparison to prevent timing side-channel attacks
  const expectedBuf = Buffer.from(generatedSignature, 'utf8');
  const providedBuf = Buffer.from(params.signature, 'utf8');
  if (expectedBuf.length !== providedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}

/**
 * Checks if a payment ID has already been redeemed by another peerId (replay prevention).
 */
export function isPaymentAlreadyClaimed(paymentId: string, currentPeerId: string): boolean {
  const store = getStore();
  // Check if claimed by another peer in memory
  for (const record of store.subscriptions.values()) {
    if (record.paymentId === paymentId && record.peerId !== currentPeerId) {
      return true;
    }
  }
  return false;
}

/**
 * Records an active subscription for a user.
 */
export async function recordSubscription(params: {
  peerId: string;
  orderId: string;
  paymentId: string;
  amount?: number;
}): Promise<SubscriptionRecord> {
  const store = getStore();
  store.claimedPaymentIds.add(params.paymentId);
  const now = Date.now();
  const expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days valid

  const record: SubscriptionRecord = {
    peerId: params.peerId,
    orderId: params.orderId,
    paymentId: params.paymentId,
    amount: params.amount || 9900,
    currency: 'INR',
    createdAt: now,
    expiresAt,
  };

  store.subscriptions.set(params.peerId, record);

  // Asynchronously persist to Supabase database
  await persistSubscriptionToSupabase({
    peerId: params.peerId,
    orderId: params.orderId,
    paymentId: params.paymentId,
    amount: record.amount,
    expiresAt,
  }).catch((err) => console.warn('Supabase persist note:', err));

  return record;
}

/**
 * Checks if a given peerId has an active, unexpired subscription.
 */
export async function isSubscriptionActive(peerId: string): Promise<boolean> {
  const store = getStore();
  const record = store.subscriptions.get(peerId);
  if (record) {
    if (Date.now() > record.expiresAt) {
      store.subscriptions.delete(peerId);
      return false;
    }
    return true;
  }

  // Check Supabase if lambda cold-started
  const isDbActive = await querySubscriptionFromSupabase(peerId);
  if (isDbActive) {
    store.subscriptions.set(peerId, {
      peerId,
      orderId: 'db_restored',
      paymentId: 'db_restored',
      amount: 9900,
      currency: 'INR',
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 86400 * 1000,
    });
    return true;
  }

  return false;
}
