import React from 'react';
import { getImageUrl } from '../api/imageUrl';
import { useOffer } from '../context/OfferContext';

export default function CartPage({ cart, menuItems }) {
  const { isActive, discount, getDiscountedPrice, getSavings } = useOffer();

  const cartItems = Object.entries(cart).filter(([, qty]) => qty > 0);
  const getItem = (id) => menuItems.find(m => m._id === id);

  const originalTotal = cartItems.reduce((sum, [id, qty]) => {
    const item = getItem(id);
    return sum + qty * (item ? item.price : 0);
  }, 0);

  const discountedTotal = cartItems.reduce((sum, [id, qty]) => {
    const item = getItem(id);
    if (!item) return sum;
    return sum + qty * getDiscountedPrice(item.price);
  }, 0);

  const totalSavings = originalTotal - discountedTotal;

  return (
    <section className="container page active">
      <h2 className="section-title">My Cart</h2>

      {isActive && discount > 0 && totalSavings > 0 && (
        <div className="cart-offer-banner">
          🎉 Happy Hour Applied! You saved ₹{totalSavings} on this order!
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="history-empty">
          <span>🛒</span>
          <p>Cart is empty</p>
          <p style={{ fontSize: '13px', opacity: 0.5 }}>Add items from the menu</p>
        </div>
      ) : (
        <>
          {cartItems.map(([id, qty]) => {
            const item = getItem(id);
            if (!item) return null;
            const discountedPrice = getDiscountedPrice(item.price);
            const savings = getSavings(item.price);
            const hasDiscount = isActive && discount > 0;
            return (
              <div className={`cart-item-row ${hasDiscount ? 'cart-item-offer' : ''}`} key={id}>
                <img
                  src={getImageUrl(item.image)}
                  className="row-img"
                  alt={item.name}
                  onError={e => e.target.style.display = 'none'}
                />
                <div className="cart-item-info">
                  <b style={{ color: 'white', fontSize: '14px' }}>{item.name}</b>
                  <div className="menu-price-row" style={{ marginTop: '4px' }}>
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
                    <p className="menu-savings">Save ₹{savings} each</p>
                  )}
                </div>
                <div className="cart-item-right">
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>×{qty}</p>
                  <p style={{ color: '#ffb347', fontWeight: '700', fontSize: '15px' }}>
                    ₹{qty * discountedPrice}
                  </p>
                </div>
              </div>
            );
          })}

          <div className="cart-total-section">
            {isActive && totalSavings > 0 && (
              <div className="cart-savings-row">
                <span>🎉 Total Savings</span>
                <span style={{ color: '#2ea44f', fontWeight: '700' }}>-₹{totalSavings}</span>
              </div>
            )}
            {isActive && originalTotal !== discountedTotal && (
              <div className="cart-original-row">
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Original Total</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>₹{originalTotal}</span>
              </div>
            )}
            <div className="cart-final-row">
              <span style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>Total</span>
              <span style={{ color: '#ffb347', fontWeight: '700', fontSize: '20px' }}>₹{discountedTotal}</span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}