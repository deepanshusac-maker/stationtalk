/**
 * Anonymous Persona Generator for StationTalk.
 *
 * Generates evocative, friendly, and atmospheric anonymous handles
 * so users can freely explore and speak across stations with full privacy.
 */

const ADJECTIVES = [
  'Silent',
  'Mystic',
  'Wandering',
  'Velvet',
  'Cosmic',
  'Midnight',
  'Amber',
  'Swift',
  'Solar',
  'Astral',
  'Curious',
  'Golden',
  'Misty',
  'Brisk',
  'Serene',
  'Daring',
  'Quiet',
  'Neon',
  'Echo',
  'Indigo',
  'Lunar',
  'Silver',
  'Drifting',
  'Zenith',
  'Vibrant',
  'Twilight',
  'Shadow',
  'Humble',
];

const NOUNS = [
  'Passenger',
  'Traveler',
  'Nomad',
  'Commuter',
  'Voyager',
  'Stargazer',
  'Conductor',
  'Dreamer',
  'Wanderer',
  'Sparrow',
  'Fox',
  'Owl',
  'Falcon',
  'Panda',
  'ChaiLover',
  'Signalman',
  'TrackRider',
  'Navigator',
  'Seeker',
  'Observer',
  'Rambler',
  'Poet',
];

/**
 * Generates a fresh random anonymous moniker (e.g. "Curious Nomad #42").
 */
export function generateRandomName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${adj} ${noun} #${num}`;
}

const STORAGE_KEY = 'stationtalk_display_name';

/**
 * Gets or initializes the anonymous name for this browser session.
 */
export function getOrInitAnonymousName(): string {
  if (typeof window === 'undefined') return 'Curious Passenger';
  let name = localStorage.getItem(STORAGE_KEY);
  if (!name || !name.trim()) {
    name = generateRandomName();
    localStorage.setItem(STORAGE_KEY, name);
  }
  return name;
}

/**
 * Re-rolls a new random anonymous identity and notifies listeners.
 */
export function shuffleAnonymousName(): string {
  if (typeof window === 'undefined') return generateRandomName();
  const newName = generateRandomName();
  localStorage.setItem(STORAGE_KEY, newName);
  window.dispatchEvent(new Event('stationtalk_name_change'));
  window.dispatchEvent(new Event('storage'));
  return newName;
}
