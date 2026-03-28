import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from '../api/axios';

const OfferContext = createContext();

export function OfferProvider({ children }) {
  const [offer, setOffer] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [countdown, setCountdown] = useState('');
  const [urgency, setUrgency] = useState(false);
  const [justActivated, setJustActivated] = useState(false);
  const [justExpired, setJustExpired] = useState(false);
  const prevActive = useRef(false);
  const pollRef = useRef(null);

  const fetchOffer = useCallback(async () => {
    try {
      const res = await axios.get('/offers');
      if (res.data.length > 0) {
        setOffer(res.data[0]);
      } else {
        setOffer(null);
        setIsActive(false);
        setDiscount(0);
      }
    } catch (err) {
      console.error('Offer fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchOffer();
    pollRef.current = setInterval(fetchOffer, 30000);
    return () => clearInterval(pollRef.current);
  }, [fetchOffer]);

  useEffect(() => {
    if (!offer) {
      setIsActive(false);
      setDiscount(0);
      setCountdown('');
      setUrgency(false);
      return;
    }

    const checkTime = () => {
      const now = new Date();
      const currentSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      const [startH, startM] = offer.startTime.split(':').map(Number);
      const [endH, endM] = offer.endTime.split(':').map(Number);
      const startSecs = startH * 3600 + startM * 60;
      const endSecs = endH * 3600 + endM * 60;
      const active = currentSecs >= startSecs && currentSecs < endSecs;

      if (active && !prevActive.current) {
        setJustActivated(true);
        setTimeout(() => setJustActivated(false), 4000);
      }
      if (!active && prevActive.current) {
        setJustExpired(true);
        setTimeout(() => setJustExpired(false), 4000);
      }
      prevActive.current = active;

      setIsActive(active);
      setDiscount(active ? offer.discount : 0);

      if (active) {
        const remaining = endSecs - currentSecs;
        const h = Math.floor(remaining / 3600);
        const m = Math.floor((remaining % 3600) / 60);
        const s = remaining % 60;
        setUrgency(remaining < 600);
        setCountdown(
          h > 0
            ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
            : `${m}:${String(s).padStart(2, '0')}`
        );
      } else {
        setUrgency(false);
        setCountdown('');
      }
    };

    checkTime();
    const timer = setInterval(checkTime, 1000);
    return () => clearInterval(timer);
  }, [offer]);

  const getDiscountedPrice = useCallback((price) => {
    if (!isActive || discount <= 0) return price;
    return Math.round(price * (1 - discount / 100));
  }, [isActive, discount]);

  const getSavings = useCallback((price) => {
    if (!isActive || discount <= 0) return 0;
    return price - Math.round(price * (1 - discount / 100));
  }, [isActive, discount]);

  return (
    <OfferContext.Provider value={{
      offer, isActive, discount, countdown, urgency,
      justActivated, justExpired,
      getDiscountedPrice, getSavings,
      refreshOffer: fetchOffer,
    }}>
      {children}
    </OfferContext.Provider>
  );
}

export const useOffer = () => useContext(OfferContext);