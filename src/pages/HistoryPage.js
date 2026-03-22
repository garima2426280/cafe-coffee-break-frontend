import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function HistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/orders');
        const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(sorted);
      } catch (err) {
        console.error(err);
        alert('Failed to load history. Is your backend running?');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <section className="container page active">
        <h2 className="section-title">Order History</h2>
        <p style={{ color: 'white' }}>Loading orders...</p>
      </section>
    );
  }

  return (
    <section className="container page active">
      <h2 className="section-title">Order History</h2>
      <div>
        {orders.length === 0 ? (
          <p style={{ color: 'white' }}>No Orders Yet</p>
        ) : (
          orders.map((order, i) => (
            <div
              className="menu-row"
              key={order._id}
              style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: '16px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <h3 style={{ color: 'white' }}>Order {orders.length - i}</h3>
                <p style={{ color: '#ffb347', fontWeight: '600' }}>₹{order.total}</p>
              </div>
              <p style={{ color: 'white', opacity: 0.8 }}>Name: {order.name}</p>
              <p style={{ color: 'white', opacity: 0.8 }}>Table: {order.table}</p>
              <p style={{ color: 'white', opacity: 0.8 }}>Payment: {order.payment}</p>
              <div style={{ marginTop: '8px', width: '100%' }}>
                {order.items.map((it, j) => (
                  <p key={j} style={{ color: 'white', opacity: 0.7, fontSize: '13px' }}>
                    {it.name} x {it.qty} = ₹{it.price}
                  </p>
                ))}
              </div>
              <p style={{ color: 'white', opacity: 0.5, fontSize: '12px', marginTop: '6px' }}>
                {order.date}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}