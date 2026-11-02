import { describe, it, expect } from 'vitest';
import {
  filterLocalLocations,
  parseNominatimAddress
} from '../lib/locationSearch';

describe('Location Search Utilities (TDD)', () => {
  it('finds local Indian farming hubs and cities by keyword', () => {
    const results = filterLocalLocations('nagpur');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain('nagpur');
    expect(results[0].state).toBe('Maharashtra');
    expect(results[0].lat).toBeCloseTo(21.1458, 2);
  });

  it('matches districts and states case-insensitively', () => {
    const keralaResults = filterLocalLocations('wayanad');
    expect(keralaResults.length).toBeGreaterThan(0);
    expect(keralaResults[0].state).toBe('Kerala');

    const punjabResults = filterLocalLocations('punjab');
    expect(punjabResults.length).toBeGreaterThan(0);
    expect(punjabResults[0].state).toBe('Punjab');
  });

  it('returns empty array when query is too short or unmatched', () => {
    expect(filterLocalLocations('')).toEqual([]);
    expect(filterLocalLocations('a')).toEqual([]);
    expect(filterLocalLocations('xyznonexistentplacename123')).toEqual([]);
  });

  it('parses Nominatim geocoding item into standardized location object', () => {
    const mockNominatimItem = {
      display_name: 'Pune, Maharashtra, 411001, India',
      lat: '18.5204',
      lon: '73.8567',
      address: {
        city: 'Pune',
        state_district: 'Pune District',
        state: 'Maharashtra',
        country: 'India',
        postcode: '411001'
      }
    };

    const parsed = parseNominatimAddress(mockNominatimItem);
    expect(parsed.lat).toBe(18.5204);
    expect(parsed.lng).toBe(73.8567);
    expect(parsed.state).toBe('Maharashtra');
    expect(parsed.district).toBe('Pune');
  });
});
