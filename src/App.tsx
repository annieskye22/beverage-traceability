import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

import LandingPage from '@/pages/LandingPage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import BuildBlendPage from '@/pages/BuildBlendPage';
import TracePage from '@/pages/TracePage';
import MyOrdersPage from '@/pages/MyOrdersPage';
import LoginPage from '@/pages/Loginpage';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminTransfers from '@/pages/admin/AdminTransfers';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/build" element={<BuildBlendPage />} />
          <Route path="/trace" element={<TracePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Logged-In Customer Route */}
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <MyOrdersPage />
              </ProtectedRoute>
            } 
          />

          {/* Restricted Admin Routes (Locked to Admin Email Only) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/products" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminProducts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/orders" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminOrders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/transfers" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminTransfers />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}