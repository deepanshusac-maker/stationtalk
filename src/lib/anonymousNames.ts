/**
 * Anonymous Identity & Persona System for StationTalk.
 *
 * Provides gender-based common name generators with unique passenger tags,
 * persistent onboarding detection, and seamless synchronization across sessions.
 */

export type Gender = 'male' | 'female';

export const COMMON_MALE_NAMES = [
  'Aarav', 'Rohan', 'Kabir', 'Aryan', 'Aditya', 'Arjun', 'Vikram', 'Reyansh',
  'Vihaan', 'Ishaan', 'Dhruv', 'Samar', 'Dev', 'Ayaan', 'Yash', 'Krrish',
  'Armaan', 'Kunal', 'Rahul', 'Aman', 'Neil', 'Siddharth', 'Tushar', 'Tanmay',
  'Varun', 'Nikhil', 'Sahil', 'Pranav', 'Rishabh', 'Shivam', 'Karan', 'Aniket',
  'Ritvik', 'Alok', 'Mohit', 'Harshit', 'Rohit', 'Mayank', 'Kartik', 'Sameer',
  'Tejas', 'Advait', 'Vivaan', 'Shaurya', 'Ayush', 'Abhay', 'Manav', 'Akash',
  'Chetan', 'Gaurav', 'Raghav', 'Madhav', 'Harsh', 'Chirag', 'Deepak', 'Anand',
  'Sanjay', 'Suraj', 'Vicky', 'Sunny',
] as const;

export const COMMON_FEMALE_NAMES = [
  'Ananya', 'Priya', 'Diya', 'Ishita', 'Riya', 'Sneha', 'Aisha', 'Mira',
  'Kiara', 'Sara', 'Tara', 'Avani', 'Meera', 'Zara', 'Pooja', 'Neha',
  'Tanvi', 'Simran', 'Kavya', 'Shreya', 'Kriti', 'Aditi', 'Anika', 'Niharika',
  'Shruti', 'Sanya', 'Roshni', 'Navya', 'Trisha', 'Rhea', 'Mansi', 'Payal',
  'Swati', 'Divya', 'Aakanksha', 'Palak', 'Bhavya', 'Tanya', 'Khushi', 'Alisha',
  'Rashi', 'Sanjana', 'Anjali', 'Mehak', 'Drishti', 'Vanshika', 'Prachi', 'Gunjan',
  'Jyoti', 'Naina', 'Isha', 'Simi', 'Pari', 'Lavanya', 'Muskan', 'Sonali',
  'Bhoomi', 'Natasha', 'Komal', 'Barkha',
] as const;

export const STORAGE_KEY_NAME = 'stationtalk_display_name';
export const STORAGE_KEY_GENDER = 'stationtalk_gender';
export const STORAGE_KEY_ONBOARDED = 'stationtalk_onboarded';

/**
 * Generates a random anonymous handle based on selected gender (or random gender if omitted).
 * Format: "Aarav #42" or "Ananya #19"
 */
export function generateRandomName(gender?: Gender): string {
  const chosenGender: Gender = gender || (Math.random() > 0.5 ? 'male' : 'female');
  const pool = chosenGender === 'female' ? COMMON_FEMALE_NAMES : COMMON_MALE_NAMES;
  const baseName = pool[Math.floor(Math.random() * pool.length)];
  const passengerNum = Math.floor(10 + Math.random() * 90);
  return `${baseName} #${passengerNum}`;
}

/**
 * Returns the user's stored gender preference, if any.
 */
export function getStoredGender(): Gender | null {
  if (typeof window === 'undefined') return null;
  const g = localStorage.getItem(STORAGE_KEY_GENDER);
  return g === 'male' || g === 'female' ? g : null;
}

/**
 * Stores the user's gender preference.
 */
export function setStoredGender(gender: Gender): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_GENDER, gender);
}

/**
 * Checks if the user has completed the first-time identity onboarding.
 */
export function isOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_KEY_ONBOARDED) === 'true';
}

/**
 * Completes onboarding with the user's selected gender and chosen/generated name.
 */
export function completeOnboarding(gender: Gender, customName?: string): string {
  if (typeof window === 'undefined') return 'Passenger #01';
  const name = customName?.trim() || generateRandomName(gender);
  localStorage.setItem(STORAGE_KEY_GENDER, gender);
  localStorage.setItem(STORAGE_KEY_NAME, name);
  localStorage.setItem(STORAGE_KEY_ONBOARDED, 'true');

  window.dispatchEvent(new Event('stationtalk_name_change'));
  window.dispatchEvent(new Event('storage'));
  return name;
}

/**
 * Gets or initializes the anonymous name for this browser session.
 */
export function getOrInitAnonymousName(defaultGender?: Gender): string {
  if (typeof window === 'undefined') return 'Curious Passenger';
  let name = localStorage.getItem(STORAGE_KEY_NAME);
  if (!name || !name.trim()) {
    const gender = defaultGender || getStoredGender() || (Math.random() > 0.5 ? 'male' : 'female');
    name = generateRandomName(gender);
    localStorage.setItem(STORAGE_KEY_NAME, name);
  }
  return name;
}

/**
 * Re-rolls a new random anonymous identity matching the current or passed gender.
 */
export function shuffleAnonymousName(overrideGender?: Gender): string {
  if (typeof window === 'undefined') return generateRandomName();
  const gender = overrideGender || getStoredGender() || (Math.random() > 0.5 ? 'male' : 'female');
  const newName = generateRandomName(gender);
  localStorage.setItem(STORAGE_KEY_NAME, newName);
  window.dispatchEvent(new Event('stationtalk_name_change'));
  window.dispatchEvent(new Event('storage'));
  return newName;
}

/**
 * Dispatches an event to open the Identity Onboarding/Customizer modal.
 */
export function openIdentityModal(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('stationtalk_open_identity_modal'));
}
