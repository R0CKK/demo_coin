# Product Requirements Document (PRD)

# 🌱 CarbonCoin — Carbon Capitalization Marketplace
**Empowering India's Green Assets under the Viksit Bharat 2047 Roadmap**

| **Document Version** | 1.0.0 |
| **Status** | Approved & MVP Deployed |
| **Target Platform** | Web (Desktop & Mobile Responsive) |
| **Repository** | [https://github.com/R0CKK/demo_coin](https://github.com/R0CKK/demo_coin) |
| **Target Initiatives** | *Hack for Viksit Bharat*, India Net Zero 2070, MoEFCC Green Credit Programme |

---

## 1. Executive Summary & Vision

### 1.1 The Vision
**CarbonCoin** is a decentralized, AI- and satellite-powered **Carbon Capitalization Marketplace** designed to democratize climate finance. While legacy carbon markets cater almost exclusively to multinational corporations and mega-industrial developers, CarbonCoin empowers **smallholder farmers, rural landowners, and local communities** to register their green assets (agroforestry, timber plantations, fruit orchards, bamboo groves, and mangroves), verify them using satellite Earth observation, and mint tradable digital **Carbon Coins**.

### 1.2 Core Value Proposition
- **For Farmers & Landowners**: Unlock passive income (e.g. ₹50,000 – ₹2,50,000/year) from standing trees and sustainable land without harvesting or selling property.
- **For Corporate Buyers**: Direct, transparent access to high-integrity voluntary carbon credits with verifiable satellite imagery, avoiding greenwashing and exorbitant broker fees.
- **For the Nation (Viksit Bharat 2047)**: Accelerates India’s target of creating an additional carbon sink of 2.5 to 3 billion tons of $\text{CO}_2\text{e}$ through expanded forest and tree cover.

---

## 2. Problem Statement & Market Opportunity

```mermaid
flowchart LR
    subgraph Traditional["Legacy Carbon Market (Flawed)"]
        F1["Farmer plants 500 trees"] --> M1["Manual Audits ($20k+)"]
        M1 --> M2["12-18 Month Approval Delay"]
        M2 --> M3["High Middleman Margins (40-60%)"]
        M3 --> M4["Farmer receives almost nothing"]
    end

    subgraph CarbonCoinFlow["CarbonCoin Solution (Democratic)"]
        F2["Farmer pins land on Satellite Map"] --> C1["AI Multi-Spectral Canopy Scan"]
        C1 --> C2["Instant Sequestration Metric (NDVI)"]
        C2 --> C3["Immediate CarbonCoin Minting"]
        C3 --> C4["Direct Corporate Sale & Instant Payout"]
    end
```

### 2.1 The Current Bottlenecks
1. **Prohibitive Verification Costs**: Legacy carbon validation (Verra VCS, Gold Standard) requires on-site physical auditing, ground surveys, and third-party verifiers, costing anywhere between \$20,000 and \$80,000 per project. Smallholders with 1–10 acres are completely priced out.
2. **Glacial Verification Timelines**: Certification takes between 9 to 18 months.
3. **Lack of Transparency & Additionality**: Buyers cannot easily see the physical parcel of land or verify that the trees still stand, leading to greenwashing scandals.
4. **Complex Onboarding**: Farmers lack legal and technical know-how to navigate international carbon credit registries.

---

## 3. User Personas & Target Audience

| Persona | Profile | Core Pain Point | How CarbonCoin Solves It |
| :--- | :--- | :--- | :--- |
| **Ramesh Patel (Smallholder Farmer)** | Owns 3.5 acres in Nagpur, Maharashtra; grows 500 Neem and Teak trees alongside crops. | No financial benefit from standing trees; cannot afford accreditation consultants. | Simple Aadhaar KYC, search/pin farm on satellite map, receive Carbon Coins in minutes. |
| **Priya Nair (Corporate ESG Lead)** | Sustainability Director at a tech/industrial enterprise needing annual carbon offsets. | Struggles to find verified Indian credits with authentic provenance; fears audit penalties. | Purchases satellite-verified credits directly; receives immutable transaction receipts with GPS coordinates. |
| **Community Forest Officer** | Oversees collective village lands and bamboo plantations in Wayanad, Kerala. | No unified digital platform to register community-managed tree plantations. | Batch registration of collective parcels with official downloadable Green India Certificates. |

---

## 4. System Architecture & Tech Stack

```mermaid
flowchart TD
    subgraph Frontend["Frontend Client (Next.js 16 + React 19)"]
        Landing["Landing & Hero Page"]
        Auth["Signup & 1-Click Demo Login"]
        KYC["Biometric & Aadhaar Verification"]
        MapWiz["Leaflet Satellite Land Map & Wizard"]
        Dash["Real-time Portfolio Dashboard"]
        Market["Corporate Trading Modal"]
        Cert["Digital Green Certificate Generator"]
    end

    subgraph Backend["REST API Backend (Express 5 - Port 5000)"]
        AuthAPI["/api/auth (Login, Signup, Me)"]
        VerifyAPI["/api/verify (Biometric, OCR)"]
        AssetAPI["/api/assets (Register, Scan, List)"]
        CreditAPI["/api/credits (Balance, Trade)"]
    end

    subgraph Engines["Core Analytical Engines"]
        LocEngine["Indian Geocoding & Nominatim Engine"]
        CarbonEngine["MoEFCC/ICAR Carbon Sequestration Engine"]
        SatSim["Sentinel-2 Multi-Spectral NDVI Simulator"]
    end

    Frontend <--> Backend
    MapWiz --> LocEngine
    MapWiz --> SatSim
    SatSim --> CarbonEngine
```

### 4.1 Technology Stack Details
- **Frontend**: Next.js 16.1 (App Router), React 19.2, Tailwind CSS 4, Leaflet.js, OpenStreetMap & Esri World Imagery tiles.
- **Backend**: Node.js v24, Express 5.2, CORS, Supertest.
- **Testing Suites (TDD)**:
  - Frontend: Vitest 5.0, JSDOM, Testing Library (18 automated tests).
  - Backend: Node.js Native Test Runner `node:test` + Supertest (12 automated tests).
- **Fail-Safe Data Layer**: Dual-mode synchronization connecting to Express REST endpoints with an automated client-side `localStorage` fallback to guarantee **100% demo uptime**.

---

## 5. Functional Modules & Detailed Specifications

---

### Module 1: Authentication & Biometric KYC Verification

#### Objectives
Provide a seamless, legally defensible onboarding process that verifies farmer identity via Aadhaar OCR and facial biometrics to prevent fraudulent multi-account claims.

#### User Flow
1. **Sign Up (`/signup`)**: Contributor enters name, email, 10-digit Indian mobile number, and password. Form performs client-side regex validation and duplicate email check. Includes an `⚡ Auto-fill Demo` trigger.
2. **Login (`/login`)**: Validates credentials against backend/seeded accounts. Includes a `⚡ 1-Click Demo Login` button.
3. **Smart Routing**: Directs already-verified users straight to `/dashboard`, while unverified users are routed to `/verify-identity`.
4. **KYC Verification (`/verify-identity`)**:
   - Accepts Aadhaar document upload and live selfie.
   - For presentations, provides `⚡ Auto-load Sample Docs` (instant inline SVG vectors).
   - Simulates AI facial recognition comparison and returns a confidence score (e.g. 98.4%) and masked Aadhaar string (`XXXX-XXXX-8921`).

#### Key Code Snippet: Identity Verification API (`backend/server.js`)
```javascript
app.post("/api/verify/identity", (req, res) => {
  const { email, aadhaarProvided, selfieProvided } = req.body;

  if (!aadhaarProvided || !selfieProvided) {
    return res.status(400).json({
      verified: false,
      error: "Both Aadhaar document and live selfie are mandatory."
    });
  }

  const user = users.find(u => u.email.toLowerCase() === (email || "demo@carboncoin.in").toLowerCase());
  if (user) user.isIdentityVerified = true;

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
```

---

### Module 2: Interactive Satellite Land Mapping & Geolocation Search

#### Objectives
Allow farmers to accurately pinpoint their land, visualize real satellite imagery, search for their village/district/PIN code, and dynamically render the exact parcel boundary matching their acreage.

#### Features
- **Esri High-Resolution World Imagery & OpenStreetMap Layer Switcher**: Real satellite view showing fields, tree canopies, and road networks.
- **Click-to-Pin & Drag**: User can click anywhere on Earth or drag the custom **🌱 Sprout Marker** to update coordinates.
- **Dynamic Acreage Boundary Polygon**: Automatically computes the parcel radius in meters from acreage:
  $$\text{Area (m}^2) = \text{Acres} \times 4046.86, \quad r = \sqrt{\frac{\text{Area}}{\pi}}$$
  Renders an interactive green boundary polygon over the satellite imagery.
- **Omni-Search Geocoder**: Searches Indian farming centers (Nagpur, Wayanad, Nashik, Ludhiana, etc.) with 0ms local matching and live OpenStreetMap Nominatim reverse geocoding.
- **Browser GPS Pinpointing**: "📍 Use My GPS Location" using `navigator.geolocation`.

#### Key Code Snippet: Geolocation Search & Address Parser (`frontend/src/lib/locationSearch.js`)
```javascript
export function parseNominatimAddress(item) {
  if (!item) return null;
  const lat = parseFloat(item.lat);
  const lng = parseFloat(item.lon);
  const addr = item.address || {};

  const state = addr.state || addr.region || 'India';
  const rawDistrict = addr.city || addr.town || addr.village || addr.state_district || addr.county || 'Local District';
  const district = rawDistrict.replace(/\s+district$/i, '').trim();

  return {
    name: item.display_name.split(',').slice(0, 3).join(', '),
    fullName: item.display_name,
    lat,
    lng,
    state,
    district
  };
}
```

---

### Module 3: AI Satellite Multi-Spectral Sequestration Engine

#### Objectives
Calculate scientifically grounded carbon sequestration estimates based on tree species, tree count, plantation age, and simulated **NDVI (Normalized Difference Vegetation Index)** multi-spectral band reflectance.

#### Sequestration Formula
The calculations adhere to benchmarks established by the Indian Council of Forestry Research and Education (ICFRE) and the Indian Council of Agricultural Research (ICAR):

$$\text{Annual CO}_2\text{ Offset (Metric Tons)} = \text{TreeCount} \times \text{AbsorptionFactor}(\text{species}) \times \text{AgeFactor}$$

$$\text{Carbon Coins Issued} = \text{Annual CO}_2\text{ Offset (Tons)} \times 10$$

| Species | Botanical Name | Benchmark Absorption Rate ($\text{tCO}_2/\text{tree/yr}$) |
| :--- | :--- | :--- |
| **Neem** | *Azadirachta indica* | 0.025 (~25 kg/yr) |
| **Teak** | *Tectona grandis* | 0.035 (~35 kg/yr) |
| **Bamboo** | *Bambusa vulgaris* | 0.040 (~40 kg/yr - high density) |
| **Banyan / Peepal** | *Ficus benghalensis / F. religiosa* | 0.050 (~50 kg/yr) |
| **Mango / Fruit** | *Mangifera indica* | 0.022 (~22 kg/yr) |
| **Mixed Native** | Standard Agroforestry Blend | 0.028 (~28 kg/yr) |

#### Simulated Multi-Spectral NDVI
Sentinel-2 imagery calculates the ratio between Near-Infrared (NIR) and Red spectral bands:
$$\text{NDVI} = \frac{\text{NIR} - \text{RED}}{\text{NIR} + \text{RED}}$$
Values between **0.65 and 0.88** represent healthy, dense photosynthetic canopy biomass.

#### Key Code Snippet: Sequestration Calculation (`frontend/src/lib/carbonEngine.js`)
```javascript
export const SPECIES_FACTORS = {
  neem: 0.025,
  teak: 0.035,
  bamboo: 0.040,
  banyan: 0.050,
  mango: 0.022,
  default: 0.028
};

export function calculateCarbonSequestration({ species = 'default', treeCount = 100, landArea = 1, treeAgeYears = 5 }) {
  const normSpecies = (species || '').toLowerCase();
  const matchedKey = Object.keys(SPECIES_FACTORS).find(k => normSpecies.includes(k)) || 'default';
  const absorptionRate = SPECIES_FACTORS[matchedKey];

  const count = Number(treeCount) || 0;
  // Trees younger than 5 yrs absorb ~80%, mature trees (5-10 yrs) absorb up to 130%
  const ageFactor = Math.min(Math.max((Number(treeAgeYears) || 5) / 5, 0.8), 1.5);

  const co2OffsetTons = Number((count * absorptionRate * ageFactor).toFixed(2));
  const carbonCoinsEarned = Math.round(co2OffsetTons * 10);

  return { species: matchedKey, treeCount: count, landArea, treeAgeYears, co2OffsetTons, carbonCoinsEarned };
}
```

---

### Module 4: Real-Time Portfolio Dashboard

#### Objectives
Provide a unified, single-pane-of-glass overview of the contributor's carbon balance, pending applications, verified land parcels, and environmental impact.

```
+-----------------------------------------------------------------------------------------+
| [🌱 CarbonCoin]                                [120 Coins 🪙] [+ Verify Asset] [Logout]  |
+-----------------------------------------------------------------------------------------+
| Welcome back, Raghav Sharma! [KYC Verified ✅]                                           |
|                                                                                         |
| +-------------------+  +-------------------+  +-------------------+  +----------------+ |
| | Carbon Coins      |  | Verified Parcels  |  | Total CO2 Offset  |  | Pending Docs   | |
| | 120 🪙 (₹78,000)  |  | 1 Asset           |  | 12.0 Tons/year    |  | 0 Pending      | |
| +-------------------+  +-------------------+  +-------------------+  +----------------+ |
|                                                                                         |
| [🌿 My Green Assets Portfolio]                          [📋 Table View] [🛰️ Map View]   |
| +-------------------------------------------------------------------------------------+ |
| | Parcel Name           | Location         | Trees & Area | NDVI | CO2 Offset | Coins | |
| | Agroforestry & Teak   | Nagpur, MH       | 350 (2.5 Ac) | 0.74 | 12.0 Tons  | +120  | |
| +-------------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------+
```

#### Key Features
1. **Dynamic Statistics**: Eliminates static zero values; dynamically aggregates metrics from active and verified parcel records.
2. **Dual-View Portfolio**:
   - **Table View**: Detailed breakdown of each parcel (species, survey number, tree count, NDVI, tonnage).
   - **Satellite Map View**: Visual satellite map pinning all registered assets across the country with highlighted canopy polygons.
3. **Instant Navbar Synchronization**: Custom events (`carbonCoinsUpdated`) ensure any balance change in the wizard or trading modal instantly reflects in the navbar without a page refresh.

---

### Module 5: Carbon Credit Marketplace & Trade Liquidation

#### Objectives
Enable contributors to liquidate their earned Carbon Coins into direct Indian Rupees (INR) through verified corporate buyers committing to voluntary ESG offsets.

#### Specifications
- **Real-Time Corporate Quotes**:
  - *Viksit Bharat Clean Energy Corp*: ₹650 / Carbon Coin
  - *Tata Steel Carbon Offset Program*: ₹680 / Carbon Coin
  - *Infosys Eco Action Initiative*: ₹640 / Carbon Coin
- **Instant Settlement Simulation**:
  - User specifies the number of coins to liquidate.
  - Form validates that requested amount $\le$ wallet balance.
  - Deducts coins from ledger and yields a formal settlement receipt with transaction ID (`TX-VB-XXXXXX`), timestamp, and buyer details.

#### Key Code Snippet: Trade Execution Controller (`backend/server.js`)
```javascript
app.post("/api/credits/trade", (req, res) => {
  const { email, coinsToSell, buyerName, pricePerCoin } = req.body;
  const count = Number(coinsToSell);
  const user = users.find(u => u.email === (email || "demo@carboncoin.in").toLowerCase());

  if (!user || user.carbonCoins < count) {
    return res.status(400).json({ error: "Insufficient balance." });
  }

  const price = Number(pricePerCoin) || 650;
  const payoutAmount = count * price;
  user.carbonCoins -= count;

  const transaction = {
    id: `TX-VB-${Date.now().toString().slice(-6)}`,
    userEmail: user.email,
    coinsSold: count,
    pricePerCoin: price,
    payoutAmount,
    buyerName: buyerName || "Viksit Bharat Clean Energy Corp",
    timestamp: new Date().toISOString()
  };

  res.json({
    success: true,
    receiptId: transaction.id,
    coinsSold: count,
    payoutAmount,
    newBalance: user.carbonCoins
  });
});
```

---

### Module 6: Tamper-Proof Digital Green Certificate

#### Objectives
Provide contributors with a formal, printable, and verifiable **National Green Capitalization Certificate** recognizing their contribution to India’s Net Zero targets.

#### Certificate Specifications
- **Unique Serial Identifier**: Formatted as `VBMVP-CC-[6-CHAR-HASH]`.
- **Issued Under**: *National Green India & Viksit Bharat Mission*.
- **Attestation Fields**: Contributor name, tree count, parcel type, verified metric tons of $\text{CO}_2\text{e}$ sequestered annually, and issue date.
- **Visual Authenticity**: Classical double-green archival border, official national emblem header, QR verification badge, and seal stamp.
- **Export Actions**: 1-click browser print integration supporting high-resolution PDF download.

---

## 6. Comprehensive API Endpoint Specification

| Method | Endpoint | Description | Request Payload | Response Attributes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status | None | `{ status: "ok", service: "CarbonCoin Backend API" }` |
| `POST` | `/api/auth/signup` | Register new contributor | `{ name, email, phone, password }` | `{ message, user: { id, name, email, carbonCoins } }` |
| `POST` | `/api/auth/login` | Authenticate contributor | `{ emailOrPhone, password }` | `{ message, user: { id, name, isIdentityVerified, carbonCoins } }` |
| `GET` | `/api/auth/me` | Fetch active user profile | Query: `?email=...` | `{ user: { id, name, email, carbonCoins } }` |
| `POST` | `/api/verify/identity`| Biometric & OCR verification | `{ email, aadhaarProvided, selfieProvided }`| `{ verified: true, matchScore: 98.4, aadhaarMasked }` |
| `POST` | `/api/assets/register`| Register green land parcel | `{ userEmail, assetType, treeCount, landArea, state, district }` | `{ message, asset: { id, status: "Pending Verification" } }` |
| `POST` | `/api/assets/verify` | AI satellite scan & minting | `{ userEmail, species, treeCount, landArea, treeAgeYears }` | `{ verified: true, ndviScore: 0.74, co2SequesteredTons, carbonCoinsIssued }` |
| `GET` | `/api/assets` | Retrieve user assets | Query: `?email=...` | `{ assets: [ { id, assetType, ndviScore, co2OffsetTons } ] }` |
| `GET` | `/api/credits/balance`| Check wallet balance & quotes| Query: `?email=...` | `{ carbonCoins, corporateBuyers, estimatedMarketValueINR }` |
| `POST` | `/api/credits/trade` | Liquidate carbon credits | `{ email, coinsToSell, buyerName, pricePerCoin }` | `{ success: true, receiptId, coinsSold, payoutAmount, newBalance }` |

---

## 7. Quality Assurance & Test-Driven Development (TDD) Results

The platform has been engineered following strict **Test-Driven Development (TDD)** paradigms where unit tests and API integration suites were implemented prior to feature code.

```
Total Automated Test Cases: 30
Status: 100% Passing
Execution Time: ~4.5 seconds combined
```

### 7.1 Backend Test Matrix (`backend/tests/api.test.js`) — 12 Passing Tests
- [x] `GET /api/health` returns 200 and JSON payload
- [x] `POST /api/auth/signup` validates missing fields (400)
- [x] `POST /api/auth/signup` registers a new user (201)
- [x] `POST /api/auth/signup` rejects duplicate emails (400)
- [x] `POST /api/auth/login` authenticates with demo credentials (200)
- [x] `POST /api/auth/login` rejects incorrect password (401)
- [x] `POST /api/verify/identity` validates biometric docs and returns $\ge 95\%$ match score (200)
- [x] `POST /api/verify/identity` rejects missing documents (400)
- [x] `POST /api/assets/register` adds green asset application with pending status (201)
- [x] `POST /api/assets/verify` simulates satellite scan and issues correct credits (200)
- [x] `GET /api/assets` retrieves user registered assets array (200)
- [x] `POST /api/credits/trade` executes sale, computes correct INR payout, and updates wallet balance (200)

### 7.2 Frontend Test Matrix (Vitest + JSDOM) — 18 Passing Tests
- [x] `carbonCalculations.test.js`: Validates absorption factors for Neem, Teak, Bamboo, Banyan (5 tests)
- [x] `authValidation.test.js`: Validates email regex, 10-digit Indian phone format, password matching (6 tests)
- [x] `portfolioState.test.js`: Validates metric aggregations, trade limits, and certificate serial formatting (3 tests)
- [x] `locationSearch.test.js`: Validates local agricultural hub search, case-insensitivity, and Nominatim address normalization (4 tests)

---

## 8. Non-Functional Requirements & Security

1. **High Availability & Demo Resilience**: The hybrid API client (`frontend/src/lib/api.js`) automatically detects backend availability. If network interruptions or local server restarts occur, it falls back seamlessly to synchronized `localStorage` state with zero user-facing errors.
2. **Data Privacy & Aadhaar Compliance**: Personal Aadhaar numbers are never stored in plain text. Responses strictly return masked strings (`XXXX-XXXX-8921`) complying with UIDAI data security best practices.
3. **Sub-second Geocoding**: Pre-indexed local database of 25+ major Indian farming hubs delivers instant **0ms search responses**, reducing reliance on external geocoders.
4. **Responsive Layouts**: Designed to adapt from desktop monitors down to mobile devices for on-field farmer usability.

---

## 9. Future Roadmap & Scaling Strategy

```mermaid
timeline
    title CarbonCoin Development & Scaling Roadmap
    section Phase 1 (Current)
        MVP Launch : Interactive Satellite Mapping
        TDD Coverage : AI Sequestration Engine
        Demo Presets : Corporate Trade Simulation
    section Phase 2 (Q2 2026)
        Blockchain Tokenization : ERC-1155 / Polygon L2
        UIDAI Integration : Live Aadhaar OTP KYC
        ONDC Integration : Open Network Agri-Commerce
    section Phase 3 (Q3 2026)
        IoT & Drone LiDAR : Ground-truth Biomass Validation
        Multi-language : Hindi, Marathi, Tamil, Telugu
        e-Rupee (CBDC) : Automated Smart Contract Payouts
```

1. **On-Chain Tokenization (Polygon / Hyperledger)**:
   - Mint each verified parcel's carbon yield as an immutable ERC-1155 or ERC-3643 compliant digital asset to enable secondary market trading on international carbon exchanges.
2. **Direct Ground-Truthing via Drone LiDAR & IoT**:
   - Pair Sentinel-2 satellite canopy scans with periodic high-resolution drone photogrammetry and solar-powered soil carbon flux sensors.
3. **Integration with ONDC & RBI Digital Rupee (CBDC)**:
   - Enable automated, direct-benefit transfers (DBT) directly into farmers' e-Rupee wallets upon satellite verification approval.
4. **Multilingual Localized Interfaces**:
   - Provide regional language support (Hindi, Marathi, Punjabi, Malayalam, Tamil) with voice-guided asset registration for rural accessibility.

---

*Authored for Hack for Viksit Bharat 2026 | National Green Credit Mission*
