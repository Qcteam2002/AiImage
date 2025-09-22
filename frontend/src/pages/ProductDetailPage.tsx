import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Target, AlertTriangle, CheckCircle, TrendingUp, Users, DollarSign, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { productService, Product } from '../services/productService';
import toast from 'react-hot-toast';

interface AnalysisResult {
  target_audience: {
    primary: string;
    secondary: string;
    demographics: {
      age_range: string;
      gender: string;
      location: string;
      income_level: string;
    };
    behaviors: string[];
    painpoints: string[];
  };
  market_analysis: {
    market_size: string;
    competition_level: string;
    growth_potential: string;
    key_competitors: string[];
  };
  product_positioning: {
    usp: string[];
    price_positioning: string;
    value_proposition: string;
    differentiation: string[];
  };
  marketing_recommendations: {
    channels: string[];
    messaging: string[];
    content_ideas: string[];
    pricing_strategy: string;
  };
  sales_potential: {
    estimated_demand: string;
    profit_margin: string;
    roi_potential: string;
    risk_level: string;
  };
}


const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await productService.getProduct(id!);
      setProduct(productData);
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    // Mock download functionality
    console.log('Downloading report...');
  };

  const handleShare = () => {
    // Mock share functionality
    if (navigator.share) {
      navigator.share({
        title: `Phân tích sản phẩm: ${product?.name}`,
        text: 'Xem kết quả phân tích sản phẩm chi tiết',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link đã được sao chép!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
          <p className="text-gray-600 mb-6">Sản phẩm không tồn tại</p>
          <Button onClick={() => navigate('/product-analysis')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  if (product.status !== 'done') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <LoadingSpinner className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {product.status === 'waiting' ? 'Đang chờ phân tích' : 
             product.status === 'processing' ? 'Đang phân tích...' : 
             'Có lỗi xảy ra'}
          </h2>
          <p className="text-gray-600 mb-6">
            {product.status === 'waiting' ? 'Sản phẩm đang chờ được phân tích' :
             product.status === 'processing' ? 'AI đang phân tích sản phẩm của bạn' :
             product.error_message || 'Có lỗi xảy ra trong quá trình phân tích'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/product-analysis')}>
              Quay lại danh sách
            </Button>
            {product.status === 'error' && (
              <Button onClick={loadProduct} variant="outline">
                Thử lại
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const analysis_result = product.analysis_result as AnalysisResult;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/product-analysis')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600">Phân tích chi tiết sản phẩm</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadReport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Tải báo cáo
          </Button>
          <Button variant="outline" onClick={handleShare} className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Chia sẻ
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span>Không có hình ảnh</span>
                </div>
              )}
            </div>
          </div>
          <div className="md:w-2/3">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin sản phẩm</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Tên sản phẩm:</span>
                <span className="ml-2 text-gray-900">{product.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Ngày tạo:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(product.created_at).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              {product.product_url && (
                <div>
                  <span className="font-medium text-gray-700">Link sản phẩm:</span>
                  <a
                    href={product.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:text-blue-800 break-all"
                  >
                    {product.product_url}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Analysis Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Target Audience */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Đối tượng mục tiêu</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Nhóm chính</h4>
              <p className="text-gray-900">{analysis_result.target_audience.primary}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Nhóm phụ</h4>
              <p className="text-gray-900">{analysis_result.target_audience.secondary}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Demographics</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-600">Tuổi:</span> {analysis_result.target_audience.demographics.age_range}</div>
                <div><span className="text-gray-600">Giới tính:</span> {analysis_result.target_audience.demographics.gender}</div>
                <div><span className="text-gray-600">Khu vực:</span> {analysis_result.target_audience.demographics.location}</div>
                <div><span className="text-gray-600">Thu nhập:</span> {analysis_result.target_audience.demographics.income_level}</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Painpoints chính</h4>
              <ul className="space-y-1">
                {analysis_result.target_audience.painpoints.map((painpoint, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-900">{painpoint}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Market Analysis */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Phân tích thị trường</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Quy mô thị trường</h4>
                <p className="text-gray-900">{analysis_result.market_analysis.market_size}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Mức độ cạnh tranh</h4>
                <p className="text-gray-900">{analysis_result.market_analysis.competition_level}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Tiềm năng tăng trưởng</h4>
              <p className="text-gray-900">{analysis_result.market_analysis.growth_potential}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Đối thủ chính</h4>
              <div className="flex flex-wrap gap-2">
                {analysis_result.market_analysis.key_competitors.map((competitor, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {competitor}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Product Positioning */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Định vị sản phẩm</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Unique Selling Points</h4>
              <ul className="space-y-1">
                {analysis_result.product_positioning.usp.map((usp, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-900">{usp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-1">Định vị giá</h4>
              <p className="text-gray-900">{analysis_result.product_positioning.price_positioning}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-1">Value Proposition</h4>
              <p className="text-gray-900">{analysis_result.product_positioning.value_proposition}</p>
            </div>
          </div>
        </Card>

        {/* Sales Potential */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Tiềm năng bán hàng</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Nhu cầu ước tính</h4>
                <p className="text-gray-900">{analysis_result.sales_potential.estimated_demand}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Biên lợi nhuận</h4>
                <p className="text-gray-900">{analysis_result.sales_potential.profit_margin}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-1">ROI tiềm năng</h4>
              <p className="text-gray-900">{analysis_result.sales_potential.roi_potential}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-1">Mức độ rủi ro</h4>
              <p className="text-gray-900">{analysis_result.sales_potential.risk_level}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Marketing Recommendations */}
      <Card className="p-6 mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Star className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Khuyến nghị Marketing</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Kênh Marketing</h4>
            <ul className="space-y-2">
              {analysis_result.marketing_recommendations.channels.map((channel, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-gray-900">{channel}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-3">Thông điệp chính</h4>
            <ul className="space-y-2">
              {analysis_result.marketing_recommendations.messaging.map((message, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-gray-900">{message}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-3">Ý tưởng Content</h4>
            <ul className="space-y-2">
              {analysis_result.marketing_recommendations.content_ideas.map((idea, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-gray-900">{idea}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-3">Chiến lược giá</h4>
            <p className="text-gray-900 text-sm">{analysis_result.marketing_recommendations.pricing_strategy}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductDetailPage;
