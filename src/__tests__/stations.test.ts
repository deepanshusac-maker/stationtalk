import {
  normalizeSlug,
  getStation,
  getStations,
  searchStations,
  getValidSlugs,
  isValidRegion,
  STATIONS,
  REGIONS,
} from '../lib/stations';

describe('Station Registry & Allowed Room IDs', () => {
  describe('Allowed Normalized Station Rooms', () => {
    it('accepts explicitly required normalized stations', () => {
      expect(normalizeSlug('delhi-central')).toBe('delhi-central');
      expect(normalizeSlug('mumbai-central')).toBe('mumbai-central');
      expect(normalizeSlug('patna-junction')).toBe('patna-junction');
      expect(normalizeSlug('chennai-central')).toBe('chennai-central');
    });

    it('normalizes uppercase and surrounding whitespace correctly', () => {
      expect(normalizeSlug('  Delhi-Central  ')).toBe('delhi-central');
      expect(normalizeSlug('MUMBAI-CENTRAL')).toBe('mumbai-central');
      expect(normalizeSlug('Patna-Junction')).toBe('patna-junction');
      expect(normalizeSlug('chennai-central')).toBe('chennai-central');
    });

    it('returns station details for valid rooms', () => {
      const delhi = getStation('delhi-central');
      expect(delhi).toBeDefined();
      expect(delhi!.name).toBe('Delhi Central');
      expect(delhi!.region).toBe('central');

      const mumbai = getStation('mumbai-central');
      expect(mumbai).toBeDefined();
      expect(mumbai!.name).toBe('Mumbai Central');
      expect(mumbai!.region).toBe('west');

      const patna = getStation('patna-junction');
      expect(patna).toBeDefined();
      expect(patna!.name).toBe('Patna Junction');
      expect(patna!.region).toBe('east');

      const chennai = getStation('chennai-central');
      expect(chennai).toBeDefined();
      expect(chennai!.name).toBe('Chennai Central');
      expect(chennai!.region).toBe('south');
    });
  });

  describe('Rejection of Arbitrary and Malformed Room IDs', () => {
    it('rejects arbitrary non-existent room names', () => {
      expect(normalizeSlug('arbitrary-room')).toBeNull();
      expect(normalizeSlug('my-custom-voice-room')).toBeNull();
      expect(normalizeSlug('unknown-junction')).toBeNull();
      expect(getStation('arbitrary-room')).toBeUndefined();
    });

    it('rejects empty and whitespace inputs', () => {
      expect(normalizeSlug('')).toBeNull();
      expect(normalizeSlug('   ')).toBeNull();
    });

    it('rejects rooms with invalid characters', () => {
      expect(normalizeSlug('delhi central')).toBeNull(); // spaces
      expect(normalizeSlug('delhi_central')).toBeNull(); // underscores
      expect(normalizeSlug('delhi@central')).toBeNull(); // symbols
      expect(normalizeSlug('delhi/central')).toBeNull(); // slashes
    });

    it('rejects SQL injection attempts', () => {
      expect(normalizeSlug("'; DROP TABLE stations;--")).toBeNull();
      expect(normalizeSlug("' OR '1'='1")).toBeNull();
    });

    it('rejects directory traversal attempts', () => {
      expect(normalizeSlug('../../../etc/passwd')).toBeNull();
      expect(normalizeSlug('..\\..\\windows')).toBeNull();
    });
  });

  describe('Regional Coverage & Filtering', () => {
    it('includes all 5 valid regions', () => {
      for (const region of REGIONS) {
        expect(isValidRegion(region)).toBe(true);
      }
      expect(isValidRegion('northwest')).toBe(false);
      expect(isValidRegion('random')).toBe(false);
    });

    it('has stations across every region', () => {
      for (const region of REGIONS) {
        const regionalStations = getStations(region);
        expect(regionalStations.length).toBeGreaterThan(0);
        expect(regionalStations.every((s) => s.region === region)).toBe(true);
      }
    });

    it('returns all stations when no region is filtered', () => {
      expect(getStations()).toHaveLength(STATIONS.length);
    });
  });

  describe('Search Functionality', () => {
    it('returns all stations for empty query', () => {
      expect(searchStations('')).toHaveLength(STATIONS.length);
    });

    it('finds stations by case-insensitive partial query', () => {
      const delhi = searchStations('delhi');
      expect(delhi.length).toBeGreaterThanOrEqual(1);
      expect(delhi[0].slug).toBe('delhi-central');

      const junction = searchStations('JUNCTION');
      expect(junction.length).toBeGreaterThanOrEqual(4);
    });

    it('returns empty array when query has no match', () => {
      expect(searchStations('zzz-non-existent')).toHaveLength(0);
    });
  });

  describe('Registry Integrity', () => {
    it('all slugs are non-empty and unique', () => {
      const slugs = getValidSlugs();
      expect(slugs).toHaveLength(STATIONS.length);
      expect(new Set(slugs).size).toBe(slugs.length);
    });

    it('all slugs strictly conform to the kebab-case pattern', () => {
      const pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      for (const station of STATIONS) {
        expect(station.slug).toMatch(pattern);
      }
    });

    it('all stations have valid fields and assigned regions', () => {
      for (const station of STATIONS) {
        expect(station.slug).toBeTruthy();
        expect(station.name).toBeTruthy();
        expect(station.description).toBeTruthy();
        expect(REGIONS).toContain(station.region);
      }
    });
  });
});
