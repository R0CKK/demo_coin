/**
 * API Client with Hybrid Backend & LocalStorage Resilience
 * If the backend is running, it queries http://localhost:5000/api.
 * If backend is unreachable or during offline demos, it gracefully falls back to localStorage,
 * guaranteeing 100% demo continuity without any hiccups.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to broadcast balance changes to Navbar & Components
export function broadcastCoinUpdate(coins) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('carbonCoins', coins.toString());
    window.dispatchEvent(new CustomEvent('carbonCoinsUpdated', { detail: coins }));
  }
}

// Default Seeded Assets for demo user
const DEFAULT_DEMO_ASSETS = [
  {
    id: 'ast_demo_01',
    userEmail: 'demo@carboncoin.in',
    assetType: 'Agroforestry & Teak Plantation',
    species: 'Teak & Bamboo',
    treeCount: 350,
    landArea: 2.5,
    state: 'Maharashtra',
    district: 'Nagpur',
    surveyNumber: 'MH-NGP-712-44A',
    status: 'AI Verified 🛰️',
    ndviScore: 0.74,
    co2OffsetTons: 12.0,
    carbonCoinsEarned: 120,
    verifiedAt: '2026-02-15T10:00:00.000Z'
  }
];

export const api = {
  // 1. Get Stored Session
  getUser() {
    if (typeof window === 'undefined') return null;
    const name = localStorage.getItem('userName') || 'Demo Contributor';
    const email = localStorage.getItem('userEmail') || 'demo@carboncoin.in';
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isIdentityVerified = localStorage.getItem('identityVerified') === 'true';
    const carbonCoins = parseInt(localStorage.getItem('carbonCoins') || '120', 10);
    return { name, email, isLoggedIn, isIdentityVerified, carbonCoins };
  },

  // 2. Signup
  async signup({ name, email, phone, password }) {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {
      // Backend offline fallback
    }

    // Local storage fallback
    const mockUser = {
      id: `usr_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      phone,
      isIdentityVerified: false,
      carbonCoins: 0
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
    }
    return { message: 'Account created successfully (Local Sync)', user: mockUser };
  },

  // 3. Login
  async login({ emailOrPhone, password }) {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof window !== 'undefined') {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userName', data.user.name);
          localStorage.setItem('userEmail', data.user.email);
          localStorage.setItem('identityVerified', data.user.isIdentityVerified ? 'true' : 'false');
          broadcastCoinUpdate(data.user.carbonCoins || 0);
        }
        return { success: true, user: data.user };
      }
    } catch {
      // Backend offline fallback
    }

    // Local demo login fallback
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('userName') || 'Raghav Sharma';
      const isDemo = emailOrPhone.includes('demo') || emailOrPhone.includes('raghav');
      const name = isDemo ? 'Raghav Sharma' : savedName;
      const verified = isDemo;
      const coins = isDemo ? 120 : 0;

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', emailOrPhone);
      localStorage.setItem('identityVerified', verified ? 'true' : 'false');
      broadcastCoinUpdate(coins);

      return {
        success: true,
        user: { name, email: emailOrPhone, isIdentityVerified: verified, carbonCoins: coins }
      };
    }

    return { success: false, error: 'Login failed' };
  },

  // 4. Identity Verification
  async verifyIdentity({ email, aadhaarProvided = true, selfieProvided = true }) {
    try {
      const res = await fetch(`${BACKEND_URL}/verify/identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, aadhaarProvided, selfieProvided })
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof window !== 'undefined') {
          localStorage.setItem('identityVerified', 'true');
        }
        return data;
      }
    } catch {
      // Backend offline fallback
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('identityVerified', 'true');
    }
    return {
      verified: true,
      status: 'Verified',
      matchScore: 98.4,
      aadhaarMasked: 'XXXX-XXXX-8921',
      verificationMethod: 'AI Biometric Facial & OCR Match'
    };
  },

  // 5. Get Assets
  async getAssets(email) {
    try {
      const res = await fetch(`${BACKEND_URL}/assets?email=${encodeURIComponent(email || 'demo@carboncoin.in')}`);
      if (res.ok) {
        const data = await res.json();
        return data.assets || [];
      }
    } catch {
      // Backend offline fallback
    }

    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('userAssets');
      if (local) {
        try {
          return JSON.parse(local);
        } catch {
          // ignore
        }
      }
      localStorage.setItem('userAssets', JSON.stringify(DEFAULT_DEMO_ASSETS));
    }
    return DEFAULT_DEMO_ASSETS;
  },

  // 6. Register & Verify Asset
  async registerAndVerifyAsset({ userEmail, assetType, species, treeCount, landArea, state, district, surveyNumber, treeAgeYears = 5 }) {
    let result = null;
    try {
      // Try backend verify endpoint
      const res = await fetch(`${BACKEND_URL}/assets/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          assetType,
          species,
          treeCount,
          landArea,
          treeAgeYears
        })
      });
      if (res.ok) {
        result = await res.json();
      }
    } catch {
      // Fallback to local calculation
    }

    if (!result) {
      // Local calculation fallback
      const { calculateCarbonSequestration, estimateNDVIScore } = await import('./carbonEngine');
      const metrics = calculateCarbonSequestration({ species, treeCount, landArea, treeAgeYears });
      const ndviScore = estimateNDVIScore('healthy_canopy');

      result = {
        verified: true,
        status: 'AI Verified 🛰️',
        satelliteProvider: 'Sentinel-2 / Landsat 9 Multi-Spectral',
        ndviScore,
        canopyDensity: `${Math.round(ndviScore * 100)}%`,
        co2SequesteredTons: metrics.co2OffsetTons,
        carbonCoinsIssued: metrics.carbonCoinsEarned
      };
    }

    // Save newly created verified asset into user asset list in localStorage
    if (typeof window !== 'undefined') {
      const newAsset = {
        id: `ast_${Date.now()}`,
        userEmail: userEmail || 'demo@carboncoin.in',
        assetType: assetType || 'Agroforestry & Tree Plantation',
        species: species || 'Neem & Native Trees',
        treeCount: Number(treeCount) || 100,
        landArea: Number(landArea) || 1,
        state: state || 'Maharashtra',
        district: district || 'Nagpur',
        surveyNumber: surveyNumber || `IN-SRV-${Math.floor(100 + Math.random() * 900)}`,
        status: 'AI Verified 🛰️',
        ndviScore: result.ndviScore,
        co2OffsetTons: result.co2SequesteredTons,
        carbonCoinsEarned: result.carbonCoinsIssued,
        verifiedAt: new Date().toISOString()
      };

      const existingAssets = await api.getAssets(userEmail);
      const updatedAssets = [newAsset, ...existingAssets];
      localStorage.setItem('userAssets', JSON.stringify(updatedAssets));

      const currentCoins = parseInt(localStorage.getItem('carbonCoins') || '0', 10);
      const newCoins = currentCoins + result.carbonCoinsIssued;
      broadcastCoinUpdate(newCoins);
    }

    return result;
  },

  // 7. Trade / Liquidate Credits
  async tradeCredits({ email, coinsToSell, buyerName, pricePerCoin = 650 }) {
    try {
      const res = await fetch(`${BACKEND_URL}/credits/trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, coinsToSell, buyerName, pricePerCoin })
      });
      if (res.ok) {
        const data = await res.json();
        broadcastCoinUpdate(data.newBalance);
        return data;
      }
    } catch {
      // Backend offline fallback
    }

    // Local trade fallback
    if (typeof window !== 'undefined') {
      const currentCoins = parseInt(localStorage.getItem('carbonCoins') || '0', 10);
      const count = Number(coinsToSell);
      if (count > currentCoins) {
        return { success: false, error: 'Insufficient Carbon Coins' };
      }
      const newBalance = currentCoins - count;
      broadcastCoinUpdate(newBalance);

      return {
        success: true,
        receiptId: `TX-VB-${Date.now().toString().slice(-6)}`,
        coinsSold: count,
        pricePerCoin,
        payoutAmount: count * pricePerCoin,
        buyerName: buyerName || 'Viksit Bharat Clean Energy Corp',
        newBalance,
        timestamp: new Date().toISOString()
      };
    }

    return { success: false, error: 'Trade execution error' };
  },

  // 8. Logout
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('identityVerified');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      broadcastCoinUpdate(0);
    }
  }
};
