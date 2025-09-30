import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { CheckCircle, XCircle } from 'lucide-react';

const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const token = searchParams.get('token');
        const success = searchParams.get('success');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage('OAuth authentication failed. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (success === 'true' && token) {
          // Store token and refresh user data
          localStorage.setItem('token', token);
          await refreshUser();
          
          setStatus('success');
          setMessage('Successfully logged in with Google!');
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          setStatus('error');
          setMessage('Invalid OAuth response. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage('An error occurred during authentication.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, refreshUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Authenticating...
              </h2>
              <p className="text-sm text-gray-600">
                Please wait while we complete your Google authentication.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Success!
              </h2>
              <p className="text-sm text-gray-600">
                {message}
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Authentication Failed
              </h2>
              <p className="text-sm text-gray-600">
                {message}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
