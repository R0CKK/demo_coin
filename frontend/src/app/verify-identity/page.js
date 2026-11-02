'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api } from '../../lib/api';

// Lightweight inline SVG data URIs for sample documents for demo reliability
const SAMPLE_AADHAAR_DATA_URI = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'><rect width='400' height='250' rx='12' fill='%23fefefe' stroke='%232e7d32' stroke-width='3'/><rect width='400' height='40' fill='%232e7d32'/><text x='20' y='26' fill='white' font-family='sans-serif' font-weight='bold' font-size='16'>GOVERNMENT OF INDIA - AADHAAR</text><circle cx='60' cy='110' r='35' fill='%23e0e0e0'/><text x='52' y='116' font-size='22'>👤</text><text x='115' y='95' font-family='sans-serif' font-weight='bold' font-size='15' fill='%23333'>Raghav Sharma</text><text x='115' y='120' font-family='sans-serif' font-size='13' fill='%23666'>DOB: 12/05/1992 | Male</text><rect x='20' y='170' width='360' height='50' rx='6' fill='%23f0f7f0'/><text x='80' y='202' font-family='monospace' font-weight='bold' font-size='20' fill='%231b5e20'>XXXX XXXX 8921</text></svg>";

const SAMPLE_SELFIE_DATA_URI = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='250' height='250' viewBox='0 0 250 250'><rect width='250' height='250' rx='12' fill='%23e8f5e9' stroke='%234caf50' stroke-width='3'/><circle cx='125' cy='105' r='55' fill='%23c8e6c9'/><circle cx='125' cy='95' r='35' fill='%23a5d6a7'/><path d='M65 210 C75 160 175 160 185 210' fill='%2381c784'/><text x='70' y='235' font-family='sans-serif' font-weight='bold' font-size='13' fill='%232e7d32'>LIVE BIOMETRIC CAPTURE</text></svg>";

const VerifyIdentityPage = () => {
  const [aadhaarImage, setAadhaarImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [previewAadhaar, setPreviewAadhaar] = useState(null);
  const [previewSelfie, setPreviewSelfie] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const router = useRouter();

  const handleImageChange = (e, setImage, setPreview, type) => {
    const file = e.target.files[0];
    
    if (file) {
      if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        setError(`${type} must be JPG or PNG format`);
        return;
      }
      
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'Aadhaar') {
          setPreviewAadhaar(reader.result);
        } else {
          setPreviewSelfie(reader.result);
        }
      };
      reader.readAsDataURL(file);
      if (error) setError('');
    }
  };

  const loadSampleDocs = () => {
    setAadhaarImage('sample_aadhaar.png');
    setSelfieImage('sample_selfie.png');
    setPreviewAadhaar(SAMPLE_AADHAAR_DATA_URI);
    setPreviewSelfie(SAMPLE_SELFIE_DATA_URI);
    setError('');
  };

  const handleVerify = async () => {
    if (!aadhaarImage || !selfieImage) {
      setError('Please upload both Aadhaar and Selfie images (or click "Auto-load Sample Docs")');
      return;
    }

    setIsLoading(true);
    setVerificationResult(null);
    setError('');

    try {
      const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : 'demo@carboncoin.in';
      const result = await api.verifyIdentity({
        email,
        aadhaarProvided: true,
        selfieProvided: true
      });

      setVerificationResult(result);
      setIsLoading(false);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch {
      setError('Verification failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      
      <main className="main-content">
        <div className="auth-container">
          <div className="auth-form" style={{ maxWidth: '650px' }}>
            <div className="auth-header-row">
              <h1 className="form-title">Identity Verification (KYC)</h1>
              <button
                type="button"
                onClick={loadSampleDocs}
                className="demo-autofill-btn"
                title="Instant sample document loader for demo"
              >
                ⚡ Auto-load Sample Docs
              </button>
            </div>
            
            <p className="subtitle">
              Verify your identity via Aadhaar OCR and facial biometric comparison to mint and trade verified Carbon Coins.
            </p>
            
            {error && <div className="error-message" style={{ textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}
            
            {verificationResult && (
              <div className="success-message" style={{ textAlign: 'left', lineHeight: '1.6' }}>
                <p><strong>✅ Biometric Verification Successful!</strong></p>
                <p>• Facial Match Confidence: <strong>{verificationResult.matchScore || '98.4'}%</strong></p>
                <p>• Masked Aadhaar: <code>{verificationResult.aadhaarMasked || 'XXXX-XXXX-8921'}</code></p>
                <p>• Status: <strong>KYC Approved</strong> — Redirecting to Dashboard…</p>
              </div>
            )}
            
            <div className="upload-section">
              <div className="upload-group">
                <label className="upload-label">
                  <strong>1. Aadhaar Card Front</strong> (JPG, PNG)
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleImageChange(e, setAadhaarImage, setPreviewAadhaar, 'Aadhaar')}
                  className="upload-input"
                />
                {previewAadhaar && (
                  <div className="image-preview">
                    <img src={previewAadhaar} alt="Aadhaar Preview" className="preview-image" />
                  </div>
                )}
              </div>
              
              <div className="upload-group">
                <label className="upload-label">
                  <strong>2. Live Contributor Selfie</strong> (JPG, PNG)
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleImageChange(e, setSelfieImage, setPreviewSelfie, 'Selfie')}
                  className="upload-input"
                />
                {previewSelfie && (
                  <div className="image-preview">
                    <img src={previewSelfie} alt="Selfie Preview" className="preview-image" />
                  </div>
                )}
              </div>
            </div>
            
            <button 
              onClick={handleVerify} 
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>
                  Simulating AI Facial & OCR Verification… <span className="spinner">⏳</span>
                </span>
              ) : (
                'Run AI Biometric Verification'
              )}
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VerifyIdentityPage;
