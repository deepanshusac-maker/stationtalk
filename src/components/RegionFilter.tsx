'use client';

import { type Region, REGIONS, STATIONS } from '@/lib/stations';

interface RegionFilterProps {
  selected: Region | null;
  onChange: (region: Region | null) => void;
}

const REGION_LABELS: Record<Region, string> = {
  south: 'South',
  north: 'North',
  central: 'Central',
  west: 'West',
  east: 'East',
};

export function RegionFilter({ selected, onChange }: RegionFilterProps) {
  const getCount = (region?: Region) => {
    if (!region) return STATIONS.length;
    return STATIONS.filter((s) => s.region === region).length;
  };

  return (
    <div
      className="p-1 rounded-2xl glass-panel flex flex-wrap items-center gap-1 border border-white/[0.08]"
      role="radiogroup"
      aria-label="Filter stations by region"
    >
      <button
        role="radio"
        aria-checked={selected === null}
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 focus:outline-none ${
          selected === null
            ? 'bg-teal-500 text-gray-950 font-bold shadow-[0_0_15px_rgba(20,184,166,0.35)]'
            : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
        }`}
      >
        <span>All</span>
        <span className="ml-1 opacity-70 text-[10px]">({getCount()})</span>
      </button>

      {REGIONS.map((region) => {
        const isSelected = selected === region;
        const count = getCount(region);

        return (
          <button
            key={region}
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(region)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 focus:outline-none ${
              isSelected
                ? 'bg-teal-500 text-gray-950 font-bold shadow-[0_0_15px_rgba(20,184,166,0.35)]'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <span>{REGION_LABELS[region]}</span>
            <span className="ml-1 opacity-60 text-[10px]">({count})</span>
          </button>
        );
      })}
    </div>
  );
}
