import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingBag, 
  Package, 
  Truck, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Eye, 
  ExternalLink,
  Search,
  Filter,
  RefreshCcw,
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CustomerOrdersPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/auth/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.orders || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Unable to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Truck className="w-3.5 h-3.5 text-blue-600" /> Shipped
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Processing
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
            <Clock className="w-3.5 h-3.5 text-yellow-600" /> Pending Confirmation
          </span>
        );
    }
  };

  // Filter & Search logic
  const filteredOrders = orders.filter((order) => {
    const orderNo = (order.order_number || `GB-${order.id}`).toLowerCase();
    const matchesSearch = orderNo.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (order.status || 'pending').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8dfc8] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#113C2B]">My Orders</h2>
          <p className="text-xs text-gray-500 mt-1">
            Track real-time shipment status, inspect past items, and view receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FDF9F1] border border-[#e8dfc8] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#113C2B]"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 bg-[#FDF9F1] border border-[#e8dfc8] rounded-xl text-xs font-semibold text-[#113C2B] focus:outline-none focus:ring-2 focus:ring-[#113C2B]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button
            onClick={fetchOrders}
            className="p-2 border border-[#e8dfc8] rounded-xl hover:bg-[#FDF9F1] text-gray-600 transition-colors"
            title="Refresh Orders"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-[#e8dfc8] shadow-sm flex flex-col items-center justify-center min-h-[350px]">
          <div className="w-10 h-10 border-4 border-[#113C2B] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-[#113C2B] font-medium text-xs">Fetching your orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#e8dfc8] shadow-sm text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#FAF4E6] border border-[#eedfc0] flex items-center justify-center mx-auto mb-4 text-[#113C2B]">
            <ShoppingBag className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#113C2B]">No orders found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'No orders match your filter criteria. Try resetting filters.'
              : 'You have not placed any orders yet. Discover authentic Andhra homemade goodness today!'}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#113C2B] text-white rounded-xl text-xs font-bold hover:bg-[#1A4B3A] transition-all shadow-md"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            let items = [];
            try {
              items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
            } catch (e) {
              items = [];
            }

            const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e8dfc8] shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                {/* Top row of card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0e8d5]">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-serif font-bold text-base text-[#113C2B]">
                      #{order.order_number || `GB-${order.id}`}
                    </span>
                    {getStatusBadge(order.status)}
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF4E6] hover:bg-[#f3e7ce] text-[#113C2B] rounded-xl text-xs font-bold border border-[#eedfc0] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>

                {/* Items preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.product?.image_url || item.image ? (
                            <img
                              src={item.product?.image_url || item.image}
                              alt={item.product?.name || item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-gray-800 truncate">
                            {item.product?.name || item.name || 'Traditional Andhra Item'}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Qty: {item.qty || 1} {item.variant?.size ? `• Size: ${item.variant.size}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <p className="text-[11px] text-gray-400 italic">
                        + {items.length - 3} more item{items.length - 3 !== 1 ? 's' : ''} in this order
                      </p>
                    )}
                  </div>

                  {/* Summary / Delivery Details */}
                  <div className="flex flex-col justify-between p-3.5 rounded-2xl bg-[#FDF9F1] border border-[#eedfc0] text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Payment Mode</span>
                      <span className="font-bold uppercase tracking-wider text-[#113C2B]">
                        {order.payment_method || 'Online / Razorpay'}
                      </span>
                    </div>

                    {order.tracking_id && (
                      <div className="flex justify-between items-center text-emerald-700">
                        <span className="font-medium flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" /> Tracking ID
                        </span>
                        {order.tracking_link ? (
                          <a
                            href={order.tracking_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold underline hover:text-emerald-900 flex items-center gap-1"
                          >
                            {order.tracking_id} <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="font-mono font-bold">{order.tracking_id}</span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-[#eedfc0]">
                      <span className="font-bold text-gray-700">Total Paid</span>
                      <span className="font-bold text-sm text-[#113C2B]">
                        ₹{parseFloat(order.total || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#e8dfc8] shadow-2xl p-6 sm:p-8 space-y-6"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#f0e8d5]">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Order Information</span>
                  <h3 className="text-xl font-serif font-bold text-[#113C2B]">
                    #{selectedOrder.order_number || `GB-${selectedOrder.id}`}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status and summary */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF4E6] p-4 rounded-2xl border border-[#eedfc0]">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Order Status</p>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Placed At</p>
                  <p className="text-xs font-bold text-[#113C2B] mt-1">
                    {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Payment</p>
                  <p className="text-xs font-bold text-[#113C2B] mt-1 uppercase">
                    {selectedOrder.payment_method || 'Prepaid'}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-[#113C2B] text-sm">Ordered Items</h4>
                <div className="divide-y divide-[#f0e8d5] border border-[#f0e8d5] rounded-2xl p-4 bg-[#FDF9F1]">
                  {(() => {
                    let items = [];
                    try {
                      items = typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items) : (selectedOrder.items || []);
                    } catch (e) {
                      items = [];
                    }
                    return items.map((item, idx) => (
                      <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white border border-[#eedfc0] overflow-hidden shrink-0 flex items-center justify-center">
                            {item.product?.image_url || item.image ? (
                              <img
                                src={item.product?.image_url || item.image}
                                alt={item.product?.name || item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#113C2B]">
                              {item.product?.name || item.name}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              Qty: {item.qty || 1} {item.variant?.size ? `• Weight: ${item.variant.size}` : ''}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-[#113C2B]">
                          ₹{(parseFloat(item.price || item.product?.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}
                        </p>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-[#113C2B] text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700" /> Delivery Address
                </h4>
                {(() => {
                  let addr = {};
                  try {
                    addr = typeof selectedOrder.address === 'string' ? JSON.parse(selectedOrder.address) : (selectedOrder.address || {});
                  } catch (e) {
                    addr = {};
                  }
                  return (
                    <div className="p-4 rounded-2xl bg-white border border-[#e8dfc8] text-xs text-gray-600 space-y-1">
                      <p className="font-bold text-[#113C2B]">{addr.name || 'Customer'}</p>
                      <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                      <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="font-medium text-gray-500 pt-1">Phone: {addr.mobile || addr.phone || 'N/A'}</p>
                    </div>
                  );
                })()}
              </div>

              {/* Price Breakdown */}
              <div className="bg-[#FAF4E6] p-4 rounded-2xl border border-[#eedfc0] text-xs space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee</span>
                  <span>{parseFloat(selectedOrder.shipping_fee || 0) > 0 ? `₹${selectedOrder.shipping_fee}` : 'FREE'}</span>
                </div>
                {parseFloat(selectedOrder.discount_amount || 0) > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount Applied ({selectedOrder.coupon_code || 'Promo'})</span>
                    <span>-₹{parseFloat(selectedOrder.discount_amount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-[#113C2B] pt-2 border-t border-[#eedfc0]">
                  <span>Total Amount</span>
                  <span>₹{parseFloat(selectedOrder.total || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2.5 bg-[#113C2B] text-white rounded-xl text-xs font-bold hover:bg-[#1A4B3A] transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CustomerOrdersPage;
