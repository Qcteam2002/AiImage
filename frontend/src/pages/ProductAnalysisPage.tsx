import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AddProductModal from '../components/AddProductModal';
import { useTranslation } from 'react-i18next';
import { productService, Product } from '../services/productService';
import toast from 'react-hot-toast';


const ProductAnalysisPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'waiting' | 'processing' | 'done' | 'error'>('all');
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Load products from API
  useEffect(() => {
    loadProducts();
  }, [searchTerm, filterStatus]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({
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

  const getStatusIcon = (status: Product['status']) => {
    switch (status) {
      case 'waiting':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <LoadingSpinner className="w-4 h-4 text-blue-500" />;
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: Product['status']) => {
    switch (status) {
      case 'waiting':
        return 'Đang chờ';
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

  const handleProductClick = (product: Product) => {
    if (product.status === 'done') {
      navigate(`/product-analysis/${product.id}`);
    }
  };

  const handleAddProduct = async (productData: { name: string; image_url?: string; product_url?: string; description?: string }) => {
    try {
      const newProduct = await productService.createProduct(productData);
      setProducts(prev => [newProduct, ...prev]);
      setShowAddModal(false);
      toast.success('Sản phẩm đã được thêm thành công');
      
      // Start analysis immediately
      try {
        await productService.analyzeProduct(newProduct.id);
        toast.success('Đã bắt đầu phân tích sản phẩm');
        // Reload products to get updated status
        loadProducts();
      } catch (analysisError) {
        console.error('Error starting analysis:', analysisError);
        toast.error('Không thể bắt đầu phân tích sản phẩm');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Không thể thêm sản phẩm');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Phân tích sản phẩm</h1>
        <p className="text-gray-600">Quản lý và phân tích sản phẩm của bạn với AI</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="waiting">Đang chờ</option>
            <option value="processing">Đang xử lý</option>
            <option value="done">Hoàn thành</option>
            <option value="error">Lỗi</option>
          </select>
          
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Bắt đầu bằng cách thêm sản phẩm đầu tiên của bạn'
            }
          </p>
          {(!searchTerm && filterStatus === 'all') && (
            <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 mx-auto">
              <Plus className="w-4 h-4" />
              Thêm sản phẩm đầu tiên
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                product.status === 'done' ? 'hover:scale-105' : 'cursor-not-allowed opacity-75'
              }`}
              onClick={() => handleProductClick(product)}
            >
              {/* Product Image */}
              <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Search className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(product.created_at).toLocaleDateString('vi-VN')}</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(product.status)}
                    <span>{getStatusText(product.status)}</span>
                  </div>
                </div>

                {product.status === 'done' && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Eye className="w-4 h-4" />
                      <span>Xem chi tiết phân tích</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
};

export default ProductAnalysisPage;
