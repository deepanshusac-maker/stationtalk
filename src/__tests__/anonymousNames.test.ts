import {
  generateRandomName,
  COMMON_MALE_NAMES,
  COMMON_FEMALE_NAMES,
  completeOnboarding,
  getStoredGender,
  isOnboardingCompleted,
  STORAGE_KEY_GENDER,
  STORAGE_KEY_NAME,
  STORAGE_KEY_ONBOARDED,
} from '@/lib/anonymousNames';

describe('Anonymous Names & Gender System', () => {
  const store: Record<string, string> = {};

  beforeAll(() => {
    const mockStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const k in store) delete store[k];
      },
    };

    (global as unknown as { window: unknown }).window = {
      localStorage: mockStorage,
      dispatchEvent: () => true,
    };
    (global as unknown as { localStorage: unknown }).localStorage = mockStorage;
  });

  beforeEach(() => {
    for (const k in store) delete store[k];
  });

  it('contains comprehensive lists of male and female names', () => {
    expect(COMMON_MALE_NAMES.length).toBeGreaterThanOrEqual(50);
    expect(COMMON_FEMALE_NAMES.length).toBeGreaterThanOrEqual(50);

    expect(COMMON_MALE_NAMES).toContain('Aarav');
    expect(COMMON_MALE_NAMES).toContain('Rohan');
    expect(COMMON_MALE_NAMES).toContain('Kabir');

    expect(COMMON_FEMALE_NAMES).toContain('Ananya');
    expect(COMMON_FEMALE_NAMES).toContain('Priya');
    expect(COMMON_FEMALE_NAMES).toContain('Diya');
  });

  it('generates a random male name matching the male pool', () => {
    const maleName = generateRandomName('male');
    const [baseName, tag] = maleName.split(' ');
    expect(COMMON_MALE_NAMES).toContain(baseName);
    expect(tag).toMatch(/^#\d{2}$/);
  });

  it('generates a random female name matching the female pool', () => {
    const femaleName = generateRandomName('female');
    const [baseName, tag] = femaleName.split(' ');
    expect(COMMON_FEMALE_NAMES).toContain(baseName);
    expect(tag).toMatch(/^#\d{2}$/);
  });

  it('completes onboarding and saves gender and name to localStorage', () => {
    expect(isOnboardingCompleted()).toBe(false);

    const chosen = completeOnboarding('female', 'Priya #99');
    expect(chosen).toBe('Priya #99');
    expect(store[STORAGE_KEY_GENDER]).toBe('female');
    expect(store[STORAGE_KEY_NAME]).toBe('Priya #99');
    expect(store[STORAGE_KEY_ONBOARDED]).toBe('true');
    expect(getStoredGender()).toBe('female');
    expect(isOnboardingCompleted()).toBe(true);
  });
});
