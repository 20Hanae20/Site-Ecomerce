import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import TenantLayout from './components/TenantLayout/TenantLayout';
import ClientLayout from './components/ClientLayout/ClientLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import { CartProvider } from './context/CartProvider';

// Pages de base
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import FAQ from './pages/FAQ';
import Pricing from './pages/Pricing';
import Docs from './pages/Docs';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

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
import Recommendations from './pages/Recommendations';
import Quiz from './pages/Quiz';
import QuizResult from './pages/QuizResult';

// Espace Client (Client Pages)
import ClientDashboard from './pages/Client/ClientDashboard';
import ClientCatalog from './pages/Client/ClientCatalog';
import ClientSupport from './pages/Client/ClientSupport';
import ClientFavorites from './pages/Client/ClientFavorites';

// Espace Entreprise (Tenant Pages)
import TenantDashboard from './pages/TenantDashboard';
import TenantProducts from './pages/Tenant/TenantProducts';
import TenantOrders from './pages/Tenant/TenantOrders';
import TenantCustomers from './pages/Tenant/TenantCustomers';
import TenantPromotions from './pages/Tenant/TenantPromotions';
import TenantTeam from './pages/Tenant/TenantTeam';
import TenantAnalytics from './pages/Tenant/TenantAnalytics';
import TenantAI from './pages/Tenant/TenantAI';
import TenantBilling from './pages/Tenant/TenantBilling';
import TenantSettings from './pages/Tenant/TenantSettings';

// Admin / Super Admin Pages
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
import AdminAnalytics from './pages/Admin/AnalyticsDashboard';
import AnalyticsDashboardFull from './pages/Admin/AnalyticsDashboardFull';
import CustomerSegmentation from './pages/Admin/CustomerSegmentation';
import SaasDashboard from './pages/Admin/SaasDashboard';
import SaasIaDashboard from './pages/Admin/SaasIaDashboard';
import PlatformMonitoring from './pages/Admin/PlatformMonitoring';
import NotificationsCenter from './pages/Admin/NotificationsCenter';

// Onboarding SaaS
import CreateCompany from './pages/CreateCompany';
import ChoosePlan from './pages/ChoosePlan';
import CheckoutSubscription from './pages/CheckoutSubscription';
import OnboardingSuccess from './pages/OnboardingSuccess';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <TenantProvider>
            <Routes>
              {/* Routes Onboarding SaaS (publiques) */}
              <Route path="/onboarding/company" element={<CreateCompany />} />
              <Route path="/onboarding/plan" element={<ChoosePlan />} />
              <Route path="/onboarding/checkout" element={<CheckoutSubscription />} />
              <Route path="/onboarding/success" element={<OnboardingSuccess />} />

              {/* 🏠 Routes Espace Client (authentifiées) */}
              <Route element={<ClientLayout />}>
                <Route path="/client/dashboard" element={<ProtectedRoute component={ClientDashboard} />} />
                <Route path="/client/catalog" element={<ProtectedRoute component={ClientCatalog} />} />
                <Route path="/client/quiz" element={<ProtectedRoute component={Quiz} />} />
                <Route path="/client/recommendations" element={<ProtectedRoute component={Recommendations} />} />
                <Route path="/client/orders" element={<ProtectedRoute component={Orders} />} />
                <Route path="/client/favorites" element={<ProtectedRoute component={ClientFavorites} />} />
                <Route path="/client/profile" element={<ProtectedRoute component={Profile} />} />
                <Route path="/client/support" element={<ProtectedRoute component={ClientSupport} />} />
              </Route>

              {/* 🏢 Routes Espace Entreprise / Tenant (authentifiées) */}
              <Route element={<TenantLayout />}>
                <Route path="/tenant/dashboard" element={<ProtectedRoute component={TenantDashboard} requiredRole={['admin', 'super_admin', 'gestionnaire', 'moderateur', 'owner']} />} />
                <Route path="/tenant/products" element={<ProtectedRoute component={TenantProducts} requiredRole={['admin', 'super_admin', 'gestionnaire', 'owner']} />} />
                <Route path="/tenant/orders" element={<ProtectedRoute component={TenantOrders} requiredRole={['admin', 'super_admin', 'gestionnaire', 'owner']} />} />
                <Route path="/tenant/customers" element={<ProtectedRoute component={TenantCustomers} requiredRole={['admin', 'super_admin', 'gestionnaire', 'owner']} />} />
                <Route path="/tenant/promotions" element={<ProtectedRoute component={TenantPromotions} requiredRole={['admin', 'super_admin', 'gestionnaire', 'owner']} />} />
                <Route path="/tenant/team" element={<ProtectedRoute component={TenantTeam} requiredRole={['admin', 'super_admin', 'owner']} />} />
                <Route path="/tenant/analytics" element={<ProtectedRoute component={TenantAnalytics} requiredRole={['admin', 'super_admin', 'gestionnaire', 'owner']} />} />
                <Route path="/tenant/ai" element={<ProtectedRoute component={TenantAI} requiredRole={['admin', 'super_admin', 'gestionnaire', 'owner']} />} />
                <Route path="/tenant/billing" element={<ProtectedRoute component={TenantBilling} requiredRole={['admin', 'super_admin', 'owner']} />} />
                <Route path="/tenant/settings" element={<ProtectedRoute component={TenantSettings} requiredRole={['admin', 'super_admin', 'owner']} />} />
              </Route>

              {/* Routes avec layout standard (Espace Public & legacy) */}
              <Route element={<Layout />}>
                {/* Pages publiques */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />

                {/* Authentification */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token?" element={<ResetPassword />} />

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
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/quiz/result" element={<QuizResult />} />
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
                <Route path="/admin/analytics" element={<ProtectedRoute component={AdminAnalytics} requiredRole={['admin', 'super_admin', 'gestionnaire']} />} />
                <Route path="/admin/analytics-full" element={<ProtectedRoute component={AnalyticsDashboardFull} requiredRole={['admin', 'super_admin', 'gestionnaire']} />} />
                <Route path="/admin/segmentation" element={<ProtectedRoute component={CustomerSegmentation} requiredRole={['admin', 'super_admin', 'gestionnaire']} />} />
                <Route path="/admin/saas" element={<ProtectedRoute component={SaasDashboard} requiredRole={['super_admin']} />} />
                <Route path="/admin/ia" element={<ProtectedRoute component={SaasIaDashboard} requiredRole={['super_admin']} />} />
                <Route path="/admin/monitoring" element={<ProtectedRoute component={PlatformMonitoring} requiredRole={['admin', 'super_admin']} />} />
                <Route path="/admin/notifications" element={<ProtectedRoute component={NotificationsCenter} requiredRole={['admin', 'super_admin', 'gestionnaire']} />} />
              </Route>

              {/* Page 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </TenantProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
