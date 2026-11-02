'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { api } from '../../lib/api';
import { aggregateDashboardMetrics, calculateTradePayout, generateCertificateData } from '../../lib/portfolioHelper';

const LandMap = dynamic(() => import('../../components/LandMap'), {
  ssr: false,
  loading: () => (
    <div className="map-view-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8f5e9', height: '350px', borderRadius: '16px' }}>
      <p style={{ color: 'var(--primary-green)' }}>🛰️ Loading Land Satellite View…</p>
    </div>
  )
});

const DashboardPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: 'Contributor', email: '' });
  const [assets, setAssets] = useState([]);
  const [carbonCoins, setCarbonCoins] = useState(0);
  
  // Modals state
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  
  // Trade state
  const [coinsToSell, setCoinsToSell] = useState(10);
  const [selectedBuyer, setSelectedBuyer] = useState({ name: 'Viksit Bharat Clean Energy Corp', price: 650 });
  const [tradeReceipt, setTradeReceipt] = useState(null);
  const [tradeError, setTradeError] = useState('');
  const [isTrading, setIsTrading] = useState(false);

  // Certificate state
  const [certData, setCertData] = useState(null);
  const [portfolioView, setPortfolioView] = useState('table'); // 'table' | 'map'

  const loadData = async () => {
    if (typeof window === 'undefined') return;

    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const identityVerified = localStorage.getItem('identityVerified') === 'true';

    if (!loggedIn) {
      router.push('/login');
      return;
    }

    if (!identityVerified) {
      router.push('/verify-identity');
      return;
    }

    const name = localStorage.getItem('userName') || 'Raghav Sharma';
    const email = localStorage.getItem('userEmail') || 'demo@carboncoin.in';
    const coins = parseInt(localStorage.getItem('carbonCoins') || '120', 10);

    setUser({ name, email });
    setCarbonCoins(coins);

    const userAssets = await api.getAssets(email);
    setAssets(userAssets);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Listen to real-time wallet coin changes
    const handleCoinUpdate = (e) => {
      if (e.detail !== undefined) {
        setCarbonCoins(Number(e.detail));
      }
    };
    window.addEventListener('carbonCoinsUpdated', handleCoinUpdate);

    return () => {
      window.removeEventListener('carbonCoinsUpdated', handleCoinUpdate);
    };
  }, []);

  const metrics = aggregateDashboardMetrics(assets, carbonCoins);

  const handleLogout = () => {
    api.logout();
    router.push('/login');
  };

  const handleExecuteTrade = async () => {
    setTradeError('');
    setIsTrading(true);

    const check = calculateTradePayout(coinsToSell, selectedBuyer.price, carbonCoins);
    if (!check.valid) {
      setTradeError(check.error);
      setIsTrading(false);
      return;
    }

    try {
      const receipt = await api.tradeCredits({
        email: user.email,
        coinsToSell: Number(coinsToSell),
        buyerName: selectedBuyer.name,
        pricePerCoin: selectedBuyer.price
      });

      if (receipt.success) {
        setTradeReceipt(receipt);
        setCarbonCoins(receipt.newBalance);
        setIsTrading(false);
      } else {
        setTradeError(receipt.error || 'Trade failed');
        setIsTrading(false);
      }
    } catch {
      setTradeError('Trade failed. Please try again.');
      setIsTrading(false);
    }
  };

  const openCertificate = () => {
    const cert = generateCertificateData({
      userName: user.name,
      totalCo2Tons: metrics.totalCo2OffsetTons,
      totalTrees: metrics.totalTrees,
      assetType: assets[0]?.assetType || 'Agroforestry & Mixed Native Plantation'
    });
    setCertData(cert);
    setShowCertModal(true);
  };

  if (loading) {
    return (
      <div className="page-container">
        <Navbar />
        <main className="main-content">
          <div className="auth-container">
            <div className="auth-form" style={{ textAlign: 'center' }}>
              <h2>Loading Carbon Portfolio…</h2>
              <p className="spinner" style={{ fontSize: '2rem', margin: '1rem 0' }}>⏳</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content">
        <div className="dashboard-container">
          <div className="dashboard-header" style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <h1 className="dashboard-title">Welcome back, {user.name}!</h1>
                  <span className="badge-verified">KYC Verified ✅</span>
                </div>
                <p className="dashboard-subtitle">
                  National Green Credit Portfolio • Viksit Bharat Clean Growth Mission
                </p>
              </div>

              <div className="quick-action-buttons">
                <Link href="/property-verification" className="action-button primary">
                  + Verify New Asset
                </Link>
                <button onClick={() => setShowTradeModal(true)} className="action-button secondary">
                  🪙 Trade / Sell Credits
                </button>
                <button onClick={openCertificate} className="action-button secondary">
                  📜 View Certificate
                </button>
                <button onClick={handleLogout} className="action-button logout-btn" style={{ padding: '0.8rem 1.4rem' }}>
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="dashboard-content">
            {/* Dynamic Metric Cards */}
            <div className="dashboard-cards">
              <div className="dashboard-card stat-card-highlight">
                <h3>Carbon Coins Wallet</h3>
                <p className="card-value" style={{ color: 'var(--primary-green)' }}>
                  {carbonCoins} <span style={{ fontSize: '1.2rem' }}>🪙</span>
                </p>
                <small style={{ color: '#666' }}>
                  Market Value: <strong>₹{(carbonCoins * 650).toLocaleString()}</strong>
                </small>
              </div>

              <div className="dashboard-card">
                <h3>Verified Green Assets</h3>
                <p className="card-value">{metrics.verifiedAssetsCount}</p>
                <small style={{ color: 'var(--primary-green)' }}>🛰️ Sentinel-2 AI Validated</small>
              </div>

              <div className="dashboard-card">
                <h3>Total CO2 Offset</h3>
                <p className="card-value">{metrics.totalCo2OffsetTons} <span style={{ fontSize: '1.2rem' }}>Tons/yr</span></p>
                <small style={{ color: '#666' }}>Across {metrics.totalTrees} Monitored Trees</small>
              </div>

              <div className="dashboard-card">
                <h3>Pending Verifications</h3>
                <p className="card-value">{metrics.pendingDocumentsCount}</p>
                <small style={{ color: '#888' }}>Applications in Pipeline</small>
              </div>
            </div>

            {/* My Green Assets Portfolio Section */}
            <div className="portfolio-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', color: 'var(--dark-green)' }}>🌿 My Green Assets Portfolio</h2>
                  <span style={{ fontSize: '0.95rem', color: '#666' }}>
                    Showing {assets.length} registered parcel{assets.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="map-layer-selector">
                  <button
                    type="button"
                    className={`layer-btn ${portfolioView === 'table' ? 'active' : ''}`}
                    onClick={() => setPortfolioView('table')}
                  >
                    📋 Table View
                  </button>
                  <button
                    type="button"
                    className={`layer-btn ${portfolioView === 'map' ? 'active' : ''}`}
                    onClick={() => setPortfolioView('map')}
                  >
                    🛰️ Satellite Map View
                  </button>
                </div>
              </div>

              {assets.length === 0 ? (
                <div className="empty-assets-box">
                  <p>You haven't registered any green assets yet.</p>
                  <Link href="/property-verification" className="action-button primary" style={{ marginTop: '1rem' }}>
                    Start Property Verification
                  </Link>
                </div>
              ) : portfolioView === 'map' ? (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ color: '#555', marginBottom: '1rem', fontSize: '0.95rem' }}>
                    Visual satellite overview of your registered green land parcels. The green perimeter polygon highlights the verified biomass canopy.
                  </p>
                  <LandMap
                    initialLat={21.1458}
                    initialLng={79.0882}
                    landAreaAcres={assets[0]?.landArea || 3.5}
                    readOnly={true}
                  />
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="assets-table">
                    <thead>
                      <tr>
                        <th>Asset & Species</th>
                        <th>Location & Survey No</th>
                        <th>Tree Count & Area</th>
                        <th>Satellite NDVI</th>
                        <th>CO2 Offset</th>
                        <th>Carbon Coins</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.map((asset) => (
                        <tr key={asset.id}>
                          <td>
                            <strong>{asset.assetType}</strong>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Species: {asset.species}</div>
                          </td>
                          <td>
                            {asset.district}, {asset.state}
                            <div style={{ fontSize: '0.85rem', color: '#777' }}><code>{asset.surveyNumber}</code></div>
                          </td>
                          <td>
                            <strong>{asset.treeCount} trees</strong>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>{asset.landArea} Acres</div>
                          </td>
                          <td>
                            <span className="ndvi-badge">
                              NDVI {asset.ndviScore || '0.74'}
                            </span>
                          </td>
                          <td>
                            <strong>{asset.co2OffsetTons} Tons</strong>
                          </td>
                          <td>
                            <span style={{ color: 'var(--primary-green)', fontWeight: 'bold' }}>
                              +{asset.carbonCoinsEarned} 🪙
                            </span>
                          </td>
                          <td>
                            <span className="badge-verified">
                              {asset.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Banner Call to Action */}
            <div className="impact-banner">
              <div className="impact-banner-content">
                <h3>Empowering India's Green Capitalization 🇮🇳</h3>
                <p>
                  Every tree you register contributes to India's Net Zero 2070 commitments under the Viksit Bharat roadmap. 
                  Turn your sustainable land into tradable economic wealth.
                </p>
              </div>
              <Link href="/property-verification" className="cta-button" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
                Register Another Parcel
              </Link>
            </div>
          </div>
        </div>

        {/* 1. TRADE / MARKETPLACE MODAL */}
        {showTradeModal && (
          <div className="modal-backdrop" onClick={() => setShowTradeModal(false)}>
            <div className="modal-window" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🪙 Carbon Credit Marketplace</h2>
                <button onClick={() => setShowTradeModal(false)} className="close-btn">×</button>
              </div>

              {!tradeReceipt ? (
                <div>
                  <p style={{ color: '#555', marginBottom: '1.5rem' }}>
                    Sell verified Carbon Coins directly to corporate buyers seeking voluntary ESG offsets.
                  </p>

                  <div className="form-group">
                    <label>Select Corporate Buyer</label>
                    <select
                      className="upload-input"
                      value={selectedBuyer.name}
                      onChange={(e) => {
                        const buyers = [
                          { name: 'Viksit Bharat Clean Energy Corp', price: 650 },
                          { name: 'Tata Steel Carbon Offset Program', price: 680 },
                          { name: 'Infosys Eco Action Initiative', price: 640 }
                        ];
                        const found = buyers.find(b => b.name === e.target.value);
                        if (found) setSelectedBuyer(found);
                      }}
                    >
                      <option value="Viksit Bharat Clean Energy Corp">Viksit Bharat Clean Energy Corp (₹650 / Coin)</option>
                      <option value="Tata Steel Carbon Offset Program">Tata Steel Carbon Offset Program (₹680 / Coin)</option>
                      <option value="Infosys Eco Action Initiative">Infosys Eco Action Initiative (₹640 / Coin)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Number of Carbon Coins to Liquidate (Your Balance: {carbonCoins})</label>
                    <input
                      type="number"
                      min="1"
                      max={carbonCoins}
                      value={coinsToSell}
                      onChange={(e) => setCoinsToSell(Number(e.target.value))}
                      className="upload-input"
                    />
                  </div>

                  <div className="trade-calc-summary">
                    <div>Gross Proceeds:</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-green)' }}>
                      ₹{(coinsToSell * selectedBuyer.price).toLocaleString()}
                    </div>
                    <small>Direct transfer to linked Bank Account via UPI / NEFT</small>
                  </div>

                  {tradeError && (
                    <div className="error-message" style={{ margin: '1rem 0', textAlign: 'center' }}>
                      {tradeError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button onClick={() => setShowTradeModal(false)} className="action-button secondary" style={{ flex: 1 }}>
                      Cancel
                    </button>
                    <button 
                      onClick={handleExecuteTrade} 
                      className="action-button primary" 
                      style={{ flex: 2 }}
                      disabled={isTrading || carbonCoins < coinsToSell || coinsToSell <= 0}
                    >
                      {isTrading ? 'Executing Liquidation… ⏳' : `Confirm Sale of ${coinsToSell} Coins`}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🎉</div>
                  <h3 style={{ color: 'var(--primary-green)', fontSize: '1.6rem' }}>Trade Successfully Executed!</h3>
                  <div className="receipt-box">
                    <p><strong>Transaction Receipt:</strong> <code>{tradeReceipt.receiptId}</code></p>
                    <p><strong>Coins Sold:</strong> {tradeReceipt.coinsSold} Carbon Coins</p>
                    <p><strong>Payout Rate:</strong> ₹{tradeReceipt.pricePerCoin} / Coin</p>
                    <p><strong>Total Payout Credited:</strong> <span style={{ color: 'var(--primary-green)', fontWeight: 'bold', fontSize: '1.3rem' }}>₹{tradeReceipt.payoutAmount.toLocaleString()}</span></p>
                    <p><strong>Corporate Offsetter:</strong> {tradeReceipt.buyerName}</p>
                    <p><strong>Remaining Wallet Balance:</strong> {tradeReceipt.newBalance} Coins</p>
                  </div>
                  <button 
                    onClick={() => {
                      setTradeReceipt(null);
                      setShowTradeModal(false);
                    }} 
                    className="submit-button"
                    style={{ marginTop: '1.5rem' }}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. GREEN CERTIFICATE MODAL */}
        {showCertModal && certData && (
          <div className="modal-backdrop" onClick={() => setShowCertModal(false)}>
            <div className="modal-window cert-modal" onClick={(e) => e.stopPropagation()}>
              <div className="cert-frame">
                <div className="cert-header">
                  <div className="cert-emblem">🇮🇳</div>
                  <h2>NATIONAL GREEN CAPITALIZATION CERTIFICATE</h2>
                  <p>VIKSIT BHARAT 2047 MISSION • CARBONCOIN MARKETPLACE</p>
                </div>

                <div className="cert-body">
                  <p className="cert-subtitle">This officially certifies that</p>
                  <h1 className="cert-recipient">{certData.userName}</h1>
                  <p className="cert-text">
                    has successfully registered and verified <strong>{certData.totalTrees} trees</strong> across 
                    their sustainable green asset portfolio, delivering an estimated annual sequestration of
                  </p>

                  <div className="cert-metric-badge">
                    {certData.totalCo2Tons} METRIC TONS OF CO₂e / YEAR
                  </div>

                  <p className="cert-text">
                    Verified through Sentinel-2 / Landsat Earth Observation Satellite Multispectral AI Analysis.
                  </p>

                  <div className="cert-footer-row">
                    <div>
                      <div className="cert-qr">🏁 QR VERIFIED</div>
                      <div className="cert-serial">Serial: {certData.serialNumber}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="cert-stamp">SEAL OF AUTHENTICITY</div>
                      <div className="cert-date">Issued: {certData.issueDate}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button onClick={() => window.print()} className="action-button primary" style={{ marginRight: '1rem' }}>
                  🖨️ Print / Download PDF
                </button>
                <button onClick={() => setShowCertModal(false)} className="action-button secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
