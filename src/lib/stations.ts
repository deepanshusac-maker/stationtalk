/**
 * Station Registry — pre-registered normalized station rooms.
 *
 * All station slugs are fixed and pre-registered. The API layer
 * strictly rejects any room name that isn't in this list.
 */

export type Region = 'north' | 'south' | 'east' | 'west' | 'central';

export interface Station {
  slug: string;
  name: string;
  region: Region;
  description: string;
}

/**
 * Normalized station records.
 * Fixed set of registered rooms across 5 regional transit zones.
 */
export const STATIONS: Station[] = [
  // Central
  {
    slug: 'delhi-central',
    name: 'Delhi Central',
    region: 'central',
    description: 'The bustling national hub where main lines and diverse voices converge.',
  },
  {
    slug: 'bhopal-junction',
    name: 'Bhopal Junction',
    region: 'central',
    description: 'Central heartland platform connecting north and south audio corridors.',
  },
  {
    slug: 'nagpur-junction',
    name: 'Nagpur Junction',
    region: 'central',
    description: 'The zero-mile marker station for balanced discussions and open forums.',
  },

  // West
  {
    slug: 'mumbai-central',
    name: 'Mumbai Central',
    region: 'west',
    description: 'Fast-paced evening conversations, creative ideas, and western coast vibes.',
  },
  {
    slug: 'ahmedabad-junction',
    name: 'Ahmedabad Junction',
    region: 'west',
    description: 'Enterprising dialogue, business exchanges, and lively regional debates.',
  },
  {
    slug: 'pune-junction',
    name: 'Pune Junction',
    region: 'west',
    description: 'Tech builders, academic minds, and relaxed evening stage talks.',
  },

  // East
  {
    slug: 'patna-junction',
    name: 'Patna Junction',
    region: 'east',
    description: 'Historic river gateway hosting vibrant, spirited, and deep conversations.',
  },
  {
    slug: 'howrah-junction',
    name: 'Howrah Junction',
    region: 'east',
    description: 'Iconic terminal platform for cultural discourse and morning perspectives.',
  },
  {
    slug: 'guwahati-terminal',
    name: 'Guwahati Terminal',
    region: 'east',
    description: 'Eastern sector hub connecting early risers and fresh perspectives.',
  },

  // South
  {
    slug: 'chennai-central',
    name: 'Chennai Central',
    region: 'south',
    description: 'Classic southern terminus with thoughtful music, arts, and deep discussions.',
  },
  {
    slug: 'bengaluru-city',
    name: 'Bengaluru City',
    region: 'south',
    description: 'Product builders, technology pioneers, and weekend audio spaces.',
  },
  {
    slug: 'hyderabad-deccan',
    name: 'Hyderabad Deccan',
    region: 'south',
    description: 'Rich cultural crossroads blending heritage narratives with modern tech.',
  },

  // North
  {
    slug: 'amritsar-junction',
    name: 'Amritsar Junction',
    region: 'north',
    description: 'Warm hospitality, lively storytelling, and community discussions.',
  },
  {
    slug: 'chandigarh-terminal',
    name: 'Chandigarh Terminal',
    region: 'north',
    description: 'Orderly, thought-provoking dialogue with fresh northern mountain breezes.',
  },
  {
    slug: 'jaipur-junction',
    name: 'Jaipur Junction',
    region: 'north',
    description: 'Vibrant pink city platform for art, architecture, and colourful chats.',
  },
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
 * Returns the normalized slug or null if invalid or unregistered.
 */
export function normalizeSlug(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null;
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
