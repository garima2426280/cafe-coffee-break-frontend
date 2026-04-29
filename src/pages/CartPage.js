import React from 'react';
import { getImageUrl } from '../api/imageUrl';
import { useOffer } from '../context/OfferContext';

export default function CartPage({ cart, menuItems, showPage, increase, decrease }) {
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

  const totalSaved = originalTotal - discountedTotal;

  return (
    <section className="container page active">
      <h2 className="section-title">My Cart</h2>

      {isActive && totalSaved > 0 && (
        <div className="cart-savings-banner">
          <span>🎉</span>
          <div>
            <p className="cart-savings-title">Happy Hour Applied!</p>
            <p className="cart-savings-desc">
              You saved <strong>₹{totalSaved}</strong> ({discount}% OFF)
            </p>
          </div>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="history-empty">
          <span>🛒</span>
          <p>Cart is empty</p>
          <p style={{ fontSize: '13px', opacity: 0.5 }}>Add items from the menu</p>
          <button
            className="welcome-btn"
            style={{ marginTop: '16px', maxWidth: '180px' }}
            onClick={() => showPage('homePage')}
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <>
          {/* CART ITEMS */}
          {cartItems.map(([id, qty]) => {
            const item = getItem(id);
            if (!item) return null;
            const discountedPrice = getDiscountedPrice(item.price);
            const hasDiscount = isActive && discount > 0;
            const itemSavings = getSavings(item.price, qty);

            return (
              <div className="cart-item-row" key={id}>
                <img
                  src={getImageUrl(item.image)}
                  className="row-img"
                  alt={item.name}
                  onError={e => e.target.style.display = 'none'}
                />
                <div className="row-info" style={{ flex: 1 }}>
                  <b>{item.name}</b>
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
                  {hasDiscount && itemSavings > 0 && (
                    <p style={{ fontSize: '11px', color: '#2ea44f', marginTop: '2px' }}>
                      Saved ₹{itemSavings}
                    </p>
                  )}
                </div>

                {/* QTY CONTROLS + REMOVE */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    {hasDiscount ? (
                      <>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>₹{item.price * qty}</p>
                        <p style={{ fontSize: '15px', fontWeight: '700', color: '#2ea44f' }}>₹{discountedPrice * qty}</p>
                      </>
                    ) : (
                      <p style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>₹{item.price * qty}</p>
                    )}
                  </div>

                  {/* QTY CONTROLS */}
                  <div className="controls" style={{ margin: 0 }}>
                    <button onClick={() => decrease(id)}>-</button>
                    <span>{qty}</span>
                    <button onClick={() => increase(id)}>+</button>
                  </div>

                  {/* BUY THIS ITEM ONLY */}
                  <button
                    onClick={() => showPage('billPage')}
                    style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      background: 'rgba(255,123,0,0.15)',
                      border: '1px solid rgba(255,123,0,0.3)',
                      color: '#ffb347',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontFamily: 'Poppins, sans-serif',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Buy Now →
                  </button>
                </div>
              </div>
            );
          })}

          {/* TOTALS */}
          <div className="cart-total-section">
            {isActive && totalSaved > 0 && (
              <>
                <div className="cart-total-row">
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Original Total</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through' }}>₹{originalTotal}</span>
                </div>
                <div className="cart-total-row">
                  <span style={{ color: '#2ea44f' }}>Happy Hour Savings</span>
                  <span style={{ color: '#2ea44f', fontWeight: '700' }}>-₹{totalSaved}</span>
                </div>
              </>
            )}
            <div className="cart-total-row cart-grand-total">
              <span>Subtotal</span>
              <span>₹{discountedTotal}</span>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '6px', textAlign: 'right' }}>
              + CGST 2.5% + SGST 2.5% added at checkout
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            <button
              className="welcome-btn"
              onClick={() => showPage('billPage')}
              style={{ background: 'linear-gradient(135deg, #ff7b00, #ffb347)', border: 'none' }}
            >
              🧾 Proceed to Checkout
            </button>
            <button
              onClick={() => showPage('homePage')}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.6)',
                padding: '12px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
              }}
            >
              ← Continue Shopping
            </button>
          </div>
        </>
      )}
    </section>
  );
}