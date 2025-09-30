import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Image, 
  Package,
  History, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Globe,
  Coins,
  BarChart3,
  Video,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const navigation = [
    { name: t('nav.home'), href: '/dashboard', icon: Home },
    { name: t('nav.virtualTryOn'), href: '/virtual-tryon', icon: Image },
    // { name: t('nav.productImageTools'), href: '/product-image-tools', icon: Package },
    // { name: 'Phân tích sản phẩm', href: '/product-analysis', icon: BarChart3 },
    { name: 'Product Analysis Aff', href: '/product-analysis-aff', icon: Coins },
    // { name: 'Product Image Generator', href: '/product-image-generator', icon: Sparkles },
    // { name: 'Product AI Flow', href: '/product-ai-flow', icon: Zap },
    // { name: 'Video Test', href: '/video-test', icon: Video },
    // { name: t('nav.history'), href: '/history', icon: History },
    { name: t('nav.profile'), href: '/profile', icon: User },
  ];

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center">
                <Image className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-primary-900">AI Image</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User info */}
          {user && (
            <div className="px-4 py-4 border-b border-neutral-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-800 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary-900 truncate">
                    {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.email}
                  </p>
                  <div className="flex items-center space-x-1 text-xs text-neutral-500">
                    <Coins className="w-3 h-3 text-secondary-500" />
                    <span>{user.credits} tín dụng còn lại</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.href);
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-primary-800 text-white shadow-sm'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-primary-700'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-5 w-5',
                      isActive ? 'text-white' : 'text-neutral-400 group-hover:text-primary-600'
                    )}
                  />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer actions */}
          <div className="px-2 py-4 border-t border-neutral-200 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="w-full justify-start text-neutral-600 hover:text-primary-600 hover:bg-neutral-100"
            >
              <Globe className="w-4 h-4 mr-3" />
              {i18n.language === 'en' ? 'Tiếng Việt' : 'English'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-3" />
              {t('nav.logout')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-600 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex-1 lg:hidden" />
            
            {/* Mobile user info */}
            <div className="lg:hidden">
              {user && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Coins className="w-4 h-4" />
                    <span>{user.credits}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
