import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Image, History, User, Coins, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: t('nav.optimizeImage'),
      description: 'Transform your fashion photography with AI',
      icon: Image,
      action: () => navigate('/optimize'),
      primary: true,
    },
    {
      title: t('nav.history'),
      description: 'View your processed images',
      icon: History,
      action: () => navigate('/history'),
    },
    {
      title: t('nav.profile'),
      description: 'Manage your account settings',
      icon: User,
      action: () => navigate('/profile'),
    },
  ];

  // Mock stats - in real app, these would come from API
  const stats = {
    totalProcessed: 12,
    successful: 10,
    failed: 2,
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('dashboard.welcome')}{user?.first_name ? `, ${user.first_name}` : ''}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here's what's happening with your AI image processing today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Credits */}
          <Card>
            <CardBody className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Coins className="w-5 h-5 text-primary-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('dashboard.credits')}</p>
                <p className="text-2xl font-bold text-gray-900">{user?.credits || 0}</p>
              </div>
            </CardBody>
          </Card>

          {/* Total Processed */}
          <Card>
            <CardBody className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('dashboard.stats.totalProcessed')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProcessed}</p>
              </div>
            </CardBody>
          </Card>

          {/* Successful */}
          <Card>
            <CardBody className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('dashboard.stats.successful')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successful}</p>
              </div>
            </CardBody>
          </Card>

          {/* Failed */}
          <Card>
            <CardBody className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('dashboard.stats.failed')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">
                  {t('dashboard.quickActions')}
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50 ${
                        action.primary ? 'border-primary-200 bg-primary-50' : 'border-gray-200'
                      }`}
                      onClick={action.action}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            action.primary
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-500">{action.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardBody>
            </Card>
          </div>

          {/* Quick Start Guide */}
          <div>
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Getting Started</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                      1
                    </div>
                    <p className="text-sm text-gray-600">Upload your model and product images</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                      2
                    </div>
                    <p className="text-sm text-gray-600">Let AI optimize your images</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                      3
                    </div>
                    <p className="text-sm text-gray-600">Download your results</p>
                  </div>
                </div>

                <Button
                  onClick={() => navigate('/optimize')}
                  className="w-full mt-4"
                >
                  Start Optimizing
                </Button>
              </CardBody>
            </Card>

            {/* Credits Info */}
            {user && user.credits < 3 && (
              <Card className="mt-6 border-orange-200 bg-orange-50">
                <CardBody>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <h3 className="text-sm font-medium text-orange-800">Low Credits</h3>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    You have {user.credits} {user.credits === 1 ? 'credit' : 'credits'} remaining.
                    Contact support to get more credits.
                  </p>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
