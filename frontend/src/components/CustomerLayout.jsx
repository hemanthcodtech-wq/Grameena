import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  User, 
  Search, 
  Menu, 
  X, 
  Heart, 
  ChevronDown, 
  LayoutDashboard, 
  Tag, 
  MapPin, 
  LogOut, 
  ShieldCheck,
  Home,
  Store,
  Sparkles,
  PhoneCall,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
import Footer from './Footer';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const CustomerLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { totalItems } = useCart();
  const { totalWishlistItems, toastMessage } = useWishlist();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserDropdownOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsUserDropdownOpen(false);
    logout();
    navigate('/login');
  };
  
  const defaultAnnouncements = [
    '✨ 100% Homemade & Authentic Andhra Pickles & Snacks',
    '🚚 Free Shipping on Orders above ₹999',
    '🌿 Zero Preservatives, Made with Cold Pressed Oils'
  ];
  const [announcements, setAnnouncements] = useState(defaultAnnouncements);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/public/settings`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.scrollerMessages) && data.scrollerMessages.length > 0) {
          setAnnouncements(data.scrollerMessages);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#FDF9F1] font-sans">
      
      {/* Top Announcement Bar */}
      <div className="w-full bg-[#113C2B] text-[#F8B319] py-2 overflow-hidden relative">
        <div className="whitespace-nowrap animate-marquee flex items-center font-medium text-sm tracking-wide">
          {[...announcements, ...announcements, ...announcements].map((msg, i) => (
            <span key={i} className="mx-8">{msg}</span>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <header className="w-full bg-[#FDF9F1] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <img src={logo} alt="Grameena Bharatham" className="h-16 w-auto object-contain" onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/150x60?text=Logo"; }} />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-7 items-center font-semibold text-[#1A4B3A]">
              {[
                { name: 'Home', path: '/' },
                { name: 'Shop', path: '/products' },
                { name: 'Offers', path: '/offers', isSpecial: true },
                { name: 'Pickles', path: '/category/pickles' },
                { name: 'Cold Press Oils', path: '/category/oils' },
                { name: 'Snacks', path: '/category/snacks' },
                { name: 'About', path: '/about' },
                { name: 'Contact', path: '/contact' }
              ].map(link => (
                <NavLink 
                  key={link.name} 
                  to={link.path} 
                  className={({ isActive }) => 
                    `transition-colors flex items-center gap-1.5 ${
                      link.isSpecial 
                        ? (isActive ? 'text-[#e09c13] font-bold' : 'text-[#F8B319] hover:text-[#e09c13] font-bold') 
                        : (isActive ? 'text-orange-500' : 'hover:text-orange-500')
                    }`
                  }
                  end={link.path === '/'}
                >
                  {link.name}
                  {link.isSpecial && (
                    <span className="bg-[#F8B319] text-[#113C2B] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                      SALE
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center space-x-4 sm:space-x-6 text-[#1A4B3A]">
              <button className="hover:text-orange-500 transition-colors" title="Search">
                <Search className="h-6 w-6" />
              </button>

              {/* Wishlist Icon */}
              <Link 
                to="/wishlist" 
                className="hover:text-red-500 transition-colors relative p-1"
                title="View Wishlist"
              >
                <Heart className={`h-6 w-6 transition-colors ${totalWishlistItems > 0 ? 'text-red-500 fill-red-500/20' : ''}`} />
                {totalWishlistItems > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm"
                  >
                    {totalWishlistItems}
                  </motion.span>
                )}
              </Link>

              {/* User Dropdown / Login Button */}
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-black/5 transition-all text-[#1A4B3A] focus:outline-none"
                    title="Account Menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#113C2B] text-[#F8B319] font-serif font-bold text-sm flex items-center justify-center shadow-xs">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden md:inline font-bold text-xs max-w-[90px] truncate text-[#113C2B]">
                      {user?.name?.split(' ')[0] || 'Account'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180 text-orange-500' : 'text-gray-500'}`} />
                  </button>

                  {/* Dropdown Menu Modal */}
                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-[#eedfc0] py-2 z-[100] text-xs font-medium text-gray-700 divide-y divide-gray-100"
                      >
                        {/* User Greeting & Status */}
                        <div className="px-4 py-3 bg-[#FAF4E6]/50">
                          <p className="font-bold text-[#113C2B] text-sm truncate">{user?.name || 'Customer'}</p>
                          <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="inline-block mt-2 text-[10px] font-bold text-[#113C2B] bg-[#F8B319] px-2 py-0.5 rounded-full"
                            >
                              Go to Admin Portal →
                            </Link>
                          )}
                        </div>

                        {/* Navigation Links */}
                        <div className="py-1">
                          <Link
                            to="/account/dashboard"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#FDF9F1] hover:text-[#113C2B] transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            to="/account/orders"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#FDF9F1] hover:text-[#113C2B] transition-colors"
                          >
                            <ShoppingBag className="w-4 h-4 text-orange-600" />
                            <span>My Orders</span>
                          </Link>
                          <Link
                            to="/account/coupons"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#FDF9F1] hover:text-[#113C2B] transition-colors"
                          >
                            <Tag className="w-4 h-4 text-amber-600" />
                            <span>Available Coupons</span>
                          </Link>
                          <Link
                            to="/account/addresses"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#FDF9F1] hover:text-[#113C2B] transition-colors"
                          >
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <span>Saved Addresses</span>
                          </Link>
                          <Link
                            to="/account/profile"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#FDF9F1] hover:text-[#113C2B] transition-colors"
                          >
                            <User className="w-4 h-4 text-gray-500" />
                            <span>Profile & Settings</span>
                          </Link>
                        </div>

                        {/* Logout Option */}
                        <div className="py-1">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors font-semibold"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hover:text-orange-500 transition-colors flex items-center gap-1.5 p-1"
                  title="Sign In / Register"
                >
                  <User className="h-6 w-6" />
                  <span className="hidden sm:inline text-xs font-bold text-[#113C2B]">Login</span>
                </Link>
              )}

              <Link to="/cart" className="hover:text-orange-500 transition-colors relative p-1" title="Cart">
                <ShoppingBag className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              
              <button className="lg:hidden hover:text-orange-500" onClick={() => setIsMenuOpen(true)}>
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Modern Slide-Over Drawer with Safe Viewport Scrolling */}
        <AnimatePresence>
          {isMenuOpen && (
            <div className="fixed inset-0 z-[100] flex">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              />

              {/* Drawer Content */}
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="relative w-full max-w-sm sm:max-w-md bg-[#113C2B] text-white flex flex-col h-[100dvh] max-h-[100dvh] shadow-2xl z-10"
              >
                {/* Header inside Menu (sticky at top so it never scrolls away or hides content) */}
                <div className="flex-shrink-0 flex justify-between items-center px-5 py-4 border-b border-white/10 bg-[#0d2f22]">
                  <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
                    <img 
                      src={logo} 
                      alt="Grameena Bharatham" 
                      className="h-10 sm:h-12 w-auto object-contain bg-white/10 p-1.5 rounded-xl backdrop-blur-md" 
                    />
                  </Link>
                  <button 
                    onClick={() => setIsMenuOpen(false)} 
                    aria-label="Close Menu"
                    className="w-10 h-10 bg-white/10 hover:bg-[#F8B319] text-white hover:text-[#113C2B] rounded-full flex items-center justify-center transition-all duration-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Menu Scrollable Body - flex-1 with overflow-y-auto ensures Home is always at top and visible */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 overscroll-contain">
                  {/* Primary Navigation Links */}
                  <div className="space-y-1.5">
                    {[
                      { name: 'Home', path: '/', icon: Home },
                      { name: 'Shop All Products', path: '/products', icon: Store },
                      { name: 'Special Offers', path: '/offers', isSpecial: true, icon: Sparkles },
                      { name: 'My Wishlist', path: '/wishlist', badge: totalWishlistItems, icon: Heart },
                      { name: 'Pickles', path: '/category/pickles', icon: Tag },
                      { name: 'Cold Press Oils', path: '/category/oils', icon: Tag },
                      { name: 'Snacks', path: '/category/snacks', icon: Tag },
                      { name: 'Our Story', path: '/about', icon: BookOpen },
                      { name: 'Contact Us', path: '/contact', icon: PhoneCall },
                    ].map((item, i) => {
                      const IconComp = item.icon;
                      const isCurrentActive = location.pathname === item.path;

                      return (
                        <Link 
                          key={item.name}
                          to={item.path} 
                          onClick={() => setIsMenuOpen(false)} 
                          className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-all font-serif ${
                            isCurrentActive 
                              ? 'bg-[#F8B319] text-[#113C2B] font-bold shadow-md' 
                              : item.isSpecial
                              ? 'bg-[#F8B319]/15 text-[#F8B319] hover:bg-[#F8B319]/25 font-bold border border-[#F8B319]/30'
                              : 'text-gray-100 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <IconComp className={`w-5 h-5 ${isCurrentActive ? 'text-[#113C2B]' : item.isSpecial ? 'text-[#F8B319]' : 'text-gray-300'}`} />
                            <span className="text-base sm:text-lg tracking-wide">{item.name}</span>
                          </div>
                          {item.isSpecial ? (
                            <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                              OFFERS
                            </span>
                          ) : item.badge > 0 ? (
                            <span className="text-xs bg-[#F8B319] text-[#113C2B] font-black px-2.5 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Account Section in Mobile Menu */}
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <p className="text-[#F8B319] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Customer Account
                    </p>
                    {isAuthenticated ? (
                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-white">
                        <Link
                          to="/account/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1.5"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/account/orders"
                          onClick={() => setIsMenuOpen(false)}
                          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-orange-400" />
                          <span>My Orders</span>
                        </Link>
                        <Link
                          to="/account/coupons"
                          onClick={() => setIsMenuOpen(false)}
                          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1.5"
                        >
                          <Tag className="w-3.5 h-3.5 text-amber-400" />
                          <span>Coupons</span>
                        </Link>
                        <Link
                          to="/account/addresses"
                          onClick={() => setIsMenuOpen(false)}
                          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1.5"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Addresses</span>
                        </Link>
                        <Link
                          to="/account/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1.5"
                        >
                          <User className="w-3.5 h-3.5 text-blue-300" />
                          <span>Profile</span>
                        </Link>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleLogout();
                          }}
                          className="p-2.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 text-left transition-colors flex items-center gap-1.5"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Link
                          to="/login"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex-1 text-center py-2.5 bg-[#F8B319] text-[#113C2B] font-bold rounded-xl text-xs hover:bg-[#e09c13] transition-colors"
                        >
                          Login
                        </Link>
                        <Link
                          to="/signup"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex-1 text-center py-2.5 bg-white/10 text-white font-bold rounded-xl text-xs border border-white/20 hover:bg-white/20 transition-colors"
                        >
                          Sign Up
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer inside Menu (compact & anchored at bottom) */}
                <div className="flex-shrink-0 px-5 py-4 border-t border-white/10 bg-[#0d2f22]/90 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[#F8B319] font-bold tracking-wider uppercase text-[10px]">Customer Support</p>
                    <a href="tel:+918143680630" className="text-white font-semibold hover:underline">+91 81436 80630</a>
                  </div>
                  <span className="text-[10px] text-white/50">Grameena Bharatham</span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col">
        <Outlet />
      </main>

      {/* Toast Notification Container for Wishlist / Cart */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 z-[120] max-w-sm w-full bg-[#113C2B] text-white p-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${toastMessage.action === 'added' ? 'bg-rose-500/20 text-red-400' : 'bg-gray-700/50 text-gray-300'}`}>
              <Heart className={`w-5 h-5 ${toastMessage.action === 'added' ? 'fill-red-500 text-red-500' : ''}`} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-[#F8B319] uppercase tracking-wider">
                {toastMessage.action === 'added' ? 'Wishlist Updated' : 'Wishlist'}
              </p>
              <p className="text-sm font-medium text-white truncate">
                {toastMessage.item ? toastMessage.item.name : toastMessage.message}
              </p>
            </div>
            <Link
              to="/wishlist"
              className="text-xs bg-[#F8B319] hover:bg-[#e09c13] text-[#113C2B] font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              View
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CustomerLayout;
