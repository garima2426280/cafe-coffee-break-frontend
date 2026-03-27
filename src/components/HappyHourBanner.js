import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function HappyHourBanner({ onOfferChange }) {
  const [offer, setOffer] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await axios.get('/offers');
        if (res.data.length > 0) {
          setOffer(res.data[0]);
        }
      } catch (err) { console.error(err); }
    };
    fetchOffer();
  }, []);

  useEffect(() => {
    if (!offer) return;
    const checkTime = () => {
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const currentSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      const [startH, startM] = offer.startTime.split(':').map(Number);
      const [endH, endM] = offer.endTime.split(':').map(Number);
      const start = startH * 60 + startM;
      const end = endH * 60 + endM;
      const endSecs = endH * 3600 + endM * 60;
      const active = currentMins >= start && currentMins < end;
      setIsActive(active);
      onOfferChange && onOfferChange(active ? offer.discount : 0);

      if (active) {
        const remaining = endSecs - currentSecs;
        const h = Math.floor(remaining / 3600);
        const m = Math.floor((remaining % 3600) / 60);
        const s = remaining % 60;
        setCountdown(h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${m}:${String(s).padStart(2,'0')}`);
        setTimeLeft('');
      } else if (currentMins < start) {
        const until = start - currentMins;
        setTimeLeft(`Starts in ${Math.floor(until/60) > 0 ? `${Math.floor(until/60)}h ` : ''}${until%60}m`);
        setCountdown('');
        onOfferChange && onOfferChange(0);
      } else {
        setTimeLeft('Offer ended for today');
        setCountdown('');
        onOfferChange && onOfferChange(0);
      }
    };
    checkTime();
    const timer = setInterval(checkTime, 1000);
    return () => clearInterval(timer);
  }, [offer, onOfferChange]);

  if (!offer) return null;

  return (
    <div className={`happyhour-banner ${isActive ? 'hh-active' : 'hh-inactive'}`}>
      {isActive && <div className="hh-glow" />}
      <div className="hh-left">
        <div className="hh-badge-wrap">
          <span className="hh-live-dot" />
          <span className="hh-badge">{isActive ? '🔥 LIVE NOW' : '⏰ UPCOMING'}</span>
        </div>
        <h3 className="hh-title">{offer.title}</h3>
        {offer.description && <p className="hh-desc">{offer.description}</p>}
        {isActive && <p className="hh-price-note">Prices updated with {offer.discount}% discount!</p>}
        {!isActive && <p className="hh-time-left">{timeLeft}</p>}
      </div>
      <div className="hh-right">
        <div className="hh-discount-circle">
          <span className="hh-discount-num">{offer.discount}%</span>
          <span className="hh-discount-off">OFF</span>
        </div>
        {isActive && countdown && (
          <div className="hh-countdown">
            <p className="hh-countdown-label">Ends in</p>
            <p className="hh-countdown-time">{countdown}</p>
          </div>
        )}
        <p className="hh-slot">{offer.startTime} – {offer.endTime}</p>
      </div>
    </div>
  );
}