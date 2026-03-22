import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { getImageUrl } from '../api/imageUrl';

const CATEGORIES = ['Hot Drinks', 'Cold Drinks', 'Snacks', 'Meals'];

export default function MenuPage({ cart, increase, decrease }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get('/menu');
        setItems(res.data);
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
        <p style={{ color: 'white', textAlign: 'center', paddingTop: '40px' }}>
          Loading menu...
        </p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="menu-section page active">
        <p style={{ color: 'white', textAlign: 'center', paddingTop: '40px' }}>
          No menu items yet. Admin needs to add items.
        </p>
      </section>
    );
  }

  return (
    <section className="menu-section page active">
      {CATEGORIES.map(category => {
        const categoryItems = items.filter(item => item.category === category);
        if (categoryItems.length === 0) return null;
        return (
          <div key={category}>
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