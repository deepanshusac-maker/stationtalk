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
      className="p-1 rounded-2xl glass-panel flex items-center gap-1 border border-slate-200/90 bg-white/85 shadow-sm overflow-x-auto no-scrollbar max-w-full touch-pan-x"
      role="radiogroup"
      aria-label="Filter stations by region"
    >
      <button
        role="radio"
        aria-checked={selected === null}
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 focus:outline-none whitespace-nowrap shrink-0 ${
          selected === null
            ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/25'
            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
        }`}
      >
        <span>All</span>
        <span className="ml-1 opacity-75 text-[10px]">({getCount()})</span>
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
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 focus:outline-none whitespace-nowrap shrink-0 ${
              isSelected
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/25'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
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
