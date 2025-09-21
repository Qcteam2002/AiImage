import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AdminContextType {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAdmin: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAdmin = async () => {
      const token = localStorage.getItem('adminToken');
      const savedAdmin = localStorage.getItem('adminUser');
      
      console.log('AdminContext: Initializing admin...', { token: !!token, savedAdmin: !!savedAdmin });
      
      if (token && savedAdmin) {
        try {
          const adminData = JSON.parse(savedAdmin);
          console.log('AdminContext: Setting admin from localStorage', adminData);
          setAdmin(adminData);
          // Refresh admin data from server
          await refreshAdmin();
        } catch (error) {
          console.error('Failed to parse saved admin:', error);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          setAdmin(null);
        }
      } else {
        console.log('AdminContext: No token or saved admin found');
        setAdmin(null);
      }
      
      setLoading(false);
    };

    initializeAdmin();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        setAdmin(data.admin);
        toast.success('Login successful!');
        navigate('/admin/dashboard');
      } else {
        toast.error(data.error || 'Login failed');
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('Login failed. Please try again.');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdmin(null);
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  const refreshAdmin = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.log('AdminContext: No token found, setting admin to null');
        setAdmin(null);
        return;
      }

      console.log('AdminContext: Refreshing admin profile...');
      const response = await fetch('/api/admin/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('AdminContext: Profile response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('AdminContext: Profile response data:', data);
        if (data.success) {
          setAdmin(data.admin);
          localStorage.setItem('adminUser', JSON.stringify(data.admin));
          console.log('AdminContext: Admin profile refreshed successfully');
        } else {
          console.log('AdminContext: Invalid response, logging out');
          logout();
        }
      } else if (response.status === 401) {
        console.log('AdminContext: Token expired or invalid, logging out');
        logout();
      } else {
        console.warn('AdminContext: Failed to refresh admin profile, keeping existing data');
      }
    } catch (error) {
      console.error('AdminContext: Failed to refresh admin:', error);
      // Don't logout on network errors, keep existing data
    }
  };

  const value = {
    admin,
    loading,
    login,
    logout,
    refreshAdmin,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
