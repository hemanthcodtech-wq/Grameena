import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  ShoppingBag, 
  Package, 
  Truck, 
  ArrowRight, 
  Copy, 
  Check, 
  MapPin, 
  Calendar,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  Home
} from 'lucide-react';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Retrieve state or fallback to local storage
  const orderDetails = location.state || (() => {
    try {
      const saved = localStorage.getItem('last_placed_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const orderNumber = orderDetails?.orderNumber || 'GB-' + Math.floor(100000 + Math.random() * 900000);
  const totalAmount = orderDetails?.total || orderDetails?.amount || 0;
  const address = orderDetails?.address || {};
  const items = orderDetails?.items || [];
  const paymentId = orderDetails?.paymentId || 'PAY_' + Math.floor(100000 + Math.random() * 900000);
  const orderDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const copyOrderNumber = () => {
    navigator.clipboard?.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#FDF9F1] py-12 md:py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Animated Success Badge & Header */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          {/* Success Check Icon with glowing ring */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <motion.div 
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="absolute inset-0 rounded-full bg-emerald-400 blur-xl"
            />
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#113C2B] text-[#F8B319] flex items-center justify-center shadow-2xl border-4 border-white">
              <CheckCircle2 className="w-14 h-14 sm:w-16 sm:h-16 stroke-[2.2] text-[#F8B319]" />
            </div>
            <motion.div 
              initial={{ rotate: -20, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute -top-2 -right-2 bg-[#F8B319] text-[#113C2B] p-2 rounded-full shadow-lg"
            >
              <Sparkles className="w-5 h-5 fill-current" />
            </motion.div>
          </div>

          <div className="inline-flex items-center gap-2 bg-emerald-100/80 text-[#113C2B] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3 border border-emerald-200">
            Payment Completed Successfully
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#113C2B] mb-3">
            Thank You for Your Order!
          </h1>
          <p className="text-gray-600 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
            Your authentic Andhra delicacies have been placed and will be freshly packed with love and traditional care.
          </p>
        </motion.div>

        {/* Order Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-[#e8dfc8] relative overflow-hidden mb-8"
        >
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#113C2B] via-[#F8B319] to-[#113C2B]"></div>

          {/* Order Details Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Order Reference</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-black text-[#113C2B] font-mono tracking-tight">{orderNumber}</span>
                <button 
                  onClick={copyOrderNumber}
                  title="Copy Order ID"
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-col sm:items-end gap-2 text-xs sm:text-sm">
              <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                <Calendar className="w-4 h-4 text-[#F8B319]" /> {orderDate}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Paid via Razorpay ({paymentId})
              </span>
            </div>
          </div>

          {/* Delivery & Estimated Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 p-5 bg-[#FDF9F1] rounded-2xl border border-[#ece3cf]">
            {/* Shipping Address */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#e8dfc8] text-[#113C2B] flex items-center justify-center shrink-0 shadow-sm">
                <MapPin className="w-5 h-5 text-[#113C2B]" />
              </div>
              <div className="text-xs sm:text-sm">
                <p className="font-bold text-[#113C2B] mb-1">Delivering To:</p>
                <p className="font-medium text-gray-800">
                  {address.firstName || address.name} {address.lastName || ''}
                </p>
                <p className="text-gray-600 leading-snug">
                  {address.street || address.line1}
                  {address.city ? `, ${address.city}` : ''}
                  {address.state ? `, ${address.state}` : ''}
                  {address.pincode ? ` - ${address.pincode}` : ''}
                </p>
                {address.phone && (
                  <p className="text-gray-500 mt-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> {address.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#e8dfc8] text-[#113C2B] flex items-center justify-center shrink-0 shadow-sm">
                <Truck className="w-5 h-5 text-[#F8B319]" />
              </div>
              <div className="text-xs sm:text-sm">
                <p className="font-bold text-[#113C2B] mb-1">Estimated Delivery:</p>
                <p className="font-semibold text-emerald-800 text-base">3 - 5 Business Days</p>
                <p className="text-gray-500 leading-relaxed text-xs mt-0.5">
                  We prepare our pickles & snacks in small, artisanal batches to ensure maximum fresh aroma and crunch.
                </p>
              </div>
            </div>
          </div>

          {/* Items Purchased List */}
          {items.length > 0 && (
            <div className="mb-8">
              <h3 className="font-serif font-bold text-[#113C2B] text-lg mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#F8B319]" /> Ordered Items ({items.length})
              </h3>
              <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto pr-2">
                {items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-[#FDF9F1] border border-[#e8dfc8] overflow-hidden shrink-0">
                        <img 
                          src={item.image || item.image_url || '/images/pickles.jpg'} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#113C2B] text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} | {item.size || item.weight || 'Standard'}</p>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-[#113C2B] shrink-0">
                      ₹{(parseFloat(item.price) || 0) * (item.quantity || 1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Summary */}
          <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
            <span className="font-bold text-gray-600 text-base">Total Amount Paid</span>
            <span className="font-serif font-black text-2xl sm:text-3xl text-[#113C2B]">₹{parseFloat(totalAmount).toFixed(2)}</span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#113C2B] hover:bg-[#1A4B3A] text-white font-bold rounded-2xl shadow-lg transition-all hover:-translate-y-0.5 text-base"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-[#113C2B] font-bold rounded-2xl border border-[#e8dfc8] shadow-sm transition-all text-base"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccessPage;
