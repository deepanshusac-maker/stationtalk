'use client';

import Link from 'next/link';
import { type Station, type Region, STATIONS } from '@/lib/stations';

interface StationCardProps {
  station: Station;
  participantCount?: number | null;
}

const REGION_BADGES: Record<
  Region,
  { label: string; line: string; color: string; badge: string; border: string }
> = {
  central: {
    label: 'Central Hub',
    line: 'GOLD LINE',
    color: 'text-amber-400',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    border: 'group-hover:border-amber-500/60',
  },
  north: {
    label: 'Northern Line',
    line: 'BLUE LINE',
    color: 'text-blue-400',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    border: 'group-hover:border-blue-500/60',
  },
  south: {
    label: 'South Coast',
    line: 'EMERALD LINE',
    color: 'text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    border: 'group-hover:border-emerald-500/60',
  },
  east: {
    label: 'East Express',
    line: 'ORANGE LINE',
    color: 'text-orange-400',
    badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    border: 'group-hover:border-orange-500/60',
  },
  west: {
    label: 'Pacific West',
    line: 'PURPLE LINE',
    color: 'text-purple-400',
    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    border: 'group-hover:border-purple-500/60',
  },
};

export function StationCard({ station, participantCount }: StationCardProps) {
  const meta = REGION_BADGES[station.region];
  const stationIndex = STATIONS.findIndex((s) => s.slug === station.slug);
  const platformNumber = String(stationIndex + 1).padStart(2, '0');

  return (
    <Link
      href={`/room/${station.slug}`}
      className={`group relative flex flex-col justify-between p-6 bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-2xl ${meta.border} hover:bg-gray-900/95 transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-950`}
    >
      {/* Platform & Region Top Banner */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700/80">
              PF {platformNumber}
            </span>
            <span
              className={`px-2.5 py-0.5 text-[11px] font-semibold font-mono tracking-wider rounded-md border uppercase ${meta.badge}`}
            >
              {meta.line}
            </span>
          </div>

          {/* Signal Indicator */}
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 text-[10px]">OPEN</span>
          </div>
        </div>

        {/* Station Name */}
        <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors mb-2">
          {station.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-400 line-clamp-2 mb-6">
          {station.description}
        </p>
      </div>

      {/* Bottom Bar: Presence & CTA */}
      <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono">
          {participantCount != null && participantCount > 0 ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {participantCount} {participantCount === 1 ? 'traveller' : 'travellers'}
            </span>
          ) : (
            <span className="text-gray-500 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
              Concourse Quiet
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all">
          <span>Board Room</span>
          <span className="text-sm">➔</span>
        </span>
      </div>
    </Link>
  );
}
