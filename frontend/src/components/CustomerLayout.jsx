import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
import Footer from './Footer';
import { useCart } from '../context/CartContext';

const CustomerLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();
  
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#FDF9F1] font-sans">
      
      {/* Top Announcement Bar */}
      <div className="w-full bg-[#113C2B] text-[#F8B319] py-2 overflow-hidden relative">
        <div className="whitespace-nowrap animate-marquee flex items-center font-medium text-sm tracking-wide">
          <span className="mx-8">✨ 100% Homemade & Authentic Andhra Pickles & Snacks</span>
          <span className="mx-8">🚚 Free Shipping on Orders above ₹999</span>
          <span className="mx-8">🌿 Zero Preservatives, Made with Cold Pressed Oils</span>
          <span className="mx-8">✨ 100% Homemade & Authentic Andhra Pickles & Snacks</span>
          <span className="mx-8">🚚 Free Shipping on Orders above ₹999</span>
          <span className="mx-8">🌿 Zero Preservatives, Made with Cold Pressed Oils</span>
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
            <nav className="hidden lg:flex space-x-8 items-center font-semibold text-[#1A4B3A]">
              <Link to="/" className="hover:text-orange-500 transition-colors text-orange-500">Home</Link>
              <Link to="/products" className="hover:text-orange-500 transition-colors">Shop</Link>
              <Link to="/category/pickles" className="hover:text-orange-500 transition-colors">Pickles</Link>
              <Link to="/category/oils" className="hover:text-orange-500 transition-colors">Cold Press Oils</Link>
              <Link to="/category/snacks" className="hover:text-orange-500 transition-colors">Snacks</Link>
              <Link to="/about" className="hover:text-orange-500 transition-colors">About</Link>
              <Link to="/contact" className="hover:text-orange-500 transition-colors">Contact</Link>
            </nav>

            {/* Icons */}
            <div className="flex items-center space-x-6 text-[#1A4B3A]">
              <button className="hover:text-orange-500 transition-colors">
                <Search className="h-6 w-6" />
              </button>
              <Link to="/login" className="hover:text-orange-500 transition-colors">
                <User className="h-6 w-6" />
              </Link>
              <Link to="/cart" className="hover:text-orange-500 transition-colors relative">
                <ShoppingBag className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
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
                      className="text-3xl md:text-5xl font-serif font-bold text-[#FDF9F1] hover:text-[#F8B319] transition-colors flex items-center group"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CustomerLayout;
