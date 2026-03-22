import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { getImageUrl } from '../api/imageUrl';

const CATEGORIES = ['Hot Drinks', 'Cold Drinks', 'Snacks', 'Meals'];

export default function AdminDashboard({ onLogout }) {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Hot Drinks');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeCategory, setActiveCategory] = useState('Hot Drinks');

  // NEW: tabs + history state
  const [mainTab, setMainTab] = useState('dashboard');
  const [searchPhone, setSearchPhone] = useState('');
  const [historyOrders, setHistoryOrders] = useState([]);
  const [historySearched, setHistorySearched] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const token = localStorage.getItem('adminToken');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get('/menu');
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAdd = async () => {
    if (!name || !price || !image || !category) {
      setError('Please fill all fields and select an image');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('image', image);

    try {
      await axios.post('/menu', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Item added successfully!');
      setName('');
      setPrice('');
      setImage(null);
      setPreview(null);
      fetchItems();
    } catch (err) {
      setError('Failed to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Item deleted successfully!');
      fetchItems();
    } catch (err) {
      setError('Failed to delete item.');
    }
  };

  // NEW: search user history
  const searchUserHistory = async () => {
    if (!searchPhone || searchPhone.length < 10) {
      setHistoryError('Please enter a valid 10-digit phone number');
      return;
    }
    setHistoryLoading(true);
    setHistoryError('');
    setHistorySearched(false);

    try {
      const res = await axios.get(`/users/history/${searchPhone}`);
      setHistoryOrders(res.data);
      setHistorySearched(true);
    } catch (err) {
      setHistoryError('Failed to fetch history. Check backend.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredItems = items.filter(item => item.category === activeCategory);

  // shared tab button style
  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    background: 'transparent',
    color: isActive ? '#ff7b00' : 'rgba(255,255,255,0.6)',
    border: 'none',
    borderBottom: isActive ? '3px solid #ff7b00' : '3px solid transparent',
    cursor: 'pointer',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s',
    marginBottom: '-2px',
  });

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>

      {/* FIXED ADMIN HEADER */}
      <div style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 30px',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        boxSizing: 'border-box',
      }}>
        <h2 style={{ color: '#ffb347', fontSize: '20px', fontWeight: '600' }}>
          Admin Panel
        </h2>
        <button
          onClick={onLogout}
          style={{
            background: 'rgba(255,80,80,0.2)',
            color: '#ff6b6b',
            border: '1px solid #ff6b6b',
            padding: '7px 18px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '13px',
          }}
        >
          Logout
        </button>
      </div>

      {/* MAIN TABS */}
      <div style={{
        display: 'flex',
        gap: 0,
        marginTop: '65px',
        borderBottom: '2px solid rgba(255,255,255,0.1)',
        padding: '0 20px',
        position: 'sticky',
        top: '60px',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        zIndex: 99,
      }}>
        <button
          style={tabStyle(mainTab === 'dashboard')}
          onClick={() => setMainTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          style={tabStyle(mainTab === 'history')}
          onClick={() => setMainTab('history')}
        >
          User History
        </button>
      </div>

      {/* ================================
          TAB: DASHBOARD (existing)
      ================================ */}
      {mainTab === 'dashboard' && (
        <div style={{ padding: '30px 20px', maxWidth: '900px', margin: '0 auto' }}>

          {/* ADD ITEM FORM */}
          <div style={{
            background: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '30px',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <h3 style={{ color: 'white', marginBottom: '16px', fontSize: '16px' }}>
              Add New Item
            </h3>

            {error && (
              <p style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '10px' }}>{error}</p>
            )}
            {success && (
              <p style={{ color: '#2ea44f', fontSize: '13px', marginBottom: '10px' }}>{success}</p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ color: 'white', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                  Item Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Masala Tea"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ color: 'white', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                  Price (₹) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="e.g. 30"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ color: 'white', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', fontSize: '14px' }}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: 'white', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                Item Image *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ color: 'white', fontSize: '13px' }}
              />
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', marginTop: '10px' }}
                />
              )}
            </div>

            <button
              onClick={handleAdd}
              disabled={loading}
              style={{
                background: '#ff7b00',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                opacity: loading ? 0.7 : 1,
                width: '100%',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              {loading ? 'Adding...' : '+ Add Item'}
            </button>
          </div>

          {/* CATEGORY TABS */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                  background: activeCategory === cat ? '#ff7b00' : 'rgba(255,255,255,0.15)',
                  color: 'white',
                  transition: 'all 0.2s',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                {cat} ({items.filter(i => i.category === cat).length})
              </button>
            ))}
          </div>

          {/* ITEMS LIST */}
          <div className="menu-list">
            {filteredItems.length === 0 ? (
              <p style={{ color: 'white', opacity: 0.6 }}>No items in this category yet.</p>
            ) : (
              filteredItems.map(item => (
                <div className="menu-row" key={item._id}>
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="row-img"
                    onError={e => e.target.style.display = 'none'}
                  />
                  <div className="row-info">
                    <b>{item.name}</b>
                    <p>₹{item.price}</p>
                    <p style={{ fontSize: '11px', color: '#ffb347' }}>{item.category}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(item._id)}
                    style={{
                      background: '#e53935',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '13px',
                      flexShrink: 0,
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================================
          TAB: USER HISTORY (NEW)
      ================================ */}
      {mainTab === 'history' && (
        <div className="container" style={{ marginTop: '30px' }}>
          <h2 className="section-title">Search User History</h2>

          {/* SEARCH ROW */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
            <input
              type="number"
              className="welcome-input"
              placeholder="Enter user phone number"
              value={searchPhone}
              onChange={e => setSearchPhone(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchUserHistory()}
              style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}
            />
            <button
              className="welcome-btn"
              onClick={searchUserHistory}
              style={{ width: 'auto', padding: '12px 28px', marginTop: 0 }}
            >
              Search
            </button>
          </div>

          {historyError && (
            <p className="welcome-error" style={{ marginTop: '10px' }}>{historyError}</p>
          )}

          {historyLoading && (
            <p style={{ color: 'white', marginTop: '16px' }}>Loading...</p>
          )}

          {/* RESULTS */}
          {historySearched && !historyLoading && (
            <div style={{ marginTop: '24px' }}>
              {historyOrders.length === 0 ? (
                <p style={{ color: 'white', opacity: 0.7 }}>
                  No orders found for +91 {searchPhone}
                </p>
              ) : (
                <>
                  <p style={{ color: '#ffb347', marginBottom: '16px', fontSize: '14px' }}>
                    {historyOrders.length} order(s) found for +91 {searchPhone}
                  </p>

                  {historyOrders.map((order, i) => (
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
                        <h3 style={{ color: 'white' }}>
                          Order {historyOrders.length - i}
                        </h3>
                        <p style={{ color: '#ffb347', fontWeight: '600' }}>
                          ₹{order.total}
                        </p>
                      </div>

                      <p style={{ color: 'white', opacity: 0.8 }}>Name: {order.name}</p>
                      <p style={{ color: 'white', opacity: 0.8 }}>Table: {order.table}</p>
                      <p style={{ color: 'white', opacity: 0.8 }}>Payment: {order.payment}</p>

                      <div style={{ marginTop: '8px', width: '100%' }}>
                        {order.items.map((it, j) => (
                          <p
                            key={j}
                            style={{ color: 'white', opacity: 0.7, fontSize: '13px' }}
                          >
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