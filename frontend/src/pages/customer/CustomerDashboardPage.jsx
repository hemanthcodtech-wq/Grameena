import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingBag, 
  Tag, 
  MapPin, 
  Clock, 
  ChevronRight, 
  ArrowUpRight, 
  Package, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Truck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CustomerDashboardPage = () => {
  const { user, token } = useAuth();
  const [data, setData] = useState({
    orders: [],
    addresses: [],
    coupons: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [profileRes, couponsRes] = await Promise.allSettled([
          axios.get(`${API_URL}/api/auth/profile`, config),
          axios.get(`${API_URL}/api/auth/my-coupons`, config)
        ]);

        const orders = profileRes.status === 'fulfilled' ? profileRes.value.data?.orders || [] : [];
        const addresses = profileRes.status === 'fulfilled' ? profileRes.value.data?.addresses || [] : [];
        const coupons = couponsRes.status === 'fulfilled' ? couponsRes.value.data?.coupons || [] : [];

        setData({
          orders,
          addresses,
          coupons,
          loading: false,
          error: null
        });
      } catch (err) {
        setData(prev => ({ ...prev, loading: false, error: 'Failed to load dashboard' }));
      }
    };

    if (token) fetchDashboardData();
  }, [token]);

  const recentOrders = data.orders.slice(0, 3);
  const defaultAddress = data.addresses.find(a => a.is_default) || data.addresses[0];
  const activeCouponsCount = data.coupons.length;

  const totalSpent = data.orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  if (data.loading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-[#e8dfc8] shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#113C2B] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#113C2B] font-medium text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#113C2B] via-[#164e38] to-[#0d2d20] rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
          <Sparkles className="w-64 h-64 text-yellow-300" />
        </div>
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F8B319]/20 text-[#F8B319] border border-[#F8B319]/30 mb-3">
            ✨ Grameena Club Member
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
            Authentic Flavors, Direct From The Village.
          </h2>
          <p className="text-sm text-white/80 mt-2 leading-relaxed">
            Every pickle, spice blend, and cold-pressed oil in your orders is crafted in traditional Andhra kitchens with purity and care.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F8B319] text-[#113C2B] rounded-xl text-sm font-bold hover:bg-[#e2a214] transition-all shadow-md"
            >
              <span>Explore Shop</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              to="/account/orders"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold backdrop-blur-sm border border-white/20 transition-all"
            >
              <span>View Orders ({data.orders.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-[#e8dfc8] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Orders</p>
            <p className="text-3xl font-serif font-bold text-[#113C2B] mt-1">{data.orders.length}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">₹{totalSpent.toLocaleString('en-IN')} lifetime value</p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-[#113C2B]/5 text-[#113C2B] flex items-center justify-center p-3 border border-[#113C2B]/10">
            <ShoppingBag className="w-7 h-7 text-[#113C2B]" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#e8dfc8] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Coupons</p>
            <p className="text-3xl font-serif font-bold text-[#d97706] mt-1">{activeCouponsCount}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">Ready to apply at checkout</p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center p-3 border border-amber-200">
            <Tag className="w-7 h-7 text-amber-600" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#e8dfc8] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Saved Addresses</p>
            <p className="text-3xl font-serif font-bold text-[#113C2B] mt-1">{data.addresses.length}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">{defaultAddress ? `${defaultAddress.city}, ${defaultAddress.state}` : 'No address saved'}</p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center p-3 border border-emerald-200">
            <MapPin className="w-7 h-7 text-emerald-700" />
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8dfc8] shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#113C2B]">Recent Orders</h3>
            <p className="text-xs text-gray-500">Track and manage your most recent purchases</p>
          </div>
          <Link
            to="/account/orders"
            className="text-xs font-bold text-[#d97706] hover:text-[#b45309] flex items-center gap-1 group"
          >
            <span>See All Orders</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-[#e8dfc8] rounded-2xl">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-60" />
            <h4 className="font-bold text-[#113C2B] text-base">No orders yet</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
              Explore authentic homemade pickles, traditional sweets, and wood-pressed oils.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#113C2B] text-white rounded-xl text-xs font-bold hover:bg-[#1A4B3A] transition-all shadow-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#f0e8d5]">
            {recentOrders.map((order) => {
              let items = [];
              try {
                items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
              } catch (e) {
                items = [];
              }

              const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              return (
                <div key={order.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF4E6] border border-[#eedfc0] flex items-center justify-center shrink-0 text-[#113C2B]">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#113C2B]">
                          #{order.order_number || `GB-${order.id}`}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                          {order.status ? order.status.toUpperCase() : 'PENDING'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Placed on {formattedDate} • {items.length} item{items.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs font-medium text-gray-700 mt-1 line-clamp-1">
                        {items.map(i => i.product?.name || i.name).filter(Boolean).join(', ') || 'Traditional Andhra Products'}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                    <p className="text-base font-bold text-[#113C2B]">
                      ₹{parseFloat(order.total || 0).toLocaleString('en-IN')}
                    </p>
                    <Link
                      to="/account/orders"
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      <span>Track Order</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Grid: Quick summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Default Shipping Address */}
        <div className="bg-white rounded-3xl p-6 border border-[#e8dfc8] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <h3 className="font-serif font-bold text-[#113C2B] text-base">Default Delivery Address</h3>
              </div>
              <Link to="/account/addresses" className="text-xs font-bold text-orange-600 hover:underline">
                Manage
              </Link>
            </div>

            {defaultAddress ? (
              <div className="bg-[#FDF9F1] p-4 rounded-2xl border border-[#eedfc0] text-xs text-gray-700 space-y-1">
                <p className="font-bold text-sm text-[#113C2B]">{defaultAddress.name}</p>
                <p>{defaultAddress.line1}{defaultAddress.line2 ? `, ${defaultAddress.line2}` : ''}</p>
                <p>{defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}</p>
                <p className="font-medium text-gray-500 pt-1">Phone: {defaultAddress.mobile}</p>
              </div>
            ) : (
              <div className="bg-[#FDF9F1] p-4 rounded-2xl border border-dashed border-[#eedfc0] text-center text-xs text-gray-500 py-6">
                <p>No default address saved yet.</p>
                <Link to="/account/addresses" className="inline-block mt-2 font-bold text-orange-600 hover:underline">
                  + Add Address Now
                </Link>
              </div>
            )}
          </div>

          <p className="text-[11px] text-gray-400 mt-4 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-emerald-600" /> Delivers safely via trusted Andhra express logistics
          </p>
        </div>

        {/* Exclusive Coupons Snippet */}
        <div className="bg-white rounded-3xl p-6 border border-[#e8dfc8] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#d97706]" />
                <h3 className="font-serif font-bold text-[#113C2B] text-base">Featured Coupons</h3>
              </div>
              <Link to="/account/coupons" className="text-xs font-bold text-orange-600 hover:underline">
                View All
              </Link>
            </div>

            {data.coupons.length > 0 ? (
              <div className="space-y-2.5">
                {data.coupons.slice(0, 2).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 border border-amber-200">
                    <div>
                      <span className="font-mono font-bold text-sm text-[#113C2B] bg-white px-2.5 py-0.5 rounded-lg border border-amber-300 shadow-xs">
                        {c.code}
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        {c.discount_type === 'percentage' ? `${parseFloat(c.discount_value)}% OFF` : `₹${parseFloat(c.discount_value)} OFF`}
                        {c.min_order_value > 0 ? ` on orders above ₹${c.min_order_value}` : ''}
                      </p>
                    </div>
                    <Link
                      to="/account/coupons"
                      className="text-xs font-bold text-[#113C2B] hover:text-[#d97706] px-3 py-1 bg-white rounded-xl border border-amber-200 shadow-2xs"
                    >
                      Copy
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#FDF9F1] p-4 rounded-2xl border border-dashed border-[#eedfc0] text-center text-xs text-gray-500 py-6">
                <p>No active coupons right now.</p>
                <p className="text-[10px] text-gray-400 mt-1">Check back during festive seasons!</p>
              </div>
            )}
          </div>

          <p className="text-[11px] text-gray-400 mt-4 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-amber-500" /> Apply valid coupons at checkout for instant savings
          </p>
        </div>

      </div>

    </div>
  );
};

export default CustomerDashboardPage;
