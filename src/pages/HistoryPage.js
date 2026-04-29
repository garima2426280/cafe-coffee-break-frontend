import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import axios from '../api/axios';

export default function HistoryPage({ userPhone }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userPhone) { setLoading(false); return; }
      setLoading(true);
      try {
        const res = await axios.get(`/users/history/${userPhone.toString().trim()}`);
        setOrders(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, [userPhone]);

  const downloadOrderPDF = (order) => {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFillColor(211, 84, 0);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Cafe Coffee Break', 105, 16, { align: 'center' });
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('TAX INVOICE', 105, 26, { align: 'center' });
      doc.text(`Date: ${order.date}`, 105, 34, { align: 'center' });

      // Customer info
      doc.setFillColor(255, 243, 224);
      doc.rect(14, 44, 182, 34, 'F');
      doc.setTextColor(51, 51, 51);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Customer Details', 18, 52);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name    : ${order.name}`, 18, 60);
      doc.text(`Phone   : +91 ${order.phone}`, 18, 67);
      doc.text(`Table   : ${order.table}`, 110, 60);
      doc.text(`Payment : ${order.payment}`, 110, 67);
      doc.setFont('helvetica', 'bold');
      doc.text(`Bill No: CCB-${order._id.toString().slice(-6).toUpperCase()}`, 110, 52);

      // Divider
      doc.setDrawColor(211, 84, 0);
      doc.setLineWidth(0.8);
      doc.line(14, 82, 196, 82);

      // Table header
      doc.setFillColor(211, 84, 0);
      doc.rect(14, 84, 182, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Item', 18, 92);
      doc.text('Qty', 112, 92);
      doc.text('Rate', 138, 92);
      doc.text('Amount', 168, 92);

      // Items
      let y = 104;
      doc.setTextColor(51, 51, 51);
      doc.setFont('helvetica', 'normal');
      order.items.forEach((it, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(255, 250, 245);
          doc.rect(14, y - 6, 182, 10, 'F');
        }
        const unitPrice = it.qty > 0 ? Math.round(it.price / it.qty) : it.price;
        doc.text(it.name.substring(0, 28), 18, y);
        doc.text(it.qty.toString(), 115, y);
        doc.text(`Rs.${unitPrice}`, 138, y);
        doc.text(`Rs.${it.price}`, 168, y);
        y += 11;
      });

      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(14, y, 196, y);
      y += 8;

      // Tax breakdown
      const subtotal = order.subtotal || order.total;
      const cgst = order.cgst || 0;
      const sgst = order.sgst || 0;
      const savedAmount = order.savedAmount || 0;

      doc.setFont('helvetica', 'normal');
      doc.text('Subtotal:', 132, y);
      doc.text(`Rs.${subtotal}`, 190, y, { align: 'right' });
      y += 8;

      if (savedAmount > 0) {
        doc.setTextColor(46, 164, 79);
        doc.text(`Happy Hour Saving:`, 118, y);
        doc.text(`-Rs.${savedAmount}`, 190, y, { align: 'right' });
        doc.setTextColor(51, 51, 51);
        y += 8;
      }

      if (cgst > 0) {
        doc.text('CGST @ 2.5%:', 132, y);
        doc.text(`Rs.${cgst}`, 190, y, { align: 'right' });
        y += 8;
        doc.text('SGST @ 2.5%:', 132, y);
        doc.text(`Rs.${sgst}`, 190, y, { align: 'right' });
        y += 6;
      }

      // Total box
      doc.setFillColor(211, 84, 0);
      doc.rect(110, y, 86, 14, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('TOTAL:', 118, y + 9);
      doc.text(`Rs.${order.total}`, 190, y + 9, { align: 'right' });
      y += 22;

      // Status badge
      doc.setTextColor(51, 51, 51);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Order Status: ${order.status === 'ready' ? 'Completed' : 'Pending'}`, 14, y);
      doc.text('* CGST and SGST as per GST regulations', 14, y + 6);

      // Footer
      doc.setFillColor(211, 84, 0);
      doc.rect(0, 278, 210, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Thank you for visiting Cafe Coffee Break!', 105, 287, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Good coffee, good mood  |  Nagar City  |  +91 9876543210', 105, 294, { align: 'center' });

      doc.save(`CafeBill_Order${order._id.toString().slice(-6)}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      alert('PDF failed: ' + err.message);
    }
  };

  if (loading) return (
    <section className="container page active">
      <h2 className="section-title">Order History</h2>
      <div className="menu-loading"><span>☕</span><p>Loading your orders...</p></div>
    </section>
  );

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
                {/* STATUS BADGE */}
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: '10px',
                  background: order.status === 'ready' ? 'rgba(46,164,79,0.2)' : 'rgba(255,123,0,0.2)',
                  color: order.status === 'ready' ? '#2ea44f' : '#ffb347',
                  border: `1px solid ${order.status === 'ready' ? 'rgba(46,164,79,0.3)' : 'rgba(255,123,0,0.3)'}`,
                }}>
                  {order.status === 'ready' ? '✅ Ready' : '⏳ Pending'}
                </span>
              </div>
            </div>

            <div className="history-card-body">
              <div className="history-meta">
                <span>👤 {order.name}</span>
                <span>🪑 Table {order.table}</span>
              </div>

              {/* TAX INFO */}
              {order.cgst > 0 && (
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span>Subtotal: ₹{order.subtotal}</span>
                  <span>CGST: ₹{order.cgst}</span>
                  <span>SGST: ₹{order.sgst}</span>
                  {order.savedAmount > 0 && <span style={{ color: '#2ea44f' }}>Saved: ₹{order.savedAmount}</span>}
                </div>
              )}

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

            {/* DOWNLOAD PDF BUTTON PER ORDER */}
            <button
              onClick={() => downloadOrderPDF(order)}
              className="history-pdf-btn"
            >
              📄 Download Bill PDF
            </button>
          </div>
        ))
      )}
    </section>
  );
}