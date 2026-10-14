import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Tag, 
  Copy, 
  Check, 
  Sparkles, 
  Calendar, 
  ShoppingBag, 
  AlertCircle, 
  Percent, 
  Coins,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CustomerCouponsPage = () => {
  const { token } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/auth/my-coupons`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCoupons(res.data.coupons || []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch coupons. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchCoupons();
  }, [token]);

  const copyToClipboard = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8dfc8] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#113C2B]">Available Coupons & Offers</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Apply these exclusive promo codes at checkout to save on pure Andhra homemade delicacies.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#113C2B] text-white rounded-xl text-xs font-bold hover:bg-[#1A4B3A] transition-all self-start md:self-auto shadow-sm"
        >
          <span>Use in Shop</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Coupons grid */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-[#e8dfc8] shadow-sm flex flex-col items-center justify-center min-h-[350px]">
          <div className="w-10 h-10 border-4 border-[#113C2B] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-[#113C2B] font-medium text-xs">Finding available discounts for you...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#e8dfc8] shadow-sm text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#FAF4E6] border border-[#eedfc0] flex items-center justify-center mx-auto mb-4 text-[#113C2B]">
            <Tag className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#113C2B]">No active coupons right now</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-6">
            We are working on bringing exciting festive deals and member offers soon. Stay tuned!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#113C2B] text-white rounded-xl text-xs font-bold hover:bg-[#1A4B3A] transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {coupons.map((coupon) => {
            const isCopied = copiedCode === coupon.code;
            const isPercentage = coupon.discount_type === 'percentage';
            const expiryDate = coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }) : 'No Expiry';

            return (
              <div
                key={coupon.id}
                className="bg-white rounded-3xl border border-[#eedfc0] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between relative group"
              >
                {/* Decorative cutouts on coupon sides */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FDF9F1] border-r border-[#eedfc0]" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FDF9F1] border-l border-[#eedfc0]" />

                {/* Top content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                        {isPercentage ? <Percent className="w-5 h-5" /> : <Coins className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="text-2xl font-serif font-bold text-[#113C2B]">
                          {isPercentage ? `${parseFloat(coupon.discount_value)}% OFF` : `₹${parseFloat(coupon.discount_value)} OFF`}
                        </span>
                        <p className="text-[11px] text-gray-500 font-medium">
                          {parseFloat(coupon.min_order_value) > 0
                            ? `On orders above ₹${parseFloat(coupon.min_order_value).toLocaleString('en-IN')}`
                            : 'No minimum order required'}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {coupon.usage_type === 'one_time' ? 'Single Use' : 'Unlimited'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {coupon.description || 'Enjoy traditional rural Andhra recipes crafted with cold-pressed oils and sun-dried spices.'}
                  </p>
                </div>

                {/* Bottom Bar: Coupon code & Copy button */}
                <div className="bg-[#FAF4E6]/80 p-4 border-t border-dashed border-[#eedfc0] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#113C2B] bg-white px-3 py-1.5 rounded-xl border border-dashed border-[#d97706] tracking-wider select-all">
                      {coupon.code}
                    </span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Valid till: {expiryDate}
                    </span>
                  </div>

                  <button
                    onClick={() => copyToClipboard(coupon.code)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isCopied
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-[#113C2B] text-white hover:bg-[#1A4B3A] shadow-xs'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Helpful terms alert */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-[#113C2B] flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">How to use coupons?</p>
          <p className="text-gray-600 mt-0.5 leading-relaxed">
            Copy your chosen coupon code and enter it during checkout in the Cart or Checkout screen to claim your discount instantly.
          </p>
        </div>
      </div>

    </div>
  );
};

export default CustomerCouponsPage;
