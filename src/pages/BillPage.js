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

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();

      // Header background
      doc.setFillColor(211, 84, 0);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Cafe Coffee Break', 105, 16, { align: 'center' });
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('TAX INVOICE', 105, 26, { align: 'center' });
      doc.text(`Date: ${new Date().toLocaleString()}`, 105, 34, { align: 'center' });

      // Customer info box
      doc.setTextColor(51, 51, 51);
      doc.setFillColor(255, 243, 224);
      doc.rect(14, 44, 182, 34, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Customer Details', 18, 52);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name    : ${name}`, 18, 60);
      doc.text(`Phone   : +91 ${userPhone}`, 18, 67);
      doc.text(`Table   : ${table}`, 110, 60);
      doc.text(`Payment : ${payment}`, 110, 67);
      doc.setFont('helvetica', 'bold');
      doc.text(`Bill No: CCB-${Date.now().toString().slice(-6)}`, 110, 52);

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
      cartItems.forEach(([id, qty], index) => {
        const item = getItem(id);
        if (!item) return;
        const unitPrice = getDiscountedPrice(item.price);
        const amount = unitPrice * qty;

        // Alternate row bg
        if (index % 2 === 0) {
          doc.setFillColor(255, 250, 245);
          doc.rect(14, y - 6, 182, 10, 'F');
        }

        doc.setFont('helvetica', 'normal');
        doc.text(item.name.substring(0, 28), 18, y);
        doc.text(qty.toString(), 115, y);
        doc.text(`Rs.${unitPrice}`, 138, y);
        doc.text(`Rs.${amount}`, 168, y);

        if (isActive && discount > 0) {
          doc.setFontSize(8);
          doc.setTextColor(120, 120, 120);
          doc.text(`(orig Rs.${item.price * qty})`, 18, y + 5);
          doc.setFontSize(10);
          doc.setTextColor(51, 51, 51);
          y += 5;
        }
        y += 11;
      });

      // Bottom section divider
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(14, y, 196, y);
      y += 8;

      // Subtotal
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Subtotal:', 132, y);
      doc.text(`Rs.${subtotal}`, 175, y, { align: 'right' });
      y += 8;

      // Savings
      if (totalSaved > 0) {
        doc.setTextColor(46, 164, 79);
        doc.text(`Happy Hour Saving (${discount}% OFF):`, 100, y);
        doc.text(`-Rs.${totalSaved}`, 175, y, { align: 'right' });
        doc.setTextColor(51, 51, 51);
        y += 8;
      }

      // CGST
      doc.text('CGST @ 2.5%:', 132, y);
      doc.text(`Rs.${cgstAmount}`, 175, y, { align: 'right' });
      y += 8;

      // SGST
      doc.text('SGST @ 2.5%:', 132, y);
      doc.text(`Rs.${sgstAmount}`, 175, y, { align: 'right' });
      y += 6;

      // Total box
      doc.setFillColor(211, 84, 0);
      doc.rect(110, y, 86, 14, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('TOTAL:', 118, y + 9);
      doc.text(`Rs.${total}`, 190, y + 9, { align: 'right' });
      y += 22;

      // Tax note
      doc.setTextColor(120, 120, 120);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('* CGST and SGST charged as per Government GST regulations', 14, y);

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

      doc.save(`CafeBill_Table${table}_${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      alert('PDF download failed: ' + err.message);
    }
  };

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