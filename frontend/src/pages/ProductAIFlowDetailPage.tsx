import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Download, Copy, CheckCircle, Clock, XCircle, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { productAIFlowService, ProductAIFlow, Painpoint } from '../services/productAIFlowService';
import toast from 'react-hot-toast';

const ProductAIFlowDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [aiFlow, setAIFlow] = useState<ProductAIFlow | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      loadAIFlow();
    }
  }, [id]);

  const loadAIFlow = async () => {
    try {
      setLoading(true);
      const response = await productAIFlowService.getAIFlow(id!);
      setAIFlow(response.data);
    } catch (error) {
      console.error('Error loading AI flow:', error);
      toast.error('Không thể tải thông tin AI flow');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!aiFlow) return;
    
    try {
      await productAIFlowService.generateAIFlow(aiFlow.id);
      toast.success('Bắt đầu tạo AI flow...');
      loadAIFlow(); // Reload to show updated status
    } catch (error) {
      console.error('Error generating AI flow:', error);
      toast.error('Không thể tạo AI flow');
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success('Đã copy vào clipboard!');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Không thể copy vào clipboard');
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Đã tải hình ảnh!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Không thể tải hình ảnh');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!aiFlow) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy AI flow</h1>
          <Button onClick={() => navigate('/product-ai-flow')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  if (aiFlow.status === 'waiting' || aiFlow.status === 'processing') {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              onClick={() => navigate('/product-ai-flow')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{aiFlow.title}</h1>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {aiFlow.status === 'waiting' ? (
              <Clock className="w-8 h-8 text-yellow-600" />
            ) : (
              <LoadingSpinner className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {aiFlow.status === 'waiting' ? 'Chờ tạo AI flow' : 'Đang tạo AI flow'}
          </h2>
          <p className="text-gray-600 mb-6">
            {aiFlow.status === 'waiting' 
              ? 'AI flow đang trong hàng đợi để được xử lý bởi AI.'
              : 'AI đang phân tích sản phẩm và tạo 5 hình ảnh cho các painpoints. Vui lòng chờ trong giây lát.'
            }
          </p>
          {aiFlow.status === 'waiting' && (
            <Button onClick={handleGenerate} className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Bắt đầu tạo
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (aiFlow.status === 'error') {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              onClick={() => navigate('/product-ai-flow')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{aiFlow.title}</h1>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lỗi tạo AI flow</h2>
          <p className="text-gray-600 mb-6">
            {aiFlow.error_message || 'Có lỗi xảy ra trong quá trình tạo AI flow.'}
          </p>
          <Button onClick={handleGenerate} className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="primary"
            onClick={() => navigate('/product-ai-flow')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{aiFlow.title}</h1>
            <p className="text-gray-600">AI Generated Product Images</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Ngày tạo: {new Date(aiFlow.created_at).toLocaleDateString('vi-VN')}</p>
          <p className="text-sm text-gray-500">Hoàn thành: {aiFlow.generated_at ? new Date(aiFlow.generated_at).toLocaleDateString('vi-VN') : 'Chưa có'}</p>
        </div>
      </div>

      {/* Product Image */}
      {aiFlow.image_url && (
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Hình ảnh sản phẩm gốc</h3>
          </div>
          <img 
            src={aiFlow.image_url} 
            alt={aiFlow.title}
            className="w-full max-w-md h-auto rounded-lg border border-gray-200"
          />
        </Card>
      )}

      {/* AI Generated Images */}
      {aiFlow.ai_result && aiFlow.ai_result.painpoints && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Hình ảnh được tạo bởi AI</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {aiFlow.ai_result.painpoints.map((painpoint, index) => (
              <Card key={index} className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {painpoint.name}
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-600 mb-1">Painpoint:</h4>
                      <p className="text-gray-900 bg-red-50 p-3 rounded-lg text-sm">
                        {painpoint.description}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-600 mb-1">Solution:</h4>
                      <p className="text-gray-900 bg-green-50 p-3 rounded-lg text-sm">
                        {painpoint.solution}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Generated Image */}
                {painpoint.image_url && (
                  <div className="mb-4">
                    <img
                      src={painpoint.image_url}
                      alt={`Generated image for ${painpoint.name}`}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => copyToClipboard(painpoint.solution, index)}
                    className="flex items-center gap-2 flex-1"
                  >
                    {copiedIndex === index ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    Copy Solution
                  </Button>
                  
                  {painpoint.image_url && (
                    <Button
                      size="sm"
                      onClick={() => downloadImage(
                        painpoint.image_url, 
                        `ai-generated-${painpoint.name.replace(/\s+/g, '-').toLowerCase()}.jpg`
                      )}
                      className="flex items-center gap-2 flex-1"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductAIFlowDetailPage;

