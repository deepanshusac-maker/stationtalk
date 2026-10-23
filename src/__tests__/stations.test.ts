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

describe('Station Registry', () => {
  describe('normalizeSlug', () => {
    it('returns null for empty string', () => {
      expect(normalizeSlug('')).toBeNull();
    });

    it('returns null for whitespace-only string', () => {
      expect(normalizeSlug('   ')).toBeNull();
    });

    it('returns null for unregistered slug', () => {
      expect(normalizeSlug('nonexistent-station')).toBeNull();
    });

    it('returns null for slugs with invalid characters', () => {
      expect(normalizeSlug('grand central')).toBeNull(); // spaces
      expect(normalizeSlug('grand_central')).toBeNull(); // underscores
      expect(normalizeSlug('hello@world')).toBeNull(); // special chars
      expect(normalizeSlug('test/path')).toBeNull(); // slashes
    });

    it('normalizes and validates registered slugs', () => {
      expect(normalizeSlug('grand-central')).toBe('grand-central');
      expect(normalizeSlug('  Grand-Central  ')).toBe('grand-central');
      expect(normalizeSlug('NORTHERN-LIGHTS')).toBe('northern-lights');
    });

    it('rejects SQL injection attempts', () => {
      expect(normalizeSlug("'; DROP TABLE stations;--")).toBeNull();
    });

    it('rejects path traversal attempts', () => {
      expect(normalizeSlug('../../../etc/passwd')).toBeNull();
    });
  });

  describe('getStation', () => {
    it('returns station for valid slug', () => {
      const station = getStation('grand-central');
      expect(station).toBeDefined();
      expect(station!.name).toBe('Grand Central');
      expect(station!.region).toBe('central');
    });

    it('returns undefined for invalid slug', () => {
      expect(getStation('fake-station')).toBeUndefined();
    });

    it('handles case-insensitive lookup', () => {
      const station = getStation('Grand-Central');
      expect(station).toBeDefined();
      expect(station!.slug).toBe('grand-central');
    });
  });

  describe('getStations', () => {
    it('returns all stations when no region specified', () => {
      const stations = getStations();
      expect(stations).toHaveLength(STATIONS.length);
    });

    it('filters by region', () => {
      const north = getStations('north');
      expect(north.length).toBeGreaterThan(0);
      expect(north.every((s) => s.region === 'north')).toBe(true);
    });

    it('returns correct count for each region', () => {
      const central = getStations('central');
      expect(central).toHaveLength(3);

      const north = getStations('north');
      expect(north).toHaveLength(2);

      const south = getStations('south');
      expect(south).toHaveLength(2);

      const east = getStations('east');
      expect(east).toHaveLength(2);

      const west = getStations('west');
      expect(west).toHaveLength(3);
    });
  });

  describe('searchStations', () => {
    it('returns all stations for empty query', () => {
      expect(searchStations('')).toHaveLength(STATIONS.length);
    });

    it('finds stations by partial name', () => {
      const results = searchStations('grand');
      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('grand-central');
    });

    it('is case-insensitive', () => {
      const results = searchStations('NORTHERN');
      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('northern-lights');
    });

    it('returns empty array for no matches', () => {
      expect(searchStations('zzzznonexistent')).toHaveLength(0);
    });

    it('matches partial words', () => {
      const results = searchStations('sun');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some((s) => s.slug === 'sunset-depot' || s.slug === 'sunstone-terminal')).toBe(true);
    });
  });

  describe('getValidSlugs', () => {
    it('returns all registered slugs', () => {
      const slugs = getValidSlugs();
      expect(slugs).toHaveLength(STATIONS.length);
      expect(slugs).toContain('grand-central');
      expect(slugs).toContain('northern-lights');
    });
  });

  describe('isValidRegion', () => {
    it('returns true for valid regions', () => {
      for (const region of REGIONS) {
        expect(isValidRegion(region)).toBe(true);
      }
    });

    it('returns false for invalid regions', () => {
      expect(isValidRegion('northeast')).toBe(false);
      expect(isValidRegion('')).toBe(false);
      expect(isValidRegion('NORTH')).toBe(false);
    });
  });

  describe('station data integrity', () => {
    it('all slugs are unique', () => {
      const slugs = STATIONS.map((s) => s.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    });

    it('all slugs match the slug pattern', () => {
      const pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      for (const station of STATIONS) {
        expect(station.slug).toMatch(pattern);
      }
    });

    it('all stations have required fields', () => {
      for (const station of STATIONS) {
        expect(station.slug).toBeTruthy();
        expect(station.name).toBeTruthy();
        expect(station.region).toBeTruthy();
        expect(station.description).toBeTruthy();
        expect(REGIONS).toContain(station.region);
      }
    });
  });
});
