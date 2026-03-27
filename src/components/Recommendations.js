import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { getImageUrl } from '../api/imageUrl';

export default function Recommendations({ cart, increase, decrease }) {
  const [topItems, setTopItems] = useState([]);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const res = await axios.get('/reports/product');
        setTopItems(res.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetchTop();
  }, []);

  const tags = ['🔥 Trending', '⭐ Best Seller', '❤️ Most Loved', '🏆 Top Pick', '✨ Popular'];

  const menuRes = React.useRef(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get('/menu');
        menuRes.current = res.data;
      } catch (err) { console.error(err); }
    };
    fetchMenu();
  }, []);

  const getMenuItem = (name) => {
    if (!menuRes.current) return null;
    return menuRes.current.find(m => m.name.toLowerCase() === name.toLowerCase());
  };

  if (topItems.length === 0) return null;

  return (
    <div className="recommendations">
      <div className="recommendations-header">
        <h2 className="section-title" style={{ margin: '0', border: 'none', padding: '0' }}>
          Recommended for You
        </h2>
        <p className="recommendations-sub">Based on what customers love most</p>
      </div>
      <div className="recommendations-scroll">
        {topItems.map((item, i) => {
          const menuItem = getMenuItem(item.name);
          return (
            <div className="rec-card" key={i}>
              <div className="rec-tag">{tags[i % tags.length]}</div>
              {menuItem && (
                <img
                  src={getImageUrl(menuItem.image)}
                  alt={item.name}
                  className="rec-img"
                  onError={e => e.target.style.display = 'none'}
                />
              )}
              <div className="rec-info">
                <h4 className="rec-name">{item.name}</h4>
                <p className="rec-price">₹{menuItem?.price || ''}</p>
                <p className="rec-orders">{item.qty} orders</p>
              </div>
              {menuItem && (
                <div className="rec-controls">
                  <button onClick={() => decrease(menuItem._id)}>−</button>
                  <span>{cart[menuItem._id] || 0}</span>
                  <button onClick={() => increase(menuItem._id)}>+</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}