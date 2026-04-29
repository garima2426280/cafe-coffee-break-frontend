import React from 'react';

export default function BottomNav({ page, showPage }) {
  return (
    <div className="bottom-nav">
      <div className={`nav-item ${page === 'homePage' ? 'active' : ''}`} onClick={() => showPage('homePage')}>
        Home
      </div>
      <div className={`nav-item ${page === 'cartPage' ? 'active' : ''}`} onClick={() => showPage('cartPage')}>
        My Cart
      </div>
      <div className={`nav-item ${page === 'billPage' ? 'active' : ''}`} onClick={() => showPage('billPage')}>
        My Bill
      </div>
      <div className={`nav-item ${page === 'tableStatusPage' ? 'active' : ''}`} onClick={() => showPage('tableStatusPage')}>
        Status
      </div>
      <div className={`nav-item ${page === 'feedbackPage' ? 'active' : ''}`} onClick={() => showPage('feedbackPage')}>
        Feedback
      </div>
      <div className={`nav-item ${page === 'historyPage' ? 'active' : ''}`} onClick={() => showPage('historyPage')}>
        History
      </div>
    </div>
  );
}