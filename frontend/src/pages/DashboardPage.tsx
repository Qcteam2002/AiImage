import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Image, 
  History, 
  Coins, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Zap,
  Target,
  BarChart3,
  Activity,
  Star,
  ArrowRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { dashboardService, DashboardData, RecentProcess } from '../services/dashboardService';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateCredits } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardStats();
      setDashboardData(data);
      
      // Update credits in context if different
      if (data.user.credits !== user?.credits) {
        updateCredits(data.user.credits);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-error-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning-500" />;
      default:
        return <Clock className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-success-50 text-success-700 border-success-200';
      case 'failed':
        return 'bg-error-50 text-error-700 border-error-200';
      case 'pending':
        return 'bg-warning-50 text-warning-700 border-warning-200';
      default:
        return 'bg-neutral-50 text-neutral-700 border-neutral-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProcessType = (metadata: any) => {
    if (metadata?.apiUsed === 'openrouter' || metadata?.type === 'virtual-tryon') {
      return 'Virtual Try-On';
    } else if (metadata?.type === 'optimize' || metadata?.uploadType === 'files') {
      return 'Image Optimize';
    } else if (metadata?.type === 'product-image') {
      return 'Product Image';
    }
    return 'Image Process';
  };

  const quickActions = [
    {
      title: t('nav.virtualTryOn'),
      description: 'Thử quần áo ảo với AI',
      icon: Target,
      action: () => navigate('/virtual-tryon'),
      primary: true,
      color: 'secondary',
    },
    {
      title: t('nav.optimizeImage'),
      description: 'Nâng cao ảnh sản phẩm',
      icon: Image,
      action: () => navigate('/optimize'),
      color: 'primary',
    },
    {
      title: t('nav.productTools'),
      description: 'Chụp ảnh sản phẩm chuyên nghiệp',
      icon: Zap,
      action: () => navigate('/product-tools'),
      color: 'accent',
    },
    {
      title: t('nav.history'),
      description: 'Xem lịch sử xử lý ảnh',
      icon: History,
      action: () => navigate('/history'),
      color: 'neutral',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-error-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Không thể tải dashboard</h3>
          <p className="text-neutral-600 mb-4">{error}</p>
          <Button onClick={loadDashboardData} className="flex items-center gap-2 bg-primary-800 hover:bg-primary-900">
            <RefreshCw className="w-4 h-4" />
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { stats, usage, recentProcesses } = dashboardData;

  return (
    <div className="min-h-full bg-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-primary-900 mb-3">
            Chào mừng trở lại{user?.first_name ? `, ${user.first_name}` : ''}! 👋
          </h1>
          <p className="text-lg text-neutral-600">
            Tổng quan về quá trình xử lý ảnh AI và hoạt động gần đây của bạn.
          </p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Credits */}
          <Card className="border border-neutral-200 bg-gradient-to-br from-primary-800 to-primary-900 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-100 text-sm font-medium mb-1">Tín dụng còn lại</p>
                  <p className="text-4xl font-bold">{stats.creditsRemaining}</p>
                  {stats.creditsRemaining < 5 && (
                    <p className="text-primary-200 text-xs mt-1">Nên mua thêm</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Coins className="w-6 h-6" />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Processed */}
          <Card className="border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 text-sm font-medium mb-1">Tổng đã xử lý</p>
                  <p className="text-4xl font-bold text-primary-900">{stats.totalProcessed}</p>
                  <p className="text-xs text-neutral-500 mt-1">{stats.thisWeekActivity} tuần này</p>
                </div>
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Success Rate */}
          <Card className="border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 text-sm font-medium mb-1">Tỷ lệ thành công</p>
                  <p className="text-4xl font-bold text-primary-900">{stats.successRate}%</p>
                  <p className="text-xs text-neutral-500 mt-1">{stats.successful} thành công</p>
                </div>
                <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-accent-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Pending */}
          <Card className="border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 text-sm font-medium mb-1">Đang xử lý</p>
                  <p className="text-4xl font-bold text-primary-900">{stats.pending}</p>
                  <p className="text-xs text-neutral-500 mt-1">Đang tiến hành</p>
                </div>
                <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="border border-neutral-200 bg-white shadow-sm">
              <CardHeader className="pb-6">
                <h2 className="text-2xl font-bold text-primary-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  Hành động nhanh
                </h2>
                <p className="text-neutral-600">Bắt đầu xử lý ảnh của bạn với AI</p>
              </CardHeader>
              <CardBody className="space-y-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  const colorClasses = {
                    primary: 'bg-primary-50 border-primary-200 hover:bg-primary-100 text-primary-700',
                    secondary: 'bg-secondary-50 border-secondary-200 hover:bg-secondary-100 text-secondary-700',
                    accent: 'bg-accent-50 border-accent-200 hover:bg-accent-100 text-accent-700',
                    neutral: 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-700',
                  };
                  
                  return (
                    <div
                      key={index}
                      className={`group p-6 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
                        action.primary 
                          ? 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white border-0' 
                          : colorClasses[action.color as keyof typeof colorClasses]
                      }`}
                      onClick={action.action}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          action.primary 
                            ? 'bg-white bg-opacity-20' 
                            : `bg-${action.color}-100`
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            action.primary 
                              ? 'text-white' 
                              : `text-${action.color}-600`
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${
                            action.primary ? 'text-white' : 'text-primary-900'
                          } group-hover:opacity-90`}>
                            {action.title}
                          </h3>
                          <p className={`text-sm ${
                            action.primary ? 'text-white text-opacity-90' : 'text-neutral-600'
                          }`}>
                            {action.description}
                          </p>
                        </div>
                        <ArrowRight className={`w-5 h-5 ${
                          action.primary ? 'text-white text-opacity-80' : 'text-neutral-400'
                        } group-hover:translate-x-1 transition-transform`} />
                      </div>
                    </div>
                  );
                })}
              </CardBody>
            </Card>

            {/* Usage Breakdown */}
            <Card className="mt-8 border border-neutral-200 bg-white shadow-sm">
              <CardHeader className="pb-6">
                <h2 className="text-2xl font-bold text-primary-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent-600 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  Phân tích sử dụng
                </h2>
                <p className="text-neutral-600">Hoạt động xử lý ảnh theo loại</p>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg border border-secondary-200">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-secondary-600" />
                      <span className="font-medium text-primary-900">Virtual Try-On</span>
                    </div>
                    <span className="text-2xl font-bold text-secondary-600">{usage.virtualTryOn}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg border border-primary-200">
                    <div className="flex items-center gap-3">
                      <Image className="w-5 h-5 text-primary-600" />
                      <span className="font-medium text-primary-900">Tối ưu ảnh</span>
                    </div>
                    <span className="text-2xl font-bold text-primary-600">{usage.optimize}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-accent-50 rounded-lg border border-accent-200">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-accent-600" />
                      <span className="font-medium text-primary-900">Ảnh sản phẩm</span>
                    </div>
                    <span className="text-2xl font-bold text-accent-600">{usage.productImage}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Recent Activity & Tips */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="border border-neutral-200 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <h2 className="text-xl font-bold text-primary-900 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary-600" />
                  Hoạt động gần đây
                </h2>
              </CardHeader>
              <CardBody>
                {recentProcesses.length > 0 ? (
                  <div className="space-y-3">
                    {recentProcesses.map((process: RecentProcess) => (
                      <div key={process.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-50 border border-neutral-100 transition-colors">
                        {getStatusIcon(process.status)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primary-900 truncate">
                            {getProcessType(process.metadata)}
                          </p>
                          <p className="text-xs text-neutral-500">{formatDate(process.createdAt)}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(process.status)}`}>
                          {process.status}
                        </span>
                      </div>
                    ))}
                    <Button 
                      className="w-full mt-4 bg-primary-800 hover:bg-primary-900 text-white"
                      onClick={() => navigate('/history')}
                    >
                      Xem tất cả lịch sử
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Image className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500 text-sm">Chưa có hoạt động gần đây</p>
                    <p className="text-neutral-400 text-xs">Bắt đầu xử lý ảnh để xem hoạt động ở đây</p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Tips & Recommendations */}
            <Card className="bg-neutral-50 border border-neutral-200">
              <CardHeader className="pb-4">
                <h2 className="text-xl font-bold text-primary-900 flex items-center gap-3">
                  <Star className="w-5 h-5 text-warning-500" />
                  Mẹo & Đề xuất
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                {stats.successRate < 70 && stats.totalProcessed > 0 && (
                  <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                    <p className="text-sm text-warning-800">
                      <strong>Mẹo:</strong> Tỷ lệ thành công của bạn là {stats.successRate}%. Hãy thử sử dụng ảnh chất lượng cao hơn để có kết quả tốt hơn.
                    </p>
                  </div>
                )}
                
                {stats.creditsRemaining < 5 && (
                  <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                    <p className="text-sm text-error-800">
                      <strong>Tín dụng thấp:</strong> Bạn còn {stats.creditsRemaining} tín dụng. Hãy cân nhắc mua thêm để tiếp tục xử lý.
                    </p>
                  </div>
                )}

                {usage.virtualTryOn === 0 && stats.totalProcessed > 0 && (
                  <div className="p-4 bg-accent-50 border border-accent-200 rounded-lg">
                    <p className="text-sm text-accent-800">
                      <strong>Thử Virtual Try-On:</strong> Bạn chưa sử dụng tính năng thử quần áo ảo. Rất tuyệt cho thời trang và quần áo!
                    </p>
                  </div>
                )}

                <div className="p-4 bg-white border border-neutral-200 rounded-lg">
                  <p className="text-sm text-neutral-800">
                    <strong>Mẹo chuyên nghiệp:</strong> Sử dụng ảnh độ phân giải cao (ít nhất 1024x1024) để có kết quả xử lý AI tốt nhất.
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Getting Started */}
            <Card className="border border-neutral-200 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <h2 className="text-xl font-bold text-primary-900">Hướng dẫn bắt đầu</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-800 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <p className="text-sm text-neutral-700">Tải lên ảnh mẫu và sản phẩm của bạn</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-secondary-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <p className="text-sm text-neutral-700">Để AI tối ưu hóa ảnh của bạn</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <p className="text-sm text-neutral-700">Tải xuống kết quả của bạn</p>
                  </div>
                </div>

                <Button
                  onClick={() => navigate('/virtual-tryon')}
                  className="w-full mt-6 bg-secondary-500 hover:bg-secondary-600 text-white"
                >
                  Bắt đầu với Virtual Try-On
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;