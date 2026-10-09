import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOffersPage from './pages/admin/AdminOffersPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

import CustomerLayout from './components/CustomerLayout';
import SplashScreen from './components/SplashScreen';
import CustomCursor from './components/CustomCursor';
import ScrollToTop from './components/ScrollToTop';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import ShopPage from './pages/ShopPage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import PoliciesPage from './pages/PoliciesPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

// Simple PrivateRoute for admin
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let isAdmin = false;
  try {
    const user = JSON.parse(userStr);
    if(user && user.role === 'admin') isAdmin = true;
  } catch(e) {}
  
  if (!token || !isAdmin) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <CartProvider>
      <SplashScreen />
      <CustomCursor />
      <Router>
        <ScrollToTop />
      <div className="w-full min-h-screen bg-earth-50 text-gray-900 font-sans">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Public Routes with CustomerLayout */}
          <Route path="/" element={<CustomerLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="products" element={<ShopPage />} />
            <Route path="product/:id" element={<ProductDetailsPage />} />
            <Route path="category/:categoryName" element={<CategoryPage />} />
            <Route path="policies" element={<PoliciesPage />} />
            <Route path="policy/shipping" element={<ShippingPolicyPage />} />
            <Route path="policy/refund" element={<RefundPolicyPage />} />
            <Route path="policy/terms" element={<TermsPage />} />
            <Route path="policy/privacy" element={<PrivacyPolicyPage />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboardPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="offers" element={<AdminOffersPage />} />
            <Route path="banners" element={<AdminBannersPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Routes>
      </div>
      </Router>
    </CartProvider>
  );
}

export default App;
