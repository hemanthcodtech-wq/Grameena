import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, X, PackageOpen, CheckCircle, Clock,
  Truck, XCircle, AlertTriangle, RefreshCcw, Printer, FileText
} from 'lucide-react';

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

// ─── CancelModal ──────────────────────────────────────────────────────────────
function CancelModal({ order, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    await onConfirm();
    setBusy(false);
    setDone(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <h2 className="font-serif text-lg font-bold text-[#113C2B]">Cancel Order</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>
        {done ? (
          <div className="p-6 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <RefreshCcw className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-bold text-lg text-[#113C2B]">Order Cancelled</h3>
            <button onClick={onClose} className="mt-4 w-full bg-[#113C2B] text-white font-bold py-2.5 rounded-xl hover:bg-[#1A4B3A] transition-colors">Done</button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600">Cancel order <strong>#{order.order_number || order.id}</strong>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 text-[#113C2B] rounded-xl font-semibold hover:bg-gray-200 transition-colors">Abort</button>
              <button onClick={handleConfirm} disabled={busy}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {busy ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Cancelling...</> : 'Cancel Order'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelModal, setCancelModal] = useState(null);
  const itemsPerPage = 20;

  useEffect(() => { fetchOrders(); }, []);
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    if (status === 'cancelled') {
      setCancelModal(orders.find(o => o.id === orderId));
      return;
    }
    setUpdatingStatusId(orderId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/orders/${orderId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      console.error('Update status error:', err);
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleCancel = async (order) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/orders/${order.id}/status`, { status: 'cancelled' }, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));
    } catch (err) {
      console.error('Cancel order error:', err);
      alert(err.response?.data?.error || 'Failed to cancel order');
    }
  };

  const openInvoice = (order, autoPrint = false) => {
    let items = [];
    try { items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch {}
    let address = {};
    try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch {}

    const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    const subtotal = items.reduce((s, i) => {
      const price = parseFloat(i.price ?? i.variant?.price ?? i.product?.price ?? 0);
      const qty = parseInt(i.quantity ?? i.qty ?? 1);
      return s + (isNaN(price * qty) ? 0 : price * qty);
    }, 0);
    const discount = parseFloat(order.discount_amount) || 0;
    const shipping = parseFloat(order.shipping_fee) || 0;
    const tax = parseFloat(order.tax_amount) || 0;

    const customerName = (address.firstName ? `${address.firstName} ${address.lastName || ''}`.trim() : null) || order.user_name || address.name || 'Guest';
    const customerEmail = address.email || order.user_email || '';
    const customerPhone = address.phone || address.mobile || '';
    const fullStreet = [address.street || address.line1, address.line2].filter(Boolean).join(', ');
    const fullCityStatePin = [address.city, address.state, address.pincode].filter(Boolean).join(', ');

    const rows = items.map((item, idx) => {
      const price = Number(item.price ?? item.variant?.price ?? item.product?.price ?? 0);
      const qty = parseInt(item.quantity ?? item.qty ?? 1);
      const size = item.size || item.weight || item.variant?.size || '—';
      const imgUrl = item.image || item.image_url || item.variant?.image || item.product?.images?.[0] || item.product?.image_url || '';
      const imgHtml = imgUrl && !imgUrl.startsWith('data:') ? `<img src="${imgUrl}" style="width:36px;height:36px;object-fit:cover;border-radius:4px;border:1px solid #d8f3dc;" />` : '';
      return `<tr style="border-bottom:1px solid #d8f3dc;">
        <td style="padding:10px 12px;color:#555;font-size:9pt;text-align:center;">${idx + 1}</td>
        <td style="padding:10px 12px;">
          <div style="display:flex;align-items:center;gap:10px;">
            ${imgHtml}
            <div>
              <div style="font-weight:700;color:#1B4332;font-size:9pt;">${item.name || item.product?.name || 'Product'}</div>
              ${size !== '—' ? `<div style="font-size:8pt;color:#52B788;margin-top:2px;">Size: ${size}</div>` : ''}
            </div>
          </div>
        </td>
        <td style="padding:10px 12px;color:#555;font-size:9pt;text-align:center;">${size}</td>
        <td style="padding:10px 12px;color:#555;font-size:9pt;text-align:center;">${qty}</td>
        <td style="padding:10px 12px;color:#1B4332;font-weight:600;font-size:9pt;text-align:right;">₹${price.toFixed(2)}</td>
        <td style="padding:10px 12px;color:#1B4332;font-weight:700;font-size:9.5pt;text-align:right;">₹${(price * qty).toFixed(2)}</td>
      </tr>`;
    }).join('');

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice #${order.order_number || order.id}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    @page { size: A4; margin: 15mm 12mm 20mm 12mm; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 24px; font-size: 10pt; line-height: 1.4; background: #fff; }
    @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .no-print { display: none !important; } }
  </style>
</head>
<body>

<!-- Header -->
<table style="width:100%;border-collapse:collapse;border-bottom:3px solid #2D6A4F;padding-bottom:16px;margin-bottom:20px;">
  <tr>
    <td style="vertical-align:middle;width:55%;">
      <div style="display:flex;flex-direction:column;">
        <span style="font-family:serif;font-weight:900;font-size:24px;color:#52B788;line-height:1;letter-spacing:0.1em;text-transform:uppercase;">GRAMEENA BHARATHAM</span>
        <span style="font-size:10px;font-weight:600;color:#2D6A4F;letter-spacing:0.2em;text-transform:uppercase;margin-top:4px;">The Taste of Rural Andhra</span>
        <span style="font-size:9px;color:#888;margin-top:2px;">info@grameenahbaratham.com</span>
      </div>
    </td>
    <td style="vertical-align:top;text-align:right;">
      <div style="font-size:22pt;font-weight:900;color:#1B4332;letter-spacing:-0.5px;">INVOICE</div>
      <div style="font-size:9pt;color:#555;margin-top:6px;line-height:1.8;">
        <strong>Invoice No:</strong> #${order.order_number || order.id}<br>
        <strong>Date:</strong> ${orderDate}<br>
        <strong>Status:</strong> ${order.status || 'paid'}
      </div>
    </td>
  </tr>
</table>

<!-- Bill To / Ship To -->
<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
  <tr>
    <td style="width:50%;padding-right:10px;vertical-align:top;">
      <div style="background:#F0FFF4;border-radius:8px;padding:12px;border:1px solid #d8f3dc;">
        <div style="font-size:9pt;font-weight:700;color:#2D6A4F;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Bill To</div>
        <div style="font-weight:700;color:#1B4332;font-size:10pt;">${customerName}</div>
        ${customerEmail ? `<div style="color:#555;font-size:9pt;">${customerEmail}</div>` : ''}
        ${customerPhone ? `<div style="color:#555;font-size:9pt;">Ph: ${customerPhone}</div>` : ''}
      </div>
    </td>
    <td style="width:50%;padding-left:10px;vertical-align:top;">
      <div style="background:#F0FFF4;border-radius:8px;padding:12px;border:1px solid #d8f3dc;">
        <div style="font-size:9pt;font-weight:700;color:#2D6A4F;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Ship To</div>
        <div style="font-weight:700;color:#1B4332;font-size:10pt;">${customerName}</div>
        ${fullStreet ? `<div style="color:#555;font-size:9pt;">${fullStreet}</div>` : ''}
        ${fullCityStatePin ? `<div style="color:#555;font-size:9pt;">${fullCityStatePin}</div>` : ''}
        ${customerPhone ? `<div style="color:#555;font-size:9pt;">Ph: ${customerPhone}</div>` : ''}
      </div>
    </td>
  </tr>
</table>

<!-- Items Table -->
<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
  <thead>
    <tr style="background:#2D6A4F;">
      <th style="padding:10px 12px;color:#fff;font-size:9pt;text-align:center;width:5%;">#</th>
      <th style="padding:10px 12px;color:#fff;font-size:9pt;text-align:left;width:42%;">Item</th>
      <th style="padding:10px 12px;color:#fff;font-size:9pt;text-align:center;width:15%;">Size</th>
      <th style="padding:10px 12px;color:#fff;font-size:9pt;text-align:center;width:10%;">Qty</th>
      <th style="padding:10px 12px;color:#fff;font-size:9pt;text-align:right;width:14%;">Unit Price</th>
      <th style="padding:10px 12px;color:#fff;font-size:9pt;text-align:right;width:14%;">Total</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>

<!-- Totals -->
<table style="width:100%;border-collapse:collapse;margin-top:8px;">
  <tr>
    <td style="width:55%;"></td>
    <td style="width:45%;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:7px 12px;text-align:right;color:#555;font-size:9.5pt;border-bottom:1px solid #d8f3dc;">Subtotal</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #d8f3dc;width:120px;">₹${subtotal.toFixed(2)}</td></tr>
        ${discount > 0 ? `<tr><td style="padding:7px 12px;text-align:right;color:#059669;font-size:9.5pt;border-bottom:1px solid #d8f3dc;">Discount</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #d8f3dc;color:#059669;">-₹${discount.toFixed(2)}</td></tr>` : ''}
        ${shipping > 0 ? `<tr><td style="padding:7px 12px;text-align:right;color:#555;font-size:9.5pt;border-bottom:1px solid #d8f3dc;">Shipping</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #d8f3dc;">₹${shipping.toFixed(2)}</td></tr>` : ''}
        ${tax > 0 ? `<tr><td style="padding:7px 12px;text-align:right;color:#555;font-size:9.5pt;border-bottom:1px solid #d8f3dc;">Tax</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #d8f3dc;">₹${tax.toFixed(2)}</td></tr>` : ''}
        <tr style="background:#d8f3dc;"><td style="padding:10px 12px;text-align:right;font-weight:700;font-size:11pt;color:#1B4332;border-top:2px solid #2D6A4F;">TOTAL</td><td style="padding:10px 12px;text-align:right;font-weight:700;font-size:11pt;color:#2D6A4F;border-top:2px solid #2D6A4F;">₹${Number(order.total).toFixed(2)}</td></tr>
      </table>
    </td>
  </tr>
</table>

<!-- Payment Info -->
<div style="margin-top:20px;padding:12px;background:#F0FFF4;border-radius:8px;border:1px solid #d8f3dc;font-size:9pt;color:#555;">
  <strong style="color:#2D6A4F;">Payment Method:</strong> ${order.payment_method || 'Online'}
  ${order.razorpay_payment_id ? ` &nbsp;|&nbsp; <strong style="color:#2D6A4F;">Transaction ID:</strong> ${order.razorpay_payment_id}` : ''}
</div>

<!-- Footer -->
<div style="margin-top:32px;padding-top:16px;border-top:1px solid #d8f3dc;text-align:center;font-size:9pt;color:#888;">
  Thank you for choosing Grameena Bharatham! &nbsp;|&nbsp; info@grameenahbaratham.com &nbsp;|&nbsp; grameenahbaratham.com
</div>

<!-- Print Button -->
<div class="no-print" style="text-align:center;margin-top:28px;display:flex;gap:12px;justify-content:center;">
  <button onclick="window.print()" style="background:#2D6A4F;color:#fff;border:none;padding:10px 32px;border-radius:999px;font-size:13px;font-weight:700;cursor:pointer;">🖨️ Print Invoice</button>
  <button onclick="window.close()" style="background:#f3f4f6;color:#333;border:none;padding:10px 24px;border-radius:999px;font-size:13px;font-weight:600;cursor:pointer;">Close</button>
</div>

</body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.open(); w.document.write(html); w.document.close(); if (autoPrint) { setTimeout(() => w.print(), 800); } }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-[#113C2B]/20 border-t-[#113C2B] rounded-full animate-spin" />
    </div>
  );

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return String(o.order_number || o.id).toLowerCase().includes(q) ||
        (o.user_email || '').toLowerCase().includes(q) ||
        (o.user_name || '').toLowerCase().includes(q);
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#113C2B]">Orders</h1>
          <p className="text-[#113C2B]/40 text-xs mt-0.5">{orders.length} total orders</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#113C2B]/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Order # or Email"
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-[#e8dfc8] text-sm focus:outline-none" />
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${
              statusFilter === s
                ? 'bg-[#113C2B] text-white shadow-sm'
                : 'bg-white border border-[#e8dfc8] text-[#113C2B]/60 hover:border-[#113C2B]/40'
            }`}>
            {s === 'all' ? `All (${orders.length})` : `${s} (${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8dfc8] p-12 text-center">
          <PackageOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-[#113C2B]/50 text-sm">{orders.length === 0 ? 'No orders yet.' : `No ${statusFilter} orders.`}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((order, i) => {
            let items = [];
            try { items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch {}
            let address = {};
            try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch {}

            const subtotal = items.reduce((s, it) => {
              const price = parseFloat(it.price ?? it.variant?.price ?? it.product?.price ?? 0);
              const qty = parseInt(it.quantity ?? it.qty ?? 1);
              return s + (isNaN(price * qty) ? 0 : price * qty);
            }, 0);
            const discount = parseFloat(order.discount_amount) || 0;
            const shipping = parseFloat(order.shipping_fee) || (parseFloat(order.total) > subtotal ? parseFloat(order.total) - subtotal + discount : 0);
            const customerName = (address.firstName ? `${address.firstName} ${address.lastName || ''}`.trim() : null) || order.user_name || address.name || 'Guest';
            const customerEmail = address.email || order.user_email || '—';

            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl border border-[#e8dfc8] overflow-hidden">

                {/* Row Header */}
                <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#FDF9F1]/40 transition-colors"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif font-bold text-[#113C2B]">#{order.order_number || order.id}</span>
                      <span className="text-[#113C2B]/50 text-xs">{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status || 'pending'}
                      </span>
                    </div>
                    <p className="text-[#113C2B]/60 text-xs mt-0.5 truncate">{customerName} • {customerEmail}</p>
                  </div>
                  <span className="font-serif font-bold text-[#F8B319] text-base flex-shrink-0">₹{Number(order.total).toLocaleString('en-IN')}</span>
                  <ChevronDown className={`w-4 h-4 text-[#113C2B]/40 transition-transform flex-shrink-0 ${expanded === order.id ? 'rotate-180' : ''}`} />
                </div>

                {/* Expanded Details */}
                {expanded === order.id && (
                  <div className="border-t border-[#e8dfc8] p-4 space-y-5">

                    {/* Update Status */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-[10px] font-bold text-[#113C2B]/40 uppercase tracking-wider">Update Status</p>
                        {updatingStatusId === order.id && (
                          <div className="w-3.5 h-3.5 border-2 border-[#113C2B]/30 border-t-[#113C2B] rounded-full animate-spin" />
                        )}
                      </div>
                      <select 
                        value={order.status || 'pending'} 
                        disabled={updatingStatusId === order.id}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        className="w-full sm:w-64 px-3 py-2 rounded-xl bg-[#FDF9F1] border border-[#e8dfc8] text-[#113C2B] text-sm focus:outline-none disabled:opacity-60"
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    {/* Customer Details */}
                    <div>
                      <p className="text-[10px] font-bold text-[#113C2B]/40 uppercase tracking-wider mb-2">Customer Details</p>
                      <div className="bg-[#FDF9F1] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          ['Customer', address.firstName ? `${address.firstName} ${address.lastName || ''}`.trim() : (order.user_name || address.name || 'Guest')],
                          ['Email', address.email || order.user_email || '—'],
                          ['Phone', address.phone || address.mobile || '—'],
                          ['Payment', `${order.payment_method || 'Razorpay'} (${order.razorpay_payment_id || 'Paid'})`],
                          ['Razorpay ID', order.razorpay_order_id || '—'],
                        ].map(([label, val]) => (
                          <div key={label} className="flex items-start gap-2">
                            <span className="text-[10px] font-bold text-[#113C2B]/40 uppercase tracking-wider w-20 shrink-0 mt-0.5">{label}</span>
                            <span className="text-sm font-semibold text-[#113C2B] break-all">{val}</span>
                          </div>
                        ))}
                        {(address.street || address.line1 || address.city) && (
                          <div className="flex items-start gap-2 sm:col-span-2">
                            <span className="text-[10px] font-bold text-[#113C2B]/40 uppercase tracking-wider w-20 shrink-0 mt-0.5">Address</span>
                            <span className="text-sm font-semibold text-[#113C2B]">
                              {[
                                address.street || address.line1,
                                address.line2,
                                address.city,
                                address.state,
                                address.pincode
                              ].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <p className="text-[10px] font-bold text-[#113C2B]/40 uppercase tracking-wider mb-2">Order Items</p>
                      <div className="space-y-2">
                        {items.length === 0
                          ? <p className="text-sm text-gray-400 italic">No items found.</p>
                          : items.map((item, idx) => {
                            const itemName = item.name || item.product?.name || 'Delicacy';
                            const itemImage = item.image || item.image_url || item.product?.image_url;
                            const itemQty = item.quantity || item.qty || 1;
                            const itemPrice = parseFloat(item.price) || 0;
                            const itemWeight = item.weight || item.size || item.variant?.size;

                            return (
                              <div key={idx} className="flex gap-3 items-center bg-[#FDF9F1] rounded-xl p-3 border border-[#e8dfc8]">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                                  {itemImage
                                    ? <img src={itemImage} alt="" className="w-full h-full object-cover" />
                                    : <PackageOpen className="w-5 h-5 text-gray-300" />
                                  }
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-[#113C2B] truncate">{itemName}</p>
                                  <p className="text-xs text-gray-500">
                                    {itemWeight ? `Size: ${itemWeight} • ` : ''}Qty: {itemQty}
                                  </p>
                                </div>
                                <span className="text-sm font-bold text-[#F8B319]">₹{(itemQty * itemPrice).toLocaleString('en-IN')}</span>
                              </div>
                            );
                          })
                        }
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div>
                      <p className="text-[10px] font-bold text-[#113C2B]/40 uppercase tracking-wider mb-2">Price Summary</p>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-1.5">
                        <div className="flex justify-between text-xs text-[#113C2B]/70">
                          <span>Item Total</span><span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-xs text-green-600">
                            <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                            <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                          </div>
                        )}
                        {shipping > 0 && (
                          <div className="flex justify-between text-xs text-[#113C2B]/70">
                            <span>Shipping</span><span className="font-semibold">₹{shipping.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-bold text-[#113C2B] border-t border-gray-200 pt-2 mt-2">
                          <span>Grand Total</span>
                          <span className="text-[#F8B319]">₹{Number(order.total).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#e8dfc8]">
                      <button onClick={() => openInvoice(order)}
                        className="flex items-center justify-center gap-1.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors">
                        <FileText className="w-3.5 h-3.5" /> View Invoice
                      </button>
                      <button onClick={() => openInvoice(order, true)}
                        className="flex items-center justify-center gap-1.5 bg-[#52B788] hover:bg-[#40916C] text-white px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors">
                        <Printer className="w-3.5 h-3.5" /> Print / Download
                      </button>
                      {order.status !== 'cancelled' && (
                        <button onClick={() => setCancelModal(order)}
                          className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-[#113C2B]/60">
                Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
              </span>
              <div className="flex gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                  className="px-3 py-1.5 border border-[#e8dfc8] rounded-lg text-sm font-semibold text-[#113C2B] bg-white hover:bg-[#FDF9F1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Previous
                </button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                  className="px-3 py-1.5 border border-[#e8dfc8] rounded-lg text-sm font-semibold text-[#113C2B] bg-white hover:bg-[#FDF9F1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancelModal && (
          <CancelModal
            order={cancelModal}
            onConfirm={() => handleCancel(cancelModal)}
            onClose={() => setCancelModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrdersPage;
