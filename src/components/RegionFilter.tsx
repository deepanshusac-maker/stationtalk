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
      className="flex flex-wrap items-center gap-1.5"
      role="radiogroup"
      aria-label="Filter stations by region"
    >
      <button
        role="radio"
        aria-checked={selected === null}
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all focus:outline-none ${
          selected === null
            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
            : 'bg-[#131926] border border-[#212b3c] text-gray-400 hover:text-gray-200'
        }`}
      >
        <span>All ({getCount()})</span>
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
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all focus:outline-none ${
              isSelected
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'bg-[#131926] border border-[#212b3c] text-gray-400 hover:text-gray-200'
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
