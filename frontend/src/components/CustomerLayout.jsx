import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
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
  ShieldCheck 
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

  const { totalItems } = useCart();
  const { totalWishlistItems, toastMessage } = useWishlist();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

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

        {/* Mobile Menu - Full Screen Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: '-100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '-100%', transition: { delay: 0.2, duration: 0.4 } }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[100] bg-[#113C2B] flex flex-col"
            >
              {/* Header inside Menu */}
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <img src={logo} alt="Grameena Bharatham" className="h-20 md:h-24 w-auto object-contain bg-white/10 p-2 rounded-xl backdrop-blur-md" />
                <button 
                  onClick={() => setIsMenuOpen(false)} 
                  className="w-12 h-12 bg-white/10 hover:bg-[#F8B319] text-white hover:text-[#113C2B] rounded-full flex items-center justify-center transition-all duration-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Menu Links */}
              <div className="flex-1 flex flex-col justify-center px-8 py-8 space-y-6 overflow-y-auto">
                {[
                  { name: 'Home', path: '/' },
                  { name: 'Shop All', path: '/products' },
                  { name: '🔥 Special Offers', path: '/offers' },
                  { name: 'Wishlist', path: '/wishlist', badge: totalWishlistItems },
                  { name: 'Pickles', path: '/category/pickles' },
                  { name: 'Cold Press Oils', path: '/category/oils' },
                  { name: 'Snacks', path: '/category/snacks' },
                  { name: 'Our Story', path: '/about' },
                  { name: 'Contact Us', path: '/contact' },
                ].map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: 0.1 + (i * 0.05), duration: 0.4 }}
                  >
                    <Link 
                      to={item.path} 
                      onClick={() => setIsMenuOpen(false)} 
                      className="text-2xl md:text-4xl font-serif font-bold text-[#FDF9F1] hover:text-[#F8B319] transition-colors flex items-center justify-between group"
                    >
                      <span>{item.name}</span>
                      {item.badge > 0 && (
                        <span className="text-sm font-sans bg-[#F8B319] text-[#113C2B] font-extrabold px-3 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                ))}

                {/* Account Section in Mobile Menu */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <p className="text-[#F8B319] text-xs font-bold uppercase tracking-wider">Customer Account</p>
                  {isAuthenticated ? (
                    <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-white">
                      <Link
                        to="/account/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/account/orders"
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/account/coupons"
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        Coupons
                      </Link>
                      <Link
                        to="/account/addresses"
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        Addresses
                      </Link>
                      <Link
                        to="/account/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                        className="p-2.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 text-left transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex-1 text-center py-2.5 bg-[#F8B319] text-[#113C2B] font-bold rounded-xl text-sm"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex-1 text-center py-2.5 bg-white/10 text-white font-bold rounded-xl text-sm border border-white/20"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer inside Menu */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-8 border-t border-white/10 bg-black/20"
              >
                <p className="text-[#F8B319] text-sm font-bold tracking-widest uppercase mb-2">Need Help?</p>
                <p className="text-white text-lg">+91 81436 80630</p>
                <p className="text-white/60 text-sm mt-1">sudhakar.moparru@gmail.com</p>
              </motion.div>
            </motion.div>
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
