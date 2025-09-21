import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminChangePassword from './pages/AdminChangePassword';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AdminRoutes: React.FC = () => {
  const { admin, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={admin ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />} 
      />
      <Route 
        path="/dashboard" 
        element={admin ? <AdminDashboard /> : <Navigate to="/admin/login" replace />} 
      />
      <Route 
        path="/change-password" 
        element={admin ? <AdminChangePassword /> : <Navigate to="/admin/login" replace />} 
      />
      <Route 
        path="/" 
        element={<Navigate to="/admin/dashboard" replace />} 
      />
      <Route 
        path="*" 
        element={<Navigate to="/admin/dashboard" replace />} 
      />
    </Routes>
  );
};

const AdminApp: React.FC = () => {
  return (
    <AdminProvider>
      <AdminRoutes />
    </AdminProvider>
  );
};

export default AdminApp;
