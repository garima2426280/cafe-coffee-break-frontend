import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import axios from '../api/axios';
import FeedbackModal from '../components/FeedbackModal';
import { useOffer } from '../context/OfferContext';

const CGST_RATE = 0.025;
const SGST_RATE = 0.025;

export default function BillPage({ cart, menuItems, clearCart, showPage, userPhone, onNameSet }) {
  const [name, setName] = useState('');
  const [table, setTable] = useState('');
  const [payment, setPayment] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');
  const [tableStatus, setTableStatus] = useState(null);
  const [tableChecking, setTableChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { isActive, discount, getDiscountedPrice } = useOffer();

  const getItem = (id) => menuItems.find(m => m._id === id);
  const cartItems = Object.entries(cart).filter(([, qty]) => qty > 0);

  const originalTotal = cartItems.reduce((sum, [id, qty]) => {
    const item = getItem(id);
    return sum + qty * (item ? item.price : 0);
  }, 0);

  const subtotal = cartItems.reduce((sum, [id, qty]) => {
    const item = getItem(id);
    if (!item) return sum;
    return sum + qty * getDiscountedPrice(item.price);
  }, 0);

  const cgstAmount = Math.round(subtotal * CGST_RATE);
  const sgstAmount = Math.round(subtotal * SGST_RATE);
  const taxAmount = cgstAmount + sgstAmount;
  const total = subtotal + taxAmount;
  const totalSaved = originalTotal - subtotal;

  useEffect(() => {
    if (!table || table < 1 || table > 20) { setTableStatus(null); return; }
    const timer = setTimeout(async () => {
      setTableChecking(true);
      try {
        const res = await axios.get(`/tables/check/${table}`);
        setTableStatus(res.data);
      } catch (err) { console.error(err); }
      finally { setTableChecking(false); }
    }, 600);
    return () => clearTimeout(timer);
  }, [table]);

  

  const submitOrder = async () => {
    if (!name || !table || !payment) { alert('Please fill all fields'); return; }
    if (cartItems.length === 0) { alert('Your cart is empty'); return; }
    if (tableStatus && !tableStatus.available) {
      alert(`Table ${table} is booked! Please wait ${tableStatus.minutesLeft} min or choose another.`);
      return;
    }
    setSubmitting(true);
    if (onNameSet) onNameSet(name);

    const items = cartItems.map(([id, qty]) => {
      const item = getItem(id);
      const finalPrice = getDiscountedPrice(item ? item.price : 0);
      return {
        name: item ? item.name : id, qty,
        price: qty * finalPrice,
        originalPrice: item ? item.price : 0,
        discount: isActive ? discount : 0,
      };
    });

    const order = {
      phone: userPhone, name, table, payment, items,
      subtotal, cgst: cgstAmount, sgst: sgstAmount,
      tax: taxAmount, total, originalTotal,
      savedAmount: totalSaved, happyHour: isActive,
      status: 'pending', date: new Date().toLocaleString(),
    };

    try {
      await axios.post('/tables/book', { tableNumber: table, phone: userPhone, name });
      const res = await axios.post('/orders', order);
      setLastOrderId(res.data._id || '');

      let message = '%E2%98%95 Cafe Coffee Break Order%0A%0A';
      message += `Customer: ${name}%0APhone: +91 ${userPhone}%0ATable: ${table}%0APayment: ${payment}%0A`;
      if (isActive && totalSaved > 0) message += `Happy Hour: ${discount}%25 OFF!%0A`;
      message += '%0AItems:%0A';
      items.forEach(it => { message += `${it.name} x${it.qty} = Rs.${it.price}%0A`; });
      message += `%0ASubtotal: Rs.${subtotal}%0ACGST(2.5%25): Rs.${cgstAmount}%0ASGST(2.5%25): Rs.${sgstAmount}%0A`;
      if (totalSaved > 0) message += `Saved: -Rs.${totalSaved}%0A`;
      message += `%0ATOTAL: Rs.${total}`;
      window.open('https://wa.me/919405253204?text=' + message, '_blank');

      clearCart();
      setShowFeedback(true);
    } catch (err) {
      if (err.response?.data?.msg) alert(err.response.data.msg);
      else alert('Failed to place order. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <>
      {showFeedback && (
        <FeedbackModal
          onClose={() => { setShowFeedback(false); showPage('historyPage'); }}
          userPhone={userPhone} userName={name} orderId={lastOrderId}
        />
      )}
      <section className="bill-page page active">
        <div className="bill-card">
          <h2>☕ Cafe Coffee Break</h2>
          <p style={{ fontSize: '11px', color: '#999', marginBottom: '10px', textAlign: 'center' }}>TAX INVOICE</p>

          {isActive && <div className="bill-hh-badge">🔥 Happy Hour Active — {discount}% OFF</div>}

          <table style={{ width: '100%', marginBottom: '10px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ff7b00' }}>
                <th style={{ padding: '6px 0', textAlign: 'left', fontSize: '12px', color: '#ff7b00' }}>Item</th>
                <th style={{ textAlign: 'center', fontSize: '12px', color: '#ff7b00' }}>Qty</th>
                <th style={{ textAlign: 'right', fontSize: '12px', color: '#ff7b00' }}>Amt</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.length === 0 ? (
                <tr><td colSpan="3" style={{ padding: '8px 0', color: '#888', textAlign: 'center' }}>No items in cart</td></tr>
              ) : (
                cartItems.map(([id, qty]) => {
                  const item = getItem(id);
                  if (!item) return null;
                  const dp = getDiscountedPrice(item.price);
                  const has = isActive && discount > 0;
                  return (
                    <tr key={id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '6px 0', fontSize: '13px' }}>
                        {item.name}
                        {has && <span style={{ fontSize: '10px', color: '#2ea44f', marginLeft: '5px' }}>{discount}%OFF</span>}
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '13px' }}>{qty}</td>
                      <td style={{ textAlign: 'right', fontSize: '13px' }}>
                        {has ? (
                          <><span style={{ textDecoration: 'line-through', color: '#999', fontSize: '11px' }}>₹{item.price * qty}</span>{' '}
                          <span style={{ color: '#2ea44f', fontWeight: '700' }}>₹{dp * qty}</span></>
                        ) : <span>₹{item.price * qty}</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* TAX BREAKDOWN */}
          <div className="bill-tax-section">
            <div className="bill-tax-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
            {totalSaved > 0 && (
              <div className="bill-tax-row" style={{ color: '#2ea44f' }}>
                <span>🎉 Discount ({discount}% OFF)</span><span>-₹{totalSaved}</span>
              </div>
            )}
            <div className="bill-tax-row"><span>CGST @ 2.5%</span><span>₹{cgstAmount}</span></div>
            <div className="bill-tax-row"><span>SGST @ 2.5%</span><span>₹{sgstAmount}</span></div>
            <div className="bill-tax-divider" />
            <div className="bill-tax-row bill-tax-total">
              <span>TOTAL (incl. tax)</span><span>₹{total}</span>
            </div>
          </div>

          <label>Customer Name *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" />

          <label>Table No (1-20) *</label>
          <input
            type="number" value={table} min="1" max="20"
            onChange={e => setTable(e.target.value)}
            placeholder="Enter table number"
            style={{ borderColor: tableStatus ? (tableStatus.available ? '#2ea44f' : '#e53935') : undefined }}
          />
          {tableChecking && <p className="bill-table-checking">⏳ Checking availability...</p>}
          {tableStatus && !tableChecking && (
            <p className={`bill-table-status ${tableStatus.available ? 'available' : 'booked'}`}>
              {tableStatus.available
                ? '✅ Table is available!'
                : `❌ Booked! Wait ${tableStatus.minutesLeft} min or choose another.`}
            </p>
          )}

          <label>Payment Method *</label>
          <select value={payment} onChange={e => setPayment(e.target.value)}>
            <option value="">Select Payment</option>
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
          </select>

          <button
            type="button"
            onClick={submitOrder}
            disabled={submitting || (tableStatus && !tableStatus.available)}
          >
            {submitting ? 'Placing Order...' : 'SUBMIT ORDER'}
          </button>

          
        </div>
      </section>
    </>
  );
}