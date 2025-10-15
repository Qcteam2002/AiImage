import React, { useState, useEffect } from 'react';
import { 
  X, Lightbulb, Copy, Sparkles, RefreshCw, ChevronDown, ChevronUp,
  TrendingUp, Target, Tag, Users, Brain, Zap, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Typography } from '../design-system/Typography';

interface ProductOptimizeModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

interface SuggestData {
  keywords: {
    informational: Array<{keyword: string, volume: number, cpc: number, competition: string}>;
    transactional: Array<{keyword: string, volume: number, cpc: number, competition: string}>;
    comparative: Array<{keyword: string, volume: number, cpc: number, competition: string}>;
    painpoint_related: Array<{keyword: string, volume: number, cpc: number, competition: string}>;
  };
  target_customers: Array<{
    name: string;
    common_painpoints: string[];
    market_share_percent: number;
    age_range: string;
    locations: string[];
  }>;
}

interface OptimizedVariant {
  variant_name: string;
  optimization_focus: string;
  new_title: string;
  new_description: string;
}

// Default Keywords (nếu chưa có insight)
const DEFAULT_KEYWORDS = [
  'high quality',
  'best price',
  'fast shipping',
  'premium',
  'durable',
  'trending',
  'bestseller',
  'eco-friendly',
  'affordable',
  'limited edition'
];

// Default Personas
const DEFAULT_PERSONAS = [
  'Young Adults (18-25)',
  'Working Professionals (26-35)',
  'Parents (30-45)',
  'Students',
  'Budget Shoppers',
  'Premium Buyers',
  'Tech Enthusiasts',
  'Fashion Lovers'
];

// Default Painpoints
const DEFAULT_PAINPOINTS = [
  'Too expensive',
  'Low quality products',
  'Slow delivery',
  'Lack of product information',
  'Difficult to use',
  'Not durable',
  'Limited options',
  'Poor customer service'
];

// Countries list
const COUNTRIES = [
  { code: 'vi', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'th', name: 'Thailand', flag: '🇹🇭' },
  { code: 'my', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'ph', name: 'Philippines', flag: '🇵🇭' },
  { code: 'sg', name: 'Singapore', flag: '🇸🇬' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵' },
  { code: 'kr', name: 'South Korea', flag: '🇰🇷' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' }
];

const ProductOptimizeModalV2: React.FC<ProductOptimizeModalV2Props> = ({
  isOpen,
  onClose,
  product
}) => {
  // Top Settings (always visible)
  const [targetMarket, setTargetMarket] = useState('vi');
  const [languageOutput, setLanguageOutput] = useState('vietnamese');
  const [numVariants, setNumVariants] = useState(2);

  // Tab state
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  // Basic Tab
  const [featuresKeywords, setFeaturesKeywords] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Advanced Tab
  const [insightData, setInsightData] = useState<SuggestData | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('');
  const [selectedPainpoint, setSelectedPainpoint] = useState('');

  // Advanced Options (hidden)
  const [tone, setTone] = useState('Friendly');
  const [optimizationGoal, setOptimizationGoal] = useState('Balanced');
  const [includeEmoji, setIncludeEmoji] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeCta, setIncludeCta] = useState(true);

  // Results
  const [variants, setVariants] = useState<OptimizedVariant[]>([]);
  const [activeVariant, setActiveVariant] = useState(0);
  const [optimizing, setOptimizing] = useState(false);
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');

  // Computed dropdowns
  const keywordOptions = insightData 
    ? Object.values(insightData.keywords).flat().map(k => k.keyword)
    : DEFAULT_KEYWORDS;
  
  const personaOptions = insightData
    ? insightData.target_customers.map(c => c.name)
    : DEFAULT_PERSONAS;
  
  const painpointOptions = insightData
    ? insightData.target_customers.flatMap(c => c.common_painpoints || [])
    : DEFAULT_PAINPOINTS;

  useEffect(() => {
    if (isOpen && product) {
      // Reset form
      setTargetMarket('vi');
      setLanguageOutput('vietnamese');
      setNumVariants(2);
      setActiveTab('basic');
      setFeaturesKeywords('');
      setSpecialInstructions('');
      setInsightData(null);
      setSelectedKeyword('');
      setSelectedPersona('');
      setSelectedPainpoint('');
      setTone('Friendly');
      setOptimizationGoal('Balanced');
      setVariants([]);
      
      // Try to load cached insight
      loadCachedInsight();
    }
  }, [isOpen, product]);

  const loadCachedInsight = async () => {
    if (!product?.id) return;
    
    try {
      const response = await fetch(`/api/product-optimize/suggest-cache/${product.id}`);
      if (response.ok) {
        const data = await response.json();
        setInsightData(data);
      }
    } catch (error) {
      console.log('No cached insight found');
    }
  };

  const handleGetMarketInsight = async () => {
    if (!product) return;

    setInsightLoading(true);
    try {
      const response = await fetch('/api/product-optimize/suggest-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_title: product.name,
          product_description: product.description || '',
          product_id: product.id,
          target_market: targetMarket, // Pass target market to API
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get market insight');
      }

      const data = await response.json();
      setInsightData(data);
      
      // Auto select first options
      if (data.keywords) {
        const firstKeyword = Object.values(data.keywords).flat()[0] as any;
        if (firstKeyword) setSelectedKeyword(firstKeyword.keyword);
      }
      if (data.target_customers && data.target_customers.length > 0) {
        setSelectedPersona(data.target_customers[0].name);
        if (data.target_customers[0].common_painpoints?.length > 0) {
          setSelectedPainpoint(data.target_customers[0].common_painpoints[0]);
        }
      }
    } catch (error) {
      console.error('Error getting market insight:', error);
      alert('Có lỗi xảy ra khi lấy market insight. Vui lòng thử lại.');
    } finally {
      setInsightLoading(false);
    }
  };


  const handleOptimizeNow = async () => {
    if (!product) return;

    setOptimizing(true);
    try {
      const payload = {
        product_id: product.id,
        product_title: product.name,
        product_description: product.description || '',
        features_keywords: featuresKeywords,
        special_instructions: specialInstructions,
        tone: tone,
        optimization_goal: optimizationGoal,
        customer_segment: selectedPersona,
        target_market: targetMarket,
        main_keywords: selectedKeyword ? [selectedKeyword] : [],
        painpoint: selectedPainpoint,
        brand_tone_reference: '',
        include_emoji: includeEmoji,
        include_hashtags: includeHashtags,
        include_cta: includeCta,
        output_format: 'title_description',
        language_output: languageOutput,
        num_variants: numVariants
      };

      const response = await fetch('/api/product-optimize/optimize-advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to optimize content');
      }

      const result = await response.json();
      if (result.variants && Array.isArray(result.variants)) {
        setVariants(result.variants);
        setActiveVariant(0);
      }
    } catch (error) {
      console.error('Error optimizing:', error);
      alert('Có lỗi xảy ra khi tối ưu nội dung. Vui lòng thử lại.');
    } finally {
      setOptimizing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
          <div className="flex items-center space-x-3 flex-1">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <Typography.H2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                🧠 Product Content Optimizer V2
              </Typography.H2>
              <Typography.BodySmall className="text-gray-600 font-medium">
                Product: {product?.name}
              </Typography.BodySmall>
            </div>
            {product?.image_url && (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg border-2 border-white shadow-md"
              />
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg p-2 transition-all ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Input Form */}
          <div className="w-2/5 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Section A: Basic Fields */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <Typography.H3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Section A — Basic Optimize
                </Typography.H3>

                <div className="space-y-4">
                  {/* Features & Keywords */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Features & Keywords
                    </label>
                    <textarea
                      value={featuresKeywords}
                      onChange={(e) => setFeaturesKeywords(e.target.value)}
                      placeholder='"usb rechargeable, quiet fan, portable design"'
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                    <Typography.Caption className="text-gray-500 mt-1">
                      Các đặc điểm nổi bật hoặc từ khóa chính
                    </Typography.Caption>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions <span className="text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder='"Make it fun, use emojis"'
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                    <Typography.Caption className="text-gray-500 mt-1">
                      Hướng dẫn đặc biệt cho AI
                    </Typography.Caption>
                  </div>

                  {/* Language Output */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language Output
                    </label>
                    <select
                      value={languageOutput}
                      onChange={(e) => setLanguageOutput(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    >
                      <option value="vietnamese">Vietnamese</option>
                      <option value="english">English</option>
                      <option value="bilingual">Bilingual</option>
                    </select>
                  </div>

                  {/* Number of Variants */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Variants
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          onClick={() => setNumVariants(num)}
                          className={`flex-1 p-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                            numVariants === num
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400 text-gray-700'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-2">
                  <Button
                    onClick={handleGetMarketInsight}
                    disabled={insightLoading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
                  >
                    {insightLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Phân tích...
                      </>
                    ) : insightData ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Insight
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Get Market Insight
                      </>
                    )}
                  </Button>

                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-all flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    ⚙️ Advanced
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Section B: Market Insight */}
              {insightData && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <Typography.H3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    Section B — Market Insight
                  </Typography.H3>

                  {/* Tabs */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setInsightActiveTab('keywords')}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        insightActiveTab === 'keywords'
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Tag className="w-4 h-4 inline mr-1" />
                      Keywords
                    </button>
                    <button
                      onClick={() => setInsightActiveTab('painpoints')}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        insightActiveTab === 'painpoints'
                          ? 'bg-red-100 text-red-700 border-2 border-red-500'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Target className="w-4 h-4 inline mr-1" />
                      Painpoints
                    </button>
                    <button
                      onClick={() => setInsightActiveTab('segmentation')}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        insightActiveTab === 'segmentation'
                          ? 'bg-green-100 text-green-700 border-2 border-green-500'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Users className="w-4 h-4 inline mr-1" />
                      Segments
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {/* Keywords Tab */}
                    {insightActiveTab === 'keywords' && (
                      <div className="space-y-3">
                        {Object.entries(insightData.keywords).map(([category, keywords]) => (
                          <div key={category}>
                            <Typography.BodySmall className="font-semibold text-gray-700 mb-2 uppercase text-xs">
                              {category === 'informational' ? '📚 Informational' :
                               category === 'transactional' ? '💰 Transactional' :
                               category === 'comparative' ? '⚖️ Comparative' :
                               '❗ Painpoint-related'}
                            </Typography.BodySmall>
                            <div className="space-y-1">
                              {keywords.slice(0, 5).map((kw: any, idx: number) => (
                                <label
                                  key={idx}
                                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all ${
                                    selectedKeywords.includes(kw.keyword)
                                      ? 'bg-blue-50 border border-blue-300'
                                      : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedKeywords.includes(kw.keyword)}
                                    onChange={() => handleKeywordToggle(kw.keyword)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                  />
                                  <span className="flex-1 text-sm text-gray-900">{kw.keyword}</span>
                                  <span className="text-xs text-gray-500">Vol: {kw.volume}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                          <Typography.Caption className="text-blue-700">
                            Selected: {selectedKeywords.length} keywords
                          </Typography.Caption>
                        </div>
                      </div>
                    )}

                    {/* Painpoints Tab */}
                    {insightActiveTab === 'painpoints' && (
                      <div className="space-y-3">
                        {insightData.target_customers.map((customer, idx) => (
                          <div key={idx}>
                            <Typography.BodySmall className="font-semibold text-gray-700 mb-2">
                              👥 {customer.name}
                            </Typography.BodySmall>
                            <div className="space-y-1">
                              {customer.common_painpoints?.map((painpoint, pidx) => (
                                <label
                                  key={pidx}
                                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all ${
                                    selectedPainpoints.includes(painpoint)
                                      ? 'bg-red-50 border border-red-300'
                                      : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedPainpoints.includes(painpoint)}
                                    onChange={() => handlePainpointToggle(painpoint)}
                                    disabled={selectedPainpoints.length >= 3 && !selectedPainpoints.includes(painpoint)}
                                    className="w-4 h-4 text-red-600 rounded"
                                  />
                                  <span className="flex-1 text-sm text-gray-900">{painpoint}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                          <Typography.Caption className="text-red-700">
                            Selected: {selectedPainpoints.length}/3 painpoints
                          </Typography.Caption>
                        </div>
                      </div>
                    )}

                    {/* Segmentation Tab */}
                    {insightActiveTab === 'segmentation' && (
                      <div className="space-y-2">
                        {insightData.target_customers.map((segment, idx) => (
                          <label
                            key={idx}
                            className={`block p-4 rounded-lg cursor-pointer transition-all border-2 ${
                              selectedSegment === segment
                                ? 'bg-green-50 border-green-500 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="segment"
                              checked={selectedSegment === segment}
                              onChange={() => setSelectedSegment(segment)}
                              className="hidden"
                            />
                            <div className="flex items-start gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                selectedSegment === segment
                                  ? 'border-green-500 bg-green-500'
                                  : 'border-gray-300'
                              }`}>
                                {selectedSegment === segment && (
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <Typography.Body className="font-semibold text-gray-900 text-sm">
                                  {segment.name}
                                </Typography.Body>
                                <Typography.Caption className="text-gray-600 mt-1">
                                  {segment.age_range} | Market share: {segment.market_share_percent}%
                                </Typography.Caption>
                                <Typography.Caption className="text-gray-500 mt-1">
                                  📍 {segment.locations.slice(0, 3).join(', ')}
                                </Typography.Caption>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section C: Advanced Options */}
              {showAdvanced && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <Typography.H3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                    Section C — Advanced Options
                  </Typography.H3>

                  <div className="space-y-4">
                    {/* Tone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tone
                      </label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                      >
                        <option value="Friendly">Friendly</option>
                        <option value="Professional">Professional</option>
                        <option value="Playful">Playful</option>
                        <option value="Sophisticated">Sophisticated</option>
                        <option value="Persuasive">Persuasive</option>
                      </select>
                    </div>

                    {/* Optimization Goal */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Optimization Goal
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['SEO', 'Conversion', 'Balanced'].map((goal) => (
                          <button
                            key={goal}
                            onClick={() => setOptimizationGoal(goal)}
                            className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                              optimizationGoal === goal
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:border-gray-400 text-gray-700'
                            }`}
                          >
                            {goal === 'SEO' ? '🔍 SEO' : goal === 'Conversion' ? '💬 Convert' : '⚖️ Balanced'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Target Market */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Market
                      </label>
                      <select
                        value={targetMarket}
                        onChange={(e) => setTargetMarket(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                      >
                        <option value="vi">🇻🇳 Vietnam</option>
                        <option value="en">🇺🇸 English (US)</option>
                        <option value="id">🇮🇩 Indonesia</option>
                        <option value="th">🇹🇭 Thailand</option>
                      </select>
                    </div>

                    {/* Include Options */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Include Elements
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeEmoji}
                            onChange={(e) => setIncludeEmoji(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700">Include Emoji 😊</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeHashtags}
                            onChange={(e) => setIncludeHashtags(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700">Include Hashtags #️⃣</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeCta}
                            onChange={(e) => setIncludeCta(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700">Include CTA 🎯</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Insight Prompt */}
              {!insightData && !insightLoading && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <Typography.Body className="text-sm font-medium text-yellow-800">
                        💡 Pro Tip
                      </Typography.Body>
                      <Typography.Caption className="text-yellow-700 mt-1">
                        Click "Get Market Insight" để AI phân tích và gợi ý keywords, painpoints, và segmentation tự động!
                      </Typography.Caption>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="w-3/5 bg-white overflow-y-auto">
            <div className="p-6">
              {variants.length > 0 ? (
                <div className="space-y-6">
                  {/* Variant Tabs */}
                  <div className="flex items-center justify-between">
                    <Typography.H3 className="text-lg font-bold text-gray-900">
                      ✨ Generated Variants ({variants.length})
                    </Typography.H3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode('html')}
                        className={`px-3 py-1 text-xs rounded-lg font-medium ${
                          viewMode === 'html'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        HTML
                      </button>
                      <button
                        onClick={() => setViewMode('text')}
                        className={`px-3 py-1 text-xs rounded-lg font-medium ${
                          viewMode === 'text'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Text
                      </button>
                    </div>
                  </div>

                  {/* Variant Selector */}
                  {variants.length > 1 && (
                    <div className="flex gap-2">
                      {variants.map((variant, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveVariant(idx)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                            activeVariant === idx
                              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                              : 'border-gray-300 hover:border-gray-400 text-gray-700'
                          }`}
                        >
                          {variant.variant_name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Content Display */}
                  {variants[activeVariant] && (
                    <div className="space-y-4">
                      {/* Title */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold text-gray-700">
                            📝 Title
                          </label>
                          <button
                            onClick={() => copyToClipboard(variants[activeVariant].new_title)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <Typography.Body className="font-medium text-gray-900">
                            {variants[activeVariant].new_title}
                          </Typography.Body>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold text-gray-700">
                            📄 Description
                          </label>
                          <button
                            onClick={() => {
                              const content = viewMode === 'html'
                                ? variants[activeVariant].new_description
                                : htmlToText(variants[activeVariant].new_description);
                              copyToClipboard(content);
                            }}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        {viewMode === 'html' ? (
                          <div className="p-6 border-2 border-gray-200 rounded-lg bg-white min-h-[400px] overflow-auto">
                            <div
                              dangerouslySetInnerHTML={{ __html: variants[activeVariant].new_description }}
                              className="prose prose-sm max-w-none"
                            />
                          </div>
                        ) : (
                          <textarea
                            value={htmlToText(variants[activeVariant].new_description)}
                            readOnly
                            className="w-full p-4 border-2 border-gray-200 rounded-lg font-mono text-sm"
                            rows={20}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[500px]">
                  <div className="text-center max-w-md">
                    <Lightbulb className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <Typography.H3 className="text-xl font-bold text-gray-900 mb-3">
                      Ready to Optimize! 🚀
                    </Typography.H3>
                    <Typography.Body className="text-gray-600">
                      Fill in the basic fields, optionally get market insights, then click "Optimize Now" to generate optimized content.
                    </Typography.Body>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              {insightData && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">Market insights loaded</span>
                </div>
              )}
              {selectedKeywords.length > 0 && (
                <span className="text-blue-600 font-medium">
                  {selectedKeywords.length} keywords selected
                </span>
              )}
              {selectedSegment && (
                <span className="text-green-600 font-medium">
                  Segment: {selectedSegment.name}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="secondary"
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleOptimizeNow}
                disabled={optimizing}
                className="px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg"
              >
                {optimizing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    🚀 Optimize Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductOptimizeModalV2;

