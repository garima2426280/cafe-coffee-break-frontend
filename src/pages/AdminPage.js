import React, { useState } from 'react';
import axios from '../api/axios';
import MenuPage from './MenuPage';

export default function AdminPage({ onLogout, prices }) {
  const [tab, setTab] = useState('menu');
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cart, setCart] = useState({});

  const increase = (id) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decrease = (id) => {
    setCart(prev => {
      const current = prev[id] || 0;
      if (current <= 0) return prev;
      return { ...prev, [id]: current - 1 };
    });
  };

  const totalItems = Object.entries(cart).reduce((sum, [, qty]) => sum + qty, 0);
  const totalPrice = Object.entries(cart).reduce(
    (sum, [id, qty]) => sum + qty * (prices[id] || 0), 0
  );

  const searchHistory = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setError('');
    setSearched(false);
    try {
      const res = await axios.get(`/users/history/${phone}`);
      setOrders(res.data);
      setSearched(true);
    } catch (err) {
      setError('Failed to fetch history. Check backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>

      {/* ADMIN HEADER */}
      <div className="admin-header">
        <h2 className="admin-title">Admin Panel</h2>
        <button className="admin-logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* TABS */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${tab === 'menu' ? 'active' : ''}`}
          onClick={() => setTab('menu')}
        >
          Add Items
        </button>
        <button
          className={`admin-tab ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          Order History
        </button>
      </div>

      {/* TAB: ADD ITEMS */}
      {tab === 'menu' && (
        <div>
          {totalItems > 0 && (
            <div className="cart-bar" style={{ display: 'flex' }}>
              <div>
                <span>{totalItems}</span> items | ₹
                <span>{totalPrice}</span>
              </div>
              <button onClick={() => alert('Admin view only — orders placed by users')}>
                View Cart
              </button>
            </div>
          )}
          <MenuPage
            cart={cart}
            increase={increase}
            decrease={decrease}
          />
        </div>
      )}

      {/* TAB: ORDER HISTORY */}
      {tab === 'history' && (
        <div className="container" style={{ marginTop: '100px' }}>
          <h2 className="section-title">Search User History</h2>

          <div className="admin-search-row">
            <input
              type="number"
              className="welcome-input"
              placeholder="Enter user phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ marginBottom: 0, flex: 1 }}
            />
            <button
              className="welcome-btn"
              onClick={searchHistory}
              style={{ width: 'auto', padding: '12px 24px', marginTop: 0 }}
            >
              Search
            </button>
          </div>

          {error && (
            <p className="welcome-error" style={{ marginTop: '10px' }}>{error}</p>
          )}

          {loading && (
            <p style={{ color: 'white', marginTop: '16px' }}>Loading...</p>
          )}

          {searched && !loading && (
            <div style={{ marginTop: '20px' }}>
              {orders.length === 0 ? (
                <p style={{ color: 'white', opacity: 0.7 }}>
                  No orders found for {phone}
                </p>
              ) : (
                <>
                  <p style={{ color: '#ffb347', marginBottom: '14px', fontSize: '14px' }}>
                    {orders.length} order(s) found for +91 {phone}
                  </p>
                  {orders.map((order, i) => (
                    <div
                      className="menu-row"
                      key={order._id}
                      style={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        marginBottom: '14px',
                      }}
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
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}