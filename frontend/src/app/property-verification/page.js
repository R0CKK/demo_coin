'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { calculateCarbonSequestration, estimateNDVIScore } from '../../lib/carbonEngine';

// Dynamically load the Leaflet LandMap component to prevent any SSR window issues
const LandMap = dynamic(() => import('../../components/LandMap'), {
  ssr: false,
  loading: () => (
    <div className="map-view-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8f5e9', height: '400px', borderRadius: '16px' }}>
      <p style={{ color: 'var(--primary-green)', fontWeight: 'bold' }}>🛰️ Initializing Interactive Satellite Map…</p>
    </div>
  )
});

const SAMPLE_PATTA_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='350' height='220' viewBox='0 0 350 220'><rect width='350' height='220' rx='8' fill='%23fffde7' stroke='%23fbc02d' stroke-width='2'/><rect width='350' height='35' fill='%23fbc02d'/><text x='15' y='24' fill='%23333' font-family='sans-serif' font-weight='bold' font-size='14'>REVENUE DEPT - 7/12 LAND RECORD EXTRACT</text><text x='20' y='65' font-family='monospace' font-size='12' fill='%23444'>District: Nagpur | Taluka: Katol</text><text x='20' y='90' font-family='monospace' font-size='12' fill='%23444'>Survey / Gat No: 712/44A</text><text x='20' y='115' font-family='monospace' font-size='12' fill='%23444'>Land Area: 3.50 Hectare / Acre</text><text x='20' y='140' font-family='monospace' font-size='12' fill='%23444'>Land Use: Agricultural & Agroforestry</text><rect x='20' y='160' width='160' height='40' fill='%23e8f5e9' rx='4'/><text x='30' y='185' font-family='sans-serif' font-weight='bold' font-size='12' fill='%232e7d32'>✅ TITLE VERIFIED</text></svg>";

const SAMPLE_CANOPY_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='350' height='220' viewBox='0 0 350 220'><rect width='350' height='220' rx='8' fill='%23e8f5e9'/><circle cx='80' cy='110' r='50' fill='%232e7d32' opacity='0.7'/><circle cx='150' cy='90' r='60' fill='%23388e3c' opacity='0.8'/><circle cx='220' cy='120' r='55' fill='%234caf50' opacity='0.75'/><circle cx='290' cy='100' r='45' fill='%231b5e20' opacity='0.85'/><text x='20' y='200' font-family='sans-serif' font-weight='bold' font-size='13' fill='%231b5e20'>SENTINEL-2 CANOPY COVERAGE</text></svg>";

const PropertyVerificationPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Asset Details
  const [formData, setFormData] = useState({
    assetType: 'Agroforestry & Tree Plantation',
    species: 'Neem',
    treeCount: 500,
    landArea: 3.5,
    treeAgeYears: 5,
    state: 'Maharashtra',
    district: 'Nagpur',
    surveyNumber: 'MH-NGP-712-44A'
  });

  // Step 2: Documents & Map Geo-tagging
  const [pattaDoc, setPattaDoc] = useState(null);
  const [canopyPhoto, setCanopyPhoto] = useState(null);
  const [coordinates, setCoordinates] = useState('21.1458° N, 79.0882° E');
  const [coordPoints, setCoordPoints] = useState({ lat: 21.1458, lng: 79.0882 });

  // Step 3: Satellite AI Scanning Simulation
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState(null);

  // Step 4: Minting
  const [isMinting, setIsMinting] = useState(false);
  const [mintedSuccess, setMintedSuccess] = useState(false);

  const fillSampleAsset = () => {
    setFormData({
      assetType: 'Agroforestry & Teak/Neem Plantation',
      species: 'Neem',
      treeCount: 500,
      landArea: 3.5,
      treeAgeYears: 6,
      state: 'Maharashtra',
      district: 'Nagpur',
      surveyNumber: 'MH-NGP-712-44A'
    });
    setPattaDoc(SAMPLE_PATTA_SVG);
    setCanopyPhoto(SAMPLE_CANOPY_SVG);
    setCoordinates('21.1458° N, 79.0882° E');
    setCoordPoints({ lat: 21.1458, lng: 79.0882 });
  };

  const loadSampleDocs = () => {
    setPattaDoc(SAMPLE_PATTA_SVG);
    setCanopyPhoto(SAMPLE_CANOPY_SVG);
  };

  const handleLocationPicked = (loc) => {
    setCoordinates(loc.coordinatesString);
    setCoordPoints({ lat: loc.lat, lng: loc.lng });
    if (loc.state && loc.district) {
      setFormData(prev => ({
        ...prev,
        state: loc.state,
        district: loc.district
      }));
    }
  };

  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(10);
    
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          const metrics = calculateCarbonSequestration({
            species: formData.species,
            treeCount: formData.treeCount,
            landArea: formData.landArea,
            treeAgeYears: formData.treeAgeYears
          });
          const ndvi = estimateNDVIScore('healthy_canopy');

          setScanResults({
            ...metrics,
            ndviScore: ndvi,
            canopyDensity: `${Math.round(ndvi * 100)}%`,
            confidence: '98.7%'
          });
          setIsScanning(false);
          return 100;
        }
        return prev + 15;
      });
    }, 250);
  };

  const handleMintAndFinish = async () => {
    setIsMinting(true);

    try {
      const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : 'demo@carboncoin.in';
      await api.registerAndVerifyAsset({
        userEmail: email,
        assetType: formData.assetType,
        species: formData.species,
        treeCount: formData.treeCount,
        landArea: formData.landArea,
        state: formData.state,
        district: formData.district,
        surveyNumber: formData.surveyNumber,
        treeAgeYears: formData.treeAgeYears
      });

      setMintedSuccess(true);
      setIsMinting(false);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch {
      setIsMinting(false);
      router.push('/dashboard');
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      
      <main className="main-content">
        <div className="container">
          <div className="dashboard-container">
            <div className="dashboard-header">
              <h1 className="dashboard-title">Green Asset & Land Verification</h1>
              <p className="dashboard-subtitle">
                Add your land using interactive satellite mapping, verify canopy density via AI, and mint verified Carbon Coins.
              </p>
            </div>

            {/* Stepper Header */}
            <div className="stepper-bar">
              <div className={`step-item ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                <div className="step-circle">1</div>
                <div className="step-label">Asset Details</div>
              </div>
              <div className="step-line"></div>
              <div className={`step-item ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                <div className="step-circle">2</div>
                <div className="step-label">Map & Land Pin</div>
              </div>
              <div className="step-line"></div>
              <div className={`step-item ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
                <div className="step-circle">3</div>
                <div className="step-label">Satellite AI Scan</div>
              </div>
              <div className="step-line"></div>
              <div className={`step-item ${currentStep >= 4 ? 'active' : ''}`}>
                <div className="step-circle">4</div>
                <div className="step-label">Mint Credits</div>
              </div>
            </div>
            
            <div className="dashboard-content">
              {/* STEP 1: ASSET DETAILS */}
              {currentStep === 1 && (
                <div className="wizard-card">
                  <div className="wizard-card-header">
                    <h2>Step 1: Green Asset Information</h2>
                    <button type="button" onClick={fillSampleAsset} className="demo-autofill-btn">
                      ⚡ Auto-fill Sample Asset
                    </button>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Asset Category / Project Type</label>
                      <select 
                        value={formData.assetType}
                        onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                        className="upload-input"
                      >
                        <option>Agroforestry & Tree Plantation</option>
                        <option>Teak & Timber Plantation</option>
                        <option>Bamboo Biomass Plantation</option>
                        <option>Fruit Orchard (Mango/Guava)</option>
                        <option>Afforestation / Community Forest</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Dominant Tree / Plant Species</label>
                      <select 
                        value={formData.species}
                        onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                        className="upload-input"
                      >
                        <option value="neem">Neem (Azadirachta indica) ~25kg/yr</option>
                        <option value="teak">Teak (Tectona grandis) ~35kg/yr</option>
                        <option value="bamboo">Bamboo (Bambusa vulgaris) ~40kg/yr</option>
                        <option value="banyan">Banyan / Peepal ~50kg/yr</option>
                        <option value="mango">Mango / Fruit Trees ~22kg/yr</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Total Number of Trees / Saplings</label>
                      <input 
                        type="number"
                        min="10"
                        max="100000"
                        value={formData.treeCount}
                        onChange={(e) => setFormData({ ...formData, treeCount: Number(e.target.value) })}
                        className="upload-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Total Land Area (Acres)</label>
                      <input 
                        type="number"
                        step="0.1"
                        value={formData.landArea}
                        onChange={(e) => setFormData({ ...formData, landArea: Number(e.target.value) })}
                        className="upload-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Average Plantation Age (Years)</label>
                      <input 
                        type="number"
                        min="1"
                        max="50"
                        value={formData.treeAgeYears}
                        onChange={(e) => setFormData({ ...formData, treeAgeYears: Number(e.target.value) })}
                        className="upload-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>State & District</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input 
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="upload-input"
                          placeholder="State"
                        />
                        <input 
                          type="text"
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          className="upload-input"
                          placeholder="District"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="wizard-actions">
                    <Link href="/dashboard" className="action-button secondary">Cancel</Link>
                    <button onClick={() => setCurrentStep(2)} className="action-button primary">
                      Next: Interactive Map & Land Pin →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: INTERACTIVE MAP & DOCUMENTS */}
              {currentStep === 2 && (
                <div className="wizard-card">
                  <div className="wizard-card-header">
                    <h2>Step 2: Add Your Land on Interactive Map</h2>
                    <button type="button" onClick={loadSampleDocs} className="demo-autofill-btn">
                      ⚡ Load Sample Land Docs
                    </button>
                  </div>

                  <p className="wizard-card-desc">
                    Pinpoint your land parcel on the satellite map below. You can click anywhere on the map, 
                    drag the <strong>🌱 pin</strong>, or use quick presets to define your <strong>{formData.landArea} Acre</strong> parcel.
                  </p>

                  {/* Interactive Leaflet Map */}
                  <LandMap
                    initialLat={coordPoints.lat}
                    initialLng={coordPoints.lng}
                    landAreaAcres={formData.landArea}
                    onLocationSelect={handleLocationPicked}
                  />

                  {/* Land Documentation Uploads */}
                  <div className="form-grid" style={{ marginTop: '2rem' }}>
                    <div className="upload-group">
                      <label className="upload-label">Land Ownership Document / 7/12 Extract / Patta</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={() => setPattaDoc(SAMPLE_PATTA_SVG)}
                        className="upload-input" 
                      />
                      {pattaDoc && (
                        <div className="image-preview" style={{ marginTop: '0.8rem' }}>
                          <img src={pattaDoc} alt="Land Record" className="preview-image" />
                        </div>
                      )}
                    </div>

                    <div className="upload-group">
                      <label className="upload-label">Geotagged Land / Canopy Photograph</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={() => setCanopyPhoto(SAMPLE_CANOPY_SVG)}
                        className="upload-input" 
                      />
                      {canopyPhoto && (
                        <div className="image-preview" style={{ marginTop: '0.8rem' }}>
                          <img src={canopyPhoto} alt="Canopy" className="preview-image" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="wizard-actions">
                    <button onClick={() => setCurrentStep(1)} className="action-button secondary">← Back</button>
                    <button 
                      onClick={() => {
                        if (!pattaDoc || !canopyPhoto) {
                          loadSampleDocs();
                        }
                        setCurrentStep(3);
                      }} 
                      className="action-button primary"
                    >
                      Next: AI Satellite Verification →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: SATELLITE AI SCANNING OVER LIVE MAP */}
              {currentStep === 3 && (
                <div className="wizard-card">
                  <div className="wizard-card-header">
                    <h2>Step 3: AI & Multi-Spectral Satellite Verification</h2>
                  </div>

                  <p className="wizard-card-desc">
                    Connecting to Sentinel-2 and Landsat Earth-observation satellites to scan the canopy density at{' '}
                    <strong>{coordinates}</strong> across your {formData.landArea}-acre parcel.
                  </p>

                  {/* Live Satellite Map with Scanning Radar Overlay */}
                  <LandMap
                    initialLat={coordPoints.lat}
                    initialLng={coordPoints.lng}
                    landAreaAcres={formData.landArea}
                    readOnly={true}
                    showScanEffect={true}
                  />

                  {isScanning && (
                    <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                      <p><strong>Analyzing multi-spectral imagery bands (NIR + Red)...</strong> {scanProgress}%</p>
                      <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${scanProgress}%` }}></div>
                      </div>
                    </div>
                  )}

                  {!isScanning && !scanResults && (
                    <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                      <button onClick={handleStartScan} className="action-button primary" style={{ fontSize: '1.2rem', padding: '1rem 2.5rem' }}>
                        🛰️ Start Satellite AI Scan
                      </button>
                    </div>
                  )}

                  {scanResults && (
                    <div className="scan-results-box">
                      <div className="scan-results-header">
                        <span className="badge-verified">✅ Satellite Verification Successful</span>
                        <span>Confidence: <strong>{scanResults.confidence}</strong></span>
                      </div>

                      <div className="dashboard-cards" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="dashboard-card">
                          <h3>Canopy Density (NDVI)</h3>
                          <p className="card-value">{scanResults.ndviScore}</p>
                          <small style={{ color: 'var(--primary-green)' }}>{scanResults.canopyDensity} Healthy Canopy</small>
                        </div>
                        <div className="dashboard-card">
                          <h3>CO2 Sequestered / Year</h3>
                          <p className="card-value">{scanResults.co2OffsetTons} Tons</p>
                          <small>Verified by MoEFCC Formula</small>
                        </div>
                        <div className="dashboard-card">
                          <h3>Carbon Coins to Issue</h3>
                          <p className="card-value" style={{ color: '#ff9800' }}>{scanResults.carbonCoinsEarned} 🪙</p>
                          <small>1 Ton CO2 = 10 CarbonCoins</small>
                        </div>
                      </div>

                      <div className="wizard-actions">
                        <button onClick={() => setCurrentStep(2)} className="action-button secondary">← Back to Map</button>
                        <button onClick={() => setCurrentStep(4)} className="action-button primary">
                          Proceed to Mint Carbon Coins →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: MINTING & APPROVAL */}
              {currentStep === 4 && (
                <div className="wizard-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                  <h2 style={{ color: 'var(--primary-green)', fontSize: '2.2rem', marginBottom: '0.8rem' }}>
                    Ready to Mint Verified Carbon Credits!
                  </h2>
                  <p style={{ maxWidth: '650px', margin: '0 auto 2rem', color: '#555', fontSize: '1.1rem' }}>
                    Your green parcel at <strong>{coordinates}</strong> ({formData.treeCount} {formData.species} trees across {formData.landArea} acres) 
                    has been authenticated via Earth observation satellite multispectral AI.
                  </p>

                  <div className="mint-highlight-box">
                    <div style={{ fontSize: '1.1rem', color: '#666' }}>You will receive:</div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--primary-green)', margin: '0.5rem 0' }}>
                      {scanResults ? scanResults.carbonCoinsEarned : 125} Carbon Coins 🪙
                    </div>
                    <div style={{ color: '#888' }}>
                      Estimated Market Liquidation Value: <strong>₹{((scanResults ? scanResults.carbonCoinsEarned : 125) * 650).toLocaleString()}</strong>
                    </div>
                  </div>

                  {mintedSuccess && (
                    <div className="success-message" style={{ margin: '2rem auto', maxWidth: '500px' }}>
                      ✅ Carbon Coins minted to your wallet! Updating dashboard…
                    </div>
                  )}

                  <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button 
                      onClick={handleMintAndFinish} 
                      className="submit-button"
                      disabled={isMinting || mintedSuccess}
                      style={{ maxWidth: '380px', fontSize: '1.2rem', padding: '1.1rem' }}
                    >
                      {isMinting ? 'Minting Credits on Ledger… ⏳' : 'Claim Carbon Coins & View Portfolio'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PropertyVerificationPage;
