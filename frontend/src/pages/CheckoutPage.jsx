import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, MapPin, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });

  const shipping = subtotal > 999 ? 0 : 50;
  const total = subtotal + shipping;

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const loadRazorpay = async () => {
    try {
      setIsProcessing(true);
      
      // 1. Create order in backend
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payment/create-order`, {
        amount: total,
        items: cartItems,
        address: address
      });

      const orderData = res.data;

      // 1.5 Fetch key
      const keyRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payment/get-key`);

      // 2. Initialize Razorpay
      const options = {
        key: keyRes.data.key || 'rzp_test_YOUR_KEY_HERE', // Get from backend
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Grameena Bharatham',
        description: 'Authentic Traditional Food',
        image: 'https://via.placeholder.com/150?text=Logo', // Replace with actual logo URL
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payment/verify-payment`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderData.db_order_id
            });
            
            if (verifyRes.data.success) {
              clearCart();
              alert('Payment Successful! Order placed.');
              navigate('/');
            } else {
              alert('Payment verification failed.');
            }
          } catch (err) {
            console.error(err);
            alert('Error verifying payment.');
          }
        },
        prefill: {
          name: `${address.firstName} ${address.lastName}`,
          email: address.email,
          contact: address.phone
        },
        theme: {
          color: '#113C2B'
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response){
        alert(`Payment failed: ${response.error.description}`);
      });
      
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Failed to initiate payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address.firstName || !address.phone || !address.street || !address.city || !address.pincode) {
      alert("Please fill all required fields.");
      return;
    }
    loadRazorpay();
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 bg-[#FDF9F1] min-h-screen">
      
      <Link to="/cart" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#F8B319] transition-colors font-medium mb-8">
        <ArrowLeft className="w-5 h-5" /> Back to Cart
      </Link>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Checkout Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full lg:w-2/3"
        >
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#e8dfc8] mb-8">
            <h2 className="text-2xl font-serif font-bold text-[#113C2B] mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#113C2B]/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-[#113C2B]" />
              </div>
              Contact Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">First Name *</label>
                <input type="text" value={address.firstName} onChange={e=>setAddress({...address, firstName: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none transition-all" placeholder="Enter first name" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                <input type="text" value={address.lastName} onChange={e=>setAddress({...address, lastName: e.target.value})} className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none transition-all" placeholder="Enter last name" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                <input type="tel" value={address.phone} onChange={e=>setAddress({...address, phone: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none transition-all" placeholder="+91" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input type="email" value={address.email} onChange={e=>setAddress({...address, email: e.target.value})} className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none transition-all" placeholder="you@example.com" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#e8dfc8]">
            <h2 className="text-2xl font-serif font-bold text-[#113C2B] mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#113C2B]/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-[#113C2B]" />
              </div>
              Delivery Address
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Street Address *</label>
                <input type="text" value={address.street} onChange={e=>setAddress({...address, street: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none transition-all" placeholder="House number and street name" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                  <input type="text" value={address.city} onChange={e=>setAddress({...address, city: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none transition-all" placeholder="City" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">State *</label>
                  <select required value={address.state} onChange={e=>setAddress({...address, state: e.target.value})} className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none transition-all">
                    <option value="">Select State</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Karnataka">Karnataka</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">PIN Code *</label>
                  <input type="text" value={address.pincode} onChange={e=>setAddress({...address, pincode: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none transition-all" placeholder="e.g. 520006" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Order Summary Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-1/3"
        >
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-[#e8dfc8] sticky top-8">
            <h2 className="text-xl font-serif font-bold text-[#113C2B] mb-6 border-b border-gray-100 pb-4">Order Summary (INR)</h2>
            
            <div className="space-y-4 max-h-[30vh] overflow-y-auto mb-6 pr-2">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-16 h-16 bg-[#FDF9F1] rounded-xl border border-[#e8dfc8] p-1 shrink-0 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#113C2B] line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} | {item.size || item.weight}</p>
                    <p className="text-sm font-bold text-[#F8B319] mt-1">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-[#e8dfc8] pt-4 mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Items Subtotal</span>
                <span className="font-medium text-[#113C2B]">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Shipping Fee</span>
                <span className="font-medium text-[#113C2B]">{shipping === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${shipping.toFixed(2)}`}</span>
              </div>
              
              <div className="flex justify-between items-end mt-4 pt-4 border-t border-[#e8dfc8]">
                <span className="text-lg font-bold text-[#113C2B]">Grand Total</span>
                <span className="text-2xl font-black text-[#F8B319]">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-800">100% Secure Checkout</p>
                <p className="text-xs text-green-600 mt-1 leading-relaxed">Your payment details are fully encrypted by Razorpay.</p>
              </div>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={isProcessing}
              className={`w-full font-bold text-base py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                isProcessing 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-[#113C2B] hover:bg-[#1A4B3A] text-[#F8B319] transform hover:-translate-y-1'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-[#F8B319]/20 border-t-[#F8B319] rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" /> Pay via Razorpay
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default CheckoutPage;
