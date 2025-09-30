import React, { useState } from 'react';
import { X, Upload, Link, Image as ImageIcon, Globe } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';
import LoadingSpinner from './ui/LoadingSpinner';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (data: { name: string; image_url?: string; product_url?: string; description?: string }) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onAddProduct }) => {
  const [activeTab, setActiveTab] = useState<'url' | 'info'>('url');
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    product_url: '',
    description: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (activeTab === 'url') {
      // For URL tab, only product_url is required
      if (!formData.product_url.trim()) {
        newErrors.product_url = 'URL sản phẩm là bắt buộc';
      } else if (!isValidUrl(formData.product_url)) {
        newErrors.product_url = 'URL sản phẩm không hợp lệ';
      }
    } else {
      // For info tab, name is required and at least one URL
      if (!formData.name.trim()) {
        newErrors.name = 'Tên sản phẩm là bắt buộc';
      }

      if (!formData.image_url.trim() && !formData.product_url.trim()) {
        newErrors.image_url = 'Vui lòng cung cấp ít nhất hình ảnh hoặc link sản phẩm';
        newErrors.product_url = 'Vui lòng cung cấp ít nhất hình ảnh hoặc link sản phẩm';
      }

      if (formData.image_url.trim() && !isValidUrl(formData.image_url)) {
        newErrors.image_url = 'URL hình ảnh không hợp lệ';
      }

      if (formData.product_url.trim() && !isValidUrl(formData.product_url)) {
        newErrors.product_url = 'URL sản phẩm không hợp lệ';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onAddProduct({
        name: formData.name || 'Sản phẩm từ URL', // Default name for URL tab
        image_url: formData.image_url || undefined,
        product_url: formData.product_url || undefined,
        description: formData.description || undefined
      });
      
      // Reset form
      setActiveTab('url');
      setFormData({
        name: '',
        image_url: '',
        product_url: '',
        description: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClose = () => {
    if (!isAnalyzing) {
      setActiveTab('url');
      setFormData({
        name: '',
        image_url: '',
        product_url: '',
        description: ''
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Thêm sản phẩm mới</h2>
            <button
              onClick={handleClose}
              disabled={isAnalyzing}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'url'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Product URL
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Product Information
                </div>
              </button>
            </nav>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Tab Content */}
            {activeTab === 'url' ? (
              /* Product URL Tab */
              <div className="space-y-6">
                <div className="text-center py-4">
                  <Globe className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Phân tích từ URL sản phẩm</h3>
                  <p className="text-sm text-gray-600">
                    Chỉ cần dán link sản phẩm, AI sẽ tự động phân tích thông tin
                  </p>
                </div>

                {/* Product URL */}
                <div>
                  <Label htmlFor="product_url" className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    URL sản phẩm *
                  </Label>
                  <Input
                    id="product_url"
                    type="url"
                    value={formData.product_url}
                    onChange={(e) => handleInputChange('product_url', e.target.value)}
                    placeholder="https://shopee.vn/product/... hoặc https://lazada.vn/..."
                    className={errors.product_url ? 'border-red-500' : ''}
                    disabled={isAnalyzing}
                  />
                  {errors.product_url && (
                    <p className="mt-1 text-sm text-red-600">{errors.product_url}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Hỗ trợ Shopee, Lazada, Tiki, Sendo và các trang thương mại điện tử khác
                  </p>
                </div>

                {/* Preview for URL tab */}
                {formData.product_url && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Xem trước</h3>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Link sản phẩm:</p>
                      <a
                        href={formData.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm break-all"
                      >
                        {formData.product_url}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Product Information Tab */
              <div className="space-y-6">
                <div className="text-center py-4">
                  <ImageIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Thông tin sản phẩm chi tiết</h3>
                  <p className="text-sm text-gray-600">
                    Cung cấp thông tin đầy đủ để có kết quả phân tích tốt nhất
                  </p>
                </div>

                {/* Product Name */}
                <div>
                  <Label htmlFor="name">Tên sản phẩm *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nhập tên sản phẩm..."
                    className={errors.name ? 'border-red-500' : ''}
                    disabled={isAnalyzing}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Mô tả sản phẩm (tùy chọn)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Mô tả ngắn về sản phẩm..."
                    rows={3}
                    disabled={isAnalyzing}
                  />
                </div>

                {/* Image URL */}
                <div>
                  <Label htmlFor="image_url" className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    URL hình ảnh sản phẩm
                  </Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                    placeholder="https://example.com/product-image.jpg"
                    className={errors.image_url ? 'border-red-500' : ''}
                    disabled={isAnalyzing}
                  />
                  {errors.image_url && (
                    <p className="mt-1 text-sm text-red-600">{errors.image_url}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Dán link hình ảnh sản phẩm từ website hoặc cloud storage
                  </p>
                </div>

                {/* Product URL */}
                <div>
                  <Label htmlFor="product_url_info" className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Link sản phẩm
                  </Label>
                  <Input
                    id="product_url_info"
                    type="url"
                    value={formData.product_url}
                    onChange={(e) => handleInputChange('product_url', e.target.value)}
                    placeholder="https://shopee.vn/product/..."
                    className={errors.product_url ? 'border-red-500' : ''}
                    disabled={isAnalyzing}
                  />
                  {errors.product_url && (
                    <p className="mt-1 text-sm text-red-600">{errors.product_url}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Link đến trang sản phẩm trên Shopee, Lazada, Tiki, v.v.
                  </p>
                </div>

                {/* Preview for info tab */}
                {(formData.image_url || formData.product_url) && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Xem trước</h3>
                    <div className="space-y-3">
                      {formData.image_url && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Hình ảnh:</p>
                          <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                            <img
                              src={formData.image_url}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {formData.product_url && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Link sản phẩm:</p>
                          <a
                            href={formData.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm break-all"
                          >
                            {formData.product_url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="primary"
                onClick={handleClose}
                disabled={isAnalyzing}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isAnalyzing}
                className="flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <LoadingSpinner className="w-4 h-4" />
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Phân tích sản phẩm
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
