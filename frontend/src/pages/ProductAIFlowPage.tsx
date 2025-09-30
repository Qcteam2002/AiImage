import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Clock, CheckCircle, XCircle, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { productAIFlowService, ProductAIFlow } from '../services/productAIFlowService';
import toast from 'react-hot-toast';

const ProductAIFlowPage: React.FC = () => {
  const navigate = useNavigate();
  const [aiFlows, setAIFlows] = useState<ProductAIFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadAIFlows();
  }, []);

  const loadAIFlows = async () => {
    try {
      setLoading(true);
      const response = await productAIFlowService.getAIFlows();
      setAIFlows(response.data);
    } catch (error) {
      console.error('Error loading AI flows:', error);
      toast.error('Không thể tải danh sách AI flows');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (id: string) => {
    try {
      await productAIFlowService.generateAIFlow(id);
      toast.success('Bắt đầu tạo AI flow...');
      loadAIFlows(); // Reload to show updated status
    } catch (error) {
      console.error('Error generating AI flow:', error);
      toast.error('Không thể tạo AI flow');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa AI flow này?')) {
      return;
    }

    try {
      await productAIFlowService.deleteAIFlow(id);
      toast.success('Đã xóa AI flow');
      loadAIFlows();
    } catch (error) {
      console.error('Error deleting AI flow:', error);
      toast.error('Không thể xóa AI flow');
    }
  };

  const filteredAIFlows = aiFlows.filter(flow => {
    const matchesSearch = flow.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || flow.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'processing':
        return <LoadingSpinner className="w-4 h-4 text-blue-600" />;
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
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

  const getStatusColor = (status: string) => {
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
          <h1 className="text-3xl font-bold text-gray-900">Product AI Flow</h1>
          <p className="text-gray-600 mt-2">Tạo hình ảnh sản phẩm với AI cho 5 painpoints khác nhau</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tạo AI Flow
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm AI flow..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="waiting">Chờ xử lý</option>
          <option value="processing">Đang xử lý</option>
          <option value="done">Hoàn thành</option>
          <option value="error">Lỗi</option>
        </select>
      </div>

      {/* AI Flows List */}
      {filteredAIFlows.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có AI flow nào</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Không tìm thấy AI flow phù hợp với bộ lọc'
              : 'Tạo AI flow đầu tiên để bắt đầu tạo hình ảnh sản phẩm với AI'
            }
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            Tạo AI Flow đầu tiên
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAIFlows.map((flow) => (
            <Card key={flow.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {flow.image_url ? (
                    <img
                      src={flow.image_url}
                      alt={flow.title}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {flow.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(flow.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flow.status)}`}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(flow.status)}
                    {getStatusText(flow.status)}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {flow.status === 'done' && (
                  <Button
                    onClick={() => navigate(`/product-ai-flow/${flow.id}`)}
                    className="w-full"
                  >
                    Xem kết quả
                  </Button>
                )}
                
                {flow.status === 'waiting' && (
                  <Button
                    onClick={() => handleGenerate(flow.id)}
                    className="w-full flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Bắt đầu tạo
                  </Button>
                )}
                
                {flow.status === 'processing' && (
                  <Button disabled className="w-full">
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    Đang xử lý...
                  </Button>
                )}
                
                {flow.status === 'error' && (
                  <div className="space-y-2">
                    <p className="text-sm text-red-600">
                      {flow.error_message || 'Có lỗi xảy ra'}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleGenerate(flow.id)}
                        variant="primary"
                        size="sm"
                        className="flex-1"
                      >
                        Thử lại
                      </Button>
                      <Button
                        onClick={() => handleDelete(flow.id)}
                        variant="primary"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700"
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddAIFlowModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadAIFlows();
          }}
        />
      )}
    </div>
  );
};

// Add AI Flow Modal Component
interface AddAIFlowModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddAIFlowModal: React.FC<AddAIFlowModalProps> = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url) {
      setImagePreview(url);
    }
  };

  const handleClose = () => {
    setTitle('');
    setImageFile(null);
    setImageUrl('');
    setImagePreview(null);
    setActiveTab('upload');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm');
      return;
    }

    if (activeTab === 'upload' && !imageFile) {
      toast.error('Vui lòng chọn hình ảnh sản phẩm');
      return;
    }

    if (activeTab === 'url' && !imageUrl.trim()) {
      toast.error('Vui lòng nhập URL hình ảnh');
      return;
    }

    try {
      setLoading(true);
      
      if (activeTab === 'upload' && imageFile) {
        await productAIFlowService.createAIFlowWithUpload(title, imageFile);
      } else if (activeTab === 'url' && imageUrl) {
        await productAIFlowService.createAIFlow(title, imageUrl);
      }
      
      toast.success('Tạo AI flow thành công!');
      handleClose();
      onSuccess();
    } catch (error) {
      console.error('Error creating AI flow:', error);
      toast.error('Không thể tạo AI flow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Tạo AI Flow mới</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'upload'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'url'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Image URL
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'upload' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh sản phẩm *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL hình ảnh *
              </label>
              <Input
                value={imageUrl}
                onChange={handleUrlChange}
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
          )}
          
          {imagePreview && (
            <div className="mt-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="primary"
              onClick={handleClose}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center gap-2"
            >
              {loading ? (
                <LoadingSpinner className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Tạo AI Flow
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductAIFlowPage;
