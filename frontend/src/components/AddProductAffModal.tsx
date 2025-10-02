import React, { useState } from 'react';
import { X, Upload, Link, Image as ImageIcon, Globe, FileText, Type, Plus, Trash2 } from 'lucide-react';
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
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' }
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
  const [images, setImages] = useState<string[]>([]);
  const [imageMethod, setImageMethod] = useState<'upload' | 'url' | 'paste'>('upload');
  const [urlInput, setUrlInput] = useState('');

  const handleInputChange = (field: keyof CreateProductAffRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (files: FileList | File[]) => {
    const fileArray = Array.isArray(files) ? files : Array.from(files);
    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePasteImage = () => {
    navigator.clipboard.read().then(clipboardItems => {
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            clipboardItem.getType(type).then(blob => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const result = e.target?.result as string;
                setImages(prev => [...prev, result]);
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

  const handleAddUrl = () => {
    if (urlInput.trim()) {
      setImages(prev => [...prev, urlInput.trim()]);
      setUrlInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.target_market || images.length === 0) {
      toast.error('Vui lòng chọn target market và upload ít nhất 1 hình ảnh');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        image1: images[0] || '',
        image2: images[1] || undefined
      };
      const newProduct = await productAffService.createProduct(submitData);
      toast.success('Sản phẩm đã được thêm thành công!');
      onSuccess(newProduct.id);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Có lỗi xảy ra khi thêm sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Shopify Polaris-style image upload component
  const ImageUploadSection = () => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Media
      </label>
      
      {/* Main upload area */}
      <div 
        className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-gray-400 transition-colors"
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
          const files = e.dataTransfer.files;
          if (files.length > 0) {
            handleFileUpload(files);
          }
        }}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files) handleFileUpload(e.target.files);
          }}
          className="hidden"
          id="file-upload"
        />
        
        <div className="space-y-3">
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-600">
              Drag and drop images here, or click to select
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <label
              htmlFor="file-upload"
              className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 cursor-pointer transition-colors"
            >
              Upload new
            </label>
            <button
              type="button"
              onClick={handlePasteImage}
              className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Paste
            </button>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <Input
              type="url"
              placeholder="Paste image URL..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="max-w-48 text-xs"
            />
            <Button
              type="button"
              onClick={handleAddUrl}
              disabled={!urlInput.trim()}
              className="px-3 py-1.5 text-xs"
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded overflow-hidden">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
                {index === 0 && (
                  <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                    Main
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Add product
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Target Market */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target market
              </label>
              <select
                value={formData.target_market}
                onChange={(e) => handleInputChange('target_market', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              >
                <option value="">Select country...</option>
                {TARGET_MARKETS.map(market => (
                  <option key={market.code} value={market.code}>
                    {market.flag} {market.name} ({market.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Product Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <Input
                type="text"
                placeholder="Enter product title (optional - AI will extract from images)"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            {/* Product Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                placeholder="Enter product description (optional - AI will extract from images)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
              />
            </div>

            {/* Image Upload */}
            <ImageUploadSection />

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || images.length === 0}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  'Add product'
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
