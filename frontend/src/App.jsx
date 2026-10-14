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
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import ShopPage from './pages/ShopPage';
import OffersPage from './pages/OffersPage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import PoliciesPage from './pages/PoliciesPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

import CustomerAccountLayout from './pages/customer/CustomerAccountLayout';
import CustomerDashboardPage from './pages/customer/CustomerDashboardPage';
import CustomerOrdersPage from './pages/customer/CustomerOrdersPage';
import CustomerCouponsPage from './pages/customer/CustomerCouponsPage';
import CustomerAddressesPage from './pages/customer/CustomerAddressesPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';

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

// Customer Protected Route
const CustomerRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
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
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="order-success" element={<OrderSuccessPage />} />
                <Route path="products" element={<ShopPage />} />
                <Route path="offers" element={<OffersPage />} />
                <Route path="product/:id" element={<ProductDetailsPage />} />
                <Route path="category/:categoryName" element={<CategoryPage />} />
                <Route path="policies" element={<PoliciesPage />} />
                <Route path="policy/shipping" element={<ShippingPolicyPage />} />
                <Route path="policy/refund" element={<RefundPolicyPage />} />
                <Route path="policy/terms" element={<TermsPage />} />
                <Route path="policy/privacy" element={<PrivacyPolicyPage />} />

                {/* Customer Account Subroutes */}
                <Route path="account" element={
                  <CustomerRoute>
                    <CustomerAccountLayout />
                  </CustomerRoute>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<CustomerDashboardPage />} />
                  <Route path="orders" element={<CustomerOrdersPage />} />
                  <Route path="coupons" element={<CustomerCouponsPage />} />
                  <Route path="addresses" element={<CustomerAddressesPage />} />
                  <Route path="profile" element={<CustomerProfilePage />} />
                </Route>
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
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
