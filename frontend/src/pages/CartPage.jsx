import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  Heart, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Tag, 
  ChevronRight,
  Leaf,
  CheckCircle2,
  Clock,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart, subtotal, totalItems } = useCart();
  const { addToWishlist } = useWishlist();

  // Free shipping threshold: ₹999
  const freeShippingThreshold = 999;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const shipping = subtotal >= freeShippingThreshold ? 0 : 50;
  const total = subtotal + shipping;

  const [savingForLater, setSavingForLater] = useState({});

  const handleSaveToWishlist = (item) => {
    addToWishlist({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image,
      weight: item.weight || item.size || 'Standard',
      sizes: item.sizes || []
    });

    setSavingForLater(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      removeFromCart(item.id, item.size || item.weight);
    }, 600);
  };

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="w-full min-h-[75vh] bg-[#FDF9F1] flex flex-col items-center justify-center px-4 py-16">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="relative mb-8"
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40 bg-amber-50 rounded-full flex items-center justify-center shadow-inner border border-amber-200/60">
            <ShoppingBag className="w-16 h-16 sm:w-20 sm:h-20 text-[#113C2B]" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#F8B319] p-3 rounded-full text-[#113C2B] shadow-md animate-bounce">
            <Sparkles className="w-6 h-6" />
          </div>
        </motion.div>

        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#113C2B] mb-3 text-center">
          Your Cart is Empty
        </h2>
        <p className="text-gray-500 mb-8 text-center max-w-md text-sm sm:text-base leading-relaxed">
          Looks like you haven't added any authentic Andhra pickles, cold-pressed oils, or crunchy snacks to your cart yet.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            to="/products" 
            className="px-8 py-3.5 bg-[#113C2B] hover:bg-[#1A4B3A] text-white font-bold rounded-xl transition-all shadow-lg hover:-translate-y-0.5 text-center flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Start Shopping
          </Link>
          <Link 
            to="/wishlist" 
            className="px-8 py-3.5 bg-white hover:bg-gray-50 text-[#113C2B] font-bold rounded-xl border border-[#e8dfc8] transition-all text-center flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4 text-red-500 fill-red-500/20" /> View Saved Wishlist
          </Link>
        </div>

        {/* Benefits bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full mt-16 pt-10 border-t border-[#e8dfc8]">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-emerald-100/60 text-emerald-800 flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5 text-[#113C2B]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#113C2B]">100% Traditional</p>
              <p className="text-[11px] text-gray-400">Zero chemical preservatives</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-amber-100/60 text-amber-800 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#F8B319]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#113C2B]">Free Delivery &gt; ₹999</p>
              <p className="text-[11px] text-gray-400">Doorstep across India</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-blue-100/60 text-blue-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#113C2B]">Airtight Packaging</p>
              <p className="text-[11px] text-gray-400">Leakproof food-grade containers</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FDF9F1] py-10 md:py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center text-xs font-semibold text-gray-400 mb-6 space-x-2">
          <Link to="/" className="text-[#113C2B] hover:text-[#F8B319] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/products" className="text-[#113C2B] hover:text-[#F8B319] transition-colors">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-500 font-bold">Shopping Cart</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#113C2B] mb-2">
              Shopping Cart
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              You have <span className="font-extrabold text-[#113C2B]">{totalItems}</span> {totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/products"
              className="text-xs sm:text-sm font-bold text-[#113C2B] hover:text-[#F8B319] transition-colors flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" /> Continue Shopping
            </Link>
            <span className="text-gray-300">|</span>
            <button
              onClick={clearCart}
              className="text-xs sm:text-sm font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" /> Clear Cart
            </button>
          </div>
        </div>

        {/* Free Shipping Progress Indicator Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-[#e8dfc8] shadow-sm mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${shipping === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-[#113C2B]'}`}>
                {shipping === 0 ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Truck className="w-4 h-4 text-[#F8B319]" />}
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#113C2B]">
                {shipping === 0 ? (
                  <span className="text-emerald-700 font-extrabold">🎉 You unlocked FREE Doorstep Delivery!</span>
                ) : (
                  <>Add <span className="text-[#F8B319] font-black">₹{remainingForFreeShipping}</span> more to get <span className="underline decoration-[#F8B319] decoration-2">FREE Delivery</span></>
                )}
              </p>
            </div>
            <span className="text-xs font-bold text-gray-500">
              Threshold: ₹{freeShippingThreshold}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${shippingProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full transition-all ${shipping === 0 ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#F8B319] to-emerald-600'}`}
            />
          </div>
        </motion.div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* LEFT: CART ITEMS LIST */}
          <div className="w-full lg:w-2/3 space-y-4 sm:space-y-6">
            <AnimatePresence>
              {cartItems.map((item, idx) => (
                <motion.div 
                  key={`${item.id}-${item.size || item.weight}`}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-[#e8dfc8] hover:shadow-md transition-shadow relative group flex flex-col sm:flex-row items-start sm:items-center gap-5"
                >
                  {/* Thumbnail */}
                  <Link 
                    to={`/product/${item.id}`} 
                    className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-[#FDF9F1] border border-[#e8dfc8] overflow-hidden flex-shrink-0 relative group/img block"
                  >
                    <img 
                      src={item.image || '/images/pickles.jpg'} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/pickles.jpg';
                      }}
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 w-full min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <Link 
                        to={`/product/${item.id}`} 
                        className="font-serif font-bold text-lg sm:text-xl text-[#113C2B] hover:text-[#F8B319] transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <div className="text-lg sm:text-xl font-black text-[#113C2B] sm:text-right">
                        ₹{(parseFloat(item.price) || 0) * item.quantity}
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                      <span className="font-semibold text-gray-600">Pack: {item.weight || item.size || 'Standard'}</span>
                      <span>•</span>
                      <span className="text-[#113C2B] font-bold">₹{item.price} each</span>
                    </p>

                    {/* Bottom Controls */}
                    <div className="flex items-center justify-between gap-4 pt-3 border-t border-gray-100 flex-wrap">
                      
                      {/* Counter */}
                      <div className="flex items-center bg-[#FDF9F1] rounded-xl border border-[#e8dfc8] overflow-hidden shadow-inner">
                        <button 
                          onClick={() => updateQuantity(item.id, item.size || item.weight, -1)} 
                          aria-label="Decrease quantity"
                          className="px-3 py-1.5 hover:bg-amber-100 text-gray-600 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center font-bold text-[#113C2B] text-sm">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.size || item.weight, 1)} 
                          aria-label="Increase quantity"
                          className="px-3 py-1.5 hover:bg-amber-100 text-gray-600 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Action links */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleSaveToWishlist(item)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5" /> Save to Wishlist
                        </button>
                        <span className="text-gray-300">|</span>
                        <button 
                          onClick={() => removeFromCart(item.id, item.size || item.weight)} 
                          className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>

                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Quality Promise Card */}
            <div className="p-5 bg-white rounded-3xl border border-[#e8dfc8] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#F8B319] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#113C2B]">100% Traditional Grameena Recipes</h4>
                  <p className="text-[11px] text-gray-400">Prepared fresh, slow-cooked in small artisanal batches with cold-pressed oils.</p>
                </div>
              </div>
              <Link 
                to="/about"
                className="text-xs font-bold text-[#113C2B] hover:text-[#F8B319] transition-colors whitespace-nowrap"
              >
                Our Story &rarr;
              </Link>
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY (STICKY) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full lg:w-1/3"
          >
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[#e8dfc8] sticky top-28">
              <h2 className="text-2xl font-serif font-bold text-[#113C2B] mb-6 border-b border-gray-100 pb-4">
                Order Summary
              </h2>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Cart Items ({totalItems})</span>
                  <span className="font-semibold text-[#113C2B]">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Doorstep Shipping</span>
                  <span className="font-semibold text-[#113C2B]">
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `₹${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-gray-800">3 - 5 Days</span>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="border-t border-gray-100 pt-6 mb-8">
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-bold text-[#113C2B]">Total Payable</span>
                  <div className="text-right">
                    <span className="text-3xl font-serif font-black text-[#113C2B]">₹{total.toFixed(2)}</span>
                    <p className="text-[10px] text-gray-400 mt-0.5">Inclusive of GST & packaging</p>
                  </div>
                </div>
              </div>

              {/* Proceed to 3-Step Checkout Button */}
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-[#113C2B] hover:bg-[#1A4B3A] text-white font-bold text-base py-4 rounded-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg flex items-center justify-center gap-2 group mb-4"
              >
                Proceed to Checkout 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/50 flex items-center gap-2 text-xs text-[#113C2B]">
                <Tag className="w-4 h-4 text-[#F8B319] shrink-0" />
                <span>You can enter coupons & promo codes on the next step!</span>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-3 text-center">
                <div className="flex flex-col items-center p-2 rounded-xl bg-gray-50">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-[10px] font-bold text-gray-700">100% Safe Payments</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-xl bg-gray-50">
                  <Truck className="w-4 h-4 text-[#113C2B] mb-1" />
                  <span className="text-[10px] font-bold text-gray-700">Fast Shipping</span>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;
