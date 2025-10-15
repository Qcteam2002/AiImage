import React, { useState } from 'react';
import { Typography } from '../design-system/Typography';

interface SearchProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  product_name: string;
  description: string;
  category: string;
  estimated_price: string;
  market_potential: string;
  search_keywords: string[];
  similar_products: string[];
}

const SearchProductModal: React.FC<SearchProductModalProps> = ({ isOpen, onClose }) => {
  const [searchMethod, setSearchMethod] = useState<'upload' | 'url'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setError(null);
    }
  };

  const handleSearch = async () => {
    if (searchMethod === 'upload' && !uploadedFile) {
      setError('Vui lòng chọn hình ảnh để tải lên');
      return;
    }
    
    if (searchMethod === 'url' && !imageUrl.trim()) {
      setError('Vui lòng nhập URL hình ảnh');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const formData = new FormData();
      
      if (searchMethod === 'upload' && uploadedFile) {
        formData.append('image', uploadedFile);
      } else if (searchMethod === 'url') {
        formData.append('imageUrl', imageUrl);
      }

      const response = await fetch('/api/product-discovery/search-product', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Lỗi khi tìm kiếm sản phẩm');
      }

      const data = await response.json();
      setResults(data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tìm kiếm');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchMethod('upload');
    setUploadedFile(null);
    setImageUrl('');
    setResults([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <Typography.H3 className="text-gray-900">Tìm Kiếm Sản Phẩm</Typography.H3>
              <Typography.BodySmall className="text-gray-600">Upload hình ảnh hoặc nhập URL để tìm kiếm sản phẩm</Typography.BodySmall>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {results.length === 0 ? (
            <>
              {/* Search Method Selection */}
              <div className="mb-6">
                <Typography.H4 className="text-gray-900 mb-4">Chọn phương thức tìm kiếm</Typography.H4>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSearchMethod('upload')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      searchMethod === 'upload'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <Typography.Body className="text-center">Upload hình ảnh</Typography.Body>
                  </button>
                  
                  <button
                    onClick={() => setSearchMethod('url')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      searchMethod === 'url'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <Typography.Body className="text-center">Nhập URL hình ảnh</Typography.Body>
                  </button>
                </div>
              </div>

              {/* Upload Section */}
              {searchMethod === 'upload' && (
                <div className="mb-6">
                  <Typography.H4 className="text-gray-900 mb-4">Upload hình ảnh sản phẩm</Typography.H4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      {uploadedFile ? (
                        <div>
                          <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <Typography.Body className="text-green-600 mb-2">Đã chọn: {uploadedFile.name}</Typography.Body>
                          <Typography.BodySmall className="text-gray-600">Nhấp để chọn hình khác</Typography.BodySmall>
                        </div>
                      ) : (
                        <div>
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <Typography.Body className="text-gray-600 mb-2">Nhấp để chọn hình ảnh</Typography.Body>
                          <Typography.BodySmall className="text-gray-500">JPG, PNG, GIF (tối đa 10MB)</Typography.BodySmall>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {/* URL Section */}
              {searchMethod === 'url' && (
                <div className="mb-6">
                  <Typography.H4 className="text-gray-900 mb-4">Nhập URL hình ảnh</Typography.H4>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Typography.BodySmall className="text-gray-500 mt-2">
                    Nhập URL trực tiếp đến hình ảnh sản phẩm
                  </Typography.BodySmall>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <Typography.BodySmall className="text-red-600">{error}</Typography.BodySmall>
                </div>
              )}

              {/* Search Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Đang tìm kiếm...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Tìm kiếm sản phẩm
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Results Section */
            <div>
              <div className="flex items-center justify-between mb-6">
                <Typography.H4 className="text-gray-900">Kết quả tìm kiếm ({results.length} sản phẩm)</Typography.H4>
                <button
                  onClick={() => setResults([])}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Tìm kiếm lại
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((product, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <Typography.H5 className="text-gray-900 mb-3">{product.product_name}</Typography.H5>
                    
                    <div className="space-y-3">
                      <div>
                        <Typography.Caption className="text-gray-600">Mô tả:</Typography.Caption>
                        <Typography.BodySmall className="text-gray-800">{product.description}</Typography.BodySmall>
                      </div>
                      
                      <div>
                        <Typography.Caption className="text-gray-600">Danh mục:</Typography.Caption>
                        <Typography.BodySmall className="text-gray-800">{product.category}</Typography.BodySmall>
                      </div>
                      
                      <div>
                        <Typography.Caption className="text-gray-600">Giá ước tính:</Typography.Caption>
                        <Typography.BodySmall className="text-gray-800">{product.estimated_price}</Typography.BodySmall>
                      </div>
                      
                      <div>
                        <Typography.Caption className="text-gray-600">Tiềm năng thị trường:</Typography.Caption>
                        <Typography.BodySmall className="text-gray-800">{product.market_potential}</Typography.BodySmall>
                      </div>
                      
                      {product.search_keywords && product.search_keywords.length > 0 && (
                        <div>
                          <Typography.Caption className="text-gray-600">Từ khóa tìm kiếm:</Typography.Caption>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {product.search_keywords.map((keyword, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {product.similar_products && product.similar_products.length > 0 && (
                        <div>
                          <Typography.Caption className="text-gray-600">Sản phẩm tương tự:</Typography.Caption>
                          <ul className="mt-1 space-y-1">
                            {product.similar_products.map((similar, idx) => (
                              <li key={idx} className="text-sm text-gray-700">• {similar}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchProductModal;
