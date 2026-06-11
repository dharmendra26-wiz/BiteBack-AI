import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BrowsePage from './pages/BrowsePage';
import ShopDashboard from './pages/ShopDashboard';
import AIScannerPage from './pages/AIScannerPage';
import ImpactDashboard from './pages/ImpactDashboard';
import FoodBankDashboard from './pages/FoodBankDashboard';
import Navbar from './components/Navbar';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/browse" element={<BrowsePage />} />

        <Route path="/shop/dashboard" element={
          <ProtectedRoute role="SHOP"><ShopDashboard /></ProtectedRoute>
        } />
        <Route path="/shop/scanner" element={
          <ProtectedRoute role="SHOP"><AIScannerPage /></ProtectedRoute>
        } />
        <Route path="/shop/impact" element={
          <ProtectedRoute role="SHOP"><ImpactDashboard /></ProtectedRoute>
        } />
        <Route path="/foodbank/dashboard" element={
          <ProtectedRoute role="FOOD_BANK"><FoodBankDashboard /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#141f14',
              color: '#e2e8e2',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: '12px',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
