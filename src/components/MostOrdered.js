import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { getImageUrl } from '../api/imageUrl';

const TAGS = ['🔥 Trending', '⭐ Best Seller', '❤️ Most Loved', '🏆 Top Pick', '✨ Popular'];

export default function MostOrdered({ cart, increase, decrease, discount }) {
  const [topItems, setTopItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, menuRes] = await Promise.all([
          axios.get('/reports/product'),
          axios.get('/menu'),
        ]);
        setTopItems(prodRes.data.slice(0, 6));
        setMenuItems(menuRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const getMenuItem = (name) =>
    menuItems.find(m => m.name.toLowerCase() === name.toLowerCase());

  const getDiscountedPrice = (price) => {
    if (!discount || discount <= 0) return price;
    return Math.round(price * (1 - discount / 100));
  };

  if (topItems.length === 0) return null;

  return (
    <div className="most-ordered-section">
      <div className="most-ordered-header">
        <div>
          <h2 className="most-ordered-title">🔥 Most Ordered</h2>
          <p className="most-ordered-sub">What everyone's loving right now</p>
        </div>
      </div>
      <div className="most-ordered-scroll">
        {topItems.map((item, i) => {
          const menuItem = getMenuItem(item.name);
          if (!menuItem) return null;
          const originalPrice = menuItem.price;
          const discountedPrice = getDiscountedPrice(originalPrice);
          const hasDiscount = discount > 0;
          return (
            <div className="most-ordered-card" key={i}>
              <div className="mo-rank">#{i + 1}</div>
              <div className="mo-tag">{TAGS[i % TAGS.length]}</div>
              <img
                src={getImageUrl(menuItem.image)}
                alt={item.name}
                className="mo-img"
                onError={e => e.target.style.display = 'none'}
              />
              <div className="mo-info">
                <h4 className="mo-name">{item.name}</h4>
                <div className="mo-price-row">
                  {hasDiscount ? (
                    <>
                      <span className="mo-price-original">₹{originalPrice}</span>
                      <span className="mo-price-discounted">₹{discountedPrice}</span>
                      <span className="mo-discount-badge">{discount}% OFF</span>
                    </>
                  ) : (
                    <span className="mo-price">₹{originalPrice}</span>
                  )}
                </div>
                <p className="mo-orders">{item.qty} orders</p>
              </div>
              <div className="mo-controls">
                <button onClick={() => decrease(menuItem._id)}>−</button>
                <span>{cart[menuItem._id] || 0}</span>
                <button onClick={() => increase(menuItem._id)}>+</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}