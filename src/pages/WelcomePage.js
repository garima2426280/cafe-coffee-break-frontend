import React, { useState } from 'react';
import axios from '../api/axios';

export default function WelcomePage({ onEnter, showAdminLogin }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEnter = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/users/login', { phone });
      if (res.data.success) {
        onEnter(phone);
      }
    } catch (err) {
      setError('Something went wrong. Is backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="welcome-page">

      {/* ADMIN BUTTON - top right corner */}
      <button className="admin-top-btn" onClick={showAdminLogin}>
        Admin
      </button>

      {/* WELCOME CARD */}
      <div className="welcome-card">
        <h1>☕ Garima Cafe</h1>
        <p className="welcome-subtitle">Good coffee, good mood</p>

        <div className="welcome-divider" />

        <label className="welcome-label">Enter your phone number</label>
        <input
          type="number"
          className="welcome-input"
          placeholder="eg. 9876543210"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          maxLength={10}
        />

        {error && (
          <p className="welcome-error">{error}</p>
        )}

        <button
          className="welcome-btn"
          onClick={handleEnter}
          disabled={loading}
        >
          {loading ? 'Please wait...' : 'Enter Cafe ☕'}
        </button>
      </div>

    </div>
  );
}