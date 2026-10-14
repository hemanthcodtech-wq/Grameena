import React from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Tag, 
  MapPin, 
  User, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CustomerAccountLayout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/account/dashboard', icon: LayoutDashboard, desc: 'Overview & recent updates' },
    { name: 'My Orders', path: '/account/orders', icon: ShoppingBag, desc: 'Track & view order history' },
    { name: 'Available Coupons', path: '/account/coupons', icon: Tag, desc: 'Discounts & promo codes' },
    { name: 'Saved Addresses', path: '/account/addresses', icon: MapPin, desc: 'Manage delivery locations' },
    { name: 'My Profile', path: '/account/profile', icon: User, desc: 'Personal details & security' },
  ];

  return (
    <div className="w-full min-h-[85vh] bg-[#FDF9F1] py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#e8dfc8] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#113C2B]/60 mb-1">
              <Link to="/" className="hover:text-orange-600 transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#113C2B]">My Account</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#113C2B]">
              Welcome back, <span className="text-[#d97706]">{user?.name || 'Customer'}</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your orders, saved addresses, and active discounts in one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/wishlist"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#e8dfc8] rounded-xl text-sm font-semibold text-[#113C2B] hover:border-red-400 hover:text-red-500 shadow-sm transition-all"
            >
              <Heart className="w-4 h-4 text-red-500" />
              <span>Wishlist</span>
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Account Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Navigation Sidebar (Visible ONLY on Desktop, Hidden on Mobile) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-3xl p-5 border border-[#e8dfc8] shadow-sm sticky top-28 space-y-6">
              
              {/* User Mini Card */}
              <div className="flex items-center gap-3 pb-5 border-b border-[#f0e8d5]">
                <div className="w-14 h-14 rounded-2xl bg-[#113C2B] text-[#F8B319] flex items-center justify-center font-serif text-2xl font-bold shadow-md shadow-[#113C2B]/20">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-[#113C2B] truncate">{user?.name || 'Customer'}</h3>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Member
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all group ${
                          isActive
                            ? 'bg-[#113C2B] text-[#F8B319] shadow-md shadow-[#113C2B]/20'
                            : 'text-gray-700 hover:bg-[#FDF9F1] hover:text-[#113C2B]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-[#F8B319]' : 'text-gray-500 group-hover:text-[#113C2B]'}`} />
                            <span>{item.name}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isActive ? 'text-[#F8B319]' : 'text-gray-400 opacity-60'}`} />
                        </>
                      )}
                    </NavLink>
                  );
                })}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all group mt-2 pt-3 border-t border-[#f0e8d5]"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                    <span>Logout</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-400 opacity-60 group-hover:translate-x-1 transition-transform" />
                </button>
              </nav>

              {/* Help & Support callout */}
              <div className="bg-[#FAF4E6] p-4 rounded-2xl border border-[#eedfc0] text-xs text-[#113C2B]">
                <p className="font-bold mb-1">Need help with an order?</p>
                <p className="text-gray-600 mb-2">Our team in Andhra is happy to assist you anytime.</p>
                <Link to="/contact" className="font-bold text-orange-600 hover:underline">
                  Contact Support →
                </Link>
              </div>

            </div>
          </div>

          {/* Main Content Area (Full width on mobile, 3/4 width on desktop) */}
          <div className="w-full lg:col-span-3">
            <Outlet />
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerAccountLayout;
