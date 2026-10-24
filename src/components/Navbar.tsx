'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useSyncExternalStore, useState, useCallback, useEffect } from 'react';
import { usePresence } from '@/lib/usePresence';
import { AvatarCapsule } from './AvatarCapsule';
import {
  getOrInitAnonymousName,
  shuffleAnonymousName,
  openIdentityModal,
  STORAGE_KEY_NAME,
} from '@/lib/anonymousNames';

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
  return localStorage.getItem(STORAGE_KEY_NAME) || '';
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

  const [shuffling, setShuffling] = useState(false);

  // Initialize random anonymous name automatically if not yet present
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY_NAME)) {
      getOrInitAnonymousName();
      window.dispatchEvent(new Event('stationtalk_name_change'));
    }
  }, []);

  const displayName = savedName || 'Passenger';

  const handleShuffle = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShuffling(true);
    shuffleAnonymousName();
    setTimeout(() => setShuffling(false), 400);
  }, []);

  const handleOpenIdentity = useCallback(() => {
    openIdentityModal();
  }, []);

  // Real online count directly from LiveKit Cloud SFU
  const realOnlineTotal = presence.total;
  const onlineText = realOnlineTotal === 1 ? '1 online' : `${realOnlineTotal} online`;

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-2xl border-b border-slate-200/80 glass-specular shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link
            href="/stations"
            className="flex items-center gap-2 group focus:outline-none"
            aria-label="StationTalk Home"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600 border border-teal-500/40 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-teal-500/20 group-hover:scale-105 transition-all duration-300">
              talk
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base md:text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-teal-600 transition-colors">
                Station<span className="text-teal-600">Talk</span>
              </span>
              <span className="hidden md:inline-block text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 uppercase font-semibold">
                SFU Live
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
              pathname === '/'
                ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <span>🏛️</span>
            <span>Concourse</span>
          </Link>
        </div>

        {/* Center: Anonymous Persona Chip (Male / Female avatar & Re-roll) */}
        <div className="flex items-center justify-center min-w-0 max-w-[170px] sm:max-w-xs">
          <div className="flex items-center glass-pill rounded-full p-1 pl-2 transition-all duration-200 shadow-sm hover:border-slate-300 max-w-full bg-white/90">
            <button
              onClick={handleOpenIdentity}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-slate-950 focus:outline-none pr-1 truncate"
              title="Click to customize identity or switch Male / Female persona"
            >
              <AvatarCapsule name={displayName} size="sm" showEyes={true} />
              <span className="truncate max-w-[65px] sm:max-w-[130px] tracking-tight text-[11px] sm:text-xs">
                {displayName}
              </span>
            </button>

            {/* 1-Click Instant Persona Shuffle */}
            <button
              onClick={handleShuffle}
              className={`p-1 sm:p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-teal-600 transition-transform duration-300 text-xs focus:outline-none shrink-0 ${
                shuffling ? 'rotate-180 scale-125' : ''
              }`}
              title="🎲 Re-roll Persona Name"
              aria-label="Re-roll anonymous name"
            >
              🎲
            </button>
          </div>
        </div>

        {/* Right: Live Telemetry & Platforms CTA */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Live Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/70 text-[11px] sm:text-xs font-mono">
            <span className="relative flex h-2 w-2">
              {realOnlineTotal > 0 ? (
                <>
                  <span className="radar-ring absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400" />
              )}
            </span>
            <span className="hidden sm:inline text-emerald-800 font-semibold">
              {onlineText}
            </span>
            <span className="sm:hidden text-emerald-800 font-semibold">
              {realOnlineTotal}
            </span>
          </div>

          {/* Stations directory CTA */}
          <Link
            href="/stations"
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 focus:outline-none ${
              pathname === '/stations'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25 hover:bg-teal-500'
                : 'glass-pill text-slate-700 hover:text-slate-950 hover:border-slate-300'
            }`}
          >
            Platforms
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-2xl border-b border-slate-200/80 h-14 sm:h-16" />
      }
    >
      <NavbarContent />
    </Suspense>
  );
}
