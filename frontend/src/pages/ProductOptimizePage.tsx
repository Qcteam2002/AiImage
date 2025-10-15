import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Sparkles, Megaphone, Zap, Brain } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Typography } from '../components/design-system/Typography';
import AddProductModal from '../components/ProductOptimize/AddProductModal';
import ProductOptimizeModal from '../components/ProductOptimize/ProductOptimizeModal';
import ProductOptimizeModalAdvanced from '../components/ProductOptimize/ProductOptimizeModalAdvanced';
import ProductOptimizeModalV2 from '../components/ProductOptimize/ProductOptimizeModalV2';
import ProductAdsGeneratorModal from '../components/ProductOptimize/ProductAdsGeneratorModal';

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

const ProductOptimizePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  const [showOptimizeAdvancedModal, setShowOptimizeAdvancedModal] = useState(false);
  const [showOptimizeV2Modal, setShowOptimizeV2Modal] = useState(false);
  const [showAdsModal, setShowAdsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/product-optimize/products');
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded products:', data.products);
        // Debug each product's image_url
        data.products?.forEach((product: any, index: number) => {
          console.log(`Product ${index}:`, {
            id: product.id,
            name: product.name,
            image_url: product.image_url,
            hasImage: !!product.image_url
          });
        });
        setProducts(data.products || []);
      } else {
        console.error('Failed to load products:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData: any) => {
    try {
      const response = await fetch('/api/product-optimize/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        await loadProducts(); // Reload products
        setShowAddModal(false);
      } else {
        throw new Error('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Có lỗi xảy ra khi thêm sản phẩm');
    }
  };

  const handleOptimizeProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowOptimizeModal(true);
  };

  const handleOptimizeProductAdvanced = (product: Product) => {
    setSelectedProduct(product);
    setShowOptimizeAdvancedModal(true);
  };

  const handleOptimizeProductV2 = (product: Product) => {
    setSelectedProduct(product);
    setShowOptimizeV2Modal(true);
  };

  const handleGenerateAds = (product: Product) => {
    setSelectedProduct(product);
    setShowAdsModal(true);
  };


  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    try {
      const response = await fetch(`/api/product-optimize/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadProducts(); // Reload products
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Có lỗi xảy ra khi xóa sản phẩm');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <Typography.H2>
                Product Optimize
              </Typography.H2>
              <Typography.BodySmall>
                Quản lý và tối ưu hóa nội dung sản phẩm với AI
              </Typography.BodySmall>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button
              variant="secondary"
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <Typography.Body className="ml-3 text-gray-600">Đang tải sản phẩm...</Typography.Body>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <Typography.H3>
              Chưa có sản phẩm nào
            </Typography.H3>
            <Typography.BodyMedium className="mb-6">
              Bắt đầu bằng cách thêm sản phẩm đầu tiên của bạn
            </Typography.BodyMedium>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Product
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hình ảnh
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                      {/* Product Image */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 h-16 w-16">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                              onLoad={() => console.log('Image loaded successfully:', product.image_url)}
                              onError={(e) => {
                                console.error('Image failed to load:', product.image_url);
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) {
                                  fallback.classList.remove('hidden');
                                }
                              }}
                            />
                          ) : null}
                          <div className={`h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center border border-gray-200 ${product.image_url ? 'hidden' : ''}`}>
                            <Typography.Caption>No Image</Typography.Caption>
                          </div>
                        </div>
                      </td>

                      {/* Product Name */}
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <Typography.H6 className="line-clamp-2">
                            {product.name}
                          </Typography.H6>
                        </div>
                      </td>

                      {/* Product Description */}
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <Typography.BodySmall className="line-clamp-2">
                            {product.description || 'Không có mô tả'}
                          </Typography.BodySmall>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Typography.Caption className="text-gray-500">
                          {new Date(product.created_at).toLocaleDateString('vi-VN')}
                        </Typography.Caption>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                          <Button
                            onClick={() => handleOptimizeProduct(product)}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 py-1.5 rounded-md text-xs"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            Optimize
                          </Button>

                          <Button
                            onClick={() => handleOptimizeProductV2(product)}
                            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold"
                            title="New flow with Market Insight"
                          >
                            <Brain className="w-3 h-3 mr-1" />
                            Optimize 2
                          </Button>

                          <Button
                            onClick={() => handleOptimizeProductAdvanced(product)}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-3 py-1.5 rounded-md text-xs"
                            title="Advanced Optimize with more options"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Advanced
                          </Button>
                          
                          <Button
                            onClick={() => handleGenerateAds(product)}
                            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-3 py-1.5 rounded-md text-xs"
                          >
                            <Megaphone className="w-3 h-3 mr-1" />
                            Generate Ads
                          </Button>
                          
                          <Button
                            variant="secondary"
                            size="sm"
                            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
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
        )}
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProduct}
      />

      <ProductOptimizeModal
        isOpen={showOptimizeModal}
        onClose={() => setShowOptimizeModal(false)}
        product={selectedProduct}
      />

      <ProductOptimizeModalAdvanced
        isOpen={showOptimizeAdvancedModal}
        onClose={() => setShowOptimizeAdvancedModal(false)}
        product={selectedProduct}
      />

      <ProductOptimizeModalV2
        isOpen={showOptimizeV2Modal}
        onClose={() => setShowOptimizeV2Modal(false)}
        product={selectedProduct}
      />

      <ProductAdsGeneratorModal
        isOpen={showAdsModal}
        onClose={() => setShowAdsModal(false)}
        product={selectedProduct}
      />
    </div>
  );
};

export default ProductOptimizePage;
