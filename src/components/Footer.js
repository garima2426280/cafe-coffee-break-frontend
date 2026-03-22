import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <h3>☕ Garima Cafe</h3>
          <p>Good coffee, good mood ☕</p>
        </div>
        <div className="footer-center">
          <p>📍 Location: Nagar City</p>
          <p>📞 +91 9876543210</p>
        </div>
        <div className="footer-right">
          <p>Follow Us</p>
          <div className="social-icons">
            <i className="ri-instagram-line"></i>
            <i className="ri-facebook-circle-line"></i>
            <i className="ri-whatsapp-line"></i>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        © 2026 Garima Cafe | All Rights Reserved
      </div>
    </footer>
  );
}