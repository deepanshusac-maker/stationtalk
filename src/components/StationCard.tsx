'use client';

import Link from 'next/link';
import { type Station } from '@/lib/stations';
import { AvatarCluster } from './AvatarCapsule';

interface StationCardProps {
  station: Station;
  participantCount?: number | null;
}

export function StationCard({ station, participantCount }: StationCardProps) {
  // Use real presence participant count if available (> 0)
  // Otherwise fall back gracefully to seed/preview count so the board looks active and inviting
  const realCount = participantCount ?? 0;
  const seedSpeakers = station.seedSpeakers || ['Traveller'];
  const isRealActive = realCount > 0;

  // Active count for visual presentation:
  // If real participants are in the room, use realCount.
  // Otherwise, use seedSpeakers length as preview so cards mirror the lively concourse look in the reference image.
  const displayCount = isRealActive ? realCount : seedSpeakers.length;
  const isFull = displayCount >= 7;

  // Format who is talking (e.g. "Mira +2 more", "Arjun is talking", "Zara +1 more")
  const primarySpeaker = seedSpeakers[0];
  const moreCount = displayCount - 1;

  let speakingText = '';
  if (displayCount === 1) {
    speakingText = `${primarySpeaker} is talking`;
  } else if (displayCount > 1) {
    speakingText = `${primarySpeaker} +${moreCount} more`;
  } else {
    speakingText = 'Waiting for discussion';
  }

  return (
    <Link
      href={`/room/${station.slug}`}
      className="group relative flex items-center justify-between p-5 sm:p-6 bg-[#131926] hover:bg-[#182132] border border-[#212b3c] hover:border-[#334158] rounded-2xl transition-all duration-200 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
    >
      {/* Left Column: Details & Status */}
      <div className="flex-1 min-w-0 pr-3">
        {/* Station Name */}
        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors truncate">
          {station.name}
        </h3>

        {/* Location: City · State */}
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {station.city} · {station.state}
        </p>

        {/* Active speaker snippet */}
        <div className="mt-3.5 sm:mt-4">
          <p className="text-xs font-medium text-gray-300 truncate">
            {speakingText}
          </p>

          {/* Live Presence indicator */}
          <div className="mt-1 flex items-center gap-1.5 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-emerald-400 font-medium">
              live
            </span>
            <span className="text-gray-400">
              {displayCount}/7 {displayCount === 1 ? 'person' : 'people'}
              {isFull && ' · full'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Overlapping Avatar Cluster */}
      <div className="shrink-0 flex items-center justify-end">
        <AvatarCluster
          names={seedSpeakers}
          totalCount={displayCount}
          size="md"
        />
      </div>
    </Link>
  );
}
