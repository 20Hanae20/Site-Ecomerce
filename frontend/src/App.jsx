import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages de base
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import FAQ from './pages/FAQ';

// Authentification
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Produits et recherche
import PerfumeList from './pages/PerfumeList';
import PerfumeDetail from './pages/PerfumeDetail';

// Panier et commande
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentConfirmation from './pages/PaymentConfirmation';

// Utilisateur (requis authentification)
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';

// NOUVEAU: Recommandations (remplace le Quiz)
import Recommendations from './pages/Recommendations';

// Admin
import AdminLogin from './pages/Admin/AdminLogin';
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminCategories from './pages/Admin/Categories';
import AdminOrders from './pages/Admin/Orders';
import AdminUsers from './pages/Admin/Users';
import AdminPromotions from './pages/Admin/Promotions';
import AdminReviews from './pages/Admin/Reviews';
import AdminSettings from './pages/Admin/Settings';
import AdminLogs from './pages/Admin/Logs';
import AdminBranding from './pages/Admin/Branding';
import AddPerfume from './pages/AddPerfume';

import './App.css';

import { CartProvider } from './context/CartProvider';

function App() {
  return (
    <Router>
      <CartProvider>
        <Routes>
          {/* Routes avec layout standard */}
          <Route element={<Layout />}>
            {/* Pages publiques */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/faq" element={<FAQ />} />

            {/* Authentification */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Produits */}
            <Route path="/perfumes" element={<PerfumeList />} />
            <Route path="/perfumes/:id" element={<PerfumeDetail />} />

            {/* Panier et commande */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<ProtectedRoute component={Checkout} />} />
            <Route path="/payment/confirmation/:orderId" element={<ProtectedRoute component={PaymentConfirmation} />} />

            {/* Utilisateur authentifié */}
            <Route path="/profile" element={<ProtectedRoute component={Profile} />} />
            <Route path="/orders" element={<ProtectedRoute component={Orders} />} />
            <Route path="/orders/:id" element={<ProtectedRoute component={OrderDetail} />} />

            {/* NOUVEAU: Recommandations basées sur l'historique (remplace /quiz) */}
            <Route path="/recommendations" element={<ProtectedRoute component={Recommendations} />} />
          </Route>

          {/* Routes Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<ProtectedRoute component={AdminDashboard} requiredRole={['admin', 'super_admin', 'gestionnaire']} />} />
            <Route path="/admin/categories" element={<ProtectedRoute component={AdminCategories} requiredRole={['admin', 'super_admin', 'gestionnaire']} />} />
            <Route path="/admin/orders" element={<ProtectedRoute component={AdminOrders} requiredRole={['admin', 'super_admin', 'gestionnaire']} />} />
            <Route path="/admin/users" element={<ProtectedRoute component={AdminUsers} requiredRole={['admin', 'super_admin']} />} />
            <Route path="/admin/promotions" element={<ProtectedRoute component={AdminPromotions} requiredRole={['admin', 'super_admin', 'gestionnaire']} />} />
            <Route path="/admin/reviews" element={<ProtectedRoute component={AdminReviews} requiredRole={['admin', 'super_admin', 'moderateur']} />} />
            <Route path="/admin/settings" element={<ProtectedRoute component={AdminSettings} requiredRole={['admin', 'super_admin']} />} />
            <Route path="/admin/branding" element={<ProtectedRoute component={AdminBranding} requiredRole={['admin', 'super_admin']} />} />
            <Route path="/admin/logs" element={<ProtectedRoute component={AdminLogs} requiredRole={['admin', 'super_admin']} />} />
          </Route>

          {/* Page 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </Router>
  );
}

export default App;
