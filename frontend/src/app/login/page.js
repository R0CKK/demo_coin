'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { validateLoginForm } from '../../lib/validation';
import { api } from '../../lib/api';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const executeLogin = async (credentials) => {
    setIsLoading(true);
    setErrors({});

    try {
      const result = await api.login(credentials);
      if (result.success) {
        // Smart routing: if KYC verified, directly go to dashboard!
        if (result.user.isIdentityVerified) {
          router.push('/dashboard');
        } else {
          router.push('/verify-identity');
        }
      } else {
        setErrors({ auth: result.error || 'Invalid credentials' });
        setIsLoading(false);
      }
    } catch {
      setErrors({ auth: 'Login failed. Please check your credentials.' });
      setIsLoading(false);
    }
  };

  const handle1ClickDemo = () => {
    const demoCreds = {
      emailOrPhone: 'demo@carboncoin.in',
      password: 'password123'
    };
    setFormData(demoCreds);
    executeLogin(demoCreds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateLoginForm(formData);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await executeLogin(formData);
  };

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content">
        <div className="auth-container">
          <div className="auth-form">
            <div className="auth-header-row">
              <h1 className="form-title">Log In</h1>
              <button
                type="button"
                onClick={handle1ClickDemo}
                className="demo-autofill-btn"
                title="Log in directly with pre-seeded demo account"
              >
                ⚡ 1-Click Demo Login
              </button>
            </div>

            {errors.auth && (
              <div className="error-message" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                {errors.auth}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="emailOrPhone">Email or Phone</label>
                <input
                  type="text"
                  id="emailOrPhone"
                  name="emailOrPhone"
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                  className={errors.emailOrPhone ? 'error' : ''}
                  placeholder="e.g. demo@carboncoin.in"
                />
                {errors.emailOrPhone && <span className="error-message">{errors.emailOrPhone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Enter your password"
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Authenticating… ⏳' : 'Log In'}
              </button>
            </form>

            <div className="auth-footer">
              <p style={{ color: "black" }}>
                New contributor? <Link href="/signup" className="auth-link">Create an account</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;
