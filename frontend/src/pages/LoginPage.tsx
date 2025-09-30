import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Image, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';
import GoogleOAuthButton from '../components/ui/GoogleOAuthButton';

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (error: any) {
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        navigate('/verify-email');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <Image className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AI Image</h1>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900">
            {t('auth.login.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.login.subtitle')}
          </p>
          
          {/* Language toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="mt-4"
          >
            <Globe className="w-4 h-4 mr-2" />
            {i18n.language === 'en' ? 'Tiếng Việt' : 'English'}
          </Button>
        </div>

        {/* Login form */}
        <Card className="glass-effect">
          <CardBody className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label={t('auth.login.email')}
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email', {
                  required: t('auth.login.emailRequired'),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('auth.login.emailInvalid'),
                  },
                })}
              />

              <div className="relative">
                <Input
                  label={t('auth.login.password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register('password', {
                    required: t('auth.login.passwordRequired'),
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                {t('auth.login.signIn')}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <GoogleOAuthButton
              text={t('auth.login.continueWithGoogle')}
              disabled={loading}
            />

            <div className="text-center space-y-4">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {t('auth.login.forgotPassword')}
              </Link>

              <div className="text-sm text-gray-600">
                {t('auth.login.noAccount')}{' '}
                <Link
                  to="/register"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {t('auth.login.signUp')}
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
