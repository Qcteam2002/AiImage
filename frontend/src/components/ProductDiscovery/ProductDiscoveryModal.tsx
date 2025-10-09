import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sparkles, ArrowRight, ArrowLeft, Target, Clock, TrendingUp, Users, Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Typography } from '../design-system/Typography';

interface ProductDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BusinessModel {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface DiscoveryData {
  business_model: string;
  niches: string[];
  time_factor: string;
  competition_level: string;
  target_market: string;
}

interface Opportunity {
  product_name: string;
  image_query: string;
  metrics: {
    demand_score: number;
    competition_score: number;
    profit_potential: string;
    trend: string;
  };
  timing_analysis: {
    type: string;
    window: string;
    reason: string;
  };
  ai_summary: string;
  detailed_analysis: {
    opportunity_overview: string;
    target_customer_profile: {
      description: string;
      pain_points: string[];
    };
    marketing_angles: string[];
    potential_risks: string[];
  };
}

const businessModels: BusinessModel[] = [
  {
    id: 'dropshipping',
    name: 'Dropshipping',
    description: 'Bán hàng không cần giữ kho, rủi ro thấp',
    icon: '📦'
  },
  {
    id: 'pod',
    name: 'Print-on-Demand (POD)',
    description: 'Bán sản phẩm thiết kế riêng, không cần sản xuất',
    icon: '🎨'
  },
  {
    id: 'affiliate',
    name: 'Affiliate Marketing',
    description: 'Kiếm hoa hồng bằng cách giới thiệu sản phẩm',
    icon: '🤝'
  },
  {
    id: 'private_label',
    name: 'Private Label',
    description: 'Xây dựng thương hiệu riêng của bạn',
    icon: '🏷️'
  }
];

const niches = [
  'Home Decor', 'Pet Supplies', 'Fitness & Yoga', 'Tech Gadgets', 
  'Eco-friendly Products', 'Baby Care', 'Fashion & Accessories', 
  'Health & Wellness', 'Kitchen & Dining', 'Garden & Outdoor',
  'Beauty & Personal Care', 'Sports & Recreation', 'Office Supplies',
  'Travel & Luggage', 'Automotive', 'Books & Media'
];

const timeFactors = [
  {
    id: 'short_term',
    name: 'Bắt Trend Nhanh',
    description: 'Tìm các sản phẩm dựa trên meme, sự kiện viral đang nóng',
    icon: '🚀'
  },
  {
    id: 'seasonal',
    name: 'Theo Mùa & Lễ hội',
    description: 'Đón đầu các dịp lễ lớn sắp tới (Tết, Giáng Sinh...)',
    icon: '📅'
  },
  {
    id: 'evergreen',
    name: 'Bền vững & Quanh năm',
    description: 'Tập trung vào sản phẩm có nhu cầu ổn định quanh năm',
    icon: '🌳'
  }
];

const competitionLevels = [
  { id: 'low', name: 'Thị trường Ngách', description: 'Ít đối thủ, dễ bắt đầu nhưng thị trường nhỏ' },
  { id: 'medium', name: 'Cân bằng', description: 'Cạnh tranh vừa phải, tiềm năng tăng trưởng tốt' },
  { id: 'high', name: 'Thị trường Lớn', description: 'Cạnh tranh cao, lợi nhuận lớn nhưng đòi hỏi nhiều kinh nghiệm' }
];

const targetMarkets = [
  { id: 'US', name: 'United States', flag: '🇺🇸' },
  { id: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { id: 'AU', name: 'Australia', flag: '🇦🇺' },
  { id: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { id: 'CA', name: 'Canada', flag: '🇨🇦' },
  { id: 'DE', name: 'Germany', flag: '🇩🇪' },
  { id: 'FR', name: 'France', flag: '🇫🇷' },
  { id: 'JP', name: 'Japan', flag: '🇯🇵' },
  { id: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { id: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { id: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { id: 'MY', name: 'Malaysia', flag: '🇲🇾' }
];

const ProductDiscoveryModal: React.FC<ProductDiscoveryModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t, i18n } = useTranslation();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [discoveryData, setDiscoveryData] = useState<DiscoveryData>({
    business_model: '',
    niches: [],
    time_factor: '',
    competition_level: '',
    target_market: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setDiscoveryData({
        business_model: '',
        niches: [],
        time_factor: '',
        competition_level: '',
        target_market: ''
      });
      setOpportunities([]);
      setSelectedOpportunity(null);
    }
  }, [isOpen]);

  const handleBusinessModelSelect = (modelId: string) => {
    setDiscoveryData(prev => ({ ...prev, business_model: modelId }));
  };

  const handleNicheToggle = (niche: string) => {
    setDiscoveryData(prev => ({
      ...prev,
      niches: prev.niches.includes(niche)
        ? prev.niches.filter(n => n !== niche)
        : [...prev.niches, niche].slice(0, 3) // Max 3 niches
    }));
  };

  const handleTimeFactorSelect = (factorId: string) => {
    setDiscoveryData(prev => ({ ...prev, time_factor: factorId }));
  };

  const handleCompetitionLevelSelect = (levelId: string) => {
    setDiscoveryData(prev => ({ ...prev, competition_level: levelId }));
  };

  const handleTargetMarketSelect = (marketId: string) => {
    setDiscoveryData(prev => ({ ...prev, target_market: marketId }));
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return discoveryData.business_model !== '';
      case 2:
        // Chỉ cần có ít nhất 1 câu hỏi được trả lời
        const hasAnyAnswer = discoveryData.niches.length > 0 || 
               discoveryData.time_factor !== '' || 
               discoveryData.competition_level !== '' || 
               discoveryData.target_market !== '';
        console.log('🔍 [Discovery] Step 2 validation:', {
          niches: discoveryData.niches,
          time_factor: discoveryData.time_factor,
          competition_level: discoveryData.competition_level,
          target_market: discoveryData.target_market,
          hasAnyAnswer
        });
        return hasAnyAnswer;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 3 && isStepValid(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGenerateOpportunities = async () => {
    if (!isStepValid(2)) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/product-discovery/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...discoveryData,
          language: i18n.language,
          submit_date: new Date().toISOString() // Thêm ngày submit
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate opportunities');
      }

      const data = await response.json();
      setOpportunities(data.opportunities || []);
      setCurrentStep(3);
    } catch (error) {
      console.error('Error generating opportunities:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Typography.H2 className="mb-4">
          Bạn muốn bắt đầu hành trình kinh doanh của mình như thế nào?
        </Typography.H2>
        <Typography.Body>
          Chọn mô hình kinh doanh phù hợp với mục tiêu và nguồn lực của bạn
        </Typography.Body>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {businessModels.map((model) => (
          <Card
            key={model.id}
            className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              discoveryData.business_model === model.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleBusinessModelSelect(model.id)}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">{model.icon}</div>
              <Typography.H4 className="mb-2">
                {model.name}
              </Typography.H4>
              <Typography.BodySmall>
                {model.description}
              </Typography.BodySmall>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
        <div className="space-y-8">
          <div className="text-center">
            <Typography.H2 className="mb-4">
              The Discovery Wizard
            </Typography.H2>
            <Typography.Body>
              Trả lời các câu hỏi tùy chọn để AI tìm ra cơ hội sản phẩm phù hợp nhất
            </Typography.Body>
            <Typography.BodySmall className="text-gray-500 mt-2">
              Bạn có thể bỏ qua bất kỳ câu hỏi nào không muốn trả lời
            </Typography.BodySmall>
          </div>

      {/* Question 1: Niches - Optional */}
      <div className="bg-gray-50 rounded-lg p-4">
        <Typography.H5 className="mb-3 flex items-center">
          <Target className="w-4 h-4 mr-2 text-blue-500" />
          Lĩnh vực bạn đam mê là gì? <span className="text-gray-400 text-sm font-normal">(Tùy chọn)</span>
        </Typography.H5>
        <Typography.BodySmall className="mb-3 text-gray-600">
          Chọn tối đa 3 lĩnh vực bạn có hứng thú (đã chọn: {discoveryData.niches.length}/3)
        </Typography.BodySmall>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {niches.map((niche) => (
            <button
              key={niche}
              onClick={() => handleNicheToggle(niche)}
              disabled={!discoveryData.niches.includes(niche) && discoveryData.niches.length >= 3}
              className={`p-2 rounded-lg border transition-all duration-200 text-xs font-medium ${
                discoveryData.niches.includes(niche)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : discoveryData.niches.length >= 3
                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {niche}
            </button>
          ))}
        </div>
      </div>

      {/* Question 2: Time Factor - Optional */}
      <div className="bg-gray-50 rounded-lg p-4">
        <Typography.H5 className="mb-3 flex items-center">
          <Clock className="w-4 h-4 mr-2 text-green-500" />
          Bạn muốn tập trung vào khung thời gian nào? <span className="text-gray-400 text-sm font-normal">(Tùy chọn)</span>
        </Typography.H5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {timeFactors.map((factor) => (
            <Card
              key={factor.id}
              className={`p-3 cursor-pointer transition-all duration-200 ${
                discoveryData.time_factor === factor.id
                  ? 'ring-2 ring-green-500 bg-green-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleTimeFactorSelect(factor.id)}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{factor.icon}</div>
                <Typography.H6 className="mb-1">
                  {factor.name}
                </Typography.H6>
                <Typography.Caption>
                  {factor.description}
                </Typography.Caption>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Question 3: Competition Level - Optional */}
      <div className="bg-gray-50 rounded-lg p-4">
        <Typography.H5 className="mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
          Mức độ cạnh tranh bạn muốn đối mặt? <span className="text-gray-400 text-sm font-normal">(Tùy chọn)</span>
        </Typography.H5>
        <div className="space-y-2">
          {competitionLevels.map((level) => (
            <Card
              key={level.id}
              className={`p-3 cursor-pointer transition-all duration-200 ${
                discoveryData.competition_level === level.id
                  ? 'ring-2 ring-orange-500 bg-orange-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleCompetitionLevelSelect(level.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <Typography.H6>
                    {level.name}
                  </Typography.H6>
                  <Typography.Caption>
                    {level.description}
                  </Typography.Caption>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  discoveryData.competition_level === level.id
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300'
                }`} />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Question 4: Target Market - Dropdown */}
      <div className="bg-gray-50 rounded-lg p-4">
        <Typography.H5 className="mb-3 flex items-center">
          <Globe className="w-4 h-4 mr-2 text-purple-500" />
          Bạn muốn bán hàng ở thị trường nào? <span className="text-gray-400 text-sm font-normal">(Tùy chọn)</span>
        </Typography.H5>
        <select
          value={discoveryData.target_market}
          onChange={(e) => handleTargetMarketSelect(e.target.value)}
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-0 transition-all duration-200 text-sm"
        >
          <option value="">Chọn thị trường mục tiêu...</option>
          {targetMarkets.map((market) => (
            <option key={market.id} value={market.id}>
              {market.flag} {market.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Typography.H2 className="text-2xl font-bold text-gray-900 mb-4">
          🌟 Your Opportunities
        </Typography.H2>
        <Typography.Body className="text-gray-600">
          Dựa trên lựa chọn của bạn, đây là các cơ hội sản phẩm tiềm năng
        </Typography.Body>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {opportunities.map((opportunity, index) => (
          <Card
            key={index}
            className="p-6 cursor-pointer transition-all duration-200 hover:shadow-lg"
            onClick={() => setSelectedOpportunity(opportunity)}
          >
            <div className="space-y-4">
              {/* Product Image Placeholder */}
              <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📦</div>
                  <Typography.Body className="text-gray-600 text-sm">
                    {opportunity.image_query}
                  </Typography.Body>
                </div>
              </div>

              {/* Product Name */}
              <Typography.H3 className="text-lg font-semibold text-gray-900">
                {opportunity.product_name}
              </Typography.H3>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Typography.H4 className="text-sm font-medium text-green-700">
                    Demand Score
                  </Typography.H4>
                  <Typography.H3 className="text-2xl font-bold text-green-600">
                    {opportunity.metrics.demand_score}/10
                  </Typography.H3>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <Typography.H4 className="text-sm font-medium text-orange-700">
                    Competition
                  </Typography.H4>
                  <Typography.H3 className="text-2xl font-bold text-orange-600">
                    {opportunity.metrics.competition_score}/10
                  </Typography.H3>
                </div>
              </div>

              {/* Timing Analysis */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <Typography.H4 className="text-sm font-medium text-blue-700 mb-1">
                  {opportunity.timing_analysis.type}
                </Typography.H4>
                <Typography.Body className="text-blue-600 text-sm">
                  {opportunity.timing_analysis.window}
                </Typography.Body>
              </div>

              {/* AI Summary */}
              <Typography.Body className="text-gray-600 text-sm">
                {opportunity.ai_summary}
              </Typography.Body>

              {/* Action Button */}
              <Button
                variant="primary"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOpportunity(opportunity);
                }}
              >
                Xem Chi tiết & Phân tích Sâu
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderOpportunityDetail = () => {
    if (!selectedOpportunity) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setSelectedOpportunity(null)}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <Typography.H2 className="text-xl font-bold text-gray-900">
            {selectedOpportunity.product_name}
          </Typography.H2>
        </div>

        <div className="space-y-6">
          {/* Opportunity Overview */}
          <Card className="p-6">
            <Typography.H3 className="text-lg font-semibold text-gray-900 mb-3">
              Tổng quan cơ hội
            </Typography.H3>
            <Typography.Body className="text-gray-600">
              {selectedOpportunity.detailed_analysis.opportunity_overview}
            </Typography.Body>
          </Card>

          {/* Target Customer Profile */}
          <Card className="p-6">
            <Typography.H3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              Hồ sơ khách hàng mục tiêu
            </Typography.H3>
            <Typography.Body className="text-gray-600 mb-4">
              {selectedOpportunity.detailed_analysis.target_customer_profile.description}
            </Typography.Body>
            <div>
              <Typography.H4 className="font-medium text-gray-900 mb-2">
                Nỗi đau của khách hàng:
              </Typography.H4>
              <ul className="list-disc list-inside space-y-1">
                {selectedOpportunity.detailed_analysis.target_customer_profile.pain_points.map((pain, index) => (
                  <li key={index} className="text-gray-600 text-sm">
                    {pain}
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Marketing Angles */}
          <Card className="p-6">
            <Typography.H3 className="text-lg font-semibold text-gray-900 mb-3">
              Góc độ Marketing gợi ý
            </Typography.H3>
            <ul className="space-y-2">
              {selectedOpportunity.detailed_analysis.marketing_angles.map((angle, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <Typography.Body className="text-gray-600 text-sm">
                    {angle}
                  </Typography.Body>
                </li>
              ))}
            </ul>
          </Card>

          {/* Potential Risks */}
          <Card className="p-6">
            <Typography.H3 className="text-lg font-semibold text-gray-900 mb-3">
              Rủi ro tiềm ẩn cần lưu ý
            </Typography.H3>
            <ul className="space-y-2">
              {selectedOpportunity.detailed_analysis.potential_risks.map((risk, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <Typography.Body className="text-gray-600 text-sm">
                    {risk}
                  </Typography.Body>
                </li>
              ))}
            </ul>
          </Card>

          {/* Next Steps */}
          <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
            <Typography.H3 className="text-lg font-semibold text-gray-900 mb-4">
              Hành động tiếp theo
            </Typography.H3>
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  // TODO: Integrate with Product Analysis
                  console.log('Navigate to Product Analysis with:', selectedOpportunity.product_name);
                }}
              >
                🚀 PHÂN TÍCH SÂU SẢN PHẨM NÀY
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="secondary" className="w-full">
                  Tìm nhà cung cấp
                </Button>
                <Button variant="secondary" className="w-full">
                  Tạo thiết kế
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <Typography.H2>
                Product Discovery Hub
              </Typography.H2>
              <Typography.BodySmall>
                Tìm cơ hội sản phẩm tiềm năng với AI
              </Typography.BodySmall>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {selectedOpportunity ? (
            renderOpportunityDetail()
          ) : (
            <>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </>
          )}
        </div>

        {/* Footer */}
        {!selectedOpportunity && (
          <div className="border-t border-gray-200 bg-gray-50 min-h-[120px] flex flex-col justify-center">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center space-x-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full ${
                      step <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center space-x-3">
                {currentStep > 1 && (
                  <Button variant="secondary" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                )}
                {currentStep < 2 && (
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={!isStepValid(currentStep)}
                  >
                    Tiếp theo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
                {currentStep === 2 && (
                  <div className="flex flex-col items-end space-y-2 min-w-[300px]">
                  {!isStepValid(currentStep) && (
                    <Typography.BodySmall className="text-orange-600 font-medium">
                      ⚠️ Vui lòng trả lời ít nhất 1 câu hỏi
                    </Typography.BodySmall>
                  )}
                    <Button
                      variant="primary"
                      onClick={handleGenerateOpportunities}
                      disabled={!isStepValid(currentStep) || isGenerating}
                      className={`px-6 py-3 ${!isStepValid(currentStep) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Đang tìm kiếm...
                        </>
                      ) : (
                        <>
                          Tìm cơ hội
                          <Sparkles className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                    {/* Debug info */}
                    <Typography.Caption className="bg-white px-3 py-1 rounded border">
                      Debug: {isStepValid(currentStep) ? 'Valid' : 'Invalid'} | 
                      Niches: {discoveryData.niches.length} | 
                      Time: {discoveryData.time_factor} | 
                      Competition: {discoveryData.competition_level} | 
                      Market: {discoveryData.target_market}
                    </Typography.Caption>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDiscoveryModal;
