import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Tag, 
  Image, 
  Ticket,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', badge: null },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Orders', badge: null },
    { path: '/admin/products', icon: Tag, label: 'Products', badge: null },
    { path: '/admin/categories', icon: Tag, label: 'Categories', badge: null },
    { path: '/admin/customers', icon: Users, label: 'Customers', badge: null },
    { path: '/admin/offers', icon: Percent, label: 'Offers', badge: 'Deals' },
    { path: '/admin/banners', icon: Image, label: 'Banners', badge: null },
    { path: '/admin/coupons', icon: Ticket, label: 'Coupons', badge: null },
    { path: '/admin/settings', icon: Settings, label: 'Settings', badge: null },
  ];

  const currentRoute = menuItems.find(m => m.path === location.pathname) || { label: 'Admin Portal' };

  return (
    <div className="flex h-screen bg-[#FDF9F1] overflow-hidden w-full font-sans">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-64 bg-[#113C2B] text-white shadow-2xl flex-shrink-0 h-full border-r border-[#1B4B38]/50 z-30">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F8B319] to-amber-300 flex items-center justify-center text-[#113C2B] font-serif font-black text-xl shadow-md">
            G
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg tracking-wide text-white leading-tight">
              Grameena
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-medium text-emerald-200/80 tracking-wider uppercase">
                Admin Panel
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
            Main Menu
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#F8B319] text-[#113C2B] shadow-lg font-bold translate-x-1'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-[#113C2B]/10 text-[#113C2B]' : 'bg-white/5 text-white/70 group-hover:text-white group-hover:bg-white/10'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-[#113C2B] text-white' : 'bg-[#F8B319]/20 text-[#F8B319]'
                  }`}>
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform opacity-0 group-hover:opacity-100 ${
                    isActive ? 'opacity-100 text-[#113C2B]' : 'text-white/40'
                  }`} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* View Customer Storefront shortcut */}
        <div className="px-3 py-2 border-t border-white/10">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-200/90 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#F8B319]" />
              Visit Store
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>

        {/* Admin User Footer / Logout */}
        <div className="p-4 border-t border-white/10 bg-[#0B2A1E]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-amber-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">Administrator</p>
                <p className="text-[10px] text-white/50 truncate">admin@grameena.com</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE HEADER ================= */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#113C2B]/95 backdrop-blur-md text-white z-40 flex items-center justify-between px-4 border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F8B319] to-amber-300 flex items-center justify-center text-[#113C2B] font-serif font-black text-lg shadow-sm">
            G
          </div>
          <div>
            <h1 className="font-serif font-bold text-base tracking-wide text-white leading-none">
              Grameena
            </h1>
            <span className="text-[10px] font-semibold text-amber-300/90">
              {currentRoute.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick link to store on mobile */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="View Storefront"
            className="p-2 text-white/80 hover:text-white bg-white/10 rounded-xl transition-colors active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Hamburger Menu Toggle with Animation */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            aria-label="Toggle mobile menu"
            className={`p-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center ${
              isMobileMenuOpen 
                ? 'bg-[#F8B319] text-[#113C2B] shadow-md' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Menu className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </header>

      {/* ================= MOBILE SIDEBAR DRAWER ================= */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            />

            {/* Slide-out Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[84%] max-w-[320px] bg-[#113C2B] text-white flex flex-col shadow-2xl border-r border-white/15 md:hidden"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0B2A1E]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F8B319] to-amber-300 flex items-center justify-center text-[#113C2B] font-serif font-black text-xl shadow-md">
                    G
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-lg text-white leading-tight">
                      Grameena
                    </h2>
                    <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                      Management Portal
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
                <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Navigation
                </div>

                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                        isActive
                          ? 'bg-[#F8B319] text-[#113C2B] shadow-md font-bold'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`p-1.5 rounded-lg ${
                          isActive ? 'bg-[#113C2B]/10 text-[#113C2B]' : 'bg-white/10 text-white/80'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-[#113C2B] text-white' : 'bg-[#F8B319]/20 text-[#F8B319]'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#113C2B]' : 'text-white/30'}`} />
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Quick Storefront Link */}
              <div className="px-3 py-2 border-t border-white/10 bg-[#0E3224]">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-200 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#F8B319]" />
                    Customer Storefront
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>
              </div>

              {/* Drawer Footer with Admin Info & Logout */}
              <div className="p-4 border-t border-white/10 bg-[#0B2A1E] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">Administrator</p>
                    <p className="text-[10px] text-white/50 truncate">admin@grameena.com</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-red-300 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full pt-16 md:pt-0">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#FDF9F1] p-4 sm:p-6 md:p-8 w-full h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
