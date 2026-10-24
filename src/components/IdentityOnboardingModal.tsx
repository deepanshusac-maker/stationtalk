'use client';

import { useState, useCallback, useSyncExternalStore, useEffect } from 'react';
import {
  type Gender,
  completeOnboarding,
  generateRandomName,
  STORAGE_KEY_GENDER,
  STORAGE_KEY_NAME,
  STORAGE_KEY_ONBOARDED,
} from '@/lib/anonymousNames';
import { AvatarCapsule } from './AvatarCapsule';

function subscribeStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('stationtalk_name_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('stationtalk_name_change', callback);
  };
}

function getOnboardedSnapshot(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_KEY_ONBOARDED) === 'true';
}

function getServerOnboardedSnapshot(): boolean {
  return true;
}

function getStoredGenderSnapshot(): Gender {
  if (typeof window === 'undefined') return 'male';
  return (localStorage.getItem(STORAGE_KEY_GENDER) as Gender) || 'male';
}

function getServerGenderSnapshot(): Gender {
  return 'male';
}

function getStoredNameSnapshot(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_NAME) || '';
}

function getServerNameSnapshot(): string {
  return '';
}

export function IdentityOnboardingModal() {
  const isOnboarded = useSyncExternalStore(
    subscribeStorage,
    getOnboardedSnapshot,
    getServerOnboardedSnapshot
  );

  const storedGender = useSyncExternalStore(
    subscribeStorage,
    getStoredGenderSnapshot,
    getServerGenderSnapshot
  );

  const storedName = useSyncExternalStore(
    subscribeStorage,
    getStoredNameSnapshot,
    getServerNameSnapshot
  );

  const [isManuallyOpen, setIsManuallyOpen] = useState(false);
  const [activeGender, setActiveGender] = useState<Gender | null>(null);
  const [customDraftName, setCustomDraftName] = useState<string | null>(null);
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [shuffling, setShuffling] = useState(false);

  // Listen for explicit manual open requests (e.g. clicking persona badge)
  useEffect(() => {
    const handleOpen = () => {
      setIsManuallyOpen(true);
      setActiveGender(null);
      setCustomDraftName(null);
      setIsEditingCustom(false);
    };

    window.addEventListener('stationtalk_open_identity_modal', handleOpen);
    return () => window.removeEventListener('stationtalk_open_identity_modal', handleOpen);
  }, []);

  const isOpen = !isOnboarded || isManuallyOpen;
  const isFirstTime = !isOnboarded;

  // Selected gender defaults to active user preference or stored gender
  const currentGender: Gender = activeGender ?? storedGender;

  // Active name preview
  const currentPreviewName =
    customDraftName ??
    storedName ??
    generateRandomName(currentGender);

  const handleGenderSelect = useCallback((gender: Gender) => {
    setActiveGender(gender);
    const newName = generateRandomName(gender);
    setCustomDraftName(newName);
    setIsEditingCustom(false);
  }, []);

  const handleShuffle = useCallback(() => {
    setShuffling(true);
    const newName = generateRandomName(currentGender);
    setCustomDraftName(newName);
    setTimeout(() => setShuffling(false), 300);
  }, [currentGender]);

  const handleConfirm = useCallback(() => {
    const finalName = (customDraftName || currentPreviewName || generateRandomName(currentGender)).trim();
    completeOnboarding(currentGender, finalName);
    setIsManuallyOpen(false);
    setActiveGender(null);
    setCustomDraftName(null);
  }, [currentGender, customDraftName, currentPreviewName]);

  const handleClose = useCallback(() => {
    setIsManuallyOpen(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white border border-slate-200/90 rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl glass-specular max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="identity-modal-title"
      >
        {/* Mobile Swipe / Sheet Handle */}
        <div className="sm:hidden w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-mono uppercase tracking-wider mb-1.5 font-bold">
              <span>🚉 Passenger Identity</span>
            </div>
            <h2 id="identity-modal-title" className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              {isFirstTime ? 'Welcome to StationTalk' : 'Passenger Persona'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your identity style once to receive your random anonymous handle for all voice platforms.
            </p>
          </div>

          {!isFirstTime && (
            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Gender Selection Step */}
        <div className="mb-5">
          <label className="block text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
            1. Choose Gender (Asked Once)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Male Choice */}
            <button
              type="button"
              onClick={() => handleGenderSelect('male')}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-teal-400 active:scale-95 ${
                currentGender === 'male'
                  ? 'bg-teal-50 border-teal-500 shadow-sm ring-1 ring-teal-500/30'
                  : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">👨</span>
                {currentGender === 'male' && (
                  <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                )}
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-900">Male</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">Aarav, Kabir, Rohan...</span>
              </div>
            </button>

            {/* Female Choice */}
            <button
              type="button"
              onClick={() => handleGenderSelect('female')}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-teal-400 active:scale-95 ${
                currentGender === 'female'
                  ? 'bg-teal-50 border-teal-500 shadow-sm ring-1 ring-teal-500/30'
                  : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">👩</span>
                {currentGender === 'female' && (
                  <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                )}
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-900">Female</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">Ananya, Priya, Diya...</span>
              </div>
            </button>
          </div>
        </div>

        {/* Assigned Random Persona Card */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider">
              2. Your Anonymous Handle
            </span>
            <button
              type="button"
              onClick={handleShuffle}
              className={`text-xs font-mono text-teal-700 hover:text-teal-800 flex items-center gap-1.5 transition-transform duration-200 focus:outline-none active:scale-95 font-semibold ${
                shuffling ? 'scale-110 text-teal-600' : ''
              }`}
              title="Draw another random name from list"
            >
              <span className={`transition-transform duration-300 ${shuffling ? 'rotate-180' : ''}`}>🎲</span>
              <span>Re-roll Name</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <AvatarCapsule name={currentPreviewName} size="md" showEyes={true} />
            <div className="flex-1 min-w-0">
              {isEditingCustom ? (
                <input
                  type="text"
                  value={currentPreviewName}
                  onChange={(e) => setCustomDraftName(e.target.value)}
                  maxLength={40}
                  className="w-full px-3 py-1.5 bg-white border border-teal-500 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  autoFocus
                />
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-slate-950 truncate tracking-tight">
                    {currentPreviewName}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingCustom(true)}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-800 ml-2 underline underline-offset-2"
                  >
                    Edit
                  </button>
                </div>
              )}
              <span className="block text-[10px] font-mono text-slate-500 mt-0.5">
                {currentGender === 'female' ? 'Female persona' : 'Male persona'} • Anonymous across all rooms
              </span>
            </div>
          </div>
        </div>

        {/* Confirm CTA */}
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-sm transition-all duration-200 shadow-[0_10px_25px_-5px_rgba(13,148,136,0.35)] hover:shadow-[0_15px_30px_-5px_rgba(13,148,136,0.5)] flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-teal-400/40 active:scale-[0.98]"
        >
          <span>{isFirstTime ? 'Enter Concourse ➔' : 'Save & Continue'}</span>
        </button>
      </div>
    </div>
  );
}
