'use client';

import { type Region, REGIONS, STATIONS } from '@/lib/stations';

interface RegionFilterProps {
  selected: Region | null;
  onChange: (region: Region | null) => void;
}

const REGION_INFO: Record<Region, { label: string; icon: string }> = {
  central: { label: 'Central Hub', icon: '🏛️' },
  north: { label: 'Northern Line', icon: '🧭' },
  south: { label: 'South Coast', icon: '🌊' },
  east: { label: 'East Express', icon: '🌅' },
  west: { label: 'Pacific West', icon: '🌄' },
};

export function RegionFilter({ selected, onChange }: RegionFilterProps) {
  const getCount = (region?: Region) => {
    if (!region) return STATIONS.length;
    return STATIONS.filter((s) => s.region === region).length;
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="radiogroup"
      aria-label="Filter stations by transit line"
    >
      <button
        role="radio"
        aria-checked={selected === null}
        onClick={() => onChange(null)}
        className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
          selected === null
            ? 'bg-amber-500 text-gray-950 font-bold shadow-md shadow-amber-500/25 ring-1 ring-amber-400'
            : 'bg-gray-900 border border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white'
        }`}
      >
        <span>All Lines</span>
        <span className="ml-1.5 opacity-70 text-[10px]">({getCount()})</span>
      </button>

      {REGIONS.map((region) => {
        const info = REGION_INFO[region];
        const count = getCount(region);
        const isSelected = selected === region;

        return (
          <button
            key={region}
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(region)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              isSelected
                ? 'bg-amber-500 text-gray-950 font-bold shadow-md shadow-amber-500/25 ring-1 ring-amber-400'
                : 'bg-gray-900 border border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white'
            }`}
          >
            <span>{info.icon} {info.label}</span>
            <span className="ml-1.5 opacity-70 text-[10px]">({count})</span>
          </button>
        );
      })}
    </div>
  );
}
