import React, { useState, useEffect } from 'react';
import { 
  X, Lightbulb, Copy, Sparkles, RefreshCw, FileCode,
  Rocket, Zap, CheckCircle2, ExternalLink, Download
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Typography } from '../design-system/Typography';

interface ProductLandingPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

const ProductLandingPageModal: React.FC<ProductLandingPageModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  // ========== COLOR THEMES ==========
  const colorThemes = [
    { value: 'luxury-gold', name: '💎 Luxury Gold', desc: 'Sang trọng, đẳng cấp', colors: ['#d4af37', '#1a1a1a'] },
    { value: 'rose-gold', name: '🌹 Rose Gold', desc: 'Nữ tính, tinh tế', colors: ['#e8b4b8', '#c9a0dc'] },
    { value: 'ocean-blue', name: '🌊 Ocean Blue', desc: 'Chuyên nghiệp, tin cậy', colors: ['#0077be', '#0099cc'] },
    { value: 'sunset-orange', name: '🌅 Sunset Orange', desc: 'Năng động, sáng tạo', colors: ['#ff6b35', '#f7931e'] },
    { value: 'forest-green', name: '🌿 Forest Green', desc: 'Tự nhiên, ECO', colors: ['#2d6a4f', '#52b788'] },
    { value: 'royal-purple', name: '👑 Royal Purple', desc: 'Quý phái, sang trọng', colors: ['#6a0dad', '#9b59b6'] },
    { value: 'elegant-black', name: '🖤 Elegant Black', desc: 'Tối giản, hiện đại', colors: ['#1a1a1a', '#4a4a4a'] },
    { value: 'coral-pink', name: '🌸 Coral Pink', desc: 'Trẻ trung, dễ thương', colors: ['#ff6b9d', '#ff8fab'] }
  ];

  // ========== AI MODELS ==========
  const aiModels = [
    { value: 'deepseek/deepseek-v3.2-exp', name: '🤖 DeepSeek V3.2', desc: 'Mạnh nhất, code tốt (Free)', recommended: true },
    { value: 'x-ai/grok-code-fast-1', name: '⚡ Grok Code Fast', desc: 'Nhanh, creative (Free)', recommended: true },
    { value: 'moonshotai/kimi-k2', name: '🌙 Kimi K2', desc: 'Moonshot AI, thông minh (Free)', recommended: false }
  ];

  // ========== FORM STATE ==========
  const [targetAudience, setTargetAudience] = useState('');
  const [usp, setUsp] = useState('');
  const [painPoints, setPainPoints] = useState('');
  const [keyBenefits, setKeyBenefits] = useState('');
  const [pricing, setPricing] = useState('');
  const [ctaText, setCtaText] = useState('Buy Now');
  const [landingGoal, setLandingGoal] = useState('direct_sale');
  const [colorScheme, setColorScheme] = useState('ocean-blue'); // Default: Ocean Blue
  const [aiModel, setAiModel] = useState('deepseek/deepseek-v3.2-exp'); // Default: DeepSeek
  const [includeTestimonials, setIncludeTestimonials] = useState(true);
  const [includeFaq, setIncludeFaq] = useState(true);
  const [includePricing, setIncludePricing] = useState(true);
  const [language, setLanguage] = useState('vietnamese');

  // ========== RESULT STATE ==========
  const [landingPageHtml, setLandingPageHtml] = useState('');
  const [generating, setGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');

  // ========== RESET ON OPEN ==========
  useEffect(() => {
    if (isOpen && product) {
      // Set smart defaults to reduce user input
      setTargetAudience('Người tiêu dùng Việt Nam quan tâm đến chất lượng và giá cả hợp lý');
      setUsp(''); // User MUST fill this - most important field
      setPainPoints('Giá cao, chất lượng không đảm bảo, giao hàng chậm');
      setKeyBenefits(''); // User MUST fill this - most important field
      setPricing(''); // Optional
      setCtaText('Mua Ngay');
      setLandingGoal('direct_sale');
      setColorScheme('ocean-blue'); // Default: Ocean Blue - professional
      setAiModel('deepseek/deepseek-v3.2-exp'); // Default: DeepSeek
      setIncludeTestimonials(true);
      setIncludeFaq(true);
      setIncludePricing(false); // Default off since pricing is optional
      setLanguage('vietnamese');
      setLandingPageHtml('');
    }
  }, [isOpen, product]);

  const handleGenerate = async () => {
    if (!product) return;

    setGenerating(true);
    try {
      const payload = {
        product_id: product.id,
        product_title: product.name,
        product_description: product.description || '',
        product_image: product.image_url || '', // Send image for ImgBB upload
        target_audience: targetAudience,
        usp: usp,
        pain_points: painPoints,
        key_benefits: keyBenefits,
        pricing: pricing,
        cta_text: ctaText,
        landing_goal: landingGoal,
        color_scheme: colorScheme,
        ai_model: aiModel, // Pass selected model
        include_testimonials: includeTestimonials,
        include_faq: includeFaq,
        include_pricing: includePricing,
        language: language
      };

      const response = await fetch('/api/product-optimize/generate-landing-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          throw new Error(errorData.details || 'Rate limit exceeded. Please wait 30 seconds and try again.');
        }
        throw new Error(errorData.error || 'Failed to generate landing page');
      }

      const result = await response.json();
      setLandingPageHtml(result.html);
    } catch (error: any) {
      console.error('Error generating landing page:', error);
      alert(error.message || 'Có lỗi xảy ra khi tạo landing page. Vui lòng thử lại.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Đã copy vào clipboard!');
  };

  const downloadHtml = () => {
    const blob = new Blob([landingPageHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `landing-page-${product?.name || 'product'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col my-4">
        {/* ========== HEADER ========== */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 via-red-50 to-pink-50">
          <div className="flex items-center space-x-3 flex-1">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <Typography.H2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                🚀 Landing Page Generator
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

        {/* ========== MAIN CONTENT ========== */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Input Form */}
          <div className="w-2/5 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <Typography.H3 className="text-base font-bold text-gray-900 mb-4">
                  🎯 Target & Goals
                </Typography.H3>

                <div className="space-y-4">
                  {/* Target Audience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      👥 Target Audience <span className="text-gray-400">(has default)</span>
                    </label>
                    <textarea
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="Default: Người tiêu dùng Việt Nam quan tâm chất lượng"
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm bg-gray-50"
                    />
                  </div>

                  {/* Landing Goal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🎯 Landing Goal
                    </label>
                    <select
                      value={landingGoal}
                      onChange={(e) => setLandingGoal(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm bg-white"
                    >
                      <option value="direct_sale">Direct Sale (Buy Now)</option>
                      <option value="lead_generation">Lead Generation (Sign Up)</option>
                      <option value="pre_order">Pre-Order / Waitlist</option>
                      <option value="learn_more">Learn More / Info</option>
                    </select>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🗣️ Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm bg-white"
                    >
                      <option value="vietnamese">Vietnamese</option>
                      <option value="english">English</option>
                      <option value="bilingual">Bilingual</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Positioning */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <Typography.H3 className="text-base font-bold text-gray-900 mb-4">
                  💎 Product Positioning
                </Typography.H3>

                <div className="space-y-4">
                  {/* USP */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ⭐ Unique Selling Proposition (USP) <span className="text-red-500">* REQUIRED</span>
                    </label>
                    <textarea
                      value={usp}
                      onChange={(e) => setUsp(e.target.value)}
                      placeholder="VD: Sạc nhanh PD 30W chính hãng, bảo hành 12 tháng, 1 đổi 1 trong 30 ngày"
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {/* Pain Points */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ⚠️ Pain Points to Address <span className="text-gray-400">(has default)</span>
                    </label>
                    <textarea
                      value={painPoints}
                      onChange={(e) => setPainPoints(e.target.value)}
                      placeholder="Default: Giá cao, chất lượng không đảm bảo, giao hàng chậm"
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm bg-gray-50"
                    />
                  </div>

                  {/* Key Benefits */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🌟 Key Benefits <span className="text-red-500">* REQUIRED</span>
                    </label>
                    <textarea
                      value={keyBenefits}
                      onChange={(e) => setKeyBenefits(e.target.value)}
                      placeholder="VD: Sạc nhanh 0-80% trong 30 phút, An toàn không chai pin, Bảo hành 12 tháng"
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* CTA & Pricing */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <Typography.H3 className="text-base font-bold text-gray-900 mb-4">
                  💰 Pricing & CTA
                </Typography.H3>

                <div className="space-y-4">
                  {/* Pricing */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      💵 Pricing Info
                    </label>
                    <input
                      type="text"
                      value={pricing}
                      onChange={(e) => setPricing(e.target.value)}
                      placeholder="e.g., $99 (was $149) - 30% OFF"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {/* CTA Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🎯 CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="e.g., Buy Now, Get Started, Sign Up"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Design Options */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <Typography.H3 className="text-base font-bold text-gray-900 mb-4">
                  🎨 Design & Color Theme
                </Typography.H3>

                <div className="space-y-4">
                  {/* Color Scheme with Visual Preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      🌈 Choose Color Theme
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {colorThemes.map((theme) => (
                        <button
                          key={theme.value}
                          type="button"
                          onClick={() => setColorScheme(theme.value)}
                          className={`relative p-3 border-2 rounded-lg text-left transition-all ${
                            colorScheme === theme.value
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          {/* Color Preview */}
                          <div className="flex gap-1 mb-2">
                            {theme.colors.map((color, idx) => (
                              <div
                                key={idx}
                                className="w-8 h-8 rounded-md shadow-sm"
                                style={{ background: color }}
                              />
                            ))}
                          </div>
                          {/* Theme Name */}
                          <div className="text-xs font-semibold text-gray-900 mb-0.5">
                            {theme.name}
                          </div>
                          {/* Theme Description */}
                          <div className="text-xs text-gray-500">
                            {theme.desc}
                          </div>
                          {/* Selected Indicator */}
                          {colorScheme === theme.value && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle2 className="w-4 h-4 text-blue-500" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Model Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🤖 AI Model <span className="text-blue-500 text-xs">(Test & Compare)</span>
                    </label>
                    <select
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm bg-white"
                    >
                      {aiModels.map((model) => (
                        <option key={model.value} value={model.value}>
                          {model.name} - {model.desc}
                          {model.recommended ? ' ⭐' : ''}
                        </option>
                      ))}
                    </select>
                    <Typography.Caption className="text-gray-500 mt-1">
                      Thử các models khác nhau để so sánh chất lượng landing page
                    </Typography.Caption>
                  </div>

                  {/* Sections to Include */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📋 Sections to Include
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeTestimonials}
                          onChange={(e) => setIncludeTestimonials(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">⭐ Testimonials Section</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeFaq}
                          onChange={(e) => setIncludeFaq(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">❓ FAQ Section</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includePricing}
                          onChange={(e) => setIncludePricing(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">💰 Pricing Section</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tip */}
              {!landingPageHtml && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <Typography.Body className="text-sm font-medium text-yellow-800">
                        💡 Pro Tip
                      </Typography.Body>
                      <Typography.Caption className="text-yellow-700 mt-1">
                        Fill in target audience, USP, and key benefits for best results. The AI will create a complete, conversion-optimized landing page!
                      </Typography.Caption>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-3/5 bg-white overflow-y-auto">
            <div className="p-6">
              {landingPageHtml ? (
                <div className="space-y-6">
                  {/* View Mode Toggle */}
                  <div className="flex items-center justify-between">
                    <Typography.H3 className="text-lg font-bold text-gray-900">
                      🎉 Landing Page Generated!
                    </Typography.H3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode('preview')}
                        className={`px-3 py-1 text-xs rounded-lg font-medium ${
                          viewMode === 'preview'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <ExternalLink className="w-3 h-3 inline mr-1" />
                        Preview
                      </button>
                      <button
                        onClick={() => setViewMode('code')}
                        className={`px-3 py-1 text-xs rounded-lg font-medium ${
                          viewMode === 'code'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <FileCode className="w-3 h-3 inline mr-1" />
                        Code
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(landingPageHtml)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy HTML
                    </Button>
                    <Button
                      onClick={downloadHtml}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  {/* Content Display */}
                  {viewMode === 'preview' ? (
                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                      <iframe
                        srcDoc={landingPageHtml}
                        className="w-full h-[600px] bg-white"
                        title="Landing Page Preview"
                      />
                    </div>
                  ) : (
                    <div>
                      <textarea
                        value={landingPageHtml}
                        readOnly
                        className="w-full p-4 border-2 border-gray-200 rounded-lg font-mono text-xs bg-gray-50"
                        rows={30}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[500px]">
                  <div className="text-center max-w-md">
                    <Rocket className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <Typography.H3 className="text-xl font-bold text-gray-900 mb-3">
                      Ready to Launch! 🚀
                    </Typography.H3>
                    <Typography.Body className="text-gray-600">
                      Fill in the form and click "Generate Landing Page" to create a stunning, high-converting landing page for your product.
                    </Typography.Body>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========== FOOTER ========== */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              {landingPageHtml && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">Landing page ready!</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="secondary"
                className="px-6"
              >
                Close
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generating || !targetAudience || !usp || !keyBenefits}
                className="px-8 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 text-white font-bold shadow-lg"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    🚀 Generate Landing Page
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

export default ProductLandingPageModal;

