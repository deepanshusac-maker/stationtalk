/**
 * Station Registry — seed data and validation utilities.
 *
 * All station slugs are pre-registered. The API layer rejects
 * any room name that isn't in this list.
 */

export type Region = 'north' | 'south' | 'east' | 'west' | 'central';

export interface Station {
  slug: string;
  name: string;
  region: Region;
  description: string;
}

/**
 * Seed station records.
 * These are clearly sample data — not live or scraped records.
 */
export const STATIONS: Station[] = [
  // Central
  { slug: 'grand-central', name: 'Grand Central', region: 'central', description: 'The main hub — all lines converge here.' },
  { slug: 'unity-square', name: 'Unity Square', region: 'central', description: 'Where every voice finds a platform.' },
  { slug: 'crossroads', name: 'Crossroads', region: 'central', description: 'Meet travellers from every direction.' },
  // North
  { slug: 'northern-lights', name: 'Northern Lights', region: 'north', description: 'Late-night conversations under the aurora.' },
  { slug: 'summit-station', name: 'Summit Station', region: 'north', description: 'Elevated discussions at the peak.' },
  // South
  { slug: 'harbour-bay', name: 'Harbour Bay', region: 'south', description: 'Coastal vibes and laid-back chats.' },
  { slug: 'sunstone-terminal', name: 'Sunstone Terminal', region: 'south', description: 'Warm conversations in the southern sun.' },
  // East
  { slug: 'dawn-platform', name: 'Dawn Platform', region: 'east', description: 'Early risers and fresh perspectives.' },
  { slug: 'east-bridge', name: 'East Bridge', region: 'east', description: 'Connecting ideas across the divide.' },
  // West
  { slug: 'sunset-depot', name: 'Sunset Depot', region: 'west', description: 'Wind down with evening conversations.' },
  { slug: 'pacific-junction', name: 'Pacific Junction', region: 'west', description: 'Where the tracks meet the ocean.' },
  { slug: 'canyon-halt', name: 'Canyon Halt', region: 'west', description: 'Echoing voices in the canyon.' },
];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Map for O(1) slug lookups. */
const stationMap = new Map<string, Station>(
  STATIONS.map((s) => [s.slug, s])
);

/** Returns all registered station slugs. */
export function getValidSlugs(): string[] {
  return STATIONS.map((s) => s.slug);
}

/**
 * Normalize and validate a station slug.
 * Returns the normalized slug or null if invalid.
 */
export function normalizeSlug(raw: string): string | null {
  const slug = raw.trim().toLowerCase();
  if (!SLUG_PATTERN.test(slug)) return null;
  return stationMap.has(slug) ? slug : null;
}

/** Look up a station by its slug. */
export function getStation(slug: string): Station | undefined {
  const normalized = normalizeSlug(slug);
  if (!normalized) return undefined;
  return stationMap.get(normalized);
}

/** Return all stations, optionally filtered by region. */
export function getStations(region?: Region): Station[] {
  if (!region) return [...STATIONS];
  return STATIONS.filter((s) => s.region === region);
}

/** Search stations by name (case-insensitive substring match). */
export function searchStations(query: string): Station[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...STATIONS];
  return STATIONS.filter((s) => s.name.toLowerCase().includes(q));
}

/** All valid region values. */
export const REGIONS: Region[] = ['north', 'south', 'east', 'west', 'central'];

/** Check if a string is a valid region. */
export function isValidRegion(value: string): value is Region {
  return REGIONS.includes(value as Region);
}
