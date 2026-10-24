'use client';

import Link from 'next/link';
import { type Station } from '@/lib/stations';
import { AvatarCluster } from './AvatarCapsule';

interface StationCardProps {
  station: Station;
  participantCount?: number;
  participantNames?: string[];
}

export function StationCard({
  station,
  participantCount = 0,
  participantNames = [],
}: StationCardProps) {
  const realCount = participantCount;

  // Real participant names from LiveKit room state
  const activeNames = participantNames;
  const primarySpeaker = activeNames[0];
  const moreCount = realCount - 1;

  let speakingText = '';
  if (realCount === 0) {
    speakingText = 'Waiting for travelers';
  } else if (realCount === 1) {
    speakingText = `${primarySpeaker || '1 traveler'} in lounge`;
  } else {
    speakingText = `${primarySpeaker || 'Traveler'} +${moreCount} more`;
  }

  return (
    <Link
      href={`/room/${station.slug}`}
      className="group relative flex items-center justify-between p-5 sm:p-6 glass-panel-interactive glass-specular rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-teal-400/50 border-slate-200/80 bg-white/85 shadow-sm hover:shadow-md"
    >
      {/* Ambient background glow on hover */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-teal-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Left Column: Details & Real Joined Count */}
      <div className="relative flex-1 min-w-0 pr-3 z-10">
        {/* Region & Line Micro Tag */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold">
            {station.region} Corridor
          </span>
          <span className="text-slate-300 text-xs">•</span>
          <span className="text-[10px] font-mono text-slate-500 truncate">
            {station.city} · {station.state}
          </span>
        </div>

        {/* Station Name */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors truncate tracking-tight">
          {station.name}
        </h3>

        {/* Active speaker snippet + Live decibel bar when active */}
        <div className="mt-3.5 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            {realCount > 0 && (
              <div className="flex items-end gap-0.5 h-3 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-0.5 bg-emerald-600 rounded-full speaking-bar-1" />
                <span className="w-0.5 bg-emerald-600 rounded-full speaking-bar-2" />
                <span className="w-0.5 bg-emerald-600 rounded-full speaking-bar-3" />
              </div>
            )}
            <p
              className={`text-xs font-medium truncate ${
                realCount > 0 ? 'text-slate-800' : 'text-slate-500'
              }`}
            >
              {speakingText}
            </p>
          </div>

          {/* Real Live Presence indicator with radar ring */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {realCount > 0 ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="radar-ring absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </span>
                <span className="text-emerald-700 font-bold">live</span>
                <span className="text-slate-600 font-medium">
                  {realCount} {realCount === 1 ? 'person' : 'people'}
                </span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 inline-block" />
                <span className="text-slate-400 font-normal">
                  quiet · open platform
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Real Joined Avatars + Smooth Hover Arrow */}
      <div className="relative shrink-0 flex items-center gap-3 z-10">
        <AvatarCluster
          names={activeNames}
          totalCount={realCount}
          size="md"
        />

        <div className="hidden sm:flex w-7 h-7 rounded-full bg-slate-100 border border-slate-200 items-center justify-center text-slate-500 group-hover:text-teal-700 group-hover:bg-teal-50 group-hover:border-teal-200 group-hover:translate-x-0.5 transition-all duration-200">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
