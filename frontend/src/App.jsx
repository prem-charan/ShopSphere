import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProductDetail from './pages/ProductDetail';
import AdminDashboard from './pages/AdminDashboard';
import MyOrders from './components/MyOrders';
import OrderDetail from './components/OrderDetail';
import LoyaltyPage from './pages/LoyaltyPage';
import Cart from './pages/Cart';
import Invoice from './components/Invoice';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes - Require Login */}
          <Route
            path="/product/:id"
            element={
              <ProtectedRoute>
                <ProductDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order/:orderId/invoice"
            element={
              <ProtectedRoute>
                <Invoice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loyalty"
            element={
              <ProtectedRoute>
                <LoyaltyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          {/* Admin Only Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
