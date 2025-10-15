import React, { useState, useEffect } from 'react';
import { 
  X, Lightbulb, Copy, Sparkles, Target, Zap, RefreshCw, 
  ChevronDown, ChevronUp, Settings, Globe, Tag, TrendingUp,
  ShoppingCart, MessageSquare, Smile, Hash, MousePointer
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Typography } from '../design-system/Typography';

interface ProductOptimizeModalAdvancedProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

interface OptimizedVariant {
  new_title: string;
  new_description: string;
  variant_name?: string;
  optimization_focus?: string;
}

// Quick Presets
const QUICK_PRESETS = [
  {
    id: 'professional',
    name: 'Bán hàng chuyên nghiệp',
    description: 'Tone chuyên nghiệp, tập trung SEO',
    config: {
      tone: 'Professional',
      optimization_goal: 'SEO',
      include_emoji: false,
      include_hashtags: true,
      include_cta: true
    }
  },
  {
    id: 'genz',
    name: 'Dễ thương – Gen Z',
    description: 'Tone trẻ trung, nhiều emoji',
    config: {
      tone: 'Playful',
      optimization_goal: 'Conversion',
      include_emoji: true,
      include_hashtags: true,
      include_cta: true
    }
  },
  {
    id: 'luxury',
    name: 'Sang trọng – High-end',
    description: 'Tone cao cấp, tinh tế',
    config: {
      tone: 'Sophisticated',
      optimization_goal: 'Balanced',
      include_emoji: false,
      include_hashtags: false,
      include_cta: true
    }
  }
];

// Customer Segments
const CUSTOMER_SEGMENTS = [
  'Gen Z (16-25)',
  'Mẹ bỉm sữa (25-40)',
  'Dân văn phòng (25-35)',
  'Nam trung niên (35-50)',
  'Phân khúc cao cấp',
  'Teen (13-18)',
  'Phổ thông',
  'Tùy chỉnh'
];

// Target Platforms
const TARGET_PLATFORMS = [
  { value: 'shopee', label: 'Shopee' },
  { value: 'tiktok_shop', label: 'TikTok Shop' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'lazada', label: 'Lazada' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'custom', label: 'Custom' }
];

// Target Markets
const TARGET_MARKETS = [
  { value: 'vi', label: 'Việt Nam 🇻🇳' },
  { value: 'en', label: 'English (US) 🇺🇸' },
  { value: 'id', label: 'Indonesia 🇮🇩' },
  { value: 'th', label: 'Thailand 🇹🇭' },
  { value: 'my', label: 'Malaysia 🇲🇾' },
];

const ProductOptimizeModalAdvanced: React.FC<ProductOptimizeModalAdvancedProps> = ({
  isOpen,
  onClose,
  product
}) => {
  // Basic Inputs
  const [productInput, setProductInput] = useState<string>('');
  const [featuresKeywords, setFeaturesKeywords] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [tone, setTone] = useState<string>('Friendly');

  // Advanced Options (collapsed by default)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [optimizationGoal, setOptimizationGoal] = useState<string>('Balanced');
  const [customerSegment, setCustomerSegment] = useState<string>('');
  const [customSegment, setCustomSegment] = useState<string>('');
  const [targetPlatform, setTargetPlatform] = useState<string>('shopee');
  const [targetMarket, setTargetMarket] = useState<string>('vi');
  const [mainKeywords, setMainKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState<string>('');
  const [brandToneReference, setBrandToneReference] = useState<string>('');
  const [includeEmoji, setIncludeEmoji] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeCta, setIncludeCta] = useState(true);

  // Output Format
  const [outputFormat, setOutputFormat] = useState<string>('title_description');
  const [languageOutput, setLanguageOutput] = useState<string>('vietnamese');
  const [numVariants, setNumVariants] = useState<number>(2);

  // Results
  const [variants, setVariants] = useState<OptimizedVariant[]>([]);
  const [activeVariant, setActiveVariant] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'text' | 'html'>('html');

  useEffect(() => {
    if (isOpen && product) {
      // Reset form
      setProductInput(product.name || '');
      setFeaturesKeywords('');
      setSpecialInstructions('');
      setTone('Friendly');
      setShowAdvanced(false);
      setVariants([]);
      setActiveVariant(0);
      
      // Set defaults
      setOptimizationGoal('Balanced');
      setCustomerSegment('');
      setTargetPlatform('shopee');
      setTargetMarket('vi');
      setMainKeywords([]);
      setBrandToneReference('');
      setIncludeEmoji(true);
      setIncludeHashtags(true);
      setIncludeCta(true);
      setOutputFormat('title_description');
      setLanguageOutput('vietnamese');
      setNumVariants(2);
    }
  }, [isOpen, product]);

  const applyPreset = (preset: any) => {
    setTone(preset.config.tone);
    setOptimizationGoal(preset.config.optimization_goal);
    setIncludeEmoji(preset.config.include_emoji);
    setIncludeHashtags(preset.config.include_hashtags);
    setIncludeCta(preset.config.include_cta);
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && mainKeywords.length < 10) {
      setMainKeywords([...mainKeywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setMainKeywords(mainKeywords.filter((_, i) => i !== index));
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const isFormValid = () => {
    return productInput.trim() !== '';
  };

  const handleGenerate = async () => {
    if (!isFormValid() || !product) return;

    setLoading(true);
    try {
      const payload = {
        // Basic inputs
        product_title: productInput,
        product_description: product.description || '',
        features_keywords: featuresKeywords,
        special_instructions: specialInstructions,
        tone: tone,
        
        // Advanced options
        optimization_goal: optimizationGoal,
        customer_segment: customerSegment === 'Tùy chỉnh' ? customSegment : customerSegment,
        target_platform: targetPlatform,
        target_market: targetMarket,
        main_keywords: mainKeywords,
        brand_tone_reference: brandToneReference,
        include_emoji: includeEmoji,
        include_hashtags: includeHashtags,
        include_cta: includeCta,
        
        // Output format
        output_format: outputFormat,
        language_output: languageOutput,
        num_variants: numVariants,
        
        product_id: product.id
      };

      const response = await fetch('/api/product-optimize/optimize-advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to generate optimized content');
      }

      const result = await response.json();
      
      // Handle multiple variants
      if (result.variants && Array.isArray(result.variants)) {
        setVariants(result.variants);
      } else {
        // Fallback for single variant
        setVariants([{
          new_title: result.new_title,
          new_description: result.new_description,
          variant_name: 'Version 1',
          optimization_focus: optimizationGoal
        }]);
      }
      
      setActiveVariant(0);
    } catch (error) {
      console.error('Error generating optimized content:', error);
      alert('Có lỗi xảy ra khi tạo nội dung tối ưu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optional: Show toast notification
  };

  const htmlToText = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <Typography.H2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Advanced Content Optimizer
              </Typography.H2>
              <Typography.BodySmall className="text-gray-600 font-medium">
                Tối ưu hóa thông minh cho: {product?.name}
              </Typography.BodySmall>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg p-2 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column - Input Form */}
          <div className="w-2/5 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Quick Presets */}
              <div>
                <Typography.H4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                  Quick Presets
                </Typography.H4>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className="p-3 text-center border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all group"
                      title={preset.description}
                    >
                      <Typography.BodySmall className="font-medium text-gray-700 group-hover:text-purple-700">
                        {preset.name}
                      </Typography.BodySmall>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <Typography.H3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  1️⃣ Basic Input
                </Typography.H3>

                {/* Product Title / Link */}
                <div className="space-y-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Product Title / Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={productInput}
                    onChange={(e) => setProductInput(e.target.value)}
                    placeholder='e.g. "Quạt mini cầm tay" hoặc "https://shopee.vn/..."'
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all text-sm"
                  />
                  <Typography.Caption className="text-gray-500">
                    Người mới có thể dán link hoặc gõ tên sản phẩm
                  </Typography.Caption>
                </div>

                {/* Features & Keywords */}
                <div className="space-y-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Features & Keywords
                  </label>
                  <textarea
                    value={featuresKeywords}
                    onChange={(e) => setFeaturesKeywords(e.target.value)}
                    placeholder='e.g. "organic cotton, relaxed fit, breathable fabric"'
                    rows={3}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all text-sm"
                  />
                  <Typography.Caption className="text-gray-500">
                    Gợi ý các đặc điểm chính hoặc keyword muốn nhấn mạnh
                  </Typography.Caption>
                </div>

                {/* Special Instructions */}
                <div className="space-y-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Special Instructions (optional)
                  </label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder='e.g. "replace some words with emoji", "focus on sustainability"'
                    rows={2}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all text-sm"
                  />
                  <Typography.Caption className="text-gray-500">
                    Cho phép hướng dẫn AI tùy chỉnh cách viết
                  </Typography.Caption>
                </div>

                {/* Tone */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all text-sm"
                  >
                    <option value="Friendly">Friendly – Thân thiện</option>
                    <option value="Professional">Professional – Chuyên nghiệp</option>
                    <option value="Expert">Expert – Chuyên gia</option>
                    <option value="Playful">Playful – Vui tươi</option>
                    <option value="Sophisticated">Sophisticated – Tinh tế</option>
                    <option value="Persuasive">Persuasive – Thuyết phục</option>
                    <option value="Luxury">Luxury – Sang trọng</option>
                    <option value="Funny">Funny – Hài hước</option>
                  </select>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all group"
                >
                  <div className="flex items-center">
                    <Settings className="w-4 h-4 mr-2 text-purple-600" />
                    <Typography.H4 className="text-sm font-semibold text-gray-900">
                      2️⃣ Advanced Options
                    </Typography.H4>
                  </div>
                  {showAdvanced ? (
                    <ChevronUp className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
                  )}
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4 pl-2">
                    {/* Optimization Goal */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                        Optimization Goal
                      </label>
                      <select
                        value={optimizationGoal}
                        onChange={(e) => setOptimizationGoal(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-0 text-sm"
                      >
                        <option value="SEO">SEO – Tối ưu công cụ tìm kiếm</option>
                        <option value="Conversion">Conversion – Tối ưu chuyển đổi</option>
                        <option value="Balanced">Balanced – Cân bằng</option>
                      </select>
                    </div>

                    {/* Customer Segment */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <Target className="w-4 h-4 mr-1 text-blue-500" />
                        Customer Segment
                      </label>
                      <select
                        value={customerSegment}
                        onChange={(e) => setCustomerSegment(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-0 text-sm"
                      >
                        <option value="">-- Chọn phân khúc --</option>
                        {CUSTOMER_SEGMENTS.map((segment) => (
                          <option key={segment} value={segment}>{segment}</option>
                        ))}
                      </select>
                      {customerSegment === 'Tùy chỉnh' && (
                        <input
                          type="text"
                          value={customSegment}
                          onChange={(e) => setCustomSegment(e.target.value)}
                          placeholder="Nhập phân khúc tùy chỉnh..."
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-0 text-sm mt-2"
                        />
                      )}
                    </div>

                    {/* Target Platform */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <ShoppingCart className="w-4 h-4 mr-1 text-orange-500" />
                        Target Platform
                      </label>
                      <select
                        value={targetPlatform}
                        onChange={(e) => setTargetPlatform(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-0 text-sm"
                      >
                        {TARGET_PLATFORMS.map((platform) => (
                          <option key={platform.value} value={platform.value}>
                            {platform.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Target Market / Language */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <Globe className="w-4 h-4 mr-1 text-indigo-500" />
                        Target Market / Language
                      </label>
                      <select
                        value={targetMarket}
                        onChange={(e) => setTargetMarket(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-0 text-sm"
                      >
                        {TARGET_MARKETS.map((market) => (
                          <option key={market.value} value={market.value}>
                            {market.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Main Keywords (Tags Input) */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <Tag className="w-4 h-4 mr-1 text-pink-500" />
                        Main Keywords (max 10)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyDown={handleKeywordKeyDown}
                          placeholder="Nhập keyword và Enter..."
                          className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-0 text-sm"
                          disabled={mainKeywords.length >= 10}
                        />
                        <button
                          onClick={handleAddKeyword}
                          disabled={mainKeywords.length >= 10}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Add
                        </button>
                      </div>
                      {mainKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {mainKeywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                            >
                              {keyword}
                              <button
                                onClick={() => handleRemoveKeyword(index)}
                                className="hover:text-purple-900"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Brand Tone Reference */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1 text-cyan-500" />
                        Brand Tone Reference
                      </label>
                      <textarea
                        value={brandToneReference}
                        onChange={(e) => setBrandToneReference(e.target.value)}
                        placeholder='e.g. "Giọng điệu của shop tôi nên giống Apple – minimalist & smart"'
                        rows={2}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-0 text-sm"
                      />
                    </div>

                    {/* Include Options (Checkboxes) */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Include Elements
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeEmoji}
                            onChange={(e) => setIncludeEmoji(e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <Smile className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-700">Include Emoji</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeHashtags}
                            onChange={(e) => setIncludeHashtags(e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <Hash className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-700">Include Hashtags</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeCta}
                            onChange={(e) => setIncludeCta(e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <MousePointer className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">Include CTA (Call to Action)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Output Format Section */}
              <div className="border-t border-gray-200 pt-6">
                <Typography.H4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  3️⃣ Output Format
                </Typography.H4>

                <div className="space-y-4">
                  {/* Output Format */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Output Format
                    </label>
                    <select
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-0 text-sm"
                    >
                      <option value="title_description">Title + Description</option>
                      <option value="description_only">Only Description</option>
                      <option value="full_seo">Full SEO (Title + Desc + Tags)</option>
                    </select>
                  </div>

                  {/* Language Output */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Language Output
                    </label>
                    <select
                      value={languageOutput}
                      onChange={(e) => setLanguageOutput(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-0 text-sm"
                    >
                      <option value="vietnamese">Vietnamese</option>
                      <option value="english">English</option>
                      <option value="bilingual">Bilingual (Vi + En)</option>
                    </select>
                  </div>

                  {/* Number of Variants */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Number of Variants
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          onClick={() => setNumVariants(num)}
                          className={`flex-1 p-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                            numVariants === num
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          {num} {num === 1 ? 'Version' : 'Versions'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="w-3/5 bg-white overflow-y-auto">
            <div className="p-6">
              {variants.length > 0 ? (
                <div className="space-y-6">
                  {/* Variant Tabs */}
                  <div className="flex items-center justify-between">
                    <Typography.H3 className="text-lg font-bold text-gray-900">
                      Generated Variants ({variants.length})
                    </Typography.H3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setViewMode('html')}
                        className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                          viewMode === 'html'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        HTML
                      </button>
                      <button
                        onClick={() => setViewMode('text')}
                        className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                          viewMode === 'text'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Text
                      </button>
                    </div>
                  </div>

                  {/* Variant Selector */}
                  {variants.length > 1 && (
                    <div className="flex gap-2 flex-wrap">
                      {variants.map((variant, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveVariant(index)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all font-medium text-sm ${
                            activeVariant === index
                              ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            {variant.variant_name || `Version ${index + 1}`}
                            {variant.optimization_focus && (
                              <span className="text-xs opacity-70">
                                ({variant.optimization_focus})
                              </span>
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Active Variant Content */}
                  {variants[activeVariant] && (
                    <div className="space-y-6">
                      {/* Title */}
                      {(outputFormat === 'title_description' || outputFormat === 'full_seo') && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-semibold text-gray-700">
                              ✨ Optimized Title
                            </label>
                            <button
                              onClick={() => copyToClipboard(variants[activeVariant].new_title)}
                              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                              title="Copy title"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                            <Typography.Body className="font-medium text-gray-900">
                              {variants[activeVariant].new_title}
                            </Typography.Body>
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-semibold text-gray-700">
                            📝 Optimized Description
                          </label>
                          <button
                            onClick={() => {
                              const content = viewMode === 'html'
                                ? variants[activeVariant].new_description
                                : htmlToText(variants[activeVariant].new_description);
                              copyToClipboard(content);
                            }}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                            title="Copy description"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {viewMode === 'html' ? (
                          <div className="p-6 border-2 border-gray-200 rounded-xl bg-white min-h-[300px] overflow-auto">
                            <div
                              dangerouslySetInnerHTML={{ __html: variants[activeVariant].new_description }}
                              className="prose prose-sm max-w-none 
                                [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mb-3 [&_h3]:mt-4
                                [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-gray-800 [&_h4]:mb-2
                                [&_p]:text-gray-700 [&_p]:mb-3 [&_p]:leading-relaxed
                                [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-3
                                [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-3
                                [&_li]:text-gray-700 [&_li]:mb-2 [&_li]:leading-relaxed
                                [&_strong]:font-bold [&_strong]:text-gray-900
                                [&_em]:italic [&_em]:text-gray-700
                                [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:shadow-md [&_img]:mb-4
                                [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800
                                [&_.emoji]:text-2xl"
                            />
                          </div>
                        ) : (
                          <textarea
                            value={htmlToText(variants[activeVariant].new_description)}
                            readOnly
                            className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                            rows={15}
                          />
                        )}
                      </div>

                      {/* SEO Tags (if full_seo) */}
                      {outputFormat === 'full_seo' && (
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            🏷️ SEO Tags & Meta
                          </label>
                          <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                            <Typography.BodySmall className="text-gray-700 font-mono">
                              {/* Placeholder for SEO tags - would be generated by backend */}
                              <strong>Meta Keywords:</strong> {mainKeywords.join(', ')}<br/>
                              <strong>Meta Description:</strong> {variants[activeVariant].new_title.slice(0, 160)}...
                            </Typography.BodySmall>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button
                          onClick={() => copyToClipboard(
                            `${variants[activeVariant].new_title}\n\n${
                              viewMode === 'html' 
                                ? variants[activeVariant].new_description 
                                : htmlToText(variants[activeVariant].new_description)
                            }`
                          )}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy All
                        </Button>
                        <Button
                          onClick={() => {
                            // Regenerate this variant with different tone
                            handleGenerate();
                          }}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[500px]">
                  <div className="text-center max-w-md">
                    <div className="mb-6 relative">
                      <Sparkles className="w-20 h-20 text-purple-300 mx-auto animate-pulse" />
                      <Lightbulb className="w-12 h-12 text-yellow-300 mx-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <Typography.H3 className="text-xl font-bold text-gray-900 mb-3">
                      Ready to Optimize! ✨
                    </Typography.H3>
                    <Typography.Body className="text-gray-600 mb-4">
                      Fill in the basic information and click <strong>"Generate Content"</strong> to create optimized product content.
                    </Typography.Body>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <Typography.BodySmall className="text-gray-700">
                        💡 <strong>Pro tip:</strong> Use Quick Presets for faster setup or explore Advanced Options for more control!
                      </Typography.BodySmall>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Generate Button */}
        <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              {isFormValid() ? (
                <span className="text-green-600 font-medium flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Ready to generate
                </span>
              ) : (
                <span className="text-gray-600">Please fill in product title to continue</span>
              )}
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!isFormValid() || loading}
              className="px-8 py-3.5 text-base font-bold rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-white transform hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                  Generating {numVariants} {numVariants === 1 ? 'Version' : 'Versions'}...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2 inline-block" />
                  Generate Content ({numVariants} {numVariants === 1 ? 'Version' : 'Versions'})
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductOptimizeModalAdvanced;

