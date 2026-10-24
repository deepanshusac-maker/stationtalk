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
      className="group relative flex items-center justify-between p-5 sm:p-6 rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-teal-400/50 border border-slate-200/90 bg-white shadow-[0_2px_8px_-2px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_24px_-4px_rgba(13,148,136,0.12)] hover:border-teal-500/50 transition-all duration-200 glass-specular"
    >
      {/* Ambient background glow on hover */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-teal-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Left Column: Details & Real Joined Count */}
      <div className="relative flex-1 min-w-0 pr-3 z-10">
        {/* Region & Line Micro Tag */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-md font-bold">
            {station.region} Corridor
          </span>
          <span className="text-slate-300 text-xs">•</span>
          <span className="text-[11px] font-mono text-slate-500 truncate font-medium">
            {station.city} · {station.state}
          </span>
        </div>

        {/* Station Name */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate tracking-tight">
          {station.name}
        </h3>

        {/* Active speaker snippet + Live decibel bar when active */}
        <div className="mt-3.5 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            {realCount > 0 && (
              <div className="flex items-end gap-0.5 h-3 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                <span className="w-0.5 bg-emerald-600 rounded-full speaking-bar-1" />
                <span className="w-0.5 bg-emerald-600 rounded-full speaking-bar-2" />
                <span className="w-0.5 bg-emerald-600 rounded-full speaking-bar-3" />
              </div>
            )}
            <p
              className={`text-xs font-semibold truncate ${
                realCount > 0 ? 'text-slate-800' : 'text-slate-500'
              }`}
            >
              {speakingText}
            </p>
          </div>

          {/* Real Live Presence indicator with radar ring */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {realCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/90">
                <span className="relative flex h-2 w-2">
                  <span className="radar-ring absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </span>
                <span className="text-emerald-800 font-bold">live</span>
                <span className="text-slate-600 font-semibold">
                  {realCount} {realCount === 1 ? 'person' : 'people'}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 inline-block" />
                <span className="font-normal text-[11px]">
                  quiet · open platform
                </span>
              </span>
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

        <div className="hidden sm:flex w-8 h-8 rounded-full bg-slate-50 border border-slate-200/90 items-center justify-center text-slate-600 group-hover:text-white group-hover:bg-teal-600 group-hover:border-teal-600 group-hover:translate-x-0.5 transition-all duration-200 shadow-sm">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
