'use client';

import { useState, useMemo, useCallback } from 'react';
import { STATIONS, type Region, searchStations } from '@/lib/stations';
import { usePresence } from '@/lib/usePresence';
import { StationCard } from './StationCard';
import { RegionFilter } from './RegionFilter';
import { SearchBar } from './SearchBar';

interface StationGridProps {
  participantCounts?: Record<string, number>;
}

export function StationGrid({ participantCounts }: StationGridProps) {
  const presence = usePresence();
  const counts = participantCounts ?? presence.counts;
  const participants = presence.participants;

  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const filteredStations = useMemo(() => {
    let stations = searchQuery
      ? searchStations(searchQuery)
      : [...STATIONS];

    if (selectedRegion) {
      stations = stations.filter((s) => s.region === selectedRegion);
    }

    return stations;
  }, [selectedRegion, searchQuery]);

  const handleReset = useCallback(() => {
    setSelectedRegion(null);
    setSearchQuery('');
  }, []);

  return (
    <div className="space-y-5">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2">
        <SearchBar onSearch={handleSearch} />
        <RegionFilter selected={selectedRegion} onChange={setSelectedRegion} />
      </div>

      {/* Grid of Station Cards */}
      {filteredStations.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="text-3xl mb-2">🔍</div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No stations found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4 font-normal">
            Try searching for a different city, state, or reset your filters.
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-500 transition-all shadow-md shadow-teal-600/20 active:scale-95"
          >
            Show All {STATIONS.length} Stations
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStations.map((station) => (
            <StationCard
              key={station.slug}
              station={station}
              participantCount={counts[station.slug] ?? 0}
              participantNames={participants[station.slug] ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
