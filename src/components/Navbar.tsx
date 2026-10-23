'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useSyncExternalStore, useState, useCallback } from 'react';
import { usePresence } from '@/lib/usePresence';
import { AvatarCapsule } from './AvatarCapsule';

// Hydration-safe localStorage subscriber for user's display name
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

  const displayName = savedName || 'Aditya';

  const handleOpenEdit = useCallback(() => {
    setTempName(savedName || 'Aditya');
    setIsEditingName(true);
  }, [savedName]);

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
      <header className="sticky top-0 z-50 bg-[#0d121c]/90 backdrop-blur-md border-b border-[#1b2333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand Logo & 1-to-1 / Concourse Link */}
          <div className="flex items-center gap-4">
            <Link
              href="/stations"
              className="flex items-center gap-2 group focus:outline-none"
            >
              {/* Circular/Pill badge icon matching screenshot */}
              <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 font-bold text-xs shadow-inner">
                talk
              </div>
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-teal-300 transition-colors">
                stationtalk
              </span>
            </Link>

            <Link
              href="/"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                pathname === '/'
                  ? 'bg-[#1a2334] text-white border border-[#2a3750]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>🏛️</span>
              <span>Arrivals</span>
            </Link>
          </div>

          {/* Center: User Profile Chip */}
          <div className="flex items-center">
            <button
              onClick={handleOpenEdit}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161d2b] hover:bg-[#1f293d] border border-[#232d42] transition-all text-xs font-medium text-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              title="Click to edit your display name"
            >
              <AvatarCapsule name={displayName} size="sm" showEyes={true} />
              <span className="truncate max-w-[100px] sm:max-w-[140px] font-semibold text-white">
                {displayName}
              </span>
            </button>
          </div>

          {/* Right: Live Counter & Navigation */}
          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="relative flex h-2 w-2">
                {realOnlineTotal > 0 && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    realOnlineTotal > 0 ? 'bg-emerald-400' : 'bg-gray-500'
                  }`}
                />
              </span>
              <span className={realOnlineTotal > 0 ? 'text-emerald-400 font-medium' : 'text-gray-400 font-medium'}>
                {onlineText}
              </span>
            </div>

            {/* Stations directory CTA */}
            <Link
              href="/stations"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all focus:outline-none ${
                pathname === '/stations'
                  ? 'bg-teal-500 text-gray-950 shadow-md shadow-teal-500/20'
                  : 'bg-[#182030] text-gray-300 hover:bg-[#202b40] hover:text-white border border-[#26334a]'
              }`}
            >
              Platforms
            </Link>
          </div>
        </div>
      </header>

      {/* Name Edit Modal */}
      {isEditingName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#131926] border border-[#242f44] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Your Concourse Pass</h3>
              <button
                onClick={() => setIsEditingName(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveName} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5">
                  Display Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    maxLength={30}
                    autoFocus
                    placeholder="e.g. Aditya"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1420] border border-[#26334a] text-white text-sm focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="flex-1 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-teal-500 text-gray-950 text-xs font-bold hover:bg-teal-400 transition-colors shadow-md shadow-teal-500/20"
                >
                  Save Name
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
    <header className="sticky top-0 z-50 bg-[#0d121c]/90 backdrop-blur-md border-b border-[#1b2333]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-500/20" />
          <div className="h-4 w-24 bg-gray-800 rounded" />
        </div>
        <div className="h-8 w-28 bg-[#161d2b] rounded-full" />
        <div className="h-8 w-20 bg-gray-800 rounded-xl" />
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
