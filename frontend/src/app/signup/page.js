'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { validateSignupForm } from '../../lib/validation';
import { api } from '../../lib/api';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error on type
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const fillDemoData = () => {
    setFormData({
      name: 'Raghav Sharma',
      email: 'demo@carboncoin.in',
      phone: '9876543210',
      password: 'password123',
      confirmPassword: 'password123'
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateSignupForm(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await api.signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      setSuccessMessage(response.message || 'Account created successfully! Redirecting to login...');

      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } catch {
      setErrors({ form: 'Registration error. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      
      <main className="main-content">
        <div className="auth-container">
          <div className="auth-form">
            <div className="auth-header-row">
              <h1 className="form-title">Create Account</h1>
              <button
                type="button"
                onClick={fillDemoData}
                className="demo-autofill-btn"
                title="Fill sample demo credentials"
              >
                ⚡ Auto-fill Demo
              </button>
            </div>
            
            {successMessage && (
              <div className="success-message">
                ✅ {successMessage}
              </div>
            )}

            {errors.form && (
              <div className="error-message" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                {errors.form}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="e.g. Raghav Sharma"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="e.g. demo@carboncoin.in"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number (10 Digits)</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'error' : ''}
                  placeholder="9876543210"
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
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
                  placeholder="At least 6 characters"
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Re-enter password"
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
              
              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? 'Registering Account...' : 'Sign Up'}
              </button>
            </form>
            
            <div className="auth-footer">
              <p style={{ color: "black" }}>
                Already have an account? <Link href="/login" className="auth-link">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SignupPage;
