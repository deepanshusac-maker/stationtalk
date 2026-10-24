'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useSyncExternalStore, useState, useCallback, useEffect } from 'react';
import { usePresence } from '@/lib/usePresence';
import { AvatarCapsule } from './AvatarCapsule';
import { getOrInitAnonymousName, shuffleAnonymousName } from '@/lib/anonymousNames';

// Hydration-safe localStorage subscriber for user's anonymous display name
function subscribeToDisplayName(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('stationtalk_name_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('stationtalk_name_change', callback);
  };
}

function getDisplayNameSnapshot(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('stationtalk_display_name') || '';
}

function getServerSnapshot(): string {
  return '';
}

function NavbarContent() {
  const pathname = usePathname();
  const presence = usePresence();
  const savedName = useSyncExternalStore(
    subscribeToDisplayName,
    getDisplayNameSnapshot,
    getServerSnapshot
  );

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [shuffling, setShuffling] = useState(false);

  // Initialize random anonymous name automatically if not yet present
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('stationtalk_display_name')) {
      getOrInitAnonymousName();
      window.dispatchEvent(new Event('stationtalk_name_change'));
    }
  }, []);

  const displayName = savedName || 'Curious Traveler';

  const handleShuffle = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShuffling(true);
    shuffleAnonymousName();
    setTimeout(() => setShuffling(false), 500);
  }, []);

  const handleOpenEdit = useCallback(() => {
    setTempName(displayName);
    setIsEditingName(true);
  }, [displayName]);

  const handleSaveName = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = tempName.trim();
      if (trimmed && typeof window !== 'undefined') {
        localStorage.setItem('stationtalk_display_name', trimmed);
        window.dispatchEvent(new Event('stationtalk_name_change'));
      }
      setIsEditingName(false);
    },
    [tempName]
  );

  // Real online count directly from LiveKit Cloud SFU
  const realOnlineTotal = presence.total;
  const onlineText = realOnlineTotal === 1 ? '1 online' : `${realOnlineTotal} online`;

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#07090e]/75 backdrop-blur-2xl border-b border-white/[0.07] glass-specular">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand Logo & Arrivals Navigation */}
          <div className="flex items-center gap-4">
            <Link
              href="/stations"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500/25 via-emerald-500/15 to-transparent border border-teal-400/40 flex items-center justify-center text-teal-300 font-bold text-xs shadow-[0_0_15px_-3px_rgba(20,184,166,0.3)] group-hover:scale-105 group-hover:border-teal-300/60 transition-all duration-300">
                talk
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-white group-hover:text-teal-300 transition-colors">
                  Station<span className="text-teal-400">Talk</span>
                </span>
                <span className="hidden sm:inline-block text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded-full bg-white/[0.05] text-teal-300 border border-white/[0.08] uppercase">
                  SFU Live
                </span>
              </div>
            </Link>

            <Link
              href="/"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                pathname === '/'
                  ? 'bg-white/[0.08] text-white border border-white/[0.12] shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
              }`}
            >
              <span>🏛️</span>
              <span>Concourse</span>
            </Link>
          </div>

          {/* Center: Anonymous Persona Chip + 1-Click Shuffle Tool */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center glass-pill rounded-full p-1 pl-2.5 transition-all duration-200 shadow-sm hover:border-white/[0.18]">
              <button
                onClick={handleOpenEdit}
                className="flex items-center gap-2 text-xs font-semibold text-white focus:outline-none pr-1.5"
                title="Click to view or customize anonymous moniker"
              >
                <AvatarCapsule name={displayName} size="sm" showEyes={true} />
                <span className="truncate max-w-[100px] sm:max-w-[150px] tracking-tight">
                  {displayName}
                </span>
              </button>

              {/* 1-Click Instant Persona Shuffle */}
              <button
                onClick={handleShuffle}
                className={`p-1.5 rounded-full hover:bg-white/[0.08] text-gray-400 hover:text-teal-300 transition-transform duration-300 text-xs focus:outline-none ${
                  shuffling ? 'rotate-180 scale-125' : ''
                }`}
                title="🎲 Shuffle Anonymous Moniker"
                aria-label="Shuffle anonymous identity"
              >
                🎲
              </button>
            </div>
          </div>

          {/* Right: Real-time Live Network Telemetry & Platforms Button */}
          <div className="flex items-center gap-3">
            {/* Real Live Indicator with Radar Ring */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs font-mono">
              <span className="relative flex h-2 w-2">
                {realOnlineTotal > 0 ? (
                  <>
                    <span className="radar-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500" />
                )}
              </span>
              <span className={realOnlineTotal > 0 ? 'text-emerald-400 font-medium' : 'text-gray-400 font-medium'}>
                {onlineText}
              </span>
            </div>

            {/* Stations directory CTA */}
            <Link
              href="/stations"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 focus:outline-none ${
                pathname === '/stations'
                  ? 'bg-teal-500 text-gray-950 font-bold shadow-[0_0_20px_rgba(20,184,166,0.35)] hover:bg-teal-400'
                  : 'glass-pill text-gray-200 hover:text-white hover:border-white/20'
              }`}
            >
              Platforms
            </Link>
          </div>
        </div>
      </header>

      {/* Name / Anonymous Identity Modal */}
      {isEditingName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl glass-panel p-6 shadow-2xl border border-white/[0.12] glass-specular">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Anonymous Identity</h3>
                <p className="text-[11px] text-gray-400">Your handle in all voice rooms.</p>
              </div>
              <button
                onClick={() => setIsEditingName(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-center py-4">
              <div className="text-center">
                <AvatarCapsule name={tempName} size="lg" showEyes={true} className="mx-auto mb-2.5 shadow-xl" />
                <span className="text-sm font-bold text-teal-300 tracking-tight">{tempName}</span>
              </div>
            </div>

            <form onSubmit={handleSaveName} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5">
                  Custom Moniker or Anonymous Handle
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    maxLength={35}
                    autoFocus
                    placeholder="e.g. Silent Voyager #42"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Shuffle helper inside modal */}
              <button
                type="button"
                onClick={() => setTempName(shuffleAnonymousName())}
                className="w-full py-2.5 rounded-xl glass-pill text-teal-300 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <span>🎲</span>
                <span>Shuffle Another Anonymous Handle</span>
              </button>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="flex-1 py-2.5 rounded-xl glass-pill text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-500 text-gray-950 text-xs font-bold hover:bg-teal-400 transition-all shadow-md shadow-teal-500/25"
                >
                  Save Handle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50 bg-[#07090e]/75 backdrop-blur-2xl border-b border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20" />
          <div className="h-4 w-24 bg-white/[0.05] rounded" />
        </div>
        <div className="h-8 w-28 bg-white/[0.05] rounded-full" />
        <div className="h-8 w-20 bg-white/[0.05] rounded-xl" />
      </div>
    </header>
  );
}

export function Navbar() {
  return (
    <Suspense fallback={<NavbarSkeleton />}>
      <NavbarContent />
    </Suspense>
  );
}
