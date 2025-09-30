import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Image as ImageIcon, Sparkles, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { productImageGeneratorService, ProductImageGenerator } from '../services/productImageGeneratorService';
import toast from 'react-hot-toast';

const ProductImageGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const [generators, setGenerators] = useState<ProductImageGenerator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadGenerators();
  }, [searchTerm, filterStatus]);

  const loadGenerators = async () => {
    try {
      setLoading(true);
      const data = await productImageGeneratorService.getGenerators(searchTerm, filterStatus);
      setGenerators(data);
    } catch (error) {
      console.error('Error loading generators:', error);
      toast.error('Không thể tải danh sách generators');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGenerator = async (title: string, image_url: string) => {
    try {
      const newGenerator = await productImageGeneratorService.createGenerator(title, image_url);
      setGenerators(prev => [newGenerator, ...prev]);
      setShowAddModal(false);
      toast.success('Tạo generator thành công!');
    } catch (error) {
      console.error('Error creating generator:', error);
      toast.error('Không thể tạo generator');
    }
  };

  const handleGenerate = async (id: string) => {
    try {
      await productImageGeneratorService.generatePrompts(id);
      toast.success('Bắt đầu tạo prompts...');
      loadGenerators(); // Reload to show updated status
    } catch (error) {
      console.error('Error generating prompts:', error);
      toast.error('Không thể tạo prompts');
    }
  };

  const getStatusIcon = (status: string) => {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'Chờ tạo';
      case 'processing':
        return 'Đang tạo';
      case 'done':
        return 'Hoàn thành';
      case 'error':
        return 'Lỗi';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Image Generator</h1>
          <p className="text-gray-600 mt-2">Tạo prompt hình ảnh sản phẩm dựa trên painpoint</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tạo Generator
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="waiting">Chờ tạo</option>
          <option value="processing">Đang tạo</option>
          <option value="done">Hoàn thành</option>
          <option value="error">Lỗi</option>
        </select>
      </div>

      {/* Generators List */}
      {generators.length === 0 ? (
        <Card className="p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có generator nào</h3>
          <p className="text-gray-600 mb-6">Tạo generator đầu tiên để bắt đầu tạo prompt hình ảnh</p>
          <Button onClick={() => setShowAddModal(true)}>
            Tạo Generator
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {generators.map((generator) => (
            <Card key={generator.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(generator.status)}
                  <span className="text-sm font-medium text-gray-600">
                    {getStatusText(generator.status)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(generator.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {generator.title}
                </h3>
                {generator.image_url && (
                  <img
                    src={generator.image_url}
                    alt={generator.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
              </div>

              <div className="flex gap-2">
                {generator.status === 'waiting' && (
                  <Button
                    onClick={() => handleGenerate(generator.id)}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </Button>
                )}
                
                {generator.status === 'done' && (
                  <Button
                    onClick={() => navigate(`/product-image-generator/${generator.id}`)}
                    className="flex-1"
                  >
                    Xem Kết Quả
                  </Button>
                )}
                
                {generator.status === 'error' && (
                  <Button
                    onClick={() => handleGenerate(generator.id)}
                    variant="primary"
                    className="flex-1"
                  >
                    Thử Lại
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Generator Modal */}
      {showAddModal && (
        <AddGeneratorModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddGenerator}
        />
      )}
    </div>
  );
};

// Add Generator Modal Component
interface AddGeneratorModalProps {
  onClose: () => void;
  onSubmit: (title: string, image_url: string) => void;
}

const AddGeneratorModal: React.FC<AddGeneratorModalProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !imageUrl.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(title.trim(), imageUrl.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tạo Product Image Generator</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên sản phẩm *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên sản phẩm..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL hình ảnh sản phẩm *
            </label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/product-image.jpg"
              type="url"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="primary"
              onClick={onClose}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center gap-2"
            >
              {loading ? <LoadingSpinner className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              Tạo Generator
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductImageGeneratorPage;

