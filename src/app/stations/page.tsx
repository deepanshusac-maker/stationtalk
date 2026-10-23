import { StationGrid } from '@/components/StationGrid';
import { STATIONS } from '@/lib/stations';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Station Platforms Directory — StationTalk',
  description: 'Browse all 12 regional station voice rooms. Listen in or take the microphone.',
};

export default function StationsPage() {
  return (
    <div className="flex-1 bg-concourse-pattern py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-6">
          <nav className="flex items-center gap-2 text-xs font-mono text-gray-500">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Arrival Concourse
            </Link>
            <span>/</span>
            <span className="text-amber-400 font-semibold">Station Platforms</span>
          </nav>

          <Link
            href="/"
            className="text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>← Return to Arrivals</span>
          </Link>
        </div>

        {/* Directory Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium mb-3">
            <span>PLATFORM SECTOR CONCOURSE</span>
            <span>•</span>
            <span>LIVE STATIONS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Choose Your Platform
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl leading-relaxed">
            Select a station from any of our 5 regional lines. Every platform hosts an open group audio room.
            Join quietly as a listener or request the mic to speak.
          </p>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Total Platforms</div>
            <div className="text-lg font-bold text-white font-mono">{STATIONS.length} Stations</div>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Regional Lines</div>
            <div className="text-lg font-bold text-amber-400 font-mono">5 Sectors</div>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Default Role</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">🎧 Listener</div>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Engine</div>
            <div className="text-lg font-bold text-blue-400 font-mono">LiveKit SFU</div>
          </div>
        </div>

        {/* The Station Grid */}
        <StationGrid />
      </div>
    </div>
  );
}
