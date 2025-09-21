import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useAdmin } from '../contexts/AdminContext';
import AdminLayout from '../components/AdminLayout';
import toast from 'react-hot-toast';

const AdminChangePassword: React.FC = () => {
  const { t } = useTranslation();
  const { logout } = useAdmin();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      toast.error('Current password is required');
      return false;
    }
    if (!formData.newPassword) {
      toast.error('New password is required');
      return false;
    }
    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      toast.error('New password must be different from current password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Admin session expired');
        logout();
        return;
      }

      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password changed successfully!');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Change Password
          </h1>
          <p className="text-gray-600">
            Update your admin account password
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">
              Security Settings
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <Label htmlFor="currentPassword">
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Enter current password"
                  required
                  className="mt-1"
                />
              </div>

              {/* New Password */}
              <div>
                <Label htmlFor="newPassword">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password (min 6 characters)"
                  required
                  className="mt-1"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  required
                  className="mt-1"
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                  className="flex-1"
                  size="lg"
                >
                  {loading ? 'Changing Password...' : 'Change Password'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="flex-1"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </form>

            {/* Security Tips */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Password Security Tips:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use at least 6 characters</li>
                <li>• Include numbers and special characters</li>
                <li>• Avoid common words or personal info</li>
                <li>• Don't reuse passwords from other accounts</li>
              </ul>
            </div>
          </CardBody>
        </Card>
      </div>
      </div>
    </AdminLayout>
  );
};

export default AdminChangePassword;
