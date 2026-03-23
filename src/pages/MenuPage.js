import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { getImageUrl } from '../api/imageUrl';

import coffeeImg from '../assets/images/coffee.png';
import coldcoffeeImg from '../assets/images/coldcoffee.png';
import teaImg from '../assets/images/tea.png';
import greenteaImg from '../assets/images/greentea.png';

const CATEGORIES = ['Hot Drinks', 'Cold Drinks', 'Snacks', 'Meals'];

export default function MenuPage({ cart, increase, decrease, onMenuLoaded }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (items.length === 0) {
    return (
      <section className="menu-section page active">
        <div className="menu-loading">
          <span>☕</span>
          <p>No menu items yet. Admin needs to add items.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="menu-section page active" style={{ position: 'relative', overflow: 'hidden' }}>

      {/* FLOATING IMAGES */}
      <img src={coffeeImg}     className="menu-float menu-float-1" alt="coffee" />
      <img src={coldcoffeeImg} className="menu-float menu-float-2" alt="cold coffee" />
      <img src={teaImg}        className="menu-float menu-float-3" alt="tea" />
      <img src={greenteaImg}   className="menu-float menu-float-4" alt="green tea" />

      {/* MENU ITEMS */}
      {CATEGORIES.map(category => {
        const categoryItems = items.filter(item => item.category === category);
        if (categoryItems.length === 0) return null;
        return (
          <div key={category} style={{ position: 'relative', zIndex: 1 }}>
            <h2 className="section-title">{category}</h2>
            <div className="menu-list">
              {categoryItems.map(item => (
                <div className="menu-row" key={item._id}>
                  <img
                    src={getImageUrl(item.image)}
                    className="row-img"
                    alt={item.name}
                    onError={e => e.target.style.display = 'none'}
                  />
                  <div className="row-info">
                    <b>{item.name}</b>
                    <p>₹{item.price}</p>
                  </div>
                  <div className="controls">
                    <button onClick={() => decrease(item._id)}>-</button>
                    <span>{cart[item._id] || 0}</span>
                    <button onClick={() => increase(item._id)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}