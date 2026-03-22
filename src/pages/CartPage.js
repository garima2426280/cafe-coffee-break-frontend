import React from 'react';
import { getImageUrl } from '../api/imageUrl';

export default function CartPage({ cart, menuItems }) {

  const cartItems = Object.entries(cart).filter(([, qty]) => qty > 0);

  const getItem = (id) => menuItems.find(m => m._id === id);

  const total = cartItems.reduce((sum, [id, qty]) => {
    const item = getItem(id);
    return sum + qty * (item ? item.price : 0);
  }, 0);

  return (
    <section className="container page active">
      <h2 className="section-title">My Cart</h2>

      {cartItems.length === 0 ? (
        <p style={{ color: 'white' }}>Cart is empty</p>
      ) : (
        cartItems.map(([id, qty]) => {
          const item = getItem(id);
          if (!item) return null;
          return (
            <div className="menu-row" key={id}>
              <img
                src={getImageUrl(item.image)}
                className="row-img"
                alt={item.name}
                onError={e => e.target.style.display = 'none'}
              />
              <div className="row-info">
                <b>{item.name}</b>
                <p>{qty} x ₹{item.price}</p>
              </div>
              <p style={{ color: 'white', fontWeight: '600' }}>
                ₹{qty * item.price}
              </p>
            </div>
          );
        })
      )}

      {cartItems.length > 0 && (
        <h3 style={{ color: 'white', marginTop: '20px' }}>
          Total : ₹{total}
        </h3>
      )}
    </section>
  );
}