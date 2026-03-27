import React from 'react';

export default function Header({ showPage, userPhone, onLogout }) {
  return (
    <header>
      <div className="logo" onClick={() => showPage('homePage')} style={{ cursor: 'pointer' }}>
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
        <div className="header-profile">
          <div className="header-profile-info">
            <p className="header-welcome">Welcome!</p>
            <p className="header-phone">+91 {userPhone}</p>
          </div>
          <div className="header-avatar" title={`+91 ${userPhone}`}>
            {userPhone.toString().slice(-2)}
          </div>
        </div>
      )}
    </header>
  );
}