import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Clock, CheckCircle, XCircle, MapPin, RotateCcw, Trash2, Grid3X3, List } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import AddMarketExplorerModal from '../components/AddMarketExplorerModal';
import { marketExplorerService, MarketExplorer } from '../services/marketExplorerService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const MarketExplorerPage: React.FC = () => {
  const { t } = useTranslation();
  const [marketExplorers, setMarketExplorers] = useState<MarketExplorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'waiting' | 'processing' | 'done' | 'error'>('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const navigate = useNavigate();

  // Load market explorers from API
  useEffect(() => {
    loadMarketExplorers();
  }, [searchTerm, filterStatus]);

  const loadMarketExplorers = async () => {
    try {
      setLoading(true);
      const response = await marketExplorerService.getMarketExplorers();
      let filtered = response.marketExplorers;
      
      // Client-side filtering for search and status
      if (searchTerm) {
        filtered = filtered.filter(item => 
          item.target_country.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.business_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.industry_category && item.industry_category.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      if (filterStatus !== 'all') {
        filtered = filtered.filter(item => item.status === filterStatus);
      }
      
      setMarketExplorers(filtered);
    } catch (error) {
      console.error('Error loading market explorers:', error);
      toast.error('Không thể tải danh sách thị trường');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: MarketExplorer['status']) => {
    switch (status) {
      case 'waiting':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <LoadingSpinner size="sm" />;
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: MarketExplorer['status']) => {
    switch (status) {
      case 'waiting':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'done':
        return 'Hoàn thành';
      case 'error':
        return 'Lỗi';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status: MarketExplorer['status']) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBusinessModelText = (model: string) => {
    switch (model) {
      case 'Dropshipping':
        return 'Dropshipping';
      case 'Affiliate':
        return 'Affiliate';
      case 'Both':
        return 'Cả hai';
      case 'Self-Business':
        return 'Tự kinh doanh';
      default:
        return model;
    }
  };

  const handleViewMarket = (marketId: string) => {
    navigate(`/market-explorer/${marketId}`);
  };

  const handleAddMarket = () => {
    setShowAddModal(true);
  };


  const handleRetryAnalysis = async (market: MarketExplorer) => {
    try {
      // Update UI immediately to show processing status
      setMarketExplorers(prevMarkets => 
        prevMarkets.map(m => 
          m.id === market.id 
            ? { ...m, status: 'processing' as const }
            : m
        )
      );

      await marketExplorerService.analyzeMarketExplorer(market.id);
      toast.success('Đã bắt đầu phân tích lại thị trường');
      loadMarketExplorers();
    } catch (error) {
      console.error('Error retrying analysis:', error);
      toast.error('Không thể phân tích lại thị trường');
      
      // Revert status on error
      setMarketExplorers(prevMarkets => 
        prevMarkets.map(m => 
          m.id === market.id 
            ? { ...m, status: 'error' as const }
            : m
        )
      );
    }
  };

  const handleDeleteMarket = async (marketId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thị trường này?')) {
      try {
        await marketExplorerService.deleteMarketExplorer(marketId);
        toast.success('Thị trường đã được xóa thành công');
        loadMarketExplorers();
      } catch (error) {
        console.error('Error deleting market:', error);
        toast.error('Không thể xóa thị trường');
      }
    }
  };

  // Table View Component
  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thị trường
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mô hình kinh doanh
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngành hàng
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {marketExplorers.map((market) => (
              <tr key={market.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 max-w-xs">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {market.target_country}
                      </div>
                      {market.business_goals && (
                        <div className="text-sm text-gray-500 line-clamp-1" title={market.business_goals}>
                          {market.business_goals}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {getBusinessModelText(market.business_model)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {market.industry_category || 'Chưa xác định'}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(market.status)}`}>
                    {getStatusIcon(market.status)}
                    <span className="ml-1">{getStatusText(market.status)}</span>
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(market.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewMarket(market.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRetryAnalysis(market)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMarket(market.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <MapPin className="w-8 h-8 mr-3 text-blue-600" />
                {t('nav.marketExplorer')}
              </h1>
              <p className="mt-2 text-gray-600">
                Phân tích thị trường và tìm kiếm cơ hội kinh doanh
              </p>
            </div>
            <Button onClick={handleAddMarket} className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Thêm thị trường
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Tìm kiếm thị trường..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'card'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid3X3 className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Card</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="waiting">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="done">Hoàn thành</option>
              <option value="error">Lỗi</option>
            </select>
          </div>
        </div>

        {/* Markets Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : marketExplorers.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có thị trường nào
            </h3>
            <p className="text-gray-600 mb-6">
              Hãy thêm thị trường đầu tiên để bắt đầu phân tích
            </p>
            <Button onClick={handleAddMarket}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm thị trường
            </Button>
          </div>
        ) : viewMode === 'table' ? (
          renderTableView()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketExplorers.map((market) => (
              <Card key={market.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {market.target_country}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Mô hình: {getBusinessModelText(market.business_model)}
                    </p>
                    {market.industry_category && (
                      <p className="text-sm text-gray-600 mb-2">
                        Ngành: {market.industry_category}
                      </p>
                    )}
                    {market.business_goals && (
                      <p className="text-sm text-gray-500 line-clamp-3" title={market.business_goals}>
                        {market.business_goals}
                      </p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(market.status)}`}>
                    {getStatusIcon(market.status)}
                    <span className="ml-1">{getStatusText(market.status)}</span>
                  </div>
                </div>

                {/* Created Date */}
                <div className="text-xs text-gray-500 mb-4">
                  Tạo lúc: {new Date(market.created_at).toLocaleString('vi-VN')}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewMarket(market.id)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Xem chi tiết
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRetryAnalysis(market)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMarket(market.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add Market Modal */}
        {showAddModal && (
          <AddMarketExplorerModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              loadMarketExplorers();
              toast.success('Thị trường đã được thêm thành công!');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MarketExplorerPage;