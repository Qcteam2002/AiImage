import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Search, Target, TrendingUp, Users, Globe, TestTube } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Typography } from '../components/design-system/Typography';
import ProductDiscoveryModal from '../components/ProductDiscovery/ProductDiscoveryModal';
import TestModal from '../components/ProductDiscovery/TestModal';

const ProductDiscoveryPage: React.FC = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  const features = [
    {
      icon: Target,
      title: 'Discovery Wizard',
      description: 'Trả lời 4 câu hỏi đơn giản để AI hiểu rõ mục tiêu và sở thích của bạn'
    },
    {
      icon: TrendingUp,
      title: 'Phân tích Xu hướng',
      description: 'AI phân tích xu hướng thị trường, mức độ cạnh tranh và tiềm năng lợi nhuận'
    },
    {
      icon: Users,
      title: 'Hồ sơ Khách hàng',
      description: 'Tự động tạo hồ sơ khách hàng mục tiêu và các góc độ marketing phù hợp'
    },
    {
      icon: Globe,
      title: 'Đa thị trường',
      description: 'Hỗ trợ phân tích cho nhiều thị trường khác nhau trên toàn cầu'
    }
  ];

  const businessModels = [
    {
      name: 'Dropshipping',
      description: 'Bán hàng không cần giữ kho, rủi ro thấp',
      icon: '📦',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Print-on-Demand',
      description: 'Bán sản phẩm thiết kế riêng, không cần sản xuất',
      icon: '🎨',
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Affiliate Marketing',
      description: 'Kiếm hoa hồng bằng cách giới thiệu sản phẩm',
      icon: '🤝',
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Private Label',
      description: 'Xây dựng thương hiệu riêng của bạn',
      icon: '🏷️',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <Typography.H1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Product Discovery Hub
          </Typography.H1>
          <Typography.H2 className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Tìm ra cơ hội sản phẩm tiềm năng với AI. Từ ý tưởng đến kế hoạch kinh doanh chỉ trong vài phút.
          </Typography.H2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Search className="w-5 h-5 mr-2" />
              Bắt đầu Khám phá
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setShowTestModal(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              <TestTube className="w-5 h-5 mr-2" />
              Test
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <Typography.H2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tại sao chọn Product Discovery Hub?
          </Typography.H2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <Typography.H3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </Typography.H3>
                <Typography.Body className="text-gray-600 text-sm">
                  {feature.description}
                </Typography.Body>
              </Card>
            ))}
          </div>
        </div>

        {/* Business Models Section */}
        <div className="mb-16">
          <Typography.H2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Hỗ trợ mọi mô hình kinh doanh
          </Typography.H2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessModels.map((model, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${model.color} rounded-full mb-4 text-2xl`}>
                  {model.icon}
                </div>
                <Typography.H3 className="text-lg font-semibold text-gray-900 mb-2">
                  {model.name}
                </Typography.H3>
                <Typography.Body className="text-gray-600 text-sm">
                  {model.description}
                </Typography.Body>
              </Card>
            ))}
          </div>
        </div>

        {/* How it Works Section */}
        <div className="mb-16">
          <Typography.H2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Cách thức hoạt động
          </Typography.H2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 text-white rounded-full text-xl font-bold mb-4">
                1
              </div>
              <Typography.H3 className="text-lg font-semibold text-gray-900 mb-2">
                Chọn mô hình kinh doanh
              </Typography.H3>
              <Typography.Body className="text-gray-600">
                Chọn mô hình phù hợp với mục tiêu và nguồn lực của bạn
              </Typography.Body>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 text-white rounded-full text-xl font-bold mb-4">
                2
              </div>
              <Typography.H3 className="text-lg font-semibold text-gray-900 mb-2">
                Trả lời Discovery Wizard
              </Typography.H3>
              <Typography.Body className="text-gray-600">
                Trả lời 4 câu hỏi về lĩnh vực, thời gian, cạnh tranh và thị trường
              </Typography.Body>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full text-xl font-bold mb-4">
                3
              </div>
              <Typography.H3 className="text-lg font-semibold text-gray-900 mb-2">
                Nhận cơ hội sản phẩm
              </Typography.H3>
              <Typography.Body className="text-gray-600">
                AI phân tích và đưa ra các cơ hội sản phẩm tiềm năng với kế hoạch chi tiết
              </Typography.Body>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="p-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <Typography.H2 className="text-2xl font-bold mb-4">
              Sẵn sàng tìm ra cơ hội sản phẩm tiếp theo?
            </Typography.H2>
            <Typography.Body className="text-blue-100 mb-6">
              Bắt đầu hành trình khám phá sản phẩm với AI ngay hôm nay
            </Typography.Body>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setShowModal(true)}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Bắt đầu miễn phí
            </Button>
          </Card>
        </div>
      </div>

      {/* Product Discovery Modal */}
      <ProductDiscoveryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      {/* Test Modal */}
      <TestModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
      />
    </div>
  );
};

export default ProductDiscoveryPage;
