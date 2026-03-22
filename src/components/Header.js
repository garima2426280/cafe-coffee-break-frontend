import React from 'react';

export default function Header({ showPage }) {
  return (
    <header>
      <div
        className="logo"
        onClick={() => showPage('homePage')}
        style={{ cursor: 'pointer' }}
      >
        ☕ Garima Cafe
      </div>
      <nav>
        <ul>
          <li onClick={() => showPage('homePage')}>Menu</li>
          <li onClick={() => showPage('cartPage')}>Cart</li>
          <li onClick={() => showPage('billPage')}>Bill</li>
          <li onClick={() => showPage('historyPage')}>History</li>
          <li
            onClick={() => showPage('adminLogin')}
            style={{ opacity: 0.4, fontSize: '12px' }}
          >
            Admin
          </li>
        </ul>
      </nav>
    </header>
  );
}