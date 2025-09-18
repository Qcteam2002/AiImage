import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Calendar, Coins, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody, CardHeader } from '../components/ui/Card';

const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('profile.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {t('profile.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">
                  {t('profile.personalInfo')}
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t('auth.register.firstName')}
                    defaultValue={user?.first_name || ''}
                  />
                  <Input
                    label={t('auth.register.lastName')}
                    defaultValue={user?.last_name || ''}
                  />
                </div>
                <Input
                  label={t('auth.register.email')}
                  type="email"
                  defaultValue={user?.email || ''}
                  disabled
                />
                <Button>
                  {t('profile.updateProfile')}
                </Button>
              </CardBody>
            </Card>

            {/* Password Change */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">
                  {t('profile.changePassword')}
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                />
                <Input
                  label="New Password"
                  type="password"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                />
                <Button>
                  Update Password
                </Button>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">
                  {t('profile.accountInfo')}
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                    <p className="text-xs text-gray-500">Email Address</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Coins className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user?.credits || 0}</p>
                    <p className="text-xs text-gray-500">{t('profile.credits')}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">{t('profile.joinedAt')}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Language Settings */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">
                  {t('profile.language')}
                </h2>
              </CardHeader>
              <CardBody>
                <Button
                  variant="secondary"
                  onClick={toggleLanguage}
                  className="w-full justify-start"
                >
                  <Globe className="w-4 h-4 mr-3" />
                  {i18n.language === 'en' ? 'Tiếng Việt' : 'English'}
                </Button>
              </CardBody>
            </Card>

            {/* User Avatar */}
            <Card>
              <CardBody className="text-center">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email}
                </h3>
                <p className="text-sm text-gray-500">AI Image User</p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
