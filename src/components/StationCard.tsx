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
  // Real participant count from LiveKit Cloud SFU
  const realCount = Math.max(0, participantCount);
  const isFull = realCount >= 7;

  // Real participant names from LiveKit room state
  const activeNames = participantNames;
  const primarySpeaker = activeNames[0];
  const moreCount = realCount - 1;

  let speakingText = '';
  if (realCount === 0) {
    speakingText = 'Waiting for discussion · Tap to join';
  } else if (realCount === 1) {
    speakingText = `${primarySpeaker || '1 person'} on stage`;
  } else {
    speakingText = `${primarySpeaker || '1 person'} +${moreCount} more`;
  }

  return (
    <Link
      href={`/room/${station.slug}`}
      className="group relative flex items-center justify-between p-5 sm:p-6 bg-[#131926] hover:bg-[#182132] border border-[#212b3c] hover:border-[#334158] rounded-2xl transition-all duration-200 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
    >
      {/* Left Column: Details & Real Joined Count */}
      <div className="flex-1 min-w-0 pr-3">
        {/* Station Name */}
        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-teal-300 transition-colors truncate">
          {station.name}
        </h3>

        {/* Location: City · State */}
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {station.city} · {station.state}
        </p>

        {/* Active speaker snippet */}
        <div className="mt-3.5 sm:mt-4">
          <p
            className={`text-xs font-medium truncate ${
              realCount > 0 ? 'text-gray-200' : 'text-gray-400'
            }`}
          >
            {speakingText}
          </p>

          {/* Real Live Presence indicator */}
          <div className="mt-1 flex items-center gap-1.5 text-xs font-mono">
            {realCount > 0 ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-emerald-400 font-medium">live</span>
                <span className="text-gray-300 font-semibold">
                  {realCount}/7 {realCount === 1 ? 'person' : 'people'}
                  {isFull && ' · full'}
                </span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-gray-600 inline-block" />
                <span className="text-gray-500 font-normal">
                  0/7 people · quiet
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Real Joined Avatars */}
      <div className="shrink-0 flex items-center justify-end">
        <AvatarCluster
          names={activeNames}
          totalCount={realCount}
          size="md"
        />
      </div>
    </Link>
  );
}
