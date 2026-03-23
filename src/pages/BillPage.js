import React, { useState } from 'react';
import axios from '../api/axios';

export default function BillPage({ cart, menuItems, clearCart, showPage, userPhone }) {

  const [name, setName] = useState('');
  const [table, setTable] = useState('');
  const [payment, setPayment] = useState('');

  const getItem = (id) => menuItems.find(m => m._id === id);

  const cartItems = Object.entries(cart).filter(([, qty]) => qty > 0);

  const total = cartItems.reduce((sum, [id, qty]) => {
    const item = getItem(id);
    return sum + qty * (item ? item.price : 0);
  }, 0);

  const submitOrder = async () => {
    if (!name || !table || !payment) {
      alert('Please fill all fields');
      return;
    }
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    const items = cartItems.map(([id, qty]) => {
      const item = getItem(id);
      return {
        name: item ? item.name : id,
        qty,
        price: qty * (item ? item.price : 0),
      };
    });

    const order = {
      phone: userPhone,
      name,
      table,
      payment,
      items,
      total,
      date: new Date().toLocaleString(),
    };

    try {
      await axios.post('/orders', order);

      /* WHATSAPP */
      let message = '☕ Cafe Order%0A%0A';
      message += 'Customer: ' + name + '%0A';
      message += 'Phone: ' + userPhone + '%0A';
      message += 'Table: ' + table + '%0A';
      message += 'Payment: ' + payment + '%0A%0A';
      items.forEach(it => {
        message += it.name + ' x ' + it.qty + ' = ₹' + it.price + '%0A';
      });
      message += '%0ATotal: ₹' + total;
      window.open('https://wa.me/919405253204?text=' + message, '_blank');
      /* WHATSAPP */

      alert('Order placed successfully!');
      clearCart();
      showPage('historyPage');

    } catch (err) {
      console.error(err);
      alert('Failed to save order. Is your backend running?');
    }
  };

  return (
    <section className="bill-page page active">
      <div className="bill-card">
        <h2>☕ Cafe Coffee Break</h2>

        <table style={{ width: '100%', marginBottom: '10px', borderCollapse: 'collapse' }}>
          <tbody>
            {cartItems.length === 0 ? (
              <tr><td style={{ padding: '8px 0', color: '#888' }}>No items in cart</td></tr>
            ) : (
              cartItems.map(([id, qty]) => {
                const item = getItem(id);
                if (!item) return null;
                return (
                  <tr key={id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '6px 0' }}>{item.name}</td>
                    <td style={{ textAlign: 'center' }}>{qty}</td>
                    <td style={{ textAlign: 'right' }}>₹{qty * item.price}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <h3 style={{ marginBottom: '15px' }}>TOTAL ₹<span>{total}</span></h3>

        <label>Customer Name *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter your name"
        />

        <label>Table No (1-20) *</label>
        <input
          type="number"
          value={table}
          onChange={e => setTable(e.target.value)}
          min="1" max="20"
          placeholder="Enter table number"
        />

        <label>Payment Method *</label>
        <select value={payment} onChange={e => setPayment(e.target.value)}>
          <option value="">Select Payment</option>
          <option>Cash</option>
          <option>UPI</option>
         
        </select>

        <button type="button" onClick={submitOrder}>
          SUBMIT ORDER
        </button>
      </div>
    </section>
  );
}