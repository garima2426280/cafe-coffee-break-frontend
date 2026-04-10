import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('expanding');

  useEffect(() => {
    // phase 1: expand (800ms)
    const t1 = setTimeout(() => setPhase('logo'), 800);
    // phase 2: show logo (1200ms)
    const t2 = setTimeout(() => setPhase('shrinking'), 2000);
    // phase 3: shrink (800ms) then done
    const t3 = setTimeout(() => onComplete(), 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      {/* LEFT PANEL */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: phase === 'expanding' ? '0%'
             : phase === 'logo'      ? '50%'
             : '0%',
        background: '#D4B896',
        transition: phase === 'expanding' ? 'width 0.8s cubic-bezier(0.77,0,0.18,1)'
                  : phase === 'shrinking' ? 'width 0.8s cubic-bezier(0.77,0,0.18,1)'
                  : 'none',
        transformOrigin: 'right',
      }} />

      {/* RIGHT PANEL */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        height: '100%',
        width: phase === 'expanding' ? '0%'
             : phase === 'logo'      ? '50%'
             : '0%',
        background: '#6B3F1F',
        transition: phase === 'expanding' ? 'width 0.8s cubic-bezier(0.77,0,0.18,1)'
                  : phase === 'shrinking' ? 'width 0.8s cubic-bezier(0.77,0,0.18,1)'
                  : 'none',
        transformOrigin: 'left',
      }} />

      {/* LOGO - shows when panels are fully expanded */}
      <div style={{
        position: 'relative',
        zIndex: 10000,
        opacity: phase === 'logo' ? 1 : 0,
        transform: phase === 'logo' ? 'scale(1)' : 'scale(0.5)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}>
        {/* CAFE LOGO ICON */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: '#8B5E3C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '4px solid #6B3F1F',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}>
          <span style={{ fontSize: '52px' }}>☕</span>
        </div>

        {/* CAFE NAME */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '22px',
            fontWeight: '700',
            color: '#4A2C0A',
            margin: 0,
            letterSpacing: '3px',
          }}>
            Cafe Coffee
          </p>
          <p style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '13px',
            fontWeight: '400',
            color: '#0a0909',
            margin: 0,
            letterSpacing: '6px',
          }}>
            Break
          </p>
        </div>
      </div>
    </div>
  );
}