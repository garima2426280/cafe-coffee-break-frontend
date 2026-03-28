import React from 'react';
import { useOffer } from '../context/OfferContext';

export default function HappyHourBanner() {
  const { offer, isActive, discount, countdown, urgency, justActivated, justExpired } = useOffer();

  if (!offer) return null;

  return (
    <>
      {justActivated && (
        <div className="hh-toast hh-toast-active">
          🎉 Happy Hour Started! {discount}% OFF on everything!
        </div>
      )}
      {justExpired && (
        <div className="hh-toast hh-toast-expired">
          ⚠️ Happy Hour ended. Prices back to normal.
        </div>
      )}

      <div className={`happyhour-banner ${isActive ? 'hh-active' : 'hh-inactive'} ${urgency ? 'hh-urgency' : ''}`}>
        {isActive && <div className="hh-glow" />}

        {urgency && isActive && (
          <div className="hh-urgency-bar">
            ⚠️ Offer ending soon! Hurry up! Only {countdown} left!
          </div>
        )}

        <div className="hh-left">
          <div className="hh-badge-wrap">
            <span className={`hh-live-dot ${isActive ? '' : 'hh-dot-inactive'}`} />
            <span className="hh-badge">{isActive ? '🔥 LIVE NOW' : '⏰ UPCOMING'}</span>
          </div>
          <h3 className="hh-title">{offer.title}</h3>
          {offer.description && <p className="hh-desc">{offer.description}</p>}
          {isActive && <p className="hh-price-note">✅ {discount}% discount applied to all prices!</p>}
          {!isActive && (
            <p className="hh-time-left">
              {(() => {
                const now = new Date();
                const curr = now.getHours() * 60 + now.getMinutes();
                const [sh, sm] = offer.startTime.split(':').map(Number);
                const start = sh * 60 + sm;
                if (curr < start) {
                  const diff = start - curr;
                  return `Starts in ${Math.floor(diff/60) > 0 ? `${Math.floor(diff/60)}h ` : ''}${diff%60}m`;
                }
                return 'Offer ended for today';
              })()}
            </p>
          )}
        </div>

        <div className="hh-right">
          <div className={`hh-discount-circle ${!isActive ? 'hh-circle-inactive' : ''}`}>
            <span className="hh-discount-num">{discount || offer.discount}%</span>
            <span className="hh-discount-off">OFF</span>
          </div>
          {isActive && countdown && (
            <div className={`hh-countdown ${urgency ? 'hh-countdown-urgent' : ''}`}>
              <p className="hh-countdown-label">Ends in</p>
              <p className="hh-countdown-time">{countdown}</p>
            </div>
          )}
          <p className="hh-slot">{offer.startTime} – {offer.endTime}</p>
        </div>
      </div>
    </>
  );
}