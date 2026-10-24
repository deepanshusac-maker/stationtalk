import { StationGrid } from '@/components/StationGrid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stations — StationTalk Voice Rooms',
  description: 'Browse regional station voice rooms. Listen in or join the discussion in real-time WebRTC.',
};

export default function StationsPage() {
  return (
    <div className="flex-1 saas-mesh-bg saas-dots-pattern py-6 sm:py-10 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Subtle Concourse Top Banner */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-[11px] font-mono font-medium mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span>LIVE AUDIO CONCOURSE</span>
              <span className="text-gray-600">•</span>
              <span>26 STATIONS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Station Platforms
            </h1>
          </div>

          <div className="text-xs font-mono text-gray-400">
            <span>Mesh Audio: </span>
            <span className="text-emerald-400 font-semibold">LiveKit Cloud SFU</span>
          </div>
        </div>

        {/* The Station Grid */}
        <StationGrid />
      </div>
    </div>
  );
}
