import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { X, Globe, Building2, Package, Lightbulb, Target, Users } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { marketExplorerService } from '../services/marketExplorerService';
import toast from 'react-hot-toast';

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
  { code: 'CL', name: 'Chile', flag: '🇨🇱' }
];

const BUSINESS_GOALS = [
  { value: 'find_low_competition_niche', label: 'Tìm niche ít cạnh tranh' },
  { value: 'test_new_market', label: 'Test thị trường mới' },
  { value: 'maximize_profit', label: 'Tối đa hóa lợi nhuận' },
  { value: 'build_sustainable_brand', label: 'Xây dựng thương hiệu bền vững' },
  { value: 'scale_existing_business', label: 'Mở rộng kinh doanh hiện tại' },
  { value: 'diversify_revenue_streams', label: 'Đa dạng hóa nguồn thu' },
  { value: 'enter_emerging_market', label: 'Thâm nhập thị trường mới nổi' },
  { value: 'optimize_marketing_strategy', label: 'Tối ưu hóa chiến lược marketing' }
];

const INDUSTRY_CATEGORIES = [
  { value: 'all', label: 'Tất cả ngành hàng (AI tự phân tích)' },
  { value: 'fashion_accessories', label: 'Thời trang & Phụ kiện' },
  { value: 'electronics_gadgets', label: 'Điện tử & Gia dụng' },
  { value: 'health_beauty', label: 'Sức khỏe & Làm đẹp' },
  { value: 'home_garden', label: 'Nhà cửa & Vườn tược' },
  { value: 'sports_outdoor', label: 'Thể thao & Ngoài trời' },
  { value: 'automotive', label: 'Ô tô & Phụ tùng' },
  { value: 'pet_supplies', label: 'Thú cưng' },
  { value: 'baby_kids', label: 'Trẻ em & Mẹ bé' },
  { value: 'food_beverage', label: 'Thực phẩm & Đồ uống' },
  { value: 'office_supplies', label: 'Văn phòng & Học tập' },
  { value: 'jewelry_watches', label: 'Trang sức & Đồng hồ' },
  { value: 'books_media', label: 'Sách & Truyền thông' },
  { value: 'travel_luggage', label: 'Du lịch & Hành lý' },
  { value: 'art_crafts', label: 'Nghệ thuật & Thủ công' },
  { value: 'other', label: 'Khác' }
];

interface AddMarketExplorerModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddMarketExplorerModal: React.FC<AddMarketExplorerModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    target_country: '',
    business_model: 'Dropshipping',
    industry_category: null,
    custom_industry: '',
    product_features: '',
    business_goals: '',
    language: 'vi',
    customer_segments_count: 1,
    niche_count: 3,
  });

  const createMutation = useMutation(
    (data: any) => marketExplorerService.createMarketExplorer(data),
    {
      onSuccess: async (createdMarket) => {
        toast.success(t('marketExplorer.createSuccess'));
        
        // Automatically start analysis
        try {
          toast(t('marketExplorer.startingAnalysis'));
          await marketExplorerService.analyzeMarketExplorer(createdMarket.id);
          toast.success(t('marketExplorer.analysisStarted'));
        } catch (error: any) {
          console.error('Error starting analysis:', error);
          toast.error(error.response?.data?.error || t('marketExplorer.analysisError'));
        }
        
        onSuccess();
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.message || t('marketExplorer.createError'));
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.target_country) {
      toast.error(t('marketExplorer.requiredFields'));
      return;
    }

    // Prepare data for API
    const submitData = {
      ...formData,
      // Use custom_industry if "other" is selected, "all" if "all" is selected, otherwise use industry_category or null if not selected
      industry_category: formData.industry_category === 'other' 
        ? formData.custom_industry 
        : formData.industry_category === 'all'
        ? 'all'
        : formData.industry_category || null,
      // Remove custom_industry from final data
      custom_industry: undefined,
    };

    console.log('Submitting data:', submitData);
    createMutation.mutate(submitData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (field === 'customer_segments_count' || field === 'niche_count') ? Number(value) : value,
    }));
  };

  const businessModelOptions = [
    { value: 'Dropshipping', label: t('marketExplorer.businessModel.dropshipping') },
    { value: 'Affiliate', label: t('marketExplorer.businessModel.affiliate') },
    { value: 'Both', label: t('marketExplorer.businessModel.both') },
    { value: 'Self-Business', label: t('marketExplorer.businessModel.selfBusiness') },
  ];

  const languageOptions = [
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'en', label: 'English' },
  ];

  const customerSegmentsOptions = [
    { value: 1, label: '1 nhóm khách hàng' },
    { value: 2, label: '2 nhóm khách hàng' },
    { value: 3, label: '3 nhóm khách hàng' },
    { value: 4, label: '4 nhóm khách hàng' },
    { value: 5, label: '5 nhóm khách hàng' },
  ];

  const nicheCountOptions = [
    { value: 1, label: '1 ngành hàng' },
    { value: 2, label: '2 ngành hàng' },
    { value: 3, label: '3 ngành hàng' },
    { value: 4, label: '4 ngành hàng' },
    { value: 5, label: '5 ngành hàng' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('marketExplorer.addMarket')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Target Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-2" />
              {t('marketExplorer.targetCountry')} *
            </label>
            <select
              value={formData.target_country}
              onChange={(e) => handleInputChange('target_country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">{t('marketExplorer.selectCountry')}</option>
              {TARGET_MARKETS.map(market => (
                <option key={market.code} value={market.code}>
                  {market.flag} {market.name} ({market.code})
                </option>
              ))}
            </select>
          </div>

          {/* Business Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-2" />
              {t('marketExplorer.businessModel.label')} *
            </label>
            <select
              value={formData.business_model}
              onChange={(e) => handleInputChange('business_model', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {businessModelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Industry Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="w-4 h-4 inline mr-2" />
              {t('marketExplorer.industryCategory')}
            </label>
            <select
              value={formData.industry_category}
              onChange={(e) => handleInputChange('industry_category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('marketExplorer.selectIndustry')}</option>
              {INDUSTRY_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            
            {/* Custom Industry Input - Show when "other" is selected */}
            {formData.industry_category === 'other' && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả ngành hàng bạn muốn kinh doanh
                </label>
                <Input
                  value={formData.custom_industry}
                  onChange={(e) => handleInputChange('custom_industry', e.target.value)}
                  placeholder="Ví dụ: Đồ chơi trẻ em, Thiết bị thể thao, Đồ nội thất..."
                  className="w-full"
                />
              </div>
            )}
            
            <p className="text-sm text-gray-500 mt-1">
              {t('marketExplorer.industryCategoryHelp')}
            </p>
          </div>

          {/* Product Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lightbulb className="w-4 h-4 inline mr-2" />
              {t('marketExplorer.productFeatures')}
            </label>
            <Textarea
              value={formData.product_features}
              onChange={(e) => handleInputChange('product_features', e.target.value)}
              placeholder={t('marketExplorer.productFeaturesPlaceholder')}
              rows={3}
            />
            <p className="text-sm text-gray-500 mt-1">
              {t('marketExplorer.productFeaturesHelp')}
            </p>
          </div>

          {/* Business Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Target className="w-4 h-4 inline mr-2" />
              {t('marketExplorer.businessGoals')}
            </label>
            <select
              value={formData.business_goals}
              onChange={(e) => handleInputChange('business_goals', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('marketExplorer.selectBusinessGoal')}</option>
              {BUSINESS_GOALS.map(goal => (
                <option key={goal.value} value={goal.value}>
                  {goal.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {t('marketExplorer.businessGoalsHelp')}
            </p>
          </div>

          {/* Customer Segments Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              {t('marketExplorer.customerSegmentsCount')}
            </label>
            <select
              value={formData.customer_segments_count}
              onChange={(e) => handleInputChange('customer_segments_count', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {customerSegmentsOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {t('marketExplorer.customerSegmentsCountHelp')}
            </p>
          </div>

          {/* Niche Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Target className="w-4 h-4 inline mr-2" />
              {t('marketExplorer.nicheCount')}
            </label>
            <select
              value={formData.niche_count}
              onChange={(e) => handleInputChange('niche_count', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {nicheCountOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {t('marketExplorer.nicheCountHelp')}
            </p>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('marketExplorer.language')}
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          </form>
        </div>

        {/* Footer - Pinned */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg flex-shrink-0">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={createMutation.isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={createMutation.isLoading}
          >
            {createMutation.isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {t('common.creating')}
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                {t('marketExplorer.exploreAndAnalyze')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddMarketExplorerModal;
