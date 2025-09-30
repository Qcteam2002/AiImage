import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Image, Globe, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';
import GoogleOAuthButton from '../components/ui/GoogleOAuthButton';

interface RegisterForm {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register: registerUser } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);
      await registerUser({
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
      });
      setSuccess(true);
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="glass-effect text-center">
            <CardBody className="space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('auth.register.registerSuccess')}
                </h2>
                <p className="text-sm text-gray-600">
                  {t('auth.register.registerSuccess')}
                </p>
              </div>

              <Button
                onClick={() => navigate('/login')}
                className="w-full"
                size="lg"
              >
                {t('auth.register.signIn')}
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

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
            {t('auth.register.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.register.subtitle')}
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

        {/* Register form */}
        <Card className="glass-effect">
          <CardBody className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('auth.register.firstName')}
                  autoComplete="given-name"
                  error={errors.firstName?.message}
                  {...register('firstName', {
                    minLength: {
                      value: 2,
                      message: t('auth.register.firstNameRequired'),
                    },
                  })}
                />

                <Input
                  label={t('auth.register.lastName')}
                  autoComplete="family-name"
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>

              <Input
                label={t('auth.register.email')}
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email', {
                  required: t('auth.register.emailRequired'),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('auth.register.emailInvalid'),
                  },
                })}
              />

              <div className="relative">
                <Input
                  label={t('auth.register.password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  error={errors.password?.message}
                  {...register('password', {
                    required: t('auth.register.passwordRequired'),
                    minLength: {
                      value: 8,
                      message: t('auth.register.passwordMin'),
                    },
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

              <div className="relative">
                <Input
                  label={t('auth.register.confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword', {
                    required: t('auth.register.passwordRequired'),
                    validate: (value) =>
                      value === password || t('auth.register.passwordMatch'),
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                {t('auth.register.signUp')}
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
              text={t('auth.register.continueWithGoogle')}
              disabled={loading}
            />

            <div className="text-center">
              <div className="text-sm text-gray-600">
                {t('auth.register.hasAccount')}{' '}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {t('auth.register.signIn')}
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
