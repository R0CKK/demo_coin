'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [carbonCoins, setCarbonCoins] = useState(0);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  const syncState = () => {
    if (typeof window === 'undefined') return;
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const coins = parseInt(localStorage.getItem('carbonCoins') || '0', 10);
    const name = localStorage.getItem('userName') || 'User';
    setIsLoggedIn(loggedIn);
    setCarbonCoins(coins);
    setUserName(name);
  };

  useEffect(() => {
    syncState();

    // Custom instant reactive event listener
    const handleCoinUpdate = (e) => {
      if (e.detail !== undefined) {
        setCarbonCoins(Number(e.detail));
      } else {
        syncState();
      }
    };

    window.addEventListener('carbonCoinsUpdated', handleCoinUpdate);
    window.addEventListener('storage', syncState);

    // Light fallback interval to catch any external updates
    const interval = setInterval(syncState, 1500);

    return () => {
      window.removeEventListener('carbonCoinsUpdated', handleCoinUpdate);
      window.removeEventListener('storage', syncState);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    api.logout();
    setIsLoggedIn(false);
    setCarbonCoins(0);
    router.push('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Link href="/" className="logo">
            <span className="logo-leaf">🌱</span>
            <span>CarbonCoin</span>
          </Link>
        </div>

        <div className="nav-menu">
        </div>

        <div className="nav-buttons">
          {isLoggedIn ? (
            <>
              <div className="nav-button coins-btn" title="Your Carbon Coins Wallet Balance">
                <span className="coin-icon"></span>
                <span className="coin-count">{carbonCoins} Coins</span>
              </div>
              <Link href="/property-verification" className="nav-button verify-btn">
                + Verify Asset
              </Link>
              <Link href="/dashboard" className="nav-button dashboard-btn">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="nav-button logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/" className="nav-button home-btn">Home</Link>
              <Link href="/#about" className="nav-button about-btn">About Us</Link>
              <Link href="/signup" className="nav-button signup-btn">Sign Up</Link>
              <Link href="/login" className="nav-button login-btn">Login</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
