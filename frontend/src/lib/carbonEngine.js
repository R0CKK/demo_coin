/**
 * Carbon Calculation Engine for Indian Agroforestry & Tree Plantations
 * Formulated aligned with ICAR and MoEFCC carbon sequestration benchmarks.
 */

// Sequestration rates in Metric Tons of CO2 per tree per year
export const SPECIES_FACTORS = {
  neem: 0.025,       // Azadirachta indica: ~25 kg CO2/yr
  teak: 0.035,       // Tectona grandis: ~35 kg CO2/yr
  bamboo: 0.040,     // Bambusa vulgaris: ~40 kg CO2/yr (high density)
  banyan: 0.050,     // Ficus benghalensis: ~50 kg CO2/yr
  mango: 0.022,      // Mangifera indica: ~22 kg CO2/yr
  peepal: 0.048,     // Ficus religiosa: ~48 kg CO2/yr
  default: 0.028     // General mixed native plantation average
};

/**
 * Calculates total annual CO2 offset and CarbonCoins earned.
 */
export function calculateCarbonSequestration({ species = 'default', treeCount = 100, landArea = 1, treeAgeYears = 5 }) {
  const normSpecies = (species || '').toLowerCase();
  const matchedKey = Object.keys(SPECIES_FACTORS).find(k => normSpecies.includes(k)) || 'default';
  const absorptionRate = SPECIES_FACTORS[matchedKey];

  const count = Number(treeCount) || 0;
  // Age factor: Young trees (1-2 yrs) absorb ~80%, mature trees (5-10 yrs) absorb up to 130%
  const ageFactor = Math.min(Math.max((Number(treeAgeYears) || 5) / 5, 0.8), 1.5);

  const co2OffsetTons = Number((count * absorptionRate * ageFactor).toFixed(2));
  const carbonCoinsEarned = convertToCarbonCoins(co2OffsetTons);

  return {
    species: matchedKey,
    treeCount: count,
    landArea: Number(landArea) || 1,
    treeAgeYears: Number(treeAgeYears) || 5,
    co2OffsetTons,
    carbonCoinsEarned
  };
}

/**
 * 1 metric ton of sequestered CO2 = 10 Carbon Coins
 */
export function convertToCarbonCoins(co2Tons) {
  const tons = Number(co2Tons) || 0;
  return Math.round(tons * 10);
}

/**
 * Simulates Normalized Difference Vegetation Index (NDVI) from multi-spectral imagery
 * Healthy dense canopy typically ranges from 0.65 to 0.88.
 */
export function estimateNDVIScore(vegetationStatus = 'healthy_canopy') {
  if (vegetationStatus === 'sparse') {
    return Number((0.35 + Math.random() * 0.15).toFixed(2));
  }
  // Healthy dense canopy
  return Number((0.72 + (Math.random() * 0.14 - 0.07)).toFixed(2));
}
