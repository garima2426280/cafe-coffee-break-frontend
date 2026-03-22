import React, { useState } from 'react';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'garima123';

export default function AdminLogin({ onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!username || !password) {
      setError('Please fill all fields');
      return;
    }
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <section className="bill-page page active">
      <div className="bill-card">
        <h2 style={{ color: 'orange', textAlign: 'center', marginBottom: '20px' }}>
          ☕ Admin Login
        </h2>

        {error && (
          <p style={{ color: 'red', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}>
            {error}
          </p>
        )}

        <label>Username *</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Enter username"
        />

        <label>Password *</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter password"
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />

        <button type="button" onClick={handleLogin}>
          LOGIN
        </button>

        <button
          type="button"
          onClick={onBack}
          style={{ marginTop: '10px', background: '#888' }}
        >
          ← Back
        </button>
      </div>
    </section>
  );
}