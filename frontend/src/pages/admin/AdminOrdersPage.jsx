import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, X, PackageOpen, CheckCircle, Clock,
  Truck, XCircle, AlertTriangle, RefreshCcw, Printer, FileText
} from 'lucide-react';

const API = 'http://localhost:5000/api';

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
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/orders/${orderId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch { alert('Failed to update status'); }
  };

  const handleCancel = async (order) => {
    const token = localStorage.getItem('token');
    await axios.put(`${API}/admin/orders/${order.id}/status`, { status: 'cancelled' }, { headers: { Authorization: `Bearer ${token}` } });
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));
  };

  const openInvoice = (order) => {
    let items = [];
    try { items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch {}
    let address = {};
    try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch {}

    const rows = items.map((item, idx) => `
      <tr style="background:${idx % 2 === 0 ? '#fff' : '#fafaf8'}">
        <td style="padding:10px 12px;border-bottom:1px solid #eee;">${idx + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-weight:600;">${item.product?.name || 'Product'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center;">${item.variant?.size || '—'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center;">${item.qty}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;">₹${item.price}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:700;">₹${(item.qty * item.price).toFixed(2)}</td>
      </tr>`).join('');

    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    const discount = parseFloat(order.discount_amount) || 0;
    const shipping = parseFloat(order.shipping_fee) || 0;

    const html = `<!doctype html><html><head><meta charset="UTF-8"><title>Invoice #${order.order_number || order.id}</title>
    <style>body{font-family:Arial,sans-serif;padding:20px;color:#333}@media print{.no-print{display:none}}</style></head><body>
    <div style="display:flex;justify-content:space-between;border-bottom:3px solid #113C2B;padding-bottom:16px;margin-bottom:20px;">
      <div><h1 style="color:#113C2B;margin:0;">Grameena Bharatham</h1><p style="color:#666;margin:4px 0 0;">grameenahbaratham.com</p></div>
      <div style="text-align:right;"><h2 style="margin:0;color:#113C2B;">INVOICE</h2>
        <p style="margin:4px 0;font-size:13px;">Order: #${order.order_number || order.id}</p>
        <p style="margin:0;font-size:13px;">Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}</p>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
      <div style="padding:12px;border:1px solid #e8dfc8;border-radius:8px;">
        <strong>Customer</strong><br>${order.user_name || 'Guest'}<br>${order.user_email || ''}
      </div>
      <div style="padding:12px;border:1px solid #e8dfc8;border-radius:8px;">
        <strong>Ship To</strong><br>
        ${address.line1 || ''}${address.line2 ? ', ' + address.line2 : ''}<br>
        ${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}
        ${address.mobile ? '<br>Ph: ' + address.mobile : ''}
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <thead><tr style="background:#113C2B;color:#F8B319;">
        <th style="padding:10px 12px;text-align:left;">#</th>
        <th style="padding:10px 12px;text-align:left;">Item</th>
        <th style="padding:10px 12px;text-align:center;">Size</th>
        <th style="padding:10px 12px;text-align:center;">Qty</th>
        <th style="padding:10px 12px;text-align:right;">Unit Price</th>
        <th style="padding:10px 12px;text-align:right;">Total</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="display:flex;justify-content:flex-end;">
      <table style="width:260px;border-collapse:collapse;">
        <tr><td style="padding:6px 12px;color:#666;">Subtotal</td><td style="padding:6px 12px;text-align:right;font-weight:600;">₹${subtotal.toFixed(2)}</td></tr>
        ${discount > 0 ? `<tr><td style="padding:6px 12px;color:#059669;">Discount</td><td style="padding:6px 12px;text-align:right;font-weight:600;color:#059669;">-₹${discount.toFixed(2)}</td></tr>` : ''}
        ${shipping > 0 ? `<tr><td style="padding:6px 12px;color:#666;">Shipping</td><td style="padding:6px 12px;text-align:right;font-weight:600;">₹${shipping.toFixed(2)}</td></tr>` : ''}
        <tr style="background:#FDF9F1;"><td style="padding:10px 12px;font-weight:700;color:#113C2B;border-top:2px solid #113C2B;">TOTAL</td>
          <td style="padding:10px 12px;text-align:right;font-weight:700;color:#F8B319;border-top:2px solid #113C2B;">₹${Number(order.total).toFixed(2)}</td></tr>
      </table>
    </div>
    <div class="no-print" style="text-align:center;margin-top:24px;">
      <button onclick="window.print()" style="background:#113C2B;color:#F8B319;border:none;padding:8px 28px;border-radius:999px;font-size:13px;font-weight:700;cursor:pointer;">🖨️ Print Invoice</button>
    </div>
    </body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.open(); w.document.write(html); w.document.close(); }
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

            const subtotal = items.reduce((s, it) => s + (it.qty * it.price), 0);
            const discount = parseFloat(order.discount_amount) || 0;
            const shipping = parseFloat(order.shipping_fee) || 0;

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
                    <p className="text-[#113C2B]/60 text-xs mt-0.5 truncate">{order.user_name || 'Guest'} • {order.user_email}</p>
                  </div>
                  <span className="font-serif font-bold text-[#F8B319] text-base flex-shrink-0">₹{Number(order.total).toLocaleString('en-IN')}</span>
                  <ChevronDown className={`w-4 h-4 text-[#113C2B]/40 transition-transform flex-shrink-0 ${expanded === order.id ? 'rotate-180' : ''}`} />
                </div>

                {/* Expanded Details */}
                {expanded === order.id && (
                  <div className="border-t border-[#e8dfc8] p-4 space-y-5">

                    {/* Update Status */}
                    <div>
                      <p className="text-[10px] font-bold text-[#113C2B]/40 uppercase tracking-wider mb-2">Update Status</p>
                      <select value={order.status || 'pending'} onChange={e => updateStatus(order.id, e.target.value)}
                        className="w-full sm:w-64 px-3 py-2 rounded-xl bg-[#FDF9F1] border border-[#e8dfc8] text-[#113C2B] text-sm focus:outline-none">
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    {/* Customer Details */}
                    <div>
                      <p className="text-[10px] font-bold text-[#113C2B]/40 uppercase tracking-wider mb-2">Customer Details</p>
                      <div className="bg-[#FDF9F1] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          ['Name', order.user_name || address.name || 'Guest'],
                          ['Email', order.user_email || '—'],
                          ['Phone', address.mobile || '—'],
                          ['Payment', order.payment_method || '—'],
                        ].map(([label, val]) => (
                          <div key={label} className="flex items-start gap-2">
                            <span className="text-[10px] font-bold text-[#113C2B]/40 uppercase tracking-wider w-16 shrink-0 mt-0.5">{label}</span>
                            <span className="text-sm font-semibold text-[#113C2B] break-all">{val}</span>
                          </div>
                        ))}
                        {(address.line1 || address.city) && (
                          <div className="flex items-start gap-2 sm:col-span-2">
                            <span className="text-[10px] font-bold text-[#113C2B]/40 uppercase tracking-wider w-16 shrink-0 mt-0.5">Address</span>
                            <span className="text-sm font-semibold text-[#113C2B]">
                              {[address.line1, address.line2, address.city, address.state, address.pincode].filter(Boolean).join(', ')}
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
                          : items.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-center bg-[#FDF9F1] rounded-xl p-3 border border-[#e8dfc8]">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                                {item.product?.image_url
                                  ? <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                                  : <PackageOpen className="w-5 h-5 text-gray-300" />
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[#113C2B] truncate">{item.product?.name || 'Product'}</p>
                                <p className="text-xs text-gray-500">{item.variant?.size ? `Size: ${item.variant.size} • ` : ''}Qty: {item.qty}</p>
                              </div>
                              <span className="text-sm font-bold text-[#F8B319]">₹{(item.qty * item.price).toLocaleString('en-IN')}</span>
                            </div>
                          ))
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
                        className="flex items-center justify-center gap-1.5 bg-[#F8B319] hover:bg-amber-500 text-[#113C2B] px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors">
                        <Printer className="w-3.5 h-3.5" /> Print Invoice
                      </button>
                      <button onClick={() => openInvoice(order)}
                        className="flex items-center justify-center gap-1.5 bg-[#113C2B] hover:bg-[#1A4B3A] text-white px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors">
                        <FileText className="w-3.5 h-3.5" /> View Invoice
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
