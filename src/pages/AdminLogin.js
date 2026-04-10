import React, { useState } from 'react';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'garima123';
const STATIC_TOKEN = 'garima-admin-secret-token';

export default function AdminLogin({ onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!username || !password) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (username === ADMIN_USER && password === ADMIN_PASS) {
        // Save token to localStorage — session management handled in App.js
        localStorage.setItem('adminToken', STATIC_TOKEN);
        onLogin(); // App.js saves session + starts timer
      } else {
        setError('Invalid username or password');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="admin-login-page">
      <div className="welcome-bg-circle circle-1" />
      <div className="welcome-bg-circle circle-2" />

      <button className="admin-back-btn" onClick={onBack}>← Back</button>

      <div className="admin-login-card">
        <div className="admin-login-icon">🔐</div>
        <h2 className="admin-login-title">Admin Login</h2>
        <p className="admin-login-subtitle">Cafe Coffee Break Dashboard</p>
        <div className="welcome-divider" style={{ marginBottom: '28px' }} />

        {error && <div className="admin-login-error">{error}</div>}

        <div className="admin-login-field">
          <label className="welcome-label">Username</label>
          <input
            type="text"
            className="welcome-input"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(''); }}
            placeholder="Enter username"
          />
        </div>

        <div className="admin-login-field">
          <label className="welcome-label">Password</label>
          <input
            type="password"
            className="welcome-input"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder="Enter password"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <button
          className="welcome-btn"
          onClick={handleLogin}
          disabled={loading}
          style={{ marginTop: '8px' }}
        >
          {loading ? 'Logging in...' : 'Login as Admin'}
        </button>
      </div>

      <footer className="footer" style={{ position: 'fixed', bottom: 0, width: '100%', zIndex: 1 }}>
        <div className="footer-bottom" style={{ borderTop: 'none' }}>
          © 2026 Cafe Coffee Break | All Rights Reserved
        </div>
      </footer>
    </div>
  );
}