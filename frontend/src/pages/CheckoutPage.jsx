import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  CreditCard, 
  ShoppingBag, 
  Tag, 
  User, 
  UserCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Trash2, 
  Plus, 
  Minus, 
  Sparkles, 
  AlertCircle,
  Truck,
  Building,
  Check,
  Edit3,
  BookmarkCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, subtotal, clearCart } = useCart();

  // Current Step: 1 = Confirm Cart & Account, 2 = Coupons & Shipping Address, 3 = Payment
  const [currentStep, setCurrentStep] = useState(1);

  // Auth / Account Mode: 'authenticated', 'login', 'guest'
  const [storedUser, setStoredUser] = useState(() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState(() => (storedUser ? 'authenticated' : 'guest'));
  
  // Login Form States (for Step 1 if guest wants to log in inline)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Step 2: Coupons
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponValidating, setCouponValidating] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  // Step 2: Shipping Address
  const [address, setAddress] = useState({
    firstName: storedUser?.name?.split(' ')[0] || '',
    lastName: storedUser?.name?.split(' ').slice(1).join(' ') || '',
    phone: storedUser?.phone || '',
    email: storedUser?.email || '',
    street: '',
    city: '',
    state: 'Andhra Pradesh',
    pincode: '',
    notes: ''
  });

  // Saved Addresses list from user account
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [saveToAccount, setSaveToAccount] = useState(true);

  // Step 3: Payment
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Calculations
  const shippingFee = subtotal > 999 ? 0 : 50;
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Load Razorpay Script on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const orderCompletedRef = React.useRef(false);

  // Redirect if cart is empty on initial load
  useEffect(() => {
    if (cartItems.length === 0 && !orderCompletedRef.current) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Fetch saved addresses from backend if logged in
  const fetchUserAddresses = async (userToken) => {
    const authToken = userToken || localStorage.getItem('token');
    if (!authToken) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const addrs = res.data.addresses || [];
      setSavedAddresses(addrs);

      if (addrs.length > 0) {
        // Select default address or first address automatically
        const def = addrs.find(a => a.is_default) || addrs[0];
        setSelectedAddressId(def.id);
        setIsAddingNewAddress(false);
        setAddress(prev => ({
          ...prev,
          firstName: def.name?.split(' ')[0] || prev.firstName,
          lastName: def.name?.split(' ').slice(1).join(' ') || prev.lastName,
          phone: def.mobile || prev.phone,
          street: `${def.line1 || ''}${def.line2 ? ', ' + def.line2 : ''}`,
          city: def.city || prev.city,
          state: def.state || prev.state,
          pincode: def.pincode || prev.pincode,
          email: res.data.user?.email || prev.email
        }));
      } else {
        setIsAddingNewAddress(true);
      }
    } catch (err) {
      console.error('Failed to load user addresses:', err);
    }
  };

  useEffect(() => {
    if (storedUser) {
      fetchUserAddresses();
    }
  }, [storedUser]);

  // Fetch available coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/my-coupons`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAvailableCoupons(res.data.coupons || []);
        } else {
          // Provide some default display promos if guest
          setAvailableCoupons([
            { code: 'WELCOME10', discount_percentage: 10, min_order_value: 399, description: '10% off for authentic lovers' },
            { code: 'FESTIVE50', discount_value: 50, discount_type: 'fixed', min_order_value: 699, description: 'Flat ₹50 off on orders above ₹699' }
          ]);
        }
      } catch {
        setAvailableCoupons([
          { code: 'WELCOME10', discount_percentage: 10, min_order_value: 399, description: '10% off on your purchase' }
        ]);
      }
    };
    fetchCoupons();
  }, [storedUser]);

  // Select a saved address chip
  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setIsAddingNewAddress(false);
    setAddress(prev => ({
      ...prev,
      firstName: addr.name?.split(' ')[0] || prev.firstName,
      lastName: addr.name?.split(' ').slice(1).join(' ') || prev.lastName,
      phone: addr.mobile || prev.phone,
      street: `${addr.line1 || ''}${addr.line2 ? ', ' + addr.line2 : ''}`,
      city: addr.city || prev.city,
      state: addr.state || prev.state,
      pincode: addr.pincode || prev.pincode
    }));
  };

  // Switch to Add New Address form
  const handleAddNewAddressClick = () => {
    setSelectedAddressId('new');
    setIsAddingNewAddress(true);
    setAddress(prev => ({
      firstName: storedUser?.name?.split(' ')[0] || '',
      lastName: storedUser?.name?.split(' ').slice(1).join(' ') || '',
      phone: storedUser?.phone || '',
      email: storedUser?.email || prev.email,
      street: '',
      city: '',
      state: 'Andhra Pradesh',
      pincode: '',
      notes: ''
    }));
  };

  // Inline Login Handler in Step 1
  const handleInlineLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/login`, {
        email: loginEmail,
        password: loginPassword
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setStoredUser(res.data.user);
      setAuthMode('authenticated');
      setAddress(prev => ({
        ...prev,
        firstName: res.data.user.name?.split(' ')[0] || prev.firstName,
        lastName: res.data.user.name?.split(' ').slice(1).join(' ') || prev.lastName,
        email: res.data.user.email || prev.email,
        phone: res.data.user.phone || prev.phone
      }));
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Invalid credentials. Check email & password.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Step 2: Validate & Apply Coupon
  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponInput).trim();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    setCouponError('');
    setCouponSuccess('');
    setCouponValidating(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payment/validate-coupon`, {
        code,
        cartTotal: subtotal,
        userId: storedUser?.id || null,
        items: cartItems
      });

      if (res.data.valid) {
        setAppliedCoupon(res.data);
        setCouponSuccess(res.data.message || `Coupon ${code} applied successfully!`);
        setCouponInput(code);
      } else {
        setCouponError(res.data.message || 'Invalid coupon.');
      }
    } catch (err) {
      // Local fallback calculation if backend has custom restriction
      const matched = availableCoupons.find(c => c.code.toUpperCase() === code.toUpperCase());
      if (matched) {
        const minVal = parseFloat(matched.min_order_value || matched.min_purchase || 0);
        if (subtotal < minVal) {
          setCouponError(`Minimum cart value of ₹${minVal} required for coupon ${code}`);
        } else {
          const disc = matched.discount_percentage ? (subtotal * matched.discount_percentage) / 100 : (matched.discount_value || 50);
          setAppliedCoupon({
            code: matched.code,
            discount_amount: Math.min(disc, subtotal),
            message: `Coupon ${matched.code} applied!`
          });
          setCouponSuccess(`Coupon ${matched.code} applied! Saved ₹${Math.min(disc, subtotal)}`);
        }
      } else {
        setCouponError(err.response?.data?.message || 'Invalid or expired coupon code.');
      }
    } finally {
      setCouponValidating(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
    setCouponInput('');
  };

  // Step 3: Razorpay Payment Initiation & Execution
  const handleInitiateRazorpay = async () => {
    setIsProcessing(true);
    setPaymentError('');

    try {
      const keyRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payment/get-key`);
      const razorpayKey = keyRes.data.key;

      const orderPayload = {
        amount: grandTotal,
        items: cartItems,
        address: address,
        couponCode: appliedCoupon?.code || null,
        discountAmount: discountAmount,
        shippingFee: shippingFee,
        userId: storedUser?.id || null
      };

      const createOrderRes = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payment/create-order`,
        orderPayload
      );

      const orderData = createOrderRes.data;

      // If Razorpay keys are placeholder/demo or not configured in environment, complete smoothly
      if (orderData.is_demo_mode || !window.Razorpay || !razorpayKey || razorpayKey === 'your_razorpay_key_id') {
        const verifyRes = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payment/verify-payment`, {
          order_id: orderData.db_order_id,
          razorpay_order_id: orderData.id,
          razorpay_payment_id: `DEMO_PAY_${Date.now()}`,
          is_demo_mode: true
        });

        const orderInfo = {
          orderNumber: orderData.order_number || `GB-${Date.now()}`,
          total: grandTotal,
          items: [...cartItems],
          address: address,
          paymentId: `DEMO_PAY_${Date.now()}`,
          dbOrderId: orderData.db_order_id
        };

        localStorage.setItem('last_placed_order', JSON.stringify(orderInfo));
        orderCompletedRef.current = true;
        clearCart();
        navigate('/order-success', { state: orderInfo, replace: true });
        return;
      }

      // Live / Test Razorpay Modal Options
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Grameena Bharatham',
        description: 'Authentic Traditional Andhra Delicacies',
        image: 'https://via.placeholder.com/150?text=Grameena',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payment/verify-payment`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderData.db_order_id
            });

            if (verifyRes.data.success) {
              const orderInfo = {
                orderNumber: orderData.order_number || `GB-${Date.now()}`,
                total: grandTotal,
                items: [...cartItems],
                address: address,
                paymentId: response.razorpay_payment_id,
                dbOrderId: orderData.db_order_id
              };

              localStorage.setItem('last_placed_order', JSON.stringify(orderInfo));
              orderCompletedRef.current = true;
              clearCart();
              navigate('/order-success', { state: orderInfo, replace: true });
            } else {
              setPaymentError('Payment verification was not accepted. Please try again.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            setPaymentError('Payment was made, but server verification failed. Please contact support.');
          }
        },
        prefill: {
          name: `${address.firstName} ${address.lastName}`.trim(),
          email: address.email,
          contact: address.phone
        },
        theme: {
          color: '#113C2B'
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setPaymentError(`Payment failed: ${resp.error?.description || 'Transaction declined'}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError(err.response?.data?.error || 'Unable to initiate payment with Razorpay. Please retry.');
      setIsProcessing(false);
    }
  };

  const validateStep2AndProceed = async (e) => {
    e.preventDefault();
    if (!address.firstName.trim()) {
      alert('Please enter your first name.');
      return;
    }
    if (!address.phone.trim() || address.phone.length < 8) {
      alert('Please enter a valid phone number.');
      return;
    }
    if (!address.street.trim()) {
      alert('Please enter your street address.');
      return;
    }
    if (!address.city.trim()) {
      alert('Please enter your city.');
      return;
    }
    if (!address.pincode.trim() || address.pincode.length < 5) {
      alert('Please enter a valid postal PIN code.');
      return;
    }

    // If customer entered a new address and opted to save it to their account
    const token = localStorage.getItem('token');
    if (token && isAddingNewAddress && saveToAccount) {
      try {
        await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/address`, {
          name: `${address.firstName} ${address.lastName}`.trim(),
          mobile: address.phone,
          line1: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: 'India',
          is_default: savedAddresses.length === 0
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.warn('Could not save address to account:', err);
      }
    }

    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stepsList = [
    { number: 1, title: 'Cart & Account', desc: 'Confirm items & guest login' },
    { number: 2, title: 'Address & Coupons', desc: 'Discounts & shipping' },
    { number: 3, title: 'Payment', desc: 'Secure Razorpay checkout' }
  ];

  return (
    <div className="w-full min-h-screen bg-[#FDF9F1] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#113C2B] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Step {currentStep} of 3
          </span>
        </div>

        {/* 3-Step Progress Indicator Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#e8dfc8] shadow-sm mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stepsList.map((step) => {
              const isPassed = currentStep > step.number;
              const isCurrent = currentStep === step.number;

              return (
                <div 
                  key={step.number}
                  onClick={() => {
                    if (isPassed) setCurrentStep(step.number);
                  }}
                  className={`flex items-center gap-3.5 p-3 rounded-2xl transition-all ${
                    isCurrent 
                      ? 'bg-amber-50/80 border border-[#F8B319]/40' 
                      : isPassed 
                        ? 'cursor-pointer hover:bg-gray-50' 
                        : 'opacity-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                    isPassed 
                      ? 'bg-emerald-600 text-white' 
                      : isCurrent 
                        ? 'bg-[#113C2B] text-[#F8B319] shadow-md' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isPassed ? <CheckCircle2 className="w-5 h-5" /> : step.number}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-bold truncate ${isCurrent ? 'text-[#113C2B]' : 'text-gray-700'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Split: Form Steps Left, Order Summary Sticky Right */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* LEFT: STEP CONTENT */}
          <div className="w-full lg:w-2/3 space-y-6">
            
            {/* ================= STEP 1: CONFIRM CART & LOGIN / GUEST ================= */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* 1. Account Section */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e8dfc8] shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#113C2B] flex items-center gap-2">
                      <User className="w-5 h-5 text-[#F8B319]" /> 1. Customer Account
                    </h2>
                    {storedUser ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <UserCheck className="w-3.5 h-3.5" /> Logged In
                      </span>
                    ) : (
                      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setAuthMode('guest')}
                          className={`px-3 py-1.5 rounded-lg transition-all ${
                            authMode === 'guest' ? 'bg-white shadow text-[#113C2B]' : 'text-gray-500'
                          }`}
                        >
                          Guest Checkout
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthMode('login')}
                          className={`px-3 py-1.5 rounded-lg transition-all ${
                            authMode === 'login' ? 'bg-white shadow text-[#113C2B]' : 'text-gray-500'
                          }`}
                        >
                          Sign In
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Logged in View */}
                  {storedUser ? (
                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#113C2B] text-base">{storedUser.name}</p>
                        <p className="text-xs text-gray-500">{storedUser.email} {storedUser.phone ? `• ${storedUser.phone}` : ''}</p>
                      </div>
                      <button
                        onClick={() => {
                          localStorage.removeItem('token');
                          localStorage.removeItem('user');
                          setStoredUser(null);
                          setAuthMode('guest');
                        }}
                        className="text-xs font-bold text-red-500 hover:underline"
                      >
                        Change Account
                      </button>
                    </div>
                  ) : authMode === 'login' ? (
                    /* Inline Login Form */
                    <form onSubmit={handleInlineLogin} className="space-y-4">
                      {loginError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" /> {loginError}
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Email</label>
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#113C2B] outline-none text-sm"
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Password</label>
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter password"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#113C2B] outline-none text-sm pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="submit"
                          disabled={loginLoading}
                          className="px-6 py-2.5 bg-[#113C2B] hover:bg-[#1A4B3A] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
                        >
                          {loginLoading ? 'Signing in...' : 'Sign In & Continue'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthMode('guest')}
                          className="text-xs font-bold text-gray-500 hover:text-[#113C2B]"
                        >
                          Or continue as Guest
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Guest Mode Notice */
                    <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/60 flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-[#F8B319] shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm text-gray-700">
                        <p className="font-bold text-[#113C2B] mb-0.5">Continuing as Guest</p>
                        <p className="text-gray-500 leading-relaxed">
                          No account password required! You can order seamlessly by simply providing your contact and delivery address in the next step.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Confirm Cart Items Review */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e8dfc8] shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#113C2B] flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-[#F8B319]" /> 2. Confirm Cart Items ({cartItems.length})
                    </h2>
                    <span className="text-xs font-bold text-gray-400">Review Quantities</span>
                  </div>

                  <div className="space-y-4 divide-y divide-gray-100">
                    {cartItems.map((item) => (
                      <div key={`${item.id}-${item.size || item.weight}`} className="pt-4 first:pt-0 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div className="w-16 h-16 rounded-xl bg-[#FDF9F1] border border-[#e8dfc8] overflow-hidden shrink-0">
                            <img src={item.image || '/images/pickles.jpg'} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#113C2B] text-base">{item.name}</h4>
                            <p className="text-xs text-gray-400">Weight: {item.weight || item.size || 'Standard'}</p>
                            <p className="text-sm font-black text-[#113C2B] mt-0.5">₹{item.price}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                          {/* Quantity selector */}
                          <div className="flex items-center bg-[#FDF9F1] rounded-xl border border-[#e8dfc8] overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.size || item.weight, -1)}
                              className="px-2.5 py-1.5 hover:bg-amber-100 text-gray-700 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-bold text-[#113C2B]">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.size || item.weight, 1)}
                              className="px-2.5 py-1.5 hover:bg-amber-100 text-gray-700 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-base font-black text-[#113C2B] w-20 text-right">
                            ₹{(parseFloat(item.price) || 0) * item.quantity}
                          </span>

                          <button
                            onClick={() => removeFromCart(item.id, item.size || item.weight)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-400 text-center sm:text-left">
                      All products are freshly packed in food-grade airtight containers.
                    </p>
                    <button
                      onClick={() => {
                        setCurrentStep(2);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 sm:py-3.5 bg-[#113C2B] hover:bg-[#1A4B3A] text-white font-bold rounded-2xl sm:rounded-xl shadow-lg shadow-[#113C2B]/20 transition-all hover:-translate-y-0.5 active:scale-[0.98] text-base sm:text-sm tracking-wide"
                    >
                      <span>Proceed to Address & Coupons</span>
                      <ArrowRight className="w-4 h-4 text-[#F8B319]" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 2: COUPONS & SHIPPING ADDRESS ================= */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* 1. Coupons & Promo Codes Section */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e8dfc8] shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#113C2B] mb-2 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#F8B319]" /> Have a Coupon or Promo Code?
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mb-6">
                    Enter your coupon code below to unlock instant discounts on your order.
                  </p>

                  {/* Coupon Input Box */}
                  <div className="flex gap-2 max-w-lg mb-4">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="e.g. WELCOME10, FESTIVE50"
                        disabled={!!appliedCoupon}
                        className="w-full uppercase font-mono tracking-wider px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#113C2B] outline-none text-sm font-bold text-[#113C2B] placeholder:normal-case placeholder:font-sans"
                      />
                    </div>
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="px-5 py-3 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded-xl transition-colors border border-red-200"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        disabled={couponValidating || !couponInput.trim()}
                        className="px-6 py-3 bg-[#113C2B] hover:bg-[#1A4B3A] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm disabled:opacity-50"
                      >
                        {couponValidating ? 'Checking...' : 'Apply'}
                      </button>
                    )}
                  </div>

                  {/* Feedback Messages */}
                  {couponError && (
                    <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5 mb-4">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {couponError}
                    </p>
                  )}
                  {couponSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-between mb-4">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {couponSuccess}
                      </span>
                      <span className="text-emerald-900 font-extrabold">-₹{discountAmount}</span>
                    </div>
                  )}

                  {/* Available coupon chips */}
                  {availableCoupons.length > 0 && !appliedCoupon && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Available Coupons:</p>
                      <div className="flex flex-wrap gap-2">
                        {availableCoupons.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => handleApplyCoupon(c.code)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FDF9F1] hover:bg-amber-100/70 border border-[#e8dfc8] rounded-lg text-xs font-mono font-bold text-[#113C2B] transition-colors"
                          >
                            <Tag className="w-3 h-3 text-[#F8B319]" /> {c.code}
                            {c.discount_percentage ? ` (${c.discount_percentage}%)` : ` (₹${c.discount_value})`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Shipping Delivery Address Form */}
                <form onSubmit={validateStep2AndProceed} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e8dfc8] shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#113C2B] flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#F8B319]" /> Shipping & Delivery Address
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        Where should we deliver your authentic delicacies?
                      </p>
                    </div>

                    {/* If logged in with saved addresses, show + New Address button */}
                    {storedUser && (
                      <button
                        type="button"
                        onClick={handleAddNewAddressClick}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all self-start sm:self-auto border ${
                          isAddingNewAddress
                            ? 'bg-[#113C2B] text-[#F8B319] border-[#113C2B]'
                            : 'bg-[#FAF4E6] text-[#113C2B] hover:bg-[#eedfc0] border-[#eedfc0]'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New Address</span>
                      </button>
                    )}
                  </div>

                  {/* SAVED ADDRESSES CAROUSEL / CHIPS (For logged-in customers) */}
                  {storedUser && savedAddresses.length > 0 && (
                    <div className="mb-6 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <BookmarkCheck className="w-4 h-4 text-emerald-600" /> Select From Your Saved Addresses:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {savedAddresses.map((addr) => {
                          const isSelected = selectedAddressId === addr.id && !isAddingNewAddress;
                          return (
                            <div
                              key={addr.id}
                              onClick={() => handleSelectSavedAddress(addr)}
                              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                                isSelected
                                  ? 'border-[#113C2B] bg-[#FAF4E6] shadow-sm ring-2 ring-[#113C2B]/10'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="font-bold text-xs text-[#113C2B] truncate">{addr.name}</span>
                                  {addr.is_default && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1 font-medium">Ph: {addr.mobile}</p>
                              </div>

                              <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100 text-[10px] font-bold">
                                <span className={isSelected ? 'text-[#113C2B] flex items-center gap-1' : 'text-gray-400'}>
                                  {isSelected ? <><Check className="w-3 h-3 text-emerald-600" /> Deliver Here</> : 'Select'}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {/* + Option card */}
                        <div
                          onClick={handleAddNewAddressClick}
                          className={`p-3.5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center min-h-[105px] ${
                            isAddingNewAddress
                              ? 'border-[#113C2B] bg-emerald-50/50 text-[#113C2B]'
                              : 'border-gray-300 hover:border-[#113C2B] text-gray-500 hover:text-[#113C2B]'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-[#FAF4E6] flex items-center justify-center mb-1 text-[#113C2B]">
                            <Plus className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold">+ New Address</span>
                          <span className="text-[10px] text-gray-400">Enter custom destination</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FORM FIELDS: Shown when adding new address or for guests/custom edit */}
                  <div className={`space-y-4 pt-2 ${storedUser && !isAddingNewAddress && savedAddresses.length > 0 ? 'bg-gray-50/60 p-4 rounded-2xl border border-gray-200/80 mb-6' : ''}`}>
                    {storedUser && !isAddingNewAddress && savedAddresses.length > 0 && (
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                        <span className="text-xs font-bold text-gray-700">Delivery Details (Auto-filled from selection):</span>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewAddress(true)}
                          className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" /> Edit / Enter Custom
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">First Name *</label>
                        <input
                          type="text"
                          required
                          value={address.firstName}
                          onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                          placeholder="E.g. Sridevi"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-[#113C2B] outline-none text-sm font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Last Name</label>
                        <input
                          type="text"
                          value={address.lastName}
                          onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                          placeholder="E.g. Reddy"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-[#113C2B] outline-none text-sm font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Contact Phone *</label>
                        <input
                          type="tel"
                          required
                          value={address.phone}
                          onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-[#113C2B] outline-none text-sm font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Email Address</label>
                        <input
                          type="email"
                          value={address.email}
                          onChange={(e) => setAddress({ ...address, email: e.target.value })}
                          placeholder="you@example.com"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-[#113C2B] outline-none text-sm font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Street Address / House / Flat *</label>
                        <input
                          type="text"
                          required
                          value={address.street}
                          onChange={(e) => setAddress({ ...address, street: e.target.value })}
                          placeholder="Door number, apartment name, street name"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-[#113C2B] outline-none text-sm font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">City / Town *</label>
                          <input
                            type="text"
                            required
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            placeholder="e.g. Vijayawada"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-[#113C2B] outline-none text-sm font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">State *</label>
                          <select
                            value={address.state}
                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-[#113C2B] outline-none text-sm font-medium"
                          >
                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                            <option value="Telangana">Telangana</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Other">Other State</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">PIN Code *</label>
                          <input
                            type="text"
                            required
                            value={address.pincode}
                            onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                            placeholder="e.g. 520002"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-[#113C2B] outline-none text-sm font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save this address to profile checkbox (For logged in users adding new address) */}
                    {storedUser && isAddingNewAddress && (
                      <div className="pt-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="save_to_account"
                          checked={saveToAccount}
                          onChange={(e) => setSaveToAccount(e.target.checked)}
                          className="w-4 h-4 text-[#113C2B] rounded border-gray-300 focus:ring-[#113C2B]"
                        />
                        <label htmlFor="save_to_account" className="text-xs font-bold text-[#113C2B] cursor-pointer">
                          Save this address to my account for future orders
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="w-full sm:w-auto px-6 py-3.5 sm:py-3 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-2xl sm:rounded-xl transition-all text-center flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Step 1</span>
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 sm:py-3.5 bg-[#113C2B] hover:bg-[#1A4B3A] text-white font-bold rounded-2xl sm:rounded-xl shadow-lg shadow-[#113C2B]/20 transition-all hover:-translate-y-0.5 active:scale-[0.98] text-base sm:text-sm tracking-wide"
                    >
                      <span>Proceed to Payment</span>
                      <ArrowRight className="w-4 h-4 text-[#F8B319]" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ================= STEP 3: RAZORPAY PAYMENT ================= */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e8dfc8] shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#113C2B] flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#F8B319]" /> 3. Complete Razorpay Payment
                    </h2>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL Secured
                    </span>
                  </div>

                  {paymentError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-semibold flex items-center gap-2.5 mb-6">
                      <AlertCircle className="w-5 h-5 shrink-0" /> {paymentError}
                    </div>
                  )}

                  {/* Summary of Shipping Address for confirmation */}
                  <div className="p-5 bg-[#FDF9F1] rounded-2xl border border-[#ece3cf] mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Delivering Order To:</p>
                      <p className="font-bold text-[#113C2B] text-base">{address.firstName} {address.lastName} ({address.phone})</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {address.street}, {address.city}, {address.state} - {address.pincode}
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-bold text-[#F8B319] hover:underline shrink-0"
                    >
                      Edit Address
                    </button>
                  </div>

                  {/* Payment Options visual badges */}
                  <div className="space-y-4 mb-8">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Supported Payment Methods via Razorpay:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
                        <span className="text-xs font-bold text-gray-800">UPI / QR</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">GPay, PhonePe, Paytm</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
                        <span className="text-xs font-bold text-gray-800">Cards</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">Visa, Mastercard, RuPay</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
                        <span className="text-xs font-bold text-gray-800">Net Banking</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">All Major Indian Banks</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
                        <span className="text-xs font-bold text-gray-800">Wallets</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">Mobikwik, Amazon Pay</p>
                      </div>
                    </div>
                  </div>

                  {/* Razorpay Launch Button */}
                  <div className="pt-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="w-full sm:w-auto px-6 py-3.5 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-2xl sm:rounded-xl transition-all text-center flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Address</span>
                    </button>

                    <button
                      onClick={handleInitiateRazorpay}
                      disabled={isProcessing}
                      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-4 font-bold text-base rounded-2xl shadow-xl transition-all active:scale-[0.98] ${
                        isProcessing 
                          ? 'bg-gray-400 text-white cursor-wait' 
                          : 'bg-[#113C2B] hover:bg-[#1A4B3A] text-[#F8B319] hover:-translate-y-0.5'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Opening Razorpay Gateway...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 text-[#F8B319]" />
                          <span>Pay ₹{grandTotal.toFixed(2)} via Razorpay</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </div>

          {/* RIGHT: ORDER SUMMARY (STICKY) */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e8dfc8] shadow-lg sticky top-28">
              <h3 className="text-xl font-serif font-bold text-[#113C2B] mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-mono font-bold bg-[#FDF9F1] px-2.5 py-1 rounded-full text-gray-600">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </span>
              </h3>

              {/* Items scroll */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-2 divide-y divide-gray-50 mb-6">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between text-xs sm:text-sm">
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-[#113C2B] truncate">{item.name}</p>
                      <p className="text-[11px] text-gray-400">Qty: {item.quantity} • {item.size || item.weight}</p>
                    </div>
                    <span className="font-bold text-gray-800 shrink-0">
                      ₹{(parseFloat(item.price) || 0) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t border-dashed border-[#e8dfc8] pt-4 mb-6 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Cart Subtotal</span>
                  <span className="font-medium text-[#113C2B]">₹{subtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Coupon ({appliedCoupon.code})
                    </span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Delivery Shipping</span>
                  <span className="font-medium text-[#113C2B]">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `₹${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 flex justify-between items-baseline">
                  <span className="font-serif font-bold text-base text-[#113C2B]">Grand Total</span>
                  <div className="text-right">
                    <span className="font-serif font-black text-2xl text-[#113C2B]">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                    <p className="text-[10px] text-gray-400">Includes all taxes</p>
                  </div>
                </div>
              </div>

              {/* Trust Callout */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex items-start gap-3">
                <Truck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-snug">
                  <p className="font-bold">Fresh Homemade Guarantee</p>
                  <p className="text-emerald-700 mt-0.5">Free shipping applies on all orders above ₹999 across India.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
