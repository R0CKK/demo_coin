# 🌱 CarbonCoin — Hack for Viksit Bharat MVP

**CarbonCoin** is a next-generation Carbon Capitalization Marketplace democratizing the carbon credit economy for individuals, farmers, and rural communities across India. By combining satellite Earth observation (Sentinel-2 / Landsat) and AI canopy analysis, CarbonCoin turns everyday green assets (plantations, agroforestry, trees) into verified, tradable digital **Carbon Coins**.

---

## 🚀 Quick Start Guide

### 1. Start the Backend API (Port 5000)
```powershell
cd backend
npm install
npm start
```
*Backend runs at `http://localhost:5000` with pre-seeded demo user and assets.*

### 2. Start the Frontend Application (Port 3000)
```powershell
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:3000`.*

---

## 🧪 Automated Test Suite (TDD Verified)

Both frontend and backend are fully covered by automated test suites.

### Run Backend Tests (12 tests)
```powershell
cd backend
npm test
```
*Tests health checks, user signup/login, biometric KYC verification, asset registration, satellite NDVI verification, and marketplace trades.*

### Run Frontend Tests (14 tests)
```powershell
cd frontend
npm test
```
*Tests Indian agroforestry carbon sequestration formulas, age multipliers, NDVI indexes, auth validation, and dashboard portfolio state aggregation.*

---

## 🎯 Step-by-Step Live Demo Flow

1. **Landing Page (`http://localhost:3000`)**:
   - Explore the hero banner, value proposition, and feature grid.
   - Click **"Get Started"** or **"Login"**.

2. **1-Click Demo Login (`/login`)**:
   - Click the **"⚡ 1-Click Demo Login"** button.
   - Pre-fills `demo@carboncoin.in` and logs in instantly.
   - If user is newly registered, routes smoothly through KYC.

3. **Identity Verification (`/verify-identity`)**:
   - Click **"⚡ Auto-load Sample Docs"** to instantly load valid Aadhaar & live selfie previews.
   - Click **"Run AI Biometric Verification"** to simulate facial recognition match (98.4% confidence) and Aadhaar OCR.
   - Automatically navigates to the Dashboard.

4. **Interactive Dashboard (`/dashboard`)**:
   - Displays real-time dynamic stats:
     - **Carbon Coins Wallet Balance** (e.g., 120 Coins, valued at ₹78,000) synced with the Navbar.
     - **Verified Green Assets count**.
     - **Total CO2 Offset** (in Metric Tons/year).
   - Inspect the **"My Green Assets Portfolio"** table with real NDVI canopy ratings and parcel coordinates.

5. **Property & Land Verification Wizard (`/property-verification`)**:
   - Click **"+ Verify New Asset"**.
   - **Step 1**: Select asset type (e.g. 500 Neem trees across 3.5 acres). Click *"⚡ Auto-fill Sample Asset"*.
   - **Step 2**: Load 7/12 land extract and GPS pin.
   - **Step 3**: Click *"🛰️ Start Satellite AI Scan"*: watch the real-time radar sweep and multi-spectral band analysis generate an NDVI index (0.74) and annual CO2 sequestration (12.5 Tons).
   - **Step 4**: Click *"Claim Carbon Coins"* to mint +125 Carbon Coins directly to your wallet!

6. **Marketplace Trading Simulation**:
   - Return to Dashboard and click **"🪙 Trade / Sell Credits"**.
   - Choose corporate buyer (e.g. *Viksit Bharat Clean Energy Corp* @ ₹650 / coin).
   - Enter coins to sell and click **"Confirm Sale"**.
   - Review the instant liquidation receipt with UPI/NEFT payout credit.

7. **Verifiable Digital Green Certificate**:
   - On the Dashboard, click **"📜 View Certificate"**.
   - Displays the tamper-proof official **National Green Capitalization Certificate** with unique serial number, QR verification seal, and print/download button.

---

## 🏛️ Architecture & Technologies
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Vitest, JSDOM.
- **Backend**: Express 5, CORS, Supertest, Node.js Native Test Runner.
- **Verification Engine**: Multi-spectral NDVI calculation, MoEFCC & ICAR tree species absorption benchmarks.
- **Fail-Safe Design**: Dual-mode data synchronization (Express REST API with automated fallback to `localStorage`), ensuring a presentation that never crashes.
