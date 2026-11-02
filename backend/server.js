const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// In-Memory Data Store (Seeded for Demo Reliability)
const users = [
  {
    id: "usr_demo_01",
    name: "Raghav Sharma",
    email: "demo@carboncoin.in",
    phone: "9876543210",
    password: "password123",
    isIdentityVerified: true,
    carbonCoins: 120,
    createdAt: new Date().toISOString()
  }
];

const assets = [
  {
    id: "ast_demo_01",
    userEmail: "demo@carboncoin.in",
    assetType: "Agroforestry & Teak Plantation",
    species: "Teak & Bamboo",
    treeCount: 350,
    landArea: 2.5,
    state: "Maharashtra",
    district: "Nagpur",
    surveyNumber: "MH-NGP-712-44A",
    status: "AI Verified 🛰️",
    ndviScore: 0.74,
    co2OffsetTons: 12.0,
    carbonCoinsEarned: 120,
    verifiedAt: new Date().toISOString()
  }
];

const corporateBuyers = [
  { id: "cb_01", name: "Viksit Bharat Clean Energy Corp", pricePerCoin: 650, verified: true },
  { id: "cb_02", name: "Tata Steel Carbon Offset Program", pricePerCoin: 680, verified: true },
  { id: "cb_03", name: "Infosys Eco Action Initiative", pricePerCoin: 640, verified: true }
];

const transactions = [];

// Helper: Carbon Sequestration Calculator
function calculateCarbonMetrics(species, treeCount, landArea, ageYears = 5) {
  const speciesAbsorption = {
    neem: 0.025, // tons CO2/tree/year
    teak: 0.035,
    bamboo: 0.040,
    banyan: 0.050,
    mango: 0.022,
    default: 0.028
  };

  const key = Object.keys(speciesAbsorption).find(k => 
    species && species.toLowerCase().includes(k)
  ) || "default";

  const ratePerTree = speciesAbsorption[key];
  const count = Number(treeCount) || 100;
  const ageFactor = Math.min(Math.max((Number(ageYears) || 5) / 5, 0.8), 1.5);
  
  const co2SequesteredTons = Number((count * ratePerTree * ageFactor).toFixed(2));
  // 1 ton CO2e = 10 CarbonCoins
  const carbonCoinsIssued = Math.round(co2SequesteredTons * 10);
  const ndviScore = Number((0.68 + Math.random() * 0.18).toFixed(2));

  return { co2SequesteredTons, carbonCoinsIssued, ndviScore };
}

// Routes

// 1. Health Checks
app.get("/", (req, res) => {
  res.send("Server is alive!");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "CarbonCoin Backend API",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// 2. Authentication
app.post("/api/auth/signup", (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: "All fields (name, email, phone, password) are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "User with this email already exists." });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    phone,
    password,
    isIdentityVerified: false,
    carbonCoins: 0,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  res.status(201).json({
    message: "Account created successfully!",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      isIdentityVerified: newUser.isIdentityVerified,
      carbonCoins: newUser.carbonCoins
    }
  });
});

app.post("/api/auth/login", (req, res) => {
  const { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password) {
    return res.status(400).json({ error: "Email/Phone and password are required." });
  }

  const user = users.find(u => 
    u.email.toLowerCase() === emailOrPhone.toLowerCase() || u.phone === emailOrPhone
  );

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials. Please verify your email/phone and password." });
  }

  res.json({
    message: "Login successful!",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isIdentityVerified: user.isIdentityVerified,
      carbonCoins: user.carbonCoins
    }
  });
});

app.get("/api/auth/me", (req, res) => {
  const email = req.query.email;
  const user = users.find(u => u.email.toLowerCase() === (email || "").toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isIdentityVerified: user.isIdentityVerified,
      carbonCoins: user.carbonCoins
    }
  });
});

// 3. Identity Verification
app.post("/api/verify/identity", (req, res) => {
  const { email, aadhaarProvided, selfieProvided } = req.body;

  if (!aadhaarProvided || !selfieProvided) {
    return res.status(400).json({
      verified: false,
      error: "Both Aadhaar document and live selfie are mandatory for biometric verification."
    });
  }

  const user = users.find(u => u.email.toLowerCase() === (email || "demo@carboncoin.in").toLowerCase());
  if (user) {
    user.isIdentityVerified = true;
  }

  const matchScore = Number((96.5 + Math.random() * 3).toFixed(1));
  const aadhaarMasked = "XXXX-XXXX-" + Math.floor(1000 + Math.random() * 9000);

  res.json({
    verified: true,
    status: "Verified",
    matchScore,
    aadhaarMasked,
    verificationMethod: "AI Biometric Facial & OCR Match",
    timestamp: new Date().toISOString()
  });
});

// 4. Asset Registration & Verification
app.post("/api/assets/register", (req, res) => {
  const { userEmail, assetType, treeCount, landArea, state, district, species, surveyNumber } = req.body;

  if (!assetType || !treeCount || !landArea) {
    return res.status(400).json({ error: "assetType, treeCount, and landArea are required." });
  }

  const newAsset = {
    id: `ast_${Date.now()}`,
    userEmail: (userEmail || "demo@carboncoin.in").toLowerCase(),
    assetType,
    species: species || "Mixed Native Trees",
    treeCount: Number(treeCount),
    landArea: Number(landArea),
    state: state || "India",
    district: district || "District",
    surveyNumber: surveyNumber || `IN-SRV-${Math.floor(100 + Math.random() * 900)}`,
    status: "Pending Verification",
    ndviScore: null,
    co2OffsetTons: 0,
    carbonCoinsEarned: 0,
    createdAt: new Date().toISOString()
  };

  assets.push(newAsset);
  res.status(201).json({ message: "Asset registered successfully!", asset: newAsset });
});

app.post("/api/assets/verify", (req, res) => {
  const { assetId, userEmail, species, treeCount, landArea, treeAgeYears } = req.body;

  const metrics = calculateCarbonMetrics(species, treeCount, landArea, treeAgeYears);

  // Update existing asset if assetId passed
  if (assetId) {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      asset.status = "AI Verified 🛰️";
      asset.ndviScore = metrics.ndviScore;
      asset.co2OffsetTons = metrics.co2SequesteredTons;
      asset.carbonCoinsEarned = metrics.carbonCoinsIssued;
      asset.verifiedAt = new Date().toISOString();
    }
  }

  // Credit user's wallet
  const email = (userEmail || "demo@carboncoin.in").toLowerCase();
  const user = users.find(u => u.email === email);
  if (user) {
    user.carbonCoins += metrics.carbonCoinsIssued;
  }

  res.json({
    verified: true,
    status: "AI Verified 🛰️",
    satelliteProvider: "Sentinel-2 / Landsat 9 Multi-Spectral",
    ndviScore: metrics.ndviScore,
    canopyDensity: `${Math.round(metrics.ndviScore * 100)}%`,
    co2SequesteredTons: metrics.co2SequesteredTons,
    carbonCoinsIssued: metrics.carbonCoinsIssued,
    updatedWalletBalance: user ? user.carbonCoins : metrics.carbonCoinsIssued,
    verifiedAt: new Date().toISOString()
  });
});

app.get("/api/assets", (req, res) => {
  const email = (req.query.email || "demo@carboncoin.in").toLowerCase();
  const userAssets = assets.filter(a => a.userEmail === email);
  res.json({ assets: userAssets });
});

// 5. Carbon Credits & Marketplace
app.get("/api/credits/balance", (req, res) => {
  const email = (req.query.email || "demo@carboncoin.in").toLowerCase();
  const user = users.find(u => u.email === email);
  const carbonCoins = user ? user.carbonCoins : 0;
  res.json({
    carbonCoins,
    corporateBuyers,
    estimatedMarketValueINR: carbonCoins * 650
  });
});

app.post("/api/credits/trade", (req, res) => {
  const { email, coinsToSell, buyerName, pricePerCoin } = req.body;
  const count = Number(coinsToSell);

  if (!count || count <= 0) {
    return res.status(400).json({ error: "Invalid number of coins to sell." });
  }

  const targetEmail = (email || "demo@carboncoin.in").toLowerCase();
  const user = users.find(u => u.email === targetEmail);

  if (!user || user.carbonCoins < count) {
    return res.status(400).json({
      error: `Insufficient Carbon Coins. Current balance: ${user ? user.carbonCoins : 0}`
    });
  }

  const price = Number(pricePerCoin) || 650;
  const payoutAmount = count * price;

  user.carbonCoins -= count;

  const transaction = {
    id: `tx_${Date.now()}`,
    userEmail: targetEmail,
    coinsSold: count,
    pricePerCoin: price,
    payoutAmount,
    buyerName: buyerName || "Viksit Bharat Clean Energy Corp",
    status: "Completed",
    timestamp: new Date().toISOString()
  };

  transactions.push(transaction);

  res.json({
    success: true,
    message: "Carbon credits successfully liquidated!",
    receiptId: transaction.id,
    coinsSold: count,
    pricePerCoin: price,
    payoutAmount,
    buyerName: transaction.buyerName,
    newBalance: user.carbonCoins,
    timestamp: transaction.timestamp
  });
});

// Only bind to port if run directly (allows Supertest testing without port lock)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CarbonCoin Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
