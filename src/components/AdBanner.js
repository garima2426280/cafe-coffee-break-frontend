import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const DEFAULT_ADS = [
  { text: "☕ Fresh Brewed Happiness — Welcome to Cafe Coffee Break!" },
  { text: "🎉 New items added! Check out our latest menu." },
  { text: "⭐ Your Daily Coffee Escape — Order now and enjoy!" },
];

export default function AdBanner() {
  const [ads, setAds] = useState(DEFAULT_ADS);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await axios.get('/ads');
        if (res.data.length > 0) setAds(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAds();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % ads.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [ads]);

  return (
    <div className="ad-banner">
      <div className="ad-banner-track">
        <p className="ad-banner-text">{ads[current]?.text}</p>
      </div>
      <div className="ad-dots">
        {ads.map((_, i) => (
          <span
            key={i}
            className={`ad-dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
}