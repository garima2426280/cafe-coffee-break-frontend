import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { getImageUrl } from '../api/imageUrl';

const CATEGORIES = ['Hot Drinks', 'Cold Drinks', 'Snacks', 'Meals'];

const PIE_COLORS = ['#ff7b00', '#ffb347', '#e06800', '#ffd280', '#ff9500', '#ffca6e', '#cc5f00', '#ffe0a0'];

function PieChart({ data, valueKey, labelKey }) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((s, d) => s + (d[valueKey] || 0), 0);
  if (total === 0) return null;

  let cumulative = 0;
  const slices = data.slice(0, 8).map((d, i) => {
    const value = d[valueKey] || 0;
    const pct = value / total;
    const startAngle = cumulative * 2 * Math.PI;
    cumulative += pct;
    const endAngle = cumulative * 2 * Math.PI;

    const x1 = 100 + 80 * Math.cos(startAngle - Math.PI / 2);
    const y1 = 100 + 80 * Math.sin(startAngle - Math.PI / 2);
    const x2 = 100 + 80 * Math.cos(endAngle - Math.PI / 2);
    const y2 = 100 + 80 * Math.sin(endAngle - Math.PI / 2);
    const largeArc = pct > 0.5 ? 1 : 0;

    return {
      path: `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: PIE_COLORS[i % PIE_COLORS.length],
      label: d[labelKey],
      value,
      pct: Math.round(pct * 100),
    };
  });

  return (
    <div className="pie-wrapper">
      <svg viewBox="0 0 200 200" className="pie-svg">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        ))}
        <circle cx="100" cy="100" r="40" fill="rgba(0,0,0,0.5)" />
        <text x="100" y="96" textAnchor="middle" fill="white" fontSize="10" fontFamily="Poppins">Total</text>
        <text x="100" y="110" textAnchor="middle" fill="#ffb347" fontSize="12" fontWeight="bold" fontFamily="Poppins">{total}</text>
      </svg>
      <div className="pie-legend">
        {slices.map((s, i) => (
          <div key={i} className="pie-legend-item">
            <span className="pie-legend-dot" style={{ background: s.color }} />
            <span className="pie-legend-label">{s.label}</span>
            <span className="pie-legend-value">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
  const [mainTab, setMainTab] = useState('dashboard');

  const [searchPhone, setSearchPhone] = useState('');
  const [historyOrders, setHistoryOrders] = useState([]);
  const [historySearched, setHistorySearched] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const [reportType, setReportType] = useState('daily');
  const [reportData, setReportData] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');

  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const token = localStorage.getItem('adminToken');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get('/menu');
      setItems(res.data);
    } catch (err) { console.error(err); }
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
    setError(''); setSuccess('');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('image', image);
    try {
      await axios.post('/menu', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Item added successfully!');
      setName(''); setPrice(''); setImage(null); setPreview(null);
      fetchItems();
    } catch (err) {
      setError('Failed to add item. Please try again.');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`/menu/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Item deleted successfully!');
      fetchItems();
    } catch (err) { setError('Failed to delete item.'); }
  };

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
      setHistoryError('Failed to fetch history.');
    } finally { setHistoryLoading(false); }
  };

  const fetchReport = async (type) => {
    setReportLoading(true);
    setReportError('');
    setReportData([]);
    try {
      const res = await axios.get(`/reports/${type}`);
      setReportData(res.data);
    } catch (err) {
      setReportError('Failed to fetch report.');
    } finally { setReportLoading(false); }
  };

  const fetchFeedbacks = async () => {
    setFeedbackLoading(true);
    try {
      const res = await axios.get('/feedback');
      setFeedbacks(res.data);
    } catch (err) { console.error(err); }
    finally { setFeedbackLoading(false); }
  };

  useEffect(() => {
    if (mainTab === 'reports') fetchReport(reportType);
    if (mainTab === 'feedback') fetchFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainTab]);

  useEffect(() => {
    if (mainTab === 'reports') fetchReport(reportType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]);

  const filteredItems = items.filter(item => item.category === activeCategory);
  const getMaxValue = () => {
    const vals = reportData.map(d => reportType === 'product' ? (d.qty || 0) : (d.total || 0));
    return Math.max(...vals, 1);
  };

  const getPieValueKey = () => reportType === 'product' ? 'qty' : 'total';
  const getPieLabelKey = () => {
    if (reportType === 'daily') return 'date';
    if (reportType === 'weekly') return 'week';
    if (reportType === 'monthly') return 'month';
    if (reportType === 'customer') return 'name';
    if (reportType === 'product') return 'name';
    return 'name';
  };

  const renderStars = (rating) => [1,2,3,4,5].map(s => (
    <span key={s} style={{ color: s <= rating ? '#ff7b00' : 'rgba(255,255,255,0.2)', fontSize: '16px' }}>★</span>
  ));

  return (
    <div className="admin-dashboard-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* HEADER */}
      <div className="admin-dash-header">
        <div className="admin-dash-header-left">
          <span className="admin-dash-icon">☕</span>
          <div>
            <h2 className="admin-dash-title">Admin Panel</h2>
            <p className="admin-dash-subtitle">Cafe Coffee Break</p>
          </div>
        </div>
        <button className="admin-logout-btn" onClick={onLogout}>Logout</button>
      </div>

      {/* MAIN TABS */}
      <div className="admin-dash-tabs">
        {['dashboard', 'history', 'reports', 'feedback'].map(tab => (
          <button
            key={tab}
            className={`admin-dash-tab ${mainTab === tab ? 'active' : ''}`}
            onClick={() => setMainTab(tab)}
          >
            {tab === 'dashboard' && 'Dashboard'}
            {tab === 'history' && 'User History'}
            {tab === 'reports' && 'Reports'}
            {tab === 'feedback' && 'Feedback'}
          </button>
        ))}
      </div>

      {/* TAB: DASHBOARD */}
      {mainTab === 'dashboard' && (
        <div className="admin-dash-content" style={{ flex: 1 }}>
          <div className="admin-form-card">
            <h3 className="admin-form-title">Add New Item</h3>
            {error && <div className="admin-alert admin-alert-error">{error}</div>}
            {success && <div className="admin-alert admin-alert-success">{success}</div>}
            <div className="admin-form-grid">
              <div className="admin-form-field">
                <label className="admin-field-label">Item Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Masala Tea" className="admin-field-input" />
              </div>
              <div className="admin-form-field">
                <label className="admin-field-label">Price (₹) *</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 30" className="admin-field-input" />
              </div>
            </div>
            <div className="admin-form-field">
              <label className="admin-field-label">Category *</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="admin-field-input">
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="admin-form-field">
              <label className="admin-field-label">Item Image *</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="admin-file-input" />
              {preview && <img src={preview} alt="preview" className="admin-preview-img" />}
            </div>
            <button onClick={handleAdd} disabled={loading} className="admin-add-btn">
              {loading ? 'Adding...' : '+ Add Item'}
            </button>
          </div>

          <div className="admin-category-tabs">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`admin-category-tab ${activeCategory === cat ? 'active' : ''}`}>
                {cat} ({items.filter(i => i.category === cat).length})
              </button>
            ))}
          </div>

          <div className="menu-list">
            {filteredItems.length === 0 ? (
              <div className="admin-empty"><p>No items in this category yet.</p></div>
            ) : (
              filteredItems.map(item => (
                <div className="menu-row" key={item._id}>
                  <img src={getImageUrl(item.image)} alt={item.name} className="row-img" onError={e => e.target.style.display = 'none'} />
                  <div className="row-info">
                    <b>{item.name}</b>
                    <p>₹{item.price}</p>
                    <p style={{ fontSize: '11px', color: '#ffb347' }}>{item.category}</p>
                  </div>
                  <button onClick={() => handleDelete(item._id)} className="admin-delete-btn">Delete</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: USER HISTORY */}
      {mainTab === 'history' && (
        <div className="admin-dash-content" style={{ flex: 1 }}>
          <div className="admin-form-card">
            <h3 className="admin-form-title">Search User History</h3>
            <p className="admin-form-desc">Enter a registered phone number to view their order history</p>
            <div className="admin-search-row">
              <input type="number" className="admin-field-input" placeholder="Enter 10-digit phone number" value={searchPhone} onChange={e => setSearchPhone(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchUserHistory()} style={{ flex: 1, marginBottom: 0 }} />
              <button className="admin-add-btn" onClick={searchUserHistory} style={{ width: 'auto', padding: '11px 28px' }}>Search</button>
            </div>
            {historyError && <div className="admin-alert admin-alert-error" style={{ marginTop: '12px' }}>{historyError}</div>}
          </div>

          {historyLoading && <div className="admin-empty"><p style={{ color: 'white' }}>Loading...</p></div>}

          {historySearched && !historyLoading && (
            <div style={{ marginTop: '20px' }}>
              {historyOrders.length === 0 ? (
                <div className="admin-empty"><p>No orders found for +91 {searchPhone}</p></div>
              ) : (
                <>
                  <p className="admin-result-count">{historyOrders.length} order(s) found for +91 {searchPhone}</p>
                  {historyOrders.map((order, i) => (
                    <div className="admin-order-card" key={order._id}>
                      <div className="admin-order-header">
                        <h3>Order {historyOrders.length - i}</h3>
                        <span className="admin-order-total">₹{order.total}</span>
                      </div>
                      <div className="admin-order-details">
                        <span>👤 {order.name}</span>
                        <span>🪑 Table {order.table}</span>
                        <span>💳 {order.payment}</span>
                      </div>
                      <div className="admin-order-items">
                        {order.items.map((it, j) => <p key={j}>{it.name} × {it.qty} = ₹{it.price}</p>)}
                      </div>
                      <p className="admin-order-date">{order.date}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB: REPORTS */}
      {mainTab === 'reports' && (
        <div className="admin-dash-content" style={{ flex: 1 }}>

          <div className="admin-form-card">
            <h3 className="admin-form-title">Sales Reports</h3>
            <p className="admin-form-desc">View detailed sales analytics for your cafe</p>
            <div className="report-type-tabs">
              {[
                { key: 'daily', label: 'Date Wise' },
                { key: 'weekly', label: 'Weekly' },
                { key: 'monthly', label: 'Monthly' },
                { key: 'customer', label: 'Customer Wise' },
                { key: 'product', label: 'Product Wise' },
              ].map(r => (
                <button key={r.key} className={`report-type-tab ${reportType === r.key ? 'active' : ''}`} onClick={() => setReportType(r.key)}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {reportLoading && <div className="admin-empty"><p style={{ color: 'white' }}>Loading report...</p></div>}
          {reportError && <div className="admin-alert admin-alert-error">{reportError}</div>}
          {!reportLoading && reportData.length === 0 && !reportError && (
            <div className="admin-empty"><p>No data available yet.</p></div>
          )}

          {!reportLoading && reportData.length > 0 && (
            <>
              {/* SUMMARY CARDS */}
              <div className="report-summary-grid">
                <div className="report-summary-card">
                  <p className="report-summary-label">Total Records</p>
                  <p className="report-summary-value">{reportData.length}</p>
                </div>
                <div className="report-summary-card">
                  <p className="report-summary-label">Total Orders</p>
                  <p className="report-summary-value">
                    {reportType === 'product'
                      ? reportData.reduce((s, d) => s + (d.orders || 0), 0)
                      : reportData.reduce((s, d) => s + (d.orders || 0), 0)}
                  </p>
                </div>
                <div className="report-summary-card">
                  <p className="report-summary-label">Total Revenue</p>
                  <p className="report-summary-value">₹{reportData.reduce((s, d) => s + (d.total || 0), 0)}</p>
                </div>
                <div className="report-summary-card">
                  <p className="report-summary-label">
                    {reportType === 'product' ? 'Total Qty Sold' : 'Avg Revenue'}
                  </p>
                  <p className="report-summary-value">
                    {reportType === 'product'
                      ? reportData.reduce((s, d) => s + (d.qty || 0), 0)
                      : `₹${Math.round(reportData.reduce((s, d) => s + (d.total || 0), 0) / reportData.length)}`}
                  </p>
                </div>
              </div>

              {/* BAR CHART + PIE CHART */}
              <div className="report-charts-grid">

                {/* BAR CHART */}
                <div className="admin-form-card">
                  <h3 className="admin-form-title">
                    {reportType === 'daily' && 'Revenue by Date'}
                    {reportType === 'weekly' && 'Revenue by Week'}
                    {reportType === 'monthly' && 'Revenue by Month'}
                    {reportType === 'customer' && 'Revenue by Customer'}
                    {reportType === 'product' && 'Sales by Product'}
                  </h3>
                  <div className="report-chart">
                    {reportData.slice(0, 8).map((d, i) => {
                      const label = d.date || d.week || d.month || d.name || d.phone || 'Unknown';
                      const value = reportType === 'product' ? (d.qty || 0) : (d.total || 0);
                      const pct = Math.round((value / getMaxValue()) * 100);
                      return (
                        <div key={i} className="report-bar-row">
                          <p className="report-bar-label">{label}</p>
                          <div className="report-bar-track">
                            <div className="report-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="report-bar-value">
                            {reportType === 'product' ? `${d.qty} qty` : `₹${value}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* PIE CHART */}
                <div className="admin-form-card">
                  <h3 className="admin-form-title">Distribution</h3>
                  <PieChart
                    data={reportData.slice(0, 8)}
                    valueKey={getPieValueKey()}
                    labelKey={getPieLabelKey()}
                  />
                </div>

              </div>

              {/* DATA TABLE */}
              <div className="admin-form-card">
                <h3 className="admin-form-title">Detailed Data</h3>
                <div className="report-table-wrapper">
                  <table className="report-table">
                    <thead>
                      <tr>
                        {reportType === 'daily' && <><th>Date</th><th>Orders</th><th>Revenue</th></>}
                        {reportType === 'weekly' && <><th>Week</th><th>Orders</th><th>Revenue</th></>}
                        {reportType === 'monthly' && <><th>Month</th><th>Orders</th><th>Revenue</th></>}
                        {reportType === 'customer' && <><th>Phone</th><th>Name</th><th>Orders</th><th>Total Spent</th></>}
                        {reportType === 'product' && <><th>Product</th><th>Qty Sold</th><th>Orders</th><th>Revenue</th></>}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((d, i) => (
                        <tr key={i}>
                          {reportType === 'daily' && <><td>{d.date}</td><td>{d.orders}</td><td>₹{d.total}</td></>}
                          {reportType === 'weekly' && <><td>{d.week}</td><td>{d.orders}</td><td>₹{d.total}</td></>}
                          {reportType === 'monthly' && <><td>{d.month}</td><td>{d.orders}</td><td>₹{d.total}</td></>}
                          {reportType === 'customer' && <><td>{d.phone}</td><td>{d.name}</td><td>{d.orders}</td><td>₹{d.total}</td></>}
                          {reportType === 'product' && <><td>{d.name}</td><td>{d.qty}</td><td>{d.orders}</td><td>₹{d.total}</td></>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB: FEEDBACK */}
      {mainTab === 'feedback' && (
        <div className="admin-dash-content" style={{ flex: 1 }}>
          <div className="admin-form-card">
            <h3 className="admin-form-title">Customer Feedback</h3>
            <p className="admin-form-desc">All feedback submitted by customers</p>
            {feedbacks.length > 0 && (
              <div className="report-summary-grid" style={{ marginTop: '16px' }}>
                <div className="report-summary-card">
                  <p className="report-summary-label">Total Feedback</p>
                  <p className="report-summary-value">{feedbacks.length}</p>
                </div>
                <div className="report-summary-card">
                  <p className="report-summary-label">Avg Rating</p>
                  <p className="report-summary-value">{(feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)} ★</p>
                </div>
                <div className="report-summary-card">
                  <p className="report-summary-label">5 Star</p>
                  <p className="report-summary-value">{feedbacks.filter(f => f.rating === 5).length}</p>
                </div>
                <div className="report-summary-card">
                  <p className="report-summary-label">Low Ratings</p>
                  <p className="report-summary-value">{feedbacks.filter(f => f.rating <= 2).length}</p>
                </div>
              </div>
            )}
          </div>

          {feedbackLoading && <div className="admin-empty"><p style={{ color: 'white' }}>Loading feedback...</p></div>}
          {!feedbackLoading && feedbacks.length === 0 && <div className="admin-empty"><p>No feedback yet.</p></div>}

          {!feedbackLoading && feedbacks.map((fb, i) => (
            <div className="admin-order-card" key={fb._id || i}>
              <div className="admin-order-header">
                <div>
                  <h3 style={{ color: 'white', fontSize: '15px' }}>{fb.name || 'Anonymous'}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>+91 {fb.phone}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>{renderStars(fb.rating)}</div>
                  <p style={{ color: '#ffb347', fontSize: '13px', fontWeight: '600' }}>{fb.rating}/5</p>
                </div>
              </div>
              {fb.comment && (
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginTop: '8px', fontStyle: 'italic' }}>
                  "{fb.comment}"
                </p>
              )}
              <p className="admin-order-date">{fb.date}</p>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER */}
      <footer className="footer" style={{ marginTop: 'auto' }}>
        <div className="footer-content">
          <div className="footer-left">
            <h3>☕ Cafe Coffee Break</h3>
            <p>Good coffee, good mood ☕</p>
          </div>
          <div className="footer-center">
            <p>📍 Location: Nagar City</p>
            <p>📞 +91 9876543210</p>
          </div>
          <div className="footer-right">
            <p>Follow Us</p>
            <div className="social-icons">
              <i className="ri-instagram-line"></i>
              <i className="ri-facebook-circle-line"></i>
              <i className="ri-whatsapp-line"></i>
            </div>
          </div>
        </div>
        <div className="footer-bottom">© 2026 Cafe Coffee Break | All Rights Reserved</div>
      </footer>

    </div>
  );
}