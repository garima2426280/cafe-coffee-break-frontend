import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function HistoryPage({ userPhone }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userPhone) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const phone = userPhone.toString().trim();
        const res = await axios.get(`/users/history/${phone}`);
        setOrders(res.data);
      } catch (err) {
        console.error('History fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userPhone]);

  if (loading) {
    return (
      <section className="container page active">
        <h2 className="section-title">Order History</h2>
        <div className="menu-loading">
          <span>☕</span>
          <p>Loading your orders...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container page active">
      <h2 className="section-title">Order History</h2>
      <p style={{ color: '#ffb347', fontSize: '13px', marginBottom: '16px' }}>
        📱 +91 {userPhone}
      </p>

      {orders.length === 0 ? (
        <div className="history-empty">
          <span>🛍️</span>
          <p>No orders yet!</p>
          <p style={{ fontSize: '13px', opacity: 0.5 }}>Your orders will appear here after you place one.</p>
        </div>
      ) : (
        orders.map((order, i) => (
          <div className="history-card" key={order._id}>
            <div className="history-card-header">
              <div>
                <h3 className="history-order-num">Order #{orders.length - i}</h3>
                <p className="history-order-date">{order.date}</p>
              </div>
              <div className="history-order-right">
                <span className="history-total">₹{order.total}</span>
                <span className="history-payment">{order.payment}</span>
              </div>
            </div>
            <div className="history-card-body">
              <div className="history-meta">
                <span>👤 {order.name}</span>
                <span>🪑 Table {order.table}</span>
              </div>
              <div className="history-items">
                {order.items.map((it, j) => (
                  <div key={j} className="history-item-row">
                    <span className="history-item-name">{it.name}</span>
                    <span className="history-item-qty">×{it.qty}</span>
                    <span className="history-item-price">₹{it.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </section>
  );
}