import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const PIE_COLORS = ['#ff7b00','#ffb347','#e06800','#ffd280','#ff9500','#ffca6e','#cc5f00','#ffe0a0'];

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
      label: d[labelKey], value,
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

export default function AnalyticsDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [daily, setDaily] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('daily');

  // expense inputs (manual)
  const [ingredients, setIngredients] = useState(0);
  const [staff, setStaff] = useState(0);
  const [rent, setRent] = useState(0);
  const [maintenance, setMaintenance] = useState(0);
  const [taxes, setTaxes] = useState(0);
  const [other, setOther] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ordersRes, productsRes, dailyRes, monthlyRes, weeklyRes] = await Promise.all([
          axios.get('/orders'),
          axios.get('/reports/product'),
          axios.get('/reports/daily'),
          axios.get('/reports/monthly'),
          axios.get('/reports/weekly'),
        ]);
        setOrders(ordersRes.data);
        setProducts(productsRes.data);
        setDaily(dailyRes.data);
        setMonthly(monthlyRes.data);
        setWeekly(weeklyRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const totalExpenses = Number(ingredients) + Number(staff) + Number(rent) + Number(maintenance) + Number(taxes) + Number(other);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
  const ownerEarnings = Math.round(netProfit * 0.7);

  const expenseData = [
    { name: 'Ingredients', value: Number(ingredients) },
    { name: 'Staff Salary', value: Number(staff) },
    { name: 'Rent & Utilities', value: Number(rent) },
    { name: 'Maintenance', value: Number(maintenance) },
    { name: 'Taxes', value: Number(taxes) },
    { name: 'Other', value: Number(other) },
  ].filter(e => e.value > 0);

  const chartData = timeFilter === 'daily' ? daily : timeFilter === 'weekly' ? weekly : monthly;
  const chartLabelKey = timeFilter === 'daily' ? 'date' : timeFilter === 'weekly' ? 'week' : 'month';
  const maxRevenue = Math.max(...chartData.map(d => d.total || 0), 1);

  const topProducts = products.slice(0, 5);
  const maxQty = Math.max(...topProducts.map(p => p.qty || 0), 1);

  const bestDay = daily.reduce((best, d) => (!best || d.total > best.total) ? d : best, null);

  const hourData = [
    { hour: 'Morning\n6-10 AM', orders: orders.filter(o => { const h = parseInt((o.date || '').split(' ')[1]); return h >= 6 && h < 10; }).length },
    { hour: 'Noon\n10-2 PM', orders: orders.filter(o => { const h = parseInt((o.date || '').split(' ')[1]); return h >= 10 && h < 14; }).length },
    { hour: 'Evening\n2-6 PM', orders: orders.filter(o => { const h = parseInt((o.date || '').split(' ')[1]); return h >= 14 && h < 18; }).length },
    { hour: 'Night\n6-10 PM', orders: orders.filter(o => { const h = parseInt((o.date || '').split(' ')[1]); return h >= 18 && h < 22; }).length },
  ];
  const maxHour = Math.max(...hourData.map(h => h.orders), 1);

  if (loading) return (
    <section className="container page active">
      <div className="menu-loading"><span>☕</span><p>Loading analytics...</p></div>
    </section>
  );

  return (
    <section className="analytics-wrapper">
      <h2 className="analytics-title">Sales Analytics</h2>
      <p className="analytics-subtitle">Complete financial overview of Cafe Coffee Break</p>

      {/* PROFIT MARGIN WARNING */}
      {totalExpenses > 0 && netProfit < 0 && (
        <div className="analytics-warning">
          ⚠️ Warning: Expenses exceed revenue! Net loss of ₹{Math.abs(netProfit)}
        </div>
      )}

      {/* FINANCIAL OVERVIEW CARDS */}
      <div className="analytics-cards-grid">
        <div className="analytics-card analytics-card-revenue">
          <p className="analytics-card-label">Total Revenue</p>
          <p className="analytics-card-value">₹{totalRevenue.toLocaleString()}</p>
          <p className="analytics-card-sub">{orders.length} total orders</p>
        </div>
        <div className="analytics-card analytics-card-expense">
          <p className="analytics-card-label">Total Expenses</p>
          <p className="analytics-card-value">₹{totalExpenses.toLocaleString()}</p>
          <p className="analytics-card-sub">Enter below to calculate</p>
        </div>
        <div className={`analytics-card ${netProfit >= 0 ? 'analytics-card-profit' : 'analytics-card-loss'}`}>
          <p className="analytics-card-label">Net Profit</p>
          <p className="analytics-card-value">₹{netProfit.toLocaleString()}</p>
          <p className="analytics-card-sub">Margin: {profitMargin}%</p>
        </div>
        <div className="analytics-card analytics-card-owner">
          <p className="analytics-card-label">Owner Earnings</p>
          <p className="analytics-card-value">₹{ownerEarnings.toLocaleString()}</p>
          <p className="analytics-card-sub">70% of net profit</p>
        </div>
      </div>

      {/* KEY HIGHLIGHTS */}
      <div className="analytics-highlights">
        {bestDay && (
          <div className="highlight-item">
            <span className="highlight-icon">🏆</span>
            <div>
              <p className="highlight-label">Best Day</p>
              <p className="highlight-value">{bestDay.date} — ₹{bestDay.total}</p>
            </div>
          </div>
        )}
        <div className="highlight-item">
          <span className="highlight-icon">📈</span>
          <div>
            <p className="highlight-label">Profit Margin</p>
            <p className="highlight-value" style={{ color: profitMargin >= 0 ? '#2ea44f' : '#ff6b6b' }}>
              {profitMargin}% {profitMargin >= 30 ? '✅ Healthy' : profitMargin >= 0 ? '⚠️ Low' : '❌ Loss'}
            </p>
          </div>
        </div>
        {topProducts[0] && (
          <div className="highlight-item">
            <span className="highlight-icon">⭐</span>
            <div>
              <p className="highlight-label">Top Selling</p>
              <p className="highlight-value">{topProducts[0].name} ({topProducts[0].qty} sold)</p>
            </div>
          </div>
        )}
        <div className="highlight-item">
          <span className="highlight-icon">👥</span>
          <div>
            <p className="highlight-label">Total Customers</p>
            <p className="highlight-value">{orders.length} orders placed</p>
          </div>
        </div>
      </div>

      {/* EXPENSE INPUT */}
      <div className="analytics-section-card">
        <h3 className="analytics-section-title">Enter Expenses (₹)</h3>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '16px' }}>
          Enter your monthly expenses to calculate profit accurately
        </p>
        <div className="expense-grid">
          {[
            { label: 'Ingredients', val: ingredients, set: setIngredients },
            { label: 'Staff Salary', val: staff, set: setStaff },
            { label: 'Rent & Utilities', val: rent, set: setRent },
            { label: 'Maintenance', val: maintenance, set: setMaintenance },
            { label: 'Taxes', val: taxes, set: setTaxes },
            { label: 'Other Expenses', val: other, set: setOther },
          ].map(e => (
            <div key={e.label} className="expense-field">
              <label className="admin-field-label">{e.label}</label>
              <input
                type="number"
                className="admin-field-input"
                placeholder="0"
                value={e.val || ''}
                onChange={ev => e.set(ev.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* EXPENSE PIE CHART */}
      {expenseData.length > 0 && (
        <div className="analytics-section-card">
          <h3 className="analytics-section-title">Expense Breakdown</h3>
          <PieChart data={expenseData} valueKey="value" labelKey="name" />
        </div>
      )}

      {/* REVENUE VS EXPENSE CHART */}
      <div className="analytics-section-card">
        <div className="analytics-chart-header">
          <h3 className="analytics-section-title">Revenue Trend</h3>
          <div className="analytics-filter-tabs">
            {['daily', 'weekly', 'monthly'].map(f => (
              <button
                key={f}
                className={`analytics-filter-tab ${timeFilter === f ? 'active' : ''}`}
                onClick={() => setTimeFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {chartData.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>No data yet.</p>
        ) : (
          <div className="analytics-bar-chart">
            {chartData.slice(-10).map((d, i) => {
              const revPct = Math.round(((d.total || 0) / maxRevenue) * 100);
              const expPct = totalExpenses > 0 ? Math.min(Math.round((totalExpenses / chartData.length / maxRevenue) * 100), 100) : 0;
              return (
                <div key={i} className="analytics-bar-group">
                  <div className="analytics-bar-pair">
                    <div className="analytics-bar-rev" style={{ height: `${revPct}%` }} title={`Revenue: ₹${d.total}`} />
                    {expPct > 0 && <div className="analytics-bar-exp" style={{ height: `${expPct}%` }} title="Expenses" />}
                  </div>
                  <p className="analytics-bar-label">{d[chartLabelKey]?.split('/')[0] || d[chartLabelKey]}</p>
                </div>
              );
            })}
            <div className="analytics-chart-legend">
              <span><span className="legend-dot" style={{ background: '#ff7b00' }} />Revenue</span>
              <span><span className="legend-dot" style={{ background: '#e53935' }} />Expenses</span>
            </div>
          </div>
        )}
      </div>

      {/* PROFIT FLOW */}
      <div className="analytics-section-card">
        <h3 className="analytics-section-title">Profit Flow</h3>
        <div className="profit-flow">
          {[
            { label: 'Revenue', value: `₹${totalRevenue}`, color: '#ff7b00' },
            { label: 'Expenses', value: `-₹${totalExpenses}`, color: '#e53935' },
            { label: 'Tax (est.)', value: `-₹${Math.round(netProfit * 0.1)}`, color: '#ffb347' },
            { label: 'Net Profit', value: `₹${netProfit}`, color: netProfit >= 0 ? '#2ea44f' : '#e53935' },
            { label: 'Owner Pocket', value: `₹${ownerEarnings}`, color: '#4fc3f7' },
          ].map((step, i, arr) => (
            <React.Fragment key={i}>
              <div className="profit-flow-step" style={{ borderColor: step.color }}>
                <p className="profit-flow-label">{step.label}</p>
                <p className="profit-flow-value" style={{ color: step.color }}>{step.value}</p>
              </div>
              {i < arr.length - 1 && <div className="profit-flow-arrow">→</div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* PRODUCT PERFORMANCE */}
      <div className="analytics-section-card">
        <h3 className="analytics-section-title">Product Performance</h3>
        {topProducts.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>No orders yet.</p>
        ) : (
          <>
            <div className="product-perf-list">
              {topProducts.map((p, i) => {
                const pct = Math.round((p.qty / maxQty) * 100);
                const revPct = Math.round((p.total / (products.reduce((s, x) => s + x.total, 0) || 1)) * 100);
                const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                return (
                  <div key={i} className="product-perf-row">
                    <span className="product-perf-rank">{medals[i]}</span>
                    <div className="product-perf-info">
                      <div className="product-perf-name-row">
                        <span className="product-perf-name">{p.name}</span>
                        <span className="product-perf-rev">{revPct}% revenue</span>
                      </div>
                      <div className="product-perf-bar-track">
                        <div className="product-perf-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="product-perf-stats">
                        <span>{p.qty} sold</span>
                        <span>₹{p.total} revenue</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '20px' }}>
              <PieChart data={topProducts} valueKey="qty" labelKey="name" />
            </div>
          </>
        )}
      </div>

      {/* PEAK HOURS */}
      <div className="analytics-section-card">
        <h3 className="analytics-section-title">Peak Hours</h3>
        <div className="peak-hours-grid">
          {hourData.map((h, i) => {
            const pct = Math.round((h.orders / maxHour) * 100);
            const colors = ['#ff9500', '#ff7b00', '#ff6000', '#e06800'];
            return (
              <div key={i} className="peak-hour-card">
                <div className="peak-hour-bar-track">
                  <div className="peak-hour-bar-fill" style={{ height: `${pct || 5}%`, background: colors[i] }} />
                </div>
                <p className="peak-hour-label">{h.hour}</p>
                <p className="peak-hour-count">{h.orders} orders</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* DYNAMIC INSIGHTS */}
      <div className="analytics-section-card">
        <h3 className="analytics-section-title">Dynamic Insights</h3>
        <div className="insights-list">
          {topProducts[0] && (
            <div className="insight-item">
              <span className="insight-icon">🔥</span>
              <p>Your best-selling item is <strong>{topProducts[0].name}</strong> with {topProducts[0].qty} orders</p>
            </div>
          )}
          {bestDay && (
            <div className="insight-item">
              <span className="insight-icon">📅</span>
              <p>Your highest earning day was <strong>{bestDay.date}</strong> with ₹{bestDay.total} revenue</p>
            </div>
          )}
          {profitMargin >= 30 && (
            <div className="insight-item">
              <span className="insight-icon">✅</span>
              <p>Great job! Your profit margin of <strong>{profitMargin}%</strong> is healthy</p>
            </div>
          )}
          {profitMargin < 30 && profitMargin >= 0 && totalExpenses > 0 && (
            <div className="insight-item" style={{ borderColor: 'rgba(255,183,0,0.3)' }}>
              <span className="insight-icon">⚠️</span>
              <p>Your profit margin is <strong>{profitMargin}%</strong> — consider reducing expenses</p>
            </div>
          )}
          {orders.length > 0 && (
            <div className="insight-item">
              <span className="insight-icon">👥</span>
              <p>Average order value is <strong>₹{Math.round(totalRevenue / orders.length)}</strong></p>
            </div>
          )}
        </div>
      </div>

    </section>
  );
}