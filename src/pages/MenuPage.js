import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { getImageUrl } from '../api/imageUrl';
import { useOffer } from '../context/OfferContext';

import coffeeImg from '../assets/images/coffee.png';
import coldcoffeeImg from '../assets/images/coldcoffee.png';
import teaImg from '../assets/images/tea.png';
import greenteaImg from '../assets/images/greentea.png';

import CarouselBanner from '../components/CarouselBanner';
import AnnouncementBar from '../components/AnnouncementBar';
import HappyHourBanner from '../components/HappyHourBanner';
import MostOrdered from '../components/MostOrdered';

const CATEGORIES = ['Hot Drinks', 'Cold Drinks', 'Snacks', 'Meals'];

export default function MenuPage({ cart, increase, decrease, onMenuLoaded }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isActive, discount, getDiscountedPrice, getSavings } = useOffer();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get('/menu');
        setItems(res.data);
        if (onMenuLoaded) onMenuLoaded(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <section className="menu-section page active">
        <div className="menu-loading">
          <span>☕</span>
          <p>Loading menu...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="menu-section page active" style={{ position: 'relative' }}>

      {/* FLOATING IMAGES */}
      <img src={coffeeImg}     className="menu-float menu-float-1" alt="coffee" />
      <img src={coldcoffeeImg} className="menu-float menu-float-2" alt="cold coffee" />
      <img src={teaImg}        className="menu-float menu-float-3" alt="tea" />
      <img src={greenteaImg}   className="menu-float menu-float-4" alt="green tea" />

      {/* CAROUSEL BANNER */}
      <div className="menu-top-section"><CarouselBanner /></div>

      {/* ANNOUNCEMENT BAR */}
      <div className="menu-top-section"><AnnouncementBar /></div>

      {/* HAPPY HOUR BANNER */}
      <div className="menu-top-section"><HappyHourBanner /></div>

      {/* MOST ORDERED */}
      {items.length > 0 && (
        <MostOrdered cart={cart} increase={increase} decrease={decrease} />
      )}

      {/* CATEGORY TAGS — centered */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        margin: '20px auto 24px auto',
        padding: '0 20px',
        maxWidth: '900px',
        position: 'relative',
        zIndex: 1,
      }}>
        <span className="welcome-feature-tag">☕ Hot Drinks</span>
        <span className="welcome-feature-tag">🧊 Cold Drinks</span>
        <span className="welcome-feature-tag">🍱 Meals</span>
        <span className="welcome-feature-tag">🥪 Snacks</span>
      </div>

      {/* MENU ITEMS */}
      {items.length === 0 ? (
        <div className="menu-loading">
          <span>☕</span>
          <p>No menu items yet. Admin needs to add items.</p>
        </div>
      ) : (
        CATEGORIES.map(category => {
          const categoryItems = items.filter(item => item.category === category);
          if (categoryItems.length === 0) return null;
          return (
            <div key={category} style={{ position: 'relative', zIndex: 1 }}>
              <h2 className="section-title">{category}</h2>
              <div className="menu-list">
                {categoryItems.map(item => {
                  const discountedPrice = getDiscountedPrice(item.price);
                  const savings = getSavings(item.price);
                  const hasDiscount = isActive && discount > 0;
                  return (
                    <div
                      className={`menu-row ${hasDiscount ? 'menu-row-offer' : ''}`}
                      key={item._id}
                    >
                      <img
                        src={getImageUrl(item.image)}
                        className="row-img"
                        alt={item.name}
                        onError={e => e.target.style.display = 'none'}
                      />
                      <div className="row-info">
                        <b>{item.name}</b>
                        <div className="menu-price-row">
                          {hasDiscount ? (
                            <>
                              <span className="menu-price-original">₹{item.price}</span>
                              <span className="menu-price-discounted">₹{discountedPrice}</span>
                              <span className="menu-price-badge">{discount}% OFF</span>
                            </>
                          ) : (
                            <span className="menu-price-normal">₹{item.price}</span>
                          )}
                        </div>
                        {hasDiscount && savings > 0 && (
                          <p className="menu-savings">You save ₹{savings}</p>
                        )}
                      </div>
                      <div className="controls">
                        <button onClick={() => decrease(item._id)}>-</button>
                        <span>{cart[item._id] || 0}</span>
                        <button onClick={() => increase(item._id)}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}