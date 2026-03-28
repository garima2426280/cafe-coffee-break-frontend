import React, { useState } from 'react';
import axios from '../api/axios';
import { useOffer } from '../context/OfferContext';
import FeedbackModal from '../components/FeedbackModal';

export default function BillPage({ cart, menuItems, clearCart, showPage, userPhone, onNameSet }) {
  const [name, setName] = useState('');
  const [table, setTable] = useState('');
  const [payment, setPayment] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');
  const { isActive, discount, getDiscountedPrice, getSavings } = useOffer();

  const getItem = (id) => menuItems.find(m => m._id === id);
  const cartItems = Object.entries(cart).filter(([, qty]) => qty > 0);

  const originalTotal = cartItems.reduce((sum, [id, qty]) => {
    const item = getItem(id);
    return sum + qty * (item ? item.price : 0);
  }, 0);

  const total = cartItems.reduce((sum, [id, qty]) => {
    const item = getItem(id);
    if (!item) return sum;
    return sum + qty * getDiscountedPrice(item.price);
  }, 0);

  const totalSavings = originalTotal - total;
  const hasDiscount = isActive && discount > 0;

  const submitOrder = async () => {
    if (!name || !table || !payment) {
      alert('Please fill all fields');
      return;
    }
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (onNameSet) onNameSet(name);

    const items = cartItems.map(([id, qty]) => {
      const item = getItem(id);
      return {
        name: item ? item.name : id,
        qty,
        price: qty * getDiscountedPrice(item ? item.price : 0),
        originalPrice: item ? item.price : 0,
      };
    });

    const order = {
      phone: userPhone,
      name, table, payment, items, total,
      discount: hasDiscount ? discount : 0,
      date: new Date().toLocaleString(),
    };

    try {
      const res = await axios.post('/orders', order);
      setLastOrderId(res.data._id || '');

      let message = '☕ Cafe Order%0A%0A';
      message += 'Customer: ' + name + '%0A';
      message += 'Phone: ' + userPhone + '%0A';
      message += 'Table: ' + table + '%0A';
      message += 'Payment: ' + payment + '%0A';
      if (hasDiscount) message += 'Discount: ' + discount + '% OFF%0A';
      message += '%0A';
      items.forEach(it => {
        message += it.name + ' x ' + it.qty + ' = ₹' + it.price + '%0A';
      });
      if (totalSavings > 0) message += '%0ASaved: ₹' + totalSavings + '%0A';
      message += '%0ATotal: ₹' + total;
      window.open('https://wa.me/919405253204?text=' + message, '_blank');

      clearCart();
      setShowFeedback(true);
    } catch (err) {
      console.error(err);
      alert('Failed to save order.');
    }
  };

  return (
    <>
      {showFeedback && (
        <FeedbackModal
          onClose={() => { setShowFeedback(false); showPage('historyPage'); }}
          userPhone={userPhone}
          userName={name}
          orderId={lastOrderId}
        />
      )}

      <section className="bill-page page active">
        <div className="bill-card">
          <h2>☕ Cafe Coffee Break</h2>

          {hasDiscount && (
            <div className="bill-offer-banner">
              🔥 Happy Hour: {discount}% OFF Applied!
            </div>
          )}

          <table style={{ width: '100%', marginBottom: '10px', borderCollapse: 'collapse' }}>
            <tbody>
              {cartItems.length === 0 ? (
                <tr><td style={{ padding: '8px 0', color: '#888' }}>No items in cart</td></tr>
              ) : (
                cartItems.map(([id, qty]) => {
                  const item = getItem(id);
                  if (!item) return null;
                  const dp = getDiscountedPrice(item.price);
                  return (
                    <tr key={id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '6px 0', fontSize: '13px' }}>{item.name}</td>
                      <td style={{ textAlign: 'center', fontSize: '13px' }}>{qty}</td>
                      <td style={{ textAlign: 'right', fontSize: '13px' }}>
                        {hasDiscount ? (
                          <span>
                            <span style={{ textDecoration: 'line-through', color: '#aaa', marginRight: '4px' }}>₹{item.price}</span>
                            <span style={{ color: '#2ea44f', fontWeight: '600' }}>₹{dp}</span>
                          </span>
                        ) : (
                          <span>₹{qty * item.price}</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {hasDiscount && totalSavings > 0 && (
            <p style={{ color: '#2ea44f', fontSize: '13px', marginBottom: '6px', textAlign: 'right' }}>
              🎉 You saved ₹{totalSavings}!
            </p>
          )}

          <h3 style={{ marginBottom: '15px' }}>
            {hasDiscount && originalTotal !== total && (
              <span style={{ textDecoration: 'line-through', color: '#aaa', fontSize: '14px', marginRight: '8px' }}>
                ₹{originalTotal}
              </span>
            )}
            TOTAL ₹<span>{total}</span>
          </h3>

          <label>Customer Name *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" />

          <label>Table No (1-20) *</label>
          <input type="number" value={table} onChange={e => setTable(e.target.value)} min="1" max="20" placeholder="Enter table number" />

          <label>Payment Method *</label>
          <select value={payment} onChange={e => setPayment(e.target.value)}>
            <option value="">Select Payment</option>
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
          </select>

          <button type="button" onClick={submitOrder}>SUBMIT ORDER</button>
        </div>
      </section>
    </>
  );
}