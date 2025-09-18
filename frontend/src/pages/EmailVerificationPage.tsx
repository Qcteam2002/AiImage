import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { authAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('pending');
  const [message, setMessage] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setStatus('loading');
      const response = await authAPI.verifyEmail(verificationToken);
      setMessage(response.data.message);
      setStatus('success');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      setMessage(error.response?.data?.error || t('auth.verification.error'));
      setStatus('error');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <h2 className="text-2xl font-bold text-gray-900">
              {t('common.loading')}
            </h2>
            <p className="text-gray-600">
              Verifying your email address...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('auth.verification.success')}
              </h2>
              <p className="text-gray-600">
                {message || t('auth.verification.success')}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/login')}
                className="w-full"
                size="lg"
              >
                {t('auth.login.signIn')}
              </Button>
              <p className="text-sm text-gray-500">
                Redirecting to login in 3 seconds...
              </p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('auth.verification.error')}
              </h2>
              <p className="text-gray-600">
                {message}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/register')}
                className="w-full"
              >
                {t('auth.verification.resend')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('auth.verification.title')}
              </h2>
              <p className="text-gray-600">
                Please check your email for a verification link, or click the link in your email to verify your account.
              </p>
            </div>

            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="glass-effect">
          <CardBody className="py-12">
            {renderContent()}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
