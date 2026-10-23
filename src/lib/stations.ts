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
  city: string;
  state: string;
  region: Region;
  description: string;
  seedSpeakers?: string[];
}

/**
 * Normalized station records.
 * Fixed set of registered rooms across 5 regional transit zones.
 */
export const STATIONS: Station[] = [
  // South
  {
    slug: 'coimbatore-junction',
    name: 'Coimbatore Junction',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    region: 'south',
    description: 'Cotton city concourse with entrepreneurial dialogue and pleasant hill breezes.',
    seedSpeakers: ['Mira', 'Karthik', 'Janani'],
  },
  {
    slug: 'madurai-junction',
    name: 'Madurai Junction',
    city: 'Madurai',
    state: 'Tamil Nadu',
    region: 'south',
    description: 'Historic temple city terminal with rich cultural discussions and evening chats.',
    seedSpeakers: ['Zara', 'Sundar'],
  },
  {
    slug: 'bengaluru-city',
    name: 'Bengaluru City',
    city: 'Bengaluru',
    state: 'Karnataka',
    region: 'south',
    description: 'Product builders, technology pioneers, and weekend audio spaces.',
    seedSpeakers: ['Kabir', 'Rohan', 'Dia', 'Aarav', 'Neha'],
  },
  {
    slug: 'chennai-central',
    name: 'Chennai Central',
    city: 'Chennai',
    state: 'Tamil Nadu',
    region: 'south',
    description: 'Classic southern terminus with thoughtful music, arts, and deep discussions.',
    seedSpeakers: ['Jade', 'Vignesh', 'Deepa', 'Sanjay'],
  },
  {
    slug: 'mysuru-junction',
    name: 'Mysuru Junction',
    city: 'Mysuru',
    state: 'Karnataka',
    region: 'south',
    description: 'Royal heritage platform for quiet reflections, art, and literature.',
    seedSpeakers: ['Aanya', 'Prakash'],
  },
  {
    slug: 'hyderabad-deccan',
    name: 'Hyderabad Deccan',
    city: 'Hyderabad',
    state: 'Telangana',
    region: 'south',
    description: 'Rich cultural crossroads blending heritage narratives with modern tech.',
    seedSpeakers: ['Anaya', 'Farhan', 'Shreya'],
  },
  {
    slug: 'tirupati',
    name: 'Tirupati',
    city: 'Tirupati',
    state: 'Andhra Pradesh',
    region: 'south',
    description: 'Spiritual transit point welcoming travelers from all walks of life.',
    seedSpeakers: ['Rider-cbd0', 'Harish'],
  },

  // North
  {
    slug: 'prayagraj-junction',
    name: 'Prayagraj Junction',
    city: 'Prayagraj',
    state: 'Uttar Pradesh',
    region: 'north',
    description: 'Sacred confluence terminal where lively debates and literature meet.',
    seedSpeakers: ['Meera', 'Gaurav', 'Alok'],
  },
  {
    slug: 'kanpur-central',
    name: 'Kanpur Central',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    region: 'north',
    description: 'Bustling railway junction with vibrant local banter and spirited opinions.',
    seedSpeakers: ['Lily', 'Raghav', 'Ankit', 'Simran'],
  },
  {
    slug: 'gorakhpur-junction',
    name: 'Gorakhpur Junction',
    city: 'Gorakhpur',
    state: 'Uttar Pradesh',
    region: 'north',
    description: 'Home of the worlds longest railway platform and timeless travelers tales.',
    seedSpeakers: ['Priya', 'Vivek', 'Manish', 'Pooja', 'Ravi'],
  },
  {
    slug: 'haridwar',
    name: 'Haridwar',
    city: 'Haridwar',
    state: 'Uttarakhand',
    region: 'north',
    description: 'Himalayan foothills gateway filled with serene thoughts and morning wisdom.',
    seedSpeakers: ['Aditya', 'Tarun', 'Ananya', 'Keshav'],
  },
  {
    slug: 'jodhpur-junction',
    name: 'Jodhpur Junction',
    city: 'Jodhpur',
    state: 'Rajasthan',
    region: 'north',
    description: 'Sun city blue lanes platform with warm royal hospitality and folk stories.',
    seedSpeakers: ['Rider-59c5', 'Nikhil', 'Dev', 'Tara'],
  },
  {
    slug: 'ghaziabad',
    name: 'Ghaziabad',
    city: 'Ghaziabad',
    state: 'Uttar Pradesh',
    region: 'north',
    description: 'High-speed junction connecting the capital commuters and late-night talks.',
    seedSpeakers: ['Rider-4dcd', 'Sunil', 'Bhavna'],
  },
  {
    slug: 'jaipur-junction',
    name: 'Jaipur Junction',
    city: 'Jaipur',
    state: 'Rajasthan',
    region: 'north',
    description: 'Vibrant pink city platform for art, architecture, and colourful chats.',
    seedSpeakers: ['Maya', 'Kunal', 'Ishaan'],
  },
  {
    slug: 'amritsar-junction',
    name: 'Amritsar Junction',
    city: 'Amritsar',
    state: 'Punjab',
    region: 'north',
    description: 'Warm hospitality, lively storytelling, and community discussions.',
    seedSpeakers: ['Gurpreet', 'Simran', 'Harpreet'],
  },
  {
    slug: 'chandigarh-terminal',
    name: 'Chandigarh Terminal',
    city: 'Chandigarh',
    state: 'Punjab / Haryana',
    region: 'north',
    description: 'Orderly, thought-provoking dialogue with fresh northern mountain breezes.',
    seedSpeakers: ['Aman', 'Tanya'],
  },

  // Central
  {
    slug: 'delhi-central',
    name: 'Delhi Central',
    city: 'Delhi',
    state: 'NCT',
    region: 'central',
    description: 'The bustling national hub where main lines and diverse voices converge.',
    seedSpeakers: ['Aditya', 'Vikram', 'Pooja', 'Rohan'],
  },
  {
    slug: 'ujjain-junction',
    name: 'Ujjain Junction',
    city: 'Ujjain',
    state: 'Madhya Pradesh',
    region: 'central',
    description: 'Historic city of Mahakal hosting peaceful discussions and astronomical trivia.',
    seedSpeakers: ['Dylan', 'Satish', 'Geeta', 'Anand'],
  },
  {
    slug: 'bhopal-junction',
    name: 'Bhopal Junction',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    region: 'central',
    description: 'Central heartland platform connecting north and south audio corridors.',
    seedSpeakers: ['Amit', 'Tanvi', 'Siddharth'],
  },
  {
    slug: 'nagpur-junction',
    name: 'Nagpur Junction',
    city: 'Nagpur',
    state: 'Maharashtra',
    region: 'central',
    description: 'The zero-mile marker station for balanced discussions and open forums.',
    seedSpeakers: ['Chetan', 'Pallavi'],
  },

  // East
  {
    slug: 'patna-junction',
    name: 'Patna Junction',
    city: 'Patna',
    state: 'Bihar',
    region: 'east',
    description: 'Historic river gateway hosting vibrant, spirited, and deep conversations.',
    seedSpeakers: ['Arjun'],
  },
  {
    slug: 'howrah-junction',
    name: 'Howrah Junction',
    city: 'Kolkata',
    state: 'West Bengal',
    region: 'east',
    description: 'Iconic terminal platform for cultural discourse and morning perspectives.',
    seedSpeakers: ['Sourav', 'Debojit', 'Moumita', 'Anirban'],
  },
  {
    slug: 'guwahati-terminal',
    name: 'Guwahati Terminal',
    city: 'Guwahati',
    state: 'Assam',
    region: 'east',
    description: 'Eastern sector hub connecting early risers and fresh perspectives.',
    seedSpeakers: ['Pranab', 'Nabanita'],
  },

  // West
  {
    slug: 'mumbai-central',
    name: 'Mumbai Central',
    city: 'Mumbai',
    state: 'Maharashtra',
    region: 'west',
    description: 'Fast-paced evening conversations, creative ideas, and western coast vibes.',
    seedSpeakers: ['Rahul', 'Sneha', 'Sameer', 'Natasha'],
  },
  {
    slug: 'ahmedabad-junction',
    name: 'Ahmedabad Junction',
    city: 'Ahmedabad',
    state: 'Gujarat',
    region: 'west',
    description: 'Enterprising dialogue, business exchanges, and lively regional debates.',
    seedSpeakers: ['Jignesh', 'Parul', 'Hardik'],
  },
  {
    slug: 'pune-junction',
    name: 'Pune Junction',
    city: 'Pune',
    state: 'Maharashtra',
    region: 'west',
    description: 'Tech builders, academic minds, and relaxed evening stage talks.',
    seedSpeakers: ['Omkar', 'Swati', 'Chinmay'],
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

/** Search stations by name, city, or state (case-insensitive substring match). */
export function searchStations(query: string): Station[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...STATIONS];
  return STATIONS.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.state.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q)
  );
}

/** All valid region values. */
export const REGIONS: Region[] = ['north', 'south', 'east', 'west', 'central'];

/** Check if a string is a valid region. */
export function isValidRegion(value: string): value is Region {
  return REGIONS.includes(value as Region);
}
