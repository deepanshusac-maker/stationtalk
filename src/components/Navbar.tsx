'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { usePresence } from '@/lib/usePresence';
import { STATIONS } from '@/lib/stations';

function NavbarContent() {
  const pathname = usePathname();
  const presence = usePresence();

  return (
    <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-lg p-1"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
            🚉
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              Station<span className="text-amber-400">Talk</span>
              <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest hidden sm:block">
              Social Audio Concourse
            </p>
          </div>
        </Link>

        {/* Live Audio Status Indicator */}
        <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-gray-900/90 border border-gray-800 text-xs text-gray-400 font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>SFU Cloud Mesh</span>
          <span className="text-gray-600">•</span>
          <span className="text-amber-400 font-medium">
            {presence.total > 0
              ? `${presence.total} ${presence.total === 1 ? 'Traveller' : 'Travellers'} Online`
              : `${STATIONS.length} Platforms Open`}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              pathname === '/'
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
            }`}
          >
            Arrivals
          </Link>

          <Link
            href="/stations"
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              pathname === '/stations' || pathname?.startsWith('/room')
                ? 'bg-amber-500 text-gray-950 font-semibold shadow-md shadow-amber-500/20'
                : 'bg-gray-800 text-gray-200 hover:bg-amber-500 hover:text-gray-950 hover:shadow-md hover:shadow-amber-500/20'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>Station Platforms</span>
              <span className="text-xs">➔</span>
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20" />
          <div className="h-4 w-28 bg-gray-800 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-20 bg-gray-800 rounded" />
          <div className="h-8 w-28 bg-amber-500/20 rounded" />
        </div>
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
