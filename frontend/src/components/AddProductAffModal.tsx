import React, { useState } from 'react';
import { X, Upload, Link, Image as ImageIcon, Globe, FileText, Type } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { productAffService, CreateProductAffRequest } from '../services/productAffService';
import toast from 'react-hot-toast';

interface AddProductAffModalProps {
  onClose: () => void;
  onSuccess: (productId: string) => void;
}

const TARGET_MARKETS = [
  'US', 'UK', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK', 'FI',
  'JP', 'KR', 'SG', 'MY', 'TH', 'PH', 'ID', 'VN', 'IN', 'BR', 'MX', 'AR', 'CL'
];

const AddProductAffModal: React.FC<AddProductAffModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateProductAffRequest>({
    target_market: '',
    image1: '',
    image2: '',
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [image1Method, setImage1Method] = useState<'upload' | 'url' | 'paste'>('upload');
  const [image2Method, setImage2Method] = useState<'upload' | 'url' | 'paste'>('upload');

  const handleInputChange = (field: keyof CreateProductAffRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (file: File, imageNumber: 1 | 2) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (imageNumber === 1) {
        setFormData(prev => ({ ...prev, image1: result }));
      } else {
        setFormData(prev => ({ ...prev, image2: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePasteImage = (imageNumber: 1 | 2) => {
    navigator.clipboard.read().then(clipboardItems => {
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            clipboardItem.getType(type).then(blob => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const result = e.target?.result as string;
                if (imageNumber === 1) {
                  setFormData(prev => ({ ...prev, image1: result }));
                } else {
                  setFormData(prev => ({ ...prev, image2: result }));
                }
              };
              reader.readAsDataURL(blob);
            });
            break;
          }
        }
      }
    }).catch(() => {
      toast.error('Không thể đọc clipboard');
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.target_market || !formData.image1) {
      toast.error('Vui lòng chọn target market và upload ít nhất 1 hình ảnh');
      return;
    }

    try {
      setLoading(true);
      const newProduct = await productAffService.createProduct(formData);
      toast.success('Sản phẩm đã được thêm thành công!');
      onSuccess(newProduct.id);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Có lỗi xảy ra khi thêm sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const ImageUploadSection = ({ 
    imageNumber, 
    method, 
    setMethod, 
    value, 
    onChange 
  }: {
    imageNumber: 1 | 2;
    method: 'upload' | 'url' | 'paste';
    setMethod: (method: 'upload' | 'url' | 'paste') => void;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Product Image {imageNumber} {imageNumber === 1 ? '*' : ''}
      </label>
      
      {/* Method Selection */}
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setMethod('upload')}
          className={`px-3 py-1 text-xs rounded-full ${
            method === 'upload' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Upload className="w-3 h-3 inline mr-1" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMethod('url')}
          className={`px-3 py-1 text-xs rounded-full ${
            method === 'url' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Link className="w-3 h-3 inline mr-1" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setMethod('paste')}
          className={`px-3 py-1 text-xs rounded-full ${
            method === 'paste' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          <ImageIcon className="w-3 h-3 inline mr-1" />
          Paste
        </button>
      </div>

      {/* Input based on method */}
      {method === 'upload' && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, imageNumber);
            }}
            className="hidden"
            id={`file-upload-${imageNumber}`}
          />
          <label
            htmlFor={`file-upload-${imageNumber}`}
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Click để upload hoặc kéo thả file</span>
          </label>
        </div>
      )}

      {method === 'url' && (
        <Input
          type="url"
          placeholder="Nhập URL hình ảnh"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {method === 'paste' && (
        <Button
          type="button"
          variant="secondary"
          onClick={() => handlePasteImage(imageNumber)}
          className="w-full"
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Paste từ clipboard
        </Button>
      )}

      {/* Preview */}
      {value && (
        <div className="mt-2">
          <img
            src={value}
            alt={`Preview ${imageNumber}`}
            className="w-20 h-20 object-cover rounded-lg border"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Thêm sản phẩm phân tích Affiliate
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Target Market */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Market *
              </label>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <select
                  value={formData.target_market}
                  onChange={(e) => handleInputChange('target_market', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn thị trường mục tiêu</option>
                  {TARGET_MARKETS.map(market => (
                    <option key={market} value={market}>{market}</option>
                  ))}
                </select>
                <Input
                  type="text"
                  placeholder="Hoặc nhập tùy chỉnh"
                  value={formData.target_market}
                  onChange={(e) => handleInputChange('target_market', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Product Image 1 */}
            <ImageUploadSection
              imageNumber={1}
              method={image1Method}
              setMethod={setImage1Method}
              value={formData.image1}
              onChange={(value) => handleInputChange('image1', value)}
            />

            {/* Product Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Type className="w-4 h-4 inline mr-1" />
                Product Title (Optional - AI sẽ tự extract từ hình ảnh)
              </label>
              <Input
                type="text"
                placeholder="Để trống để AI tự extract từ hình ảnh"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            {/* Product Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Product Description (Optional - AI sẽ tự extract từ hình ảnh)
              </label>
              <Textarea
                placeholder="Để trống để AI tự extract từ hình ảnh"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Product Image 2 */}
            <ImageUploadSection
              imageNumber={2}
              method={image2Method}
              setMethod={setImage2Method}
              value={formData.image2 || ''}
              onChange={(value) => handleInputChange('image2', value)}
            />

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang thêm...
                  </>
                ) : (
                  'Thêm sản phẩm'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductAffModal;
