/**
 * Dashboard & Portfolio State Aggregation Helpers
 */

export function aggregateDashboardMetrics(assets = [], walletBalance = 0) {
  let verifiedAssetsCount = 0;
  let pendingDocumentsCount = 0;
  let totalCo2OffsetTons = 0;
  let totalTrees = 0;

  for (const asset of assets) {
    if (asset.status && asset.status.includes('Verified')) {
      verifiedAssetsCount += 1;
      totalCo2OffsetTons += Number(asset.co2OffsetTons) || 0;
    } else {
      pendingDocumentsCount += 1;
    }
    totalTrees += Number(asset.treeCount) || 0;
  }

  return {
    verifiedAssetsCount,
    pendingDocumentsCount,
    totalCo2OffsetTons: Number(totalCo2OffsetTons.toFixed(2)),
    totalTrees,
    carbonCoins: Number(walletBalance) || 0
  };
}

export function calculateTradePayout(coinsToSell, pricePerCoin = 650, currentBalance = 0) {
  const coins = Number(coinsToSell) || 0;
  const balance = Number(currentBalance) || 0;

  if (coins <= 0) {
    return { valid: false, error: 'Must sell at least 1 Carbon Coin' };
  }

  if (coins > balance) {
    return { valid: false, error: `Insufficient balance: you have ${balance} coins, requested ${coins}` };
  }

  const payoutINR = coins * Number(pricePerCoin);
  return {
    valid: true,
    coinsSold: coins,
    pricePerCoin,
    payoutINR,
    remainingCoins: balance - coins
  };
}

export function generateCertificateData({ userName, totalCo2Tons, totalTrees, assetType }) {
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const serialNumber = `VBMVP-CC-${randomSuffix}`;

  return {
    serialNumber,
    userName: userName || 'Registered Contributor',
    totalCo2Tons: Number(totalCo2Tons) || 0,
    totalTrees: Number(totalTrees) || 0,
    assetType: assetType || 'Agroforestry & Green Asset Portfolio',
    issueDate: new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    issuer: 'National Green India & Viksit Bharat Mission',
    registryStatus: 'Officially Verified & Immutably Recorded'
  };
}
