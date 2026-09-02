import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './AuthContext';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BrowsePage from './pages/BrowsePage';
import ShopDashboard from './pages/ShopDashboard';
import AIScannerPage from './pages/AIScannerPage';
import ImpactDashboard from './pages/ImpactDashboard';
import FoodBankDashboard from './pages/FoodBankDashboard';
import Navbar from './components/Navbar';
import api from './api';

// Only shown in production (when VITE_API_URL is set). Hidden in local dev.
function DemoBanner() {
  const [visible, setVisible] = useState(true);
  if (!import.meta.env.VITE_API_URL || !visible) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(10,15,10,0.95)', backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(34,197,94,0.3)',
      padding: '10px 24px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 14 }}>⚡ <strong>Live Demo</strong></span>
        <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>
          Data resets on server restart · Use demo credentials:
        </span>
        <code style={{ fontSize: 12, color: 'var(--green-400)', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: 6 }}>
          shop@demo.com / customer@demo.com / foodbank@demo.com — password: demo123
        </code>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href="https://github.com/dharmendra26-wiz/BiteBack-AI" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 13, color: 'var(--gray-400)' }}>
          GitHub ↗
        </a>
        <button onClick={() => setVisible(false)} style={{
          background: 'none', border: 'none', color: 'var(--gray-500)',
          cursor: 'pointer', fontSize: 18, lineHeight: 1,
        }}>×</button>
      </div>
    </div>
  );
}

// Detects Railway cold starts and explains the delay instead of looking broken
function ColdStartCheck() {
  useEffect(() => {
    if (!import.meta.env.VITE_API_URL) return; // skip in dev

    let toastId;
    const timer = setTimeout(() => {
      toastId = toast.loading('⏳ Waking up server… (free tier cold start, ~30s)', {
        duration: 40000,
        style: { background: '#141f14', color: '#e2e8e2', border: '1px solid rgba(251,146,60,0.4)' },
      });
    }, 3000);

    api.get('/health')
      .then(() => {
        clearTimeout(timer);
        if (toastId) toast.dismiss(toastId);
      })
      .catch(() => {
        clearTimeout(timer);
        if (toastId) toast.dismiss(toastId);
        toast('⚠️ Backend starting up — refresh in ~30 seconds', {
          duration: 30000,
          icon: '⏳',
        });
      });

    return () => clearTimeout(timer);
  }, []);
  return null;
}

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
        <ColdStartCheck />
        <AppRoutes />
        <DemoBanner />
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

