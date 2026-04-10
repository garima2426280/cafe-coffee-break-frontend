import React, { useState } from 'react';

export default function Header({ showPage, userPhone, onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header>
      <div
        className="logo"
        onClick={() => showPage('homePage')}
        style={{ cursor: 'pointer' }}
      >
        ☕ Cafe Coffee Break
      </div>

      <nav>
        <ul>
          <li onClick={() => showPage('homePage')}>Menu</li>
          <li onClick={() => showPage('cartPage')}>Cart</li>
          <li onClick={() => showPage('billPage')}>Bill</li>
          <li onClick={() => showPage('historyPage')}>History</li>
        </ul>
      </nav>

      {userPhone && (
        <div className="header-profile" style={{ position: 'relative' }}>
          <div className="header-profile-info">
            <p className="header-welcome">Welcome!</p>
            <p className="header-phone">+91 {userPhone}</p>
          </div>

          <div
            className="header-avatar"
            title={`+91 ${userPhone}`}
            onClick={() => setShowDropdown(prev => !prev)}
          >
            {userPhone.toString().slice(-2)}
          </div>

          {showDropdown && (
            <div className="header-dropdown">
              <div className="header-dropdown-info">
                <div className="header-dropdown-avatar">
                  {userPhone.toString().slice(-2)}
                </div>
                <div>
                  <p className="header-dropdown-label">Logged in as</p>
                  <p className="header-dropdown-phone">+91 {userPhone}</p>
                </div>
              </div>
              <div className="header-dropdown-divider" />
              <button
                className="header-dropdown-logout"
                onClick={() => {
                  setShowDropdown(false);
                  onLogout();
                }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
} 