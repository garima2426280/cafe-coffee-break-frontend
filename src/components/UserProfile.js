import React, { useState } from 'react';

export default function UserProfile({ userPhone, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="user-profile-wrapper">
      <button className="user-profile-btn" onClick={() => setOpen(!open)}>
        <div className="user-avatar">
          {userPhone ? userPhone.toString().slice(-2) : 'U'}
        </div>
      </button>

      {open && (
        <div className="user-profile-dropdown">
          <div className="user-profile-info">
            <div className="user-avatar-large">
              {userPhone ? userPhone.toString().slice(-2) : 'U'}
            </div>
            <div>
              <p className="user-profile-welcome">Welcome!</p>
              <p className="user-profile-phone">+91 {userPhone}</p>
            </div>
          </div>
          <div className="user-profile-divider" />
          <button className="user-profile-logout" onClick={() => { setOpen(false); onLogout(); }}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}