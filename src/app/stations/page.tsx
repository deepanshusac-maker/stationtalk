import { StationGrid } from '@/components/StationGrid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stations — StationTalk Voice Rooms',
  description: 'Browse regional station voice rooms. Listen in or join the discussion in real-time WebRTC.',
};

export default function StationsPage() {
  return (
    <div className="flex-1 saas-mesh-bg saas-dots-pattern py-6 sm:py-10 min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Subtle Concourse Top Banner */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-mono font-bold mb-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span>LIVE AUDIO CONCOURSE</span>
              <span className="text-slate-300">•</span>
              <span>26 STATIONS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Station Platforms
            </h1>
          </div>

          <div className="text-xs font-mono text-slate-500">
            <span>Audio Mesh: </span>
            <span className="text-emerald-700 font-bold">LiveKit Cloud SFU</span>
          </div>
        </div>

        {/* The Station Grid */}
        <StationGrid />
      </div>
    </div>
  );
}
