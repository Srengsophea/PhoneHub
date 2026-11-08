import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

// Public & Customer pages
import { HomePage } from '@/pages/HomePage';
import { ProductListingPage } from '@/pages/ProductListingPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { BrandsPage } from '@/pages/BrandsPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderTrackingPage } from '@/pages/OrderTrackingPage';
import { ComparePage } from '@/pages/ComparePage';
import { WishlistPage } from '@/pages/WishlistPage';
import { UserProfilePage } from '@/pages/UserProfilePage';

// Admin pages
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminInventoryPage } from '@/pages/admin/AdminInventoryPage';
import { AdminCustomersPage } from '@/pages/admin/AdminCustomersPage';
import { AdminCouponsPage } from '@/pages/admin/AdminCouponsPage';
import { AdminReviewsPage } from '@/pages/admin/AdminReviewsPage';
import { AdminAuditLogsPage } from '@/pages/admin/AdminAuditLogsPage';

export function App() {
  return (
    <Routes>
      {/* Public & Customer Experience */}
      <Route element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductListingPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="brands" element={<BrandsPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders/track" element={<OrderTrackingPage />} />
        <Route path="orders/track/:orderNumber" element={<OrderTrackingPage />} />
        <Route path="compare" element={<ComparePage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="profile" element={<UserProfilePage />} />
      </Route>

      {/* Dedicated Admin Login Gateway */}
      <Route path="admin/login" element={<AdminLoginPage />} />

      {/* Admin Panel Experience */}
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="inventory" element={<AdminInventoryPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
