import { useState } from 'react';
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
  Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/admin/products', icon: Tag, label: 'Products' },
    { path: '/admin/categories', icon: Tag, label: 'Categories' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/offers', icon: Tag, label: 'Offers' },
    { path: '/admin/banners', icon: Image, label: 'Banners' },
    { path: '/admin/coupons', icon: Ticket, label: 'Coupons' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-earth-50 overflow-hidden w-full">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex flex-col w-64 bg-grameena-800 text-white shadow-xl flex-shrink-0 h-full">
        <div className="p-6 flex items-center justify-center border-b border-grameena-700">
          <h1 className="text-2xl font-bold tracking-tight text-earth-100">Grameena<br/><span className="text-grameena-300 text-lg font-medium">Admin</span></h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-grameena-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-grameena-100 hover:text-white hover:bg-grameena-700 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Header & Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-grameena-800 text-white z-50 flex items-center justify-between px-4 shadow-md">
        <h1 className="text-xl font-bold">Grameena Admin</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="fixed inset-0 z-40 bg-grameena-800 text-white pt-16 md:hidden flex flex-col h-full"
          >
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`admin-sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="p-4 border-t border-grameena-700">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-grameena-100 hover:text-white hover:bg-grameena-700 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full pt-16 md:pt-0">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-earth-50 p-4 md:p-8 w-full h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
