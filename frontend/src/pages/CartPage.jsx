import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const shipping = subtotal > 999 ? 0 : 50;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center mb-6"
        >
          <ShoppingBag className="w-16 h-16 text-[#F8B319]" />
        </motion.div>
        <h2 className="text-3xl font-serif font-bold text-[#113C2B] mb-3">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">Looks like you haven't added any authentic Andhra delicacies to your cart yet.</p>
        <Link to="/products" className="px-8 py-3 bg-[#113C2B] hover:bg-[#1A4B3A] text-white font-bold rounded-full transition-transform hover:-translate-y-1">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-[#113C2B] mb-2">Shopping Cart</h1>
        <p className="text-gray-500">You have {cartItems.length} items in your cart</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Cart Items List */}
        <div className="w-full lg:w-2/3 space-y-6">
          {cartItems.map((item, idx) => (
            <motion.div 
              key={`${item.id}-${item.size || item.weight}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col sm:flex-row items-center gap-6 bg-white p-5 rounded-2xl shadow-sm border border-[#e8dfc8]"
            >
              <Link to={`/product/${item.id}`} className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-[#FDF9F1] overflow-hidden flex-shrink-0 hover:opacity-90 transition-opacity">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
              </Link>
              
              <div className="flex-1 w-full text-center sm:text-left">
                <Link to={`/product/${item.id}`} className="hover:text-[#F8B319] transition-colors">
                  <h3 className="text-xl font-bold text-[#113C2B] mb-1">{item.name}</h3>
                </Link>
                <p className="text-sm text-gray-500 mb-4">Weight: {item.weight || item.size}</p>
                
                <div className="flex items-center justify-center sm:justify-between w-full flex-wrap gap-4">
                  <div className="text-xl font-black text-[#113C2B]">₹{item.price}</div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-[#FDF9F1] rounded-full border border-[#e8dfc8] overflow-hidden">
                      <button onClick={() => updateQuantity(item.id, item.size || item.weight, -1)} className="p-2 hover:bg-[#F8B319] hover:text-white transition-colors text-gray-600">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold text-[#113C2B]">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.size || item.weight, 1)} className="p-2 hover:bg-[#F8B319] hover:text-white transition-colors text-gray-600">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id, item.size || item.weight)} 
                      className="w-10 h-10 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full lg:w-1/3"
        >
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-[#e8dfc8] sticky top-32">
            <h2 className="text-2xl font-serif font-bold text-[#113C2B] mb-6 border-b border-gray-100 pb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartItems.length} items)</span>
                <span className="font-medium text-[#113C2B]">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium text-[#113C2B]">
                  {shipping === 0 ? <span className="text-green-600 font-bold">Free</span> : `₹${shipping}`}
                </span>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-6 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-[#113C2B]">Total Amount</span>
                <span className="text-3xl font-black text-[#F8B319]">₹{total}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1 text-right">Inclusive of all taxes</p>
            </div>
            
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-[#113C2B] hover:bg-[#1A4B3A] text-white font-bold text-lg py-4 rounded-xl transition-all transform hover:-translate-y-1 shadow-md flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>
            
            {shipping > 0 && (
              <p className="text-sm text-center text-gray-500 mt-4">
                Add items worth ₹{1000 - subtotal} more for <span className="text-[#F8B319] font-bold">Free Shipping</span>!
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CartPage;
