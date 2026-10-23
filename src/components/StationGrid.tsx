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
    <div className="space-y-6">
      {/* Search & Filters Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-sm">
        <SearchBar onSearch={handleSearch} />
        <RegionFilter selected={selectedRegion} onChange={setSelectedRegion} />
      </div>

      {/* Results Meta */}
      <div className="flex items-center justify-between px-1 text-xs font-mono text-gray-500">
        <div>
          Showing <span className="text-amber-400 font-semibold">{filteredStations.length}</span> of{' '}
          <span className="text-gray-300">{STATIONS.length}</span> Platforms
          {selectedRegion && (
            <span className="ml-2 px-2 py-0.5 rounded bg-gray-800 text-gray-300 capitalize">
              Line: {selectedRegion}
            </span>
          )}
        </div>

        {(selectedRegion !== null || searchQuery !== '') && (
          <button
            onClick={handleReset}
            className="text-amber-400 hover:text-amber-300 underline underline-offset-4 transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Grid of Stations */}
      {filteredStations.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-gray-900/40 border border-gray-800/80">
          <div className="text-4xl mb-3">🚉</div>
          <h3 className="text-lg font-bold text-white mb-1">No Platforms Found</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto mb-6">
            No station lines matched your search or filter. Try a different query or reset filters.
          </p>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-gray-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
          >
            Show All {STATIONS.length} Stations
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStations.map((station) => (
            <StationCard
              key={station.slug}
              station={station}
              participantCount={counts[station.slug] ?? null}
            />
          ))}
        </div>
      )}

      {/* Seed Notice */}
      <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800/60 text-center">
        <p className="text-xs text-gray-500 font-mono">
          ℹ️ Seed station records for demonstration. Selecting any station connects to a live LiveKit room.
        </p>
      </div>
    </div>
  );
}
