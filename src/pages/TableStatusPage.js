import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function TableStatusPage({ userPhone }) {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [tRes, oRes] = await Promise.all([
        axios.get('/tables'),
        axios.get(`/orders/status/${userPhone}`),
      ]);
      setTables(tRes.data);
      setOrders(oRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPhone]);

  if (loading) return (
    <section className="container page active">
      <div className="menu-loading"><span>☕</span><p>Loading...</p></div>
    </section>
  );

  return (
    <section className="container page active">
      <h2 className="section-title">Order Status & Tables</h2>

      {/* MY ORDER STATUS */}
      {orders.length > 0 && (
        <div className="order-status-section">
          <h3 className="order-status-heading">🛎️ Your Recent Orders</h3>
          {orders.map(order => (
            <div key={order._id} className={`order-status-card ${order.status}`}>
              <div className="order-status-header">
                <div>
                  <p className="order-status-name">{order.name} — Table {order.table}</p>
                  <p className="order-status-date">{order.date}</p>
                </div>
                <div className={`order-status-badge ${order.status}`}>
                  {order.status === 'pending' ? '⏳ In Queue' : '✅ Ready!'}
                </div>
              </div>
              <div className="order-status-items">
                {order.items.map((it, i) => (
                  <span key={i} className="order-status-item-tag">{it.name} ×{it.qty}</span>
                ))}
              </div>
              <p className="order-status-total">Total: ₹{order.total}</p>
              {order.status === 'ready' && (
                <div className="order-status-ready-msg">
                  🎉 Your order is ready! Please collect at the counter.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {orders.length === 0 && (
        <div className="history-empty" style={{ marginBottom: '24px' }}>
          <span>🛍️</span>
          <p>No recent orders found.</p>
        </div>
      )}

      {/* TABLE MAP */}
      <h3 className="order-status-heading">🪑 Table Availability</h3>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '16px' }}>
        Live status — auto refreshes every 30 seconds
      </p>
      <div className="table-map-grid">
        {tables.map(t => (
          <div key={t.tableNumber} className={`table-card ${t.isBooked ? 'booked' : 'free'}`}>
            <div className="table-card-icon">🪑</div>
            <p className="table-card-number">Table {t.tableNumber}</p>
            <p className={`table-card-status ${t.isBooked ? 'booked' : 'free'}`}>
              {t.isBooked ? 'Booked' : 'Free'}
            </p>
            {t.isBooked && t.releasesAt && (
              <p className="table-card-time">
                ~{Math.max(0, Math.ceil((new Date(t.releasesAt) - new Date()) / 60000))} min left
              </p>
            )}
          </div>
        ))}
      </div>

      <button className="welcome-btn" onClick={fetchAll} style={{ marginTop: '20px', maxWidth: '200px' }}>
        🔄 Refresh
      </button>
    </section>
  );
}