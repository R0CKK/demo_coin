import { describe, it, expect } from 'vitest';
import {
  aggregateDashboardMetrics,
  calculateTradePayout,
  generateCertificateData
} from '../lib/portfolioHelper';

describe('Portfolio & Dashboard State Management (TDD)', () => {
  const sampleAssets = [
    {
      id: 'ast_1',
      status: 'AI Verified 🛰️',
      co2OffsetTons: 12.5,
      carbonCoinsEarned: 125,
      treeCount: 500
    },
    {
      id: 'ast_2',
      status: 'AI Verified 🛰️',
      co2OffsetTons: 8.0,
      carbonCoinsEarned: 80,
      treeCount: 200
    },
    {
      id: 'ast_3',
      status: 'Pending Verification',
      co2OffsetTons: 0,
      carbonCoinsEarned: 0,
      treeCount: 300
    }
  ];

  it('aggregates total verified assets, pending documents, and CO2 offset accurately', () => {
    const metrics = aggregateDashboardMetrics(sampleAssets, 205);

    expect(metrics.verifiedAssetsCount).toBe(2);
    expect(metrics.pendingDocumentsCount).toBe(1);
    expect(metrics.totalCo2OffsetTons).toBe(20.5);
    expect(metrics.totalTrees).toBe(1000);
    expect(metrics.carbonCoins).toBe(205);
  });

  it('calculates trade payout and validates trade amount against user balance', () => {
    const trade = calculateTradePayout(20, 650, 100);
    expect(trade.valid).toBe(true);
    expect(trade.payoutINR).toBe(13000);
    expect(trade.remainingCoins).toBe(80);

    const overTrade = calculateTradePayout(150, 650, 100);
    expect(overTrade.valid).toBe(false);
    expect(overTrade.error).toContain('Insufficient');
  });

  it('generates verifiable certificate metadata with serial number and seal info', () => {
    const cert = generateCertificateData({
      userName: 'Raghav Sharma',
      totalCo2Tons: 20.5,
      totalTrees: 1000,
      assetType: 'Agroforestry & Native Plantations'
    });

    expect(cert.serialNumber).toMatch(/^VBMVP-CC-[A-Z0-9]+$/);
    expect(cert.issuer).toBe('National Green India & Viksit Bharat Mission');
    expect(cert.userName).toBe('Raghav Sharma');
    expect(cert.totalCo2Tons).toBe(20.5);
  });
});
