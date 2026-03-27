import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function HappyHour() {
  const [offer, setOffer] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await axios.get('/offers');
        if (res.data.length > 0) setOffer(res.data[0]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOffer();
  }, []);

  useEffect(() => {
    if (!offer) return;
    const checkTime = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [startH, startM] = offer.startTime.split(':').map(Number);
      const [endH, endM] = offer.endTime.split(':').map(Number);
      const start = startH * 60 + startM;
      const end = endH * 60 + endM;
      const active = currentTime >= start && currentTime < end;
      setIsActive(active);
      if (active) {
        const remaining = end - currentTime;
        const h = Math.floor(remaining / 60);
        const m = remaining % 60;
        setTimeLeft(h > 0 ? `${h}h ${m}m left` : `${m}m left`);
      } else if (currentTime < start) {
        const until = start - currentTime;
        const h = Math.floor(until / 60);
        const m = until % 60;
        setTimeLeft(`Starts in ${h > 0 ? `${h}h ` : ''}${m}m`);
      } else {
        setTimeLeft('Offer ended for today');
      }
    };
    checkTime();
    const timer = setInterval(checkTime, 60000);
    return () => clearInterval(timer);
  }, [offer]);

  if (!offer) return null;

  return (
    <div className={`happy-hour ${isActive ? 'active' : 'inactive'}`}>
      <div className="happy-hour-left">
        <span className="happy-hour-badge">{isActive ? '🔥 LIVE' : '⏰ UPCOMING'}</span>
        <div>
          <h3 className="happy-hour-title">{offer.title}</h3>
          <p className="happy-hour-desc">{offer.description}</p>
        </div>
      </div>
      <div className="happy-hour-right">
        <div className="happy-hour-discount">{offer.discount}% OFF</div>
        <p className="happy-hour-time">{timeLeft}</p>
        <p className="happy-hour-slot">{offer.startTime} – {offer.endTime}</p>
      </div>
    </div>
  );
}