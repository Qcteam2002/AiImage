import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Clock, CheckCircle, XCircle, Coins, RotateCcw, Trash2, Grid3X3, List } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AddProductAffModal from '../components/AddProductAffModal';
import RetryAnalysisModal from '../components/RetryAnalysisModal';
import { productAffService, ProductAff } from '../services/productAffService';
import toast from 'react-hot-toast';

const ProductAnalysisAffPage: React.FC = () => {
  const [products, setProducts] = useState<ProductAff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [retryProduct, setRetryProduct] = useState<ProductAff | null>(null);
  const [retryLoading, setRetryLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'waiting' | 'processing' | 'done' | 'error'>('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const navigate = useNavigate();

  // Load products from API
  useEffect(() => {
    loadProducts();
  }, [searchTerm, filterStatus]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productAffService.getProducts({
        search: searchTerm || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        limit: 50
      });
      setProducts(response.products);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // No need for client-side filtering since API handles it
  const filteredProducts = products;

  const getStatusIcon = (status: ProductAff['status']) => {
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

  const getStatusText = (status: ProductAff['status']) => {
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

  const getStatusColor = (status: ProductAff['status']) => {
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

  const handleViewProduct = (productId: string) => {
    navigate(`/product-analysis-aff/${productId}`);
  };

  const handleAddProduct = () => {
    setShowAddModal(true);
  };

  const handleProductAdded = async (productId: string) => {
    setShowAddModal(false);
    loadProducts();
    toast.success('Sản phẩm đã được thêm thành công!');
    
    // Start analysis immediately
    try {
      // Update UI immediately to show processing status
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, status: 'processing' as const }
            : product
        )
      );

      await productAffService.analyzeProduct(productId);
      toast.success('Đã bắt đầu phân tích sản phẩm');
      // Reload products to get updated status
      loadProducts();
    } catch (analysisError) {
      console.error('Error starting analysis:', analysisError);
      toast.error('Không thể bắt đầu phân tích sản phẩm');
      
      // Revert status on error
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, status: 'error' as const }
            : product
        )
      );
    }
  };

  const handleRetryAnalysis = (product: ProductAff) => {
    setRetryProduct(product);
    setShowRetryModal(true);
  };

  const handleRetryConfirm = async (targetMarket: string) => {
    if (!retryProduct) return;

    try {
      setRetryLoading(true);
      
      // Update target market if changed
      if (targetMarket !== retryProduct.target_market) {
        await productAffService.updateProduct(retryProduct.id, {
          target_market: targetMarket
        });
        toast.success('Target market đã được cập nhật');
      }

      // Update UI immediately to show processing status
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === retryProduct.id 
            ? { ...product, status: 'processing' as const }
            : product
        )
      );

      // Start analysis
      await productAffService.analyzeProduct(retryProduct.id);
      toast.success('Đã bắt đầu phân tích lại sản phẩm');
      
      setShowRetryModal(false);
      setRetryProduct(null);
      
      // Reload products to get the latest status
      loadProducts();
    } catch (error) {
      console.error('Error retrying analysis:', error);
      toast.error('Không thể phân tích lại sản phẩm');
      
      // Revert status on error
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === retryProduct.id 
            ? { ...product, status: 'error' as const }
            : product
        )
      );
    } finally {
      setRetryLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await productAffService.deleteProduct(productId);
        toast.success('Sản phẩm đã được xóa thành công');
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Không thể xóa sản phẩm');
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
                Sản phẩm
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thị trường
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
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 max-w-xs">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      {product.image1 ? (
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={product.image1}
                          alt="Product"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Coins className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2" title={product.title || 'Sản phẩm không có tiêu đề'}>
                        {product.title || 'Sản phẩm không có tiêu đề'}
                      </div>
                      {product.description && (
                        <div className="text-sm text-gray-500 line-clamp-1" title={product.description}>
                          {product.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {product.target_market}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                    {getStatusIcon(product.status)}
                    <span className="ml-1">{getStatusText(product.status)}</span>
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(product.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewProduct(product.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRetryAnalysis(product)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
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
                <Coins className="w-8 h-8 mr-3 text-yellow-600" />
                Product Analysis Aff
              </h1>
              <p className="mt-2 text-gray-600">
                Phân tích sản phẩm cho affiliate marketing với AI
              </p>
            </div>
            <Button onClick={handleAddProduct} className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm
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
                placeholder="Tìm kiếm sản phẩm..."
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

        {/* Products Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Coins className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có sản phẩm nào
            </h3>
            <p className="text-gray-600 mb-6">
              Hãy thêm sản phẩm đầu tiên để bắt đầu phân tích
            </p>
            <Button onClick={handleAddProduct}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </Button>
          </div>
        ) : viewMode === 'table' ? (
          renderTableView()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2" title={product.title || 'Sản phẩm không có tiêu đề'}>
                      {product.title || 'Sản phẩm không có tiêu đề'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Target Market: {product.target_market}
                    </p>
                    {product.description && (
                      <p className="text-sm text-gray-500 line-clamp-3" title={product.description}>
                        {product.description}
                      </p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                    {getStatusIcon(product.status)}
                    <span className="ml-1">{getStatusText(product.status)}</span>
                  </div>
                </div>

                {/* Product Images */}
                <div className="flex gap-2 mb-4">
                  {product.image1 && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={product.image1}
                        alt="Product 1"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {product.image2 && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={product.image2}
                        alt="Product 2"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Created Date */}
                <div className="text-xs text-gray-500 mb-4">
                  Tạo lúc: {new Date(product.created_at).toLocaleString('vi-VN')}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewProduct(product.id)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Xem chi tiết
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRetryAnalysis(product)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <AddProductAffModal
            onClose={() => setShowAddModal(false)}
            onSuccess={handleProductAdded}
          />
        )}

        {/* Retry Analysis Modal */}
        {showRetryModal && retryProduct && (
          <RetryAnalysisModal
            isOpen={showRetryModal}
            onClose={() => {
              setShowRetryModal(false);
              setRetryProduct(null);
            }}
            onRetry={handleRetryConfirm}
            currentTargetMarket={retryProduct.target_market}
            loading={retryLoading}
          />
        )}
      </div>
    </div>
  );
};

export default ProductAnalysisAffPage;
