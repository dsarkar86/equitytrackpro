import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import './App.css';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Page components
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Maintenance from './pages/Maintenance';
import MaintenanceDetail from './pages/MaintenanceDetail';
import SubscriptionPlans from './pages/SubscriptionPlans';
import ReceiptHistory from './pages/ReceiptHistory';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Admin Route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

function App() {
  const { user } = useAuth();

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/properties" element={
            <ProtectedRoute>
              <Properties />
            </ProtectedRoute>
          } />
          
          <Route path="/properties/:id" element={
            <ProtectedRoute>
              <PropertyDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/maintenance" element={
            <ProtectedRoute>
              <Maintenance />
            </ProtectedRoute>
          } />
          
          <Route path="/maintenance/:id" element={
            <ProtectedRoute>
              <MaintenanceDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/subscription" element={
            <ProtectedRoute>
              <SubscriptionPlans />
            </ProtectedRoute>
          } />
          
          <Route path="/receipts" element={
            <ProtectedRoute>
              <ReceiptHistory />
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;