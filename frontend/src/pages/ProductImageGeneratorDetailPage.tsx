import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Copy, CheckCircle, Clock, XCircle, Sparkles, Download, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { productImageGeneratorService, ProductImageGenerator, GenerationResult, Painpoint } from '../services/productImageGeneratorService';
import toast from 'react-hot-toast';

const ProductImageGeneratorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [generator, setGenerator] = useState<ProductImageGenerator | null>(null);
  const [loading, setLoading] = useState(true);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    prompt: string;
    painpointName: string;
  }>({
    isOpen: false,
    imageUrl: '',
    prompt: '',
    painpointName: ''
  });
  const [generatingImage, setGeneratingImage] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      loadGenerator();
    }
  }, [id]);

  const loadGenerator = async () => {
    try {
      setLoading(true);
      const generatorData = await productImageGeneratorService.getGenerator(id!);
      setGenerator(generatorData);
      
      if (generatorData.generation_result) {
        const result = JSON.parse(generatorData.generation_result) as GenerationResult;
        setGenerationResult(result);
      }
    } catch (error) {
      console.error('Error loading generator:', error);
      toast.error('Không thể tải thông tin generator');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!generator) return;
    
    try {
      await productImageGeneratorService.generatePrompts(generator.id);
      toast.success('Bắt đầu tạo prompts...');
      loadGenerator(); // Reload to show updated status
    } catch (error) {
      console.error('Error generating prompts:', error);
      toast.error('Không thể tạo prompts');
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

  const handleGenerateImage = async (prompt: string, painpointName: string, index: number) => {
    if (!generator) return;
    
    try {
      // Mở modal ngay lập tức với trạng thái loading
      setImageModal({
        isOpen: true,
        imageUrl: '',
        prompt: prompt,
        painpointName: painpointName
      });
      
      setGeneratingImage(index);
      const result = await productImageGeneratorService.generateImage(generator.id, prompt, index);
      
      // Cập nhật modal với kết quả
      setImageModal(prev => ({
        ...prev,
        imageUrl: result.generatedImageUrl
      }));
      
      toast.success('Tạo hình ảnh thành công!');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Không thể tạo hình ảnh');
      // Đóng modal nếu có lỗi
      setImageModal({
        isOpen: false,
        imageUrl: '',
        prompt: '',
        painpointName: ''
      });
    } finally {
      setGeneratingImage(null);
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

  if (!generator) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy generator</h1>
          <Button onClick={() => navigate('/product-image-generator')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  if (generator.status === 'waiting' || generator.status === 'processing') {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              onClick={() => navigate('/product-image-generator')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{generator.title}</h1>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {generator.status === 'waiting' ? (
              <Clock className="w-8 h-8 text-yellow-600" />
            ) : (
              <LoadingSpinner className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {generator.status === 'waiting' ? 'Chờ tạo prompts' : 'Đang tạo prompts'}
          </h2>
          <p className="text-gray-600 mb-6">
            {generator.status === 'waiting' 
              ? 'Generator đang trong hàng đợi để được xử lý bởi AI.'
              : 'AI đang phân tích sản phẩm và tạo prompts. Vui lòng chờ trong giây lát.'
            }
          </p>
          {generator.status === 'waiting' && (
            <Button onClick={handleGenerate} className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Bắt đầu tạo
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (generator.status === 'error') {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              onClick={() => navigate('/product-image-generator')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{generator.title}</h1>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lỗi tạo prompts</h2>
          <p className="text-gray-600 mb-6">
            {generator.error_message || 'Có lỗi xảy ra trong quá trình tạo prompts.'}
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
            onClick={() => navigate('/product-image-generator')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {generationResult?.product_title || generator.title}
            </h1>
            <p className="text-gray-600">Generated Image Prompts</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Ngày tạo: {new Date(generator.created_at).toLocaleDateString('vi-VN')}</p>
          <p className="text-sm text-gray-500">Hoàn thành: {generator.generated_at ? new Date(generator.generated_at).toLocaleDateString('vi-VN') : 'Chưa có'}</p>
        </div>
      </div>

      {/* Product Image */}
      {generator.image_url && (
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Hình ảnh sản phẩm gốc</h3>
          </div>
          <img 
            src={generator.image_url} 
            alt={generator.title}
            className="w-full max-w-md h-auto rounded-lg border border-gray-200"
          />
        </Card>
      )}

      {/* Market Info */}
      {generationResult && (
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Thông tin thị trường</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-600 mb-1">Sản phẩm</h4>
              <p className="text-gray-900">{generationResult.product_title}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-600 mb-1">Thị trường</h4>
              <p className="text-gray-900">{generationResult.market}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Painpoints and Prompts */}
      {generationResult && generationResult.painpoints && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Painpoints & Image Prompts</h2>
          
          {generationResult.painpoints.map((painpoint, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {painpoint.name}
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => copyToClipboard(painpoint.prompt, index)}
                    className="flex items-center gap-2"
                  >
                    {copiedIndex === index ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    Copy Prompt
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleGenerateImage(painpoint.prompt, painpoint.name, index)}
                    disabled={generatingImage === index}
                    className="flex items-center gap-2"
                  >
                    {generatingImage === index ? (
                      <LoadingSpinner className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Generate Image
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-600 mb-2">Painpoint:</h4>
                  <p className="text-gray-900 bg-red-50 p-3 rounded-lg">{painpoint.painpoint}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-600 mb-2">Solution:</h4>
                  <p className="text-gray-900 bg-green-50 p-3 rounded-lg">{painpoint.solution}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-600 mb-2">Image Prompt:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap font-mono text-sm">
                      {painpoint.prompt}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Image Generation Modal */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Generated Image - {imageModal.painpointName}
              </h2>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setImageModal({ isOpen: false, imageUrl: '', prompt: '', painpointName: '' })}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Close
              </Button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-medium text-gray-600 mb-2">Prompt used:</h3>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm">
                  {imageModal.prompt}
                </p>
              </div>
              
              <div className="mb-6">
                {imageModal.imageUrl ? (
                  <img
                    src={imageModal.imageUrl}
                    alt="Generated image"
                    className="w-full h-auto rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <LoadingSpinner className="w-8 h-8 text-blue-600 mb-4" />
                    <p className="text-gray-600 font-medium">Đang tạo hình ảnh...</p>
                    <p className="text-gray-500 text-sm mt-1">Vui lòng chờ trong giây lát</p>
                  </div>
                )}
              </div>
              
              {imageModal.imageUrl && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => downloadImage(
                      imageModal.imageUrl, 
                      `generated-image-${imageModal.painpointName.replace(/\s+/g, '-').toLowerCase()}.jpg`
                    )}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Image
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => copyToClipboard(imageModal.imageUrl, -1)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Image URL
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageGeneratorDetailPage;
