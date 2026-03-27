import React, { useState, useEffect } from 'react';

const BANNERS = [
  {
    id: 1,
    bg: 'linear-gradient(135deg, #1a0a00, #3d1c00)',
    accent: '#ff7b00',
    badge: '🔥 LIMITED TIME',
    title: '50% OFF',
    subtitle: 'On all Hot Drinks',
    desc: 'Use code: COFFEE50',
    emoji: '☕',
  },
  {
    id: 2,
    bg: 'linear-gradient(135deg, #0a1a00, #1c3d00)',
    accent: '#2ea44f',
    badge: '⭐ BEST SELLER',
    title: 'Veg Thali',
    subtitle: 'Complete Meal Deal',
    desc: 'Only ₹200 — Full Satisfaction',
    emoji: '🍱',
  },
  {
    id: 3,
    bg: 'linear-gradient(135deg, #1a0014, #3d002e)',
    accent: '#ff47a3',
    badge: '🎉 NEW ARRIVAL',
    title: 'Cold Coffee',
    subtitle: 'Chilled & Refreshing',
    desc: 'Perfect for summer days',
    emoji: '🧊',
  },
  {
    id: 4,
    bg: 'linear-gradient(135deg, #0a0a1a, #00003d)',
    accent: '#4fc3f7',
    badge: '🌅 MORNING SPECIAL',
    title: 'Free Snack',
    subtitle: 'With every breakfast order',
    desc: 'Valid 8 AM – 11 AM daily',
    emoji: '🥪',
  },
];

export default function CarouselBanner() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % BANNERS.length);
        setAnimating(false);
      }, 300);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (i) => {
    setAnimating(true);
    setTimeout(() => { setCurrent(i); setAnimating(false); }, 300);
  };

  const banner = BANNERS[current];

  return (
    <div className="carousel-wrapper">
      <div
        className={`carousel-slide ${animating ? 'carousel-exit' : 'carousel-enter'}`}
        style={{ background: banner.bg }}
      >
        {/* LEFT CONTENT */}
        <div className="carousel-content">
          <span className="carousel-badge" style={{ color: banner.accent, borderColor: banner.accent }}>
            {banner.badge}
          </span>
          <h2 className="carousel-title" style={{ color: banner.accent }}>{banner.title}</h2>
          <p className="carousel-subtitle">{banner.subtitle}</p>
          <p className="carousel-desc">{banner.desc}</p>
        </div>

        {/* RIGHT EMOJI */}
        <div className="carousel-emoji-wrap">
          <div className="carousel-emoji-bg" style={{ background: `${banner.accent}20` }}>
            <span className="carousel-emoji">{banner.emoji}</span>
          </div>
        </div>

        {/* DOTS */}
        <div className="carousel-dots">
          {BANNERS.map((_, i) => (
            <span
              key={i}
              className={`carousel-dot ${i === current ? 'active' : ''}`}
              style={i === current ? { background: banner.accent } : {}}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {/* ARROWS */}
        <button
          className="carousel-arrow carousel-arrow-left"
          onClick={() => goTo((current - 1 + BANNERS.length) % BANNERS.length)}
        >‹</button>
        <button
          className="carousel-arrow carousel-arrow-right"
          onClick={() => goTo((current + 1) % BANNERS.length)}
        >›</button>
      </div>
    </div>
  );
}