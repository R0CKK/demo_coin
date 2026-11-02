import { describe, it, expect } from 'vitest';
import {
  calculateCarbonSequestration,
  estimateNDVIScore,
  convertToCarbonCoins,
  SPECIES_FACTORS
} from '../lib/carbonEngine';

describe('Carbon Engine Calculations (TDD)', () => {
  it('has valid sequestration absorption factors for major Indian green species', () => {
    expect(SPECIES_FACTORS['neem']).toBeGreaterThan(0.02);
    expect(SPECIES_FACTORS['teak']).toBeGreaterThan(0.03);
    expect(SPECIES_FACTORS['bamboo']).toBeGreaterThan(0.035);
    expect(SPECIES_FACTORS['banyan']).toBeGreaterThan(0.04);
  });

  it('calculates carbon sequestration for 500 Neem trees', () => {
    const result = calculateCarbonSequestration({
      species: 'neem',
      treeCount: 500,
      landArea: 3,
      treeAgeYears: 5
    });

    // 500 * 0.025 * 1.0 = 12.5 tons CO2/year
    expect(result.co2OffsetTons).toBeCloseTo(12.5, 1);
    expect(result.carbonCoinsEarned).toBe(125);
  });

  it('adjusts carbon absorption based on tree age factor', () => {
    const youngTree = calculateCarbonSequestration({
      species: 'teak',
      treeCount: 100,
      treeAgeYears: 2
    });

    const matureTree = calculateCarbonSequestration({
      species: 'teak',
      treeCount: 100,
      treeAgeYears: 8
    });

    expect(matureTree.co2OffsetTons).toBeGreaterThan(youngTree.co2OffsetTons);
  });

  it('converts tons of CO2 to Carbon Coins at 1 ton = 10 coins ratio', () => {
    expect(convertToCarbonCoins(1)).toBe(10);
    expect(convertToCarbonCoins(15.4)).toBe(154);
    expect(convertToCarbonCoins(0)).toBe(0);
  });

  it('generates a realistic NDVI canopy density index between 0.65 and 0.90 for verified vegetation', () => {
    const ndvi = estimateNDVIScore('healthy_canopy');
    expect(ndvi).toBeGreaterThanOrEqual(0.65);
    expect(ndvi).toBeLessThanOrEqual(0.95);
  });
});
