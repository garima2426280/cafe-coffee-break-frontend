import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function AnnouncementBar() {
  const [ads, setAds] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await axios.get('/ads');
        if (res.data.length > 0) setAds(res.data);
      } catch (err) { console.error(err); }
    };
    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % ads.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [ads]);

  if (ads.length === 0) return null;

  return (
    <div className="announcement-bar">
      <span className="announcement-label">📢 Announcement</span>
      <div className="announcement-text-wrap">
        <p key={current} className="announcement-text">{ads[current]?.text}</p>
      </div>
      {ads.length > 1 && (
        <div className="announcement-dots">
          {ads.map((_, i) => (
            <span key={i} className={`ann-dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)} />
          ))}
        </div>
      )}
    </div>
  );
}