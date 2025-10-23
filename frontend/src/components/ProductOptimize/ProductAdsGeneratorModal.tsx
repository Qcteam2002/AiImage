import React, { useState, useEffect } from 'react';
import { X, Sparkles, Megaphone, RefreshCw, Copy, Check, Facebook, Instagram, Video } from 'lucide-react';
import { Button } from '../ui/Button';
import { Typography } from '../design-system/Typography';

interface ProductAdsGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

interface AdResult {
  ad_headline: string;
  ad_copy: string;
  ad_visual_idea?: string;
  cta: string;
  expected_performance?: string;
}

const ProductAdsGeneratorModal: React.FC<ProductAdsGeneratorModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const [platform, setPlatform] = useState<'facebook' | 'instagram' | 'tiktok'>('facebook');
  const [mode, setMode] = useState<'segment' | 'painpoint' | 'feature' | 'keyword'>('segment');
  const [format, setFormat] = useState<'PAS' | 'BAB' | 'testimonial' | 'feature'>('PAS');
  const [inputMode, setInputMode] = useState<'manual' | 'suggest'>('suggest');
  const [numVersions, setNumVersions] = useState<number>(1);
  const [selectedModel, setSelectedModel] = useState<string>('openai/gpt-4o-mini');
  
  // Manual input states
  const [manualSegment, setManualSegment] = useState<string>('');
  const [manualPainpoint, setManualPainpoint] = useState<string>('');
  const [manualFeature, setManualFeature] = useState<string>('');
  const [manualKeywords, setManualKeywords] = useState<string>('');
  
  // AI suggest states
  const [suggestData, setSuggestData] = useState<any>(null);
  const [selectedSegment, setSelectedSegment] = useState<any>(null);
  const [selectedPainpoint, setSelectedPainpoint] = useState<string>('');
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  
  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [adResult, setAdResult] = useState<AdResult | null>(null);
  const [adVersions, setAdVersions] = useState<AdResult[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset all states
      setPlatform('facebook');
      setMode('segment');
      setFormat('PAS');
      setInputMode('suggest');
      setNumVersions(1);
      setSelectedModel('openai/gpt-4o-mini');
      setManualSegment('');
      setManualPainpoint('');
      setManualFeature('');
      setManualKeywords('');
      setSuggestData(null);
      setSelectedSegment(null);
      setSelectedPainpoint('');
      setSelectedFeature(null);
      setSelectedKeywords([]);
      setAdResult(null);
      setAdVersions([]);
      setCopiedField(null);
      
      // Load cached suggest data
      loadCachedSuggestData();
    }
  }, [isOpen]);

  const loadCachedSuggestData = async () => {
    if (!product) return;
    
    try {
      const response = await fetch(`/api/product-optimize/suggest-cache/${product.id}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestData(data);
        console.log('Loaded cached suggest data for ads:', data);
      } else if (response.status === 404) {
        console.log('No cached data found for this product');
      } else {
        throw new Error('Failed to load cached data');
      }
    } catch (error) {
      console.error('Error loading cached suggest data:', error);
    }
  };

  const handleSuggestData = async () => {
    if (!product) return;

    setSuggestLoading(true);
    try {
      // Get current date for market insight
      const currentDate = new Date().toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });

      const response = await fetch('/api/product-optimize/suggest-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_title: product.name,
          product_description: product.description,
          product_id: product.id,
          market_insight_date: currentDate, // Add date for better AI analysis
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestData(data);
      } else {
        throw new Error('Failed to get suggest data');
      }
    } catch (error) {
      console.error('Error fetching suggested data:', error);
      alert('Có lỗi xảy ra khi lấy dữ liệu gợi ý.');
    } finally {
      setSuggestLoading(false);
    }
  };

  const isGenerateEnabled = () => {
    if (!platform || !mode || !format) return false;
    
    if (inputMode === 'manual') {
      switch (mode) {
        case 'segment':
          return manualSegment.trim() !== '';
        case 'painpoint':
          return manualPainpoint.trim() !== '';
        case 'feature':
          return manualFeature.trim() !== '';
        case 'keyword':
          return manualKeywords.trim() !== '';
        default:
          return false;
      }
    } else {
      switch (mode) {
        case 'segment':
          return selectedSegment !== null;
        case 'painpoint':
          return selectedPainpoint !== '';
        case 'feature':
          return selectedFeature !== null;
        case 'keyword':
          return selectedKeywords.length > 0;
        default:
          return false;
      }
    }
  };

  const handleGenerateAds = async () => {
    if (!isGenerateEnabled()) return;

    setIsGenerating(true);
    setAdResult(null);
    setAdVersions([]);

    try {
      let payload: any = {
        platform,
        mode,
        format,
        num_versions: numVersions,
        language: 'vi',
        model: selectedModel
      };

      // Prepare data based on mode and input type
      if (inputMode === 'manual') {
        switch (mode) {
          case 'segment':
            payload.data = { segment_data: { name: manualSegment } };
            break;
          case 'painpoint':
            payload.data = { painpoint_data: { painpoint: manualPainpoint, customer: 'Manual Input' } };
            break;
          case 'feature':
            payload.data = { feature_data: { problem: manualFeature, satisfaction_percent: 85 } };
            break;
          case 'keyword':
            payload.data = { keyword_data: { keywords: manualKeywords.split(',').map(k => k.trim()).filter(k => k) } };
            break;
        }
      } else {
        switch (mode) {
          case 'segment':
            payload.data = { segment_data: selectedSegment };
            break;
          case 'painpoint':
            // Find which customer segment this painpoint belongs to
            let customerName = 'Unknown';
            for (const customer of suggestData?.target_customers || []) {
              if (customer.common_painpoints?.includes(selectedPainpoint)) {
                customerName = customer.name;
                break;
              }
            }
            payload.data = { painpoint_data: { painpoint: selectedPainpoint, customer: customerName } };
            break;
          case 'feature':
            payload.data = { feature_data: selectedFeature };
            break;
          case 'keyword':
            payload.data = { keyword_data: { keywords: selectedKeywords } };
            break;
        }
      }

      const response = await fetch(`/api/product-optimize/generate-ads/${product.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to generate ads');
      }

      const result = await response.json();
      
      // Handle multiple versions or single version
      if (result.versions && Array.isArray(result.versions)) {
        setAdVersions(result.versions);
        setAdResult(null);
      } else {
        setAdResult(result);
        setAdVersions([]);
      }
    } catch (error) {
      console.error('Error generating ads:', error);
      alert('Có lỗi xảy ra khi tạo quảng cáo. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const renderAdPreview = (ad: AdResult, versionIndex?: number) => {
    const versionLabel = versionIndex !== undefined ? ` - Phiên bản ${versionIndex + 1}` : '';
    
    return (
      <div key={versionIndex} className="space-y-6">
        {versionIndex !== undefined && (
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-200">
            <Typography.H4 className="text-xl font-bold text-gray-900 flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
              Phiên bản {versionIndex + 1}
            </Typography.H4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(`${ad.ad_headline}\n\n${ad.ad_copy}\n\n${ad.cta}`, `version_${versionIndex}`)}
              className="bg-white hover:bg-gray-50 rounded-lg px-4 py-2 shadow-sm"
            >
              {copiedField === `version_${versionIndex}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="ml-2 text-sm font-medium">Copy All</span>
            </Button>
          </div>
        )}

        {/* Facebook/Instagram Preview */}
        {(platform === 'facebook' || platform === 'instagram') && (
          <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${platform === 'facebook' ? 'bg-blue-100' : 'bg-pink-100'}`}>
                  {platform === 'facebook' ? (
                    <Facebook className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Instagram className="w-6 h-6 text-pink-600" />
                  )}
                </div>
                <div>
                  <span className="font-bold text-gray-900 text-lg">
                    {platform === 'facebook' ? 'Facebook' : 'Instagram'} Ad Preview{versionLabel}
                  </span>
                  <p className="text-sm text-gray-600">Preview quảng cáo thực tế</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                  {ad.ad_headline}
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                  {ad.ad_copy}
                </p>
                <div className="pt-4">
                  <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                    {ad.cta}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TikTok Preview */}
        {platform === 'tiktok' && (
          <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-900 to-black">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg">
                  <Video className="w-6 h-6 text-black" />
                </div>
                <div>
                  <span className="font-bold text-white text-lg">TikTok Video Script{versionLabel}</span>
                  <p className="text-sm text-gray-400">Kịch bản video 15 giây</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                <h3 className="text-white font-bold mb-4 text-xl">
                  {ad.ad_headline}
                </h3>
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-base mb-6">
                  {ad.ad_visual_idea}
                </div>
                <div className="pt-4 border-t border-gray-700">
                  <div className="text-sm text-gray-400 mb-2 font-medium">Call to Action:</div>
                  <div className="text-white font-bold text-lg">{ad.cta}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Megaphone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <Typography.H2 className="text-xl font-bold text-gray-900 mb-1">
                Generate Ads
              </Typography.H2>
              <p className="text-sm text-gray-600 font-medium">Tạo quảng cáo cho {product?.name}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg p-2 transition-all"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Content - Two Columns */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column - Settings */}
          <div className="w-1/3 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Platform Selection */}
              <div>
                <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Chọn nền tảng
                </Typography.H4>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as any)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 text-sm"
                >
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>

              {/* Mode Selection */}
              <div>
                <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Chọn Mode (Mục đích tạo ads)
                </Typography.H4>
                <select
                  value={mode}
                  onChange={(e) => {
                    setMode(e.target.value as any);
                    setSelectedSegment(null);
                    setSelectedPainpoint('');
                    setSelectedFeature(null);
                    setSelectedKeywords([]);
                    setManualSegment('');
                    setManualPainpoint('');
                    setManualFeature('');
                    setManualKeywords('');
                  }}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 transition-all duration-200 text-sm"
                >
                  <option value="segment">Dựa trên phân khúc khách hàng</option>
                  <option value="painpoint">Dựa trên nỗi đau (Pain Points)</option>
                  <option value="feature">Dựa trên tính năng sản phẩm</option>
                  <option value="keyword">Dựa trên từ khóa</option>
                </select>
              </div>

              {/* Input Mode Selection */}
              <div>
                <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Chế độ nhập liệu
                </Typography.H4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setInputMode('manual')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                      inputMode === 'manual'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Nhập thủ công
                  </button>
                  <button
                    onClick={() => setInputMode('suggest')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                      inputMode === 'suggest'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    AI Gợi ý
                  </button>
                </div>
              </div>

              {/* Suggest Button */}
              {inputMode === 'suggest' && (
                <div>
                  {suggestData && (
                    <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <Typography.BodySmall className="text-green-700 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Đã có dữ liệu gợi ý từ lần trước
                      </Typography.BodySmall>
                    </div>
                  )}
                  <Button
                    onClick={handleSuggestData}
                    disabled={suggestLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {suggestLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang phân tích...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {suggestData ? 'Cập nhật dữ liệu gợi ý' : 'AI Gợi ý dữ liệu'}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Manual Input Fields */}
              {inputMode === 'manual' && (
                <div>
                  {mode === 'segment' && (
                    <div>
                      <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                        Nhập phân khúc khách hàng
                      </Typography.H4>
                      <textarea
                        value={manualSegment}
                        onChange={(e) => setManualSegment(e.target.value)}
                        placeholder="Ví dụ: Khách hàng trẻ tuổi 25-35, sống ở thành phố lớn, quan tâm đến công nghệ..."
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all duration-200 text-sm resize-none"
                        rows={3}
                      />
                    </div>
                  )}

                  {mode === 'painpoint' && (
                    <div>
                      <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        Nhập pain point
                      </Typography.H4>
                      <textarea
                        value={manualPainpoint}
                        onChange={(e) => setManualPainpoint(e.target.value)}
                        placeholder="Ví dụ: Khó khăn trong việc tìm kiếm sản phẩm phù hợp, lo lắng về chất lượng..."
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 transition-all duration-200 text-sm resize-none"
                        rows={3}
                      />
                    </div>
                  )}

                  {mode === 'feature' && (
                    <div>
                      <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                        Nhập tính năng sản phẩm
                      </Typography.H4>
                      <textarea
                        value={manualFeature}
                        onChange={(e) => setManualFeature(e.target.value)}
                        placeholder="Ví dụ: Thiết kế thông minh, tiết kiệm thời gian, dễ sử dụng..."
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 transition-all duration-200 text-sm resize-none"
                        rows={3}
                      />
                    </div>
                  )}

                  {mode === 'keyword' && (
                    <div>
                      <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        Nhập từ khóa
                      </Typography.H4>
                      <textarea
                        value={manualKeywords}
                        onChange={(e) => setManualKeywords(e.target.value)}
                        placeholder="Ví dụ: sản phẩm chất lượng, giá rẻ, giao hàng nhanh, uy tín..."
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 text-sm resize-none"
                        rows={3}
                      />
                      <Typography.BodySmall className="text-gray-500 mt-2">
                        Nhập các từ khóa cách nhau bởi dấu phẩy (,)
                      </Typography.BodySmall>
                    </div>
                  )}
                </div>
              )}

              {/* AI Suggest Data Selection */}
              {inputMode === 'suggest' && suggestData && (
                <div>
                  {mode === 'segment' && (
                    <div>
                      <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                        Chọn phân khúc khách hàng
                      </Typography.H4>
                      <div className="space-y-2">
                        {suggestData.target_customers?.map((customer: any, index: number) => (
                          <label
                            key={index}
                            className={`flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedSegment === customer 
                                ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name="segment"
                              value={index}
                              checked={selectedSegment === customer}
                              onChange={() => setSelectedSegment(customer)}
                              className="w-4 h-4 text-indigo-600"
                            />
                            <div className="flex-1">
                              <Typography.Body className="font-medium text-gray-900 text-sm">{customer.name}</Typography.Body>
                              <Typography.BodySmall className="text-gray-600 mt-1">
                                {customer.age_range} | {customer.locations?.slice(0, 2).join(', ')}
                              </Typography.BodySmall>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {mode === 'painpoint' && (
                    <div>
                      <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        Chọn Pain Point
                      </Typography.H4>
                      <div className="space-y-2">
                        {suggestData.target_customers?.map((customer: any, customerIndex: number) => (
                          <div key={customerIndex} className="border border-gray-200 rounded-lg p-3">
                            <Typography.BodySmall className="font-semibold text-gray-700 mb-2">
                              {customer.name}
                            </Typography.BodySmall>
                            <div className="space-y-1">
                              {customer.common_painpoints?.map((painpoint: string, painpointIndex: number) => (
                                <label
                                  key={`${customerIndex}-${painpointIndex}`}
                                  className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-all duration-200 ${
                                    selectedPainpoint === painpoint 
                                      ? 'border-red-500 bg-red-50 shadow-sm' 
                                      : 'border-gray-200 hover:border-gray-300 hover:bg-white'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="painpoint"
                                    value={painpoint}
                                    checked={selectedPainpoint === painpoint}
                                    onChange={() => setSelectedPainpoint(painpoint)}
                                    className="w-4 h-4 text-red-600"
                                  />
                                  <div className="flex-1">
                                    <Typography.Body className="font-medium text-gray-900 text-sm">{painpoint}</Typography.Body>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {mode === 'feature' && (
                    <div>
                      <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                        Chọn tính năng sản phẩm
                      </Typography.H4>
                      <div className="space-y-2">
                        {suggestData.product_problems?.resolved?.map((feature: any, index: number) => (
                          <label
                            key={index}
                            className={`flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedFeature === feature 
                                ? 'border-yellow-500 bg-yellow-50 shadow-sm' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name="feature"
                              value={index}
                              checked={selectedFeature === feature}
                              onChange={() => setSelectedFeature(feature)}
                              className="w-4 h-4 text-yellow-600"
                            />
                            <div className="flex-1">
                              <Typography.Body className="font-medium text-gray-900 text-sm">{feature.problem}</Typography.Body>
                              <Typography.BodySmall className="text-gray-600 mt-1">
                                {feature.satisfaction_percent}% hài lòng
                              </Typography.BodySmall>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {mode === 'keyword' && (
                    <div>
                      <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        Chọn từ khóa
                      </Typography.H4>
                      <div className="space-y-3">
                        {suggestData.keywords && Object.entries(suggestData.keywords).map(([category, keywords]: [string, any]) => (
                          <div key={category} className="border border-gray-200 rounded-lg p-3">
                            <Typography.BodySmall className="font-semibold text-gray-700 mb-2 capitalize">
                              {category.replace('_', ' ')}
                            </Typography.BodySmall>
                            <div className="space-y-1">
                              {Array.isArray(keywords) && keywords.map((keyword: any, index: number) => {
                                const keywordText = typeof keyword === 'string' ? keyword : keyword.keyword;
                                const isSelected = selectedKeywords.includes(keywordText);
                                
                                return (
                                  <label
                                    key={index}
                                    className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-all duration-200 ${
                                      isSelected
                                        ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-white'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedKeywords(prev => [...prev, keywordText]);
                                        } else {
                                          setSelectedKeywords(prev => prev.filter(k => k !== keywordText));
                                        }
                                      }}
                                      className="w-4 h-4 text-blue-600"
                                    />
                                    <div className="flex-1">
                                      <Typography.Body className="font-medium text-gray-900 text-sm">{keywordText}</Typography.Body>
                                      {typeof keyword === 'object' && keyword.volume && (
                                        <Typography.BodySmall className="text-gray-600 mt-1">
                                          Volume: {keyword.volume} | CPC: ${keyword.cpc}
                                        </Typography.BodySmall>
                                      )}
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Format Selection */}
              <div>
                <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  Chọn định dạng
                </Typography.H4>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 transition-all duration-200 text-sm"
                >
                  <option value="PAS">PAS (Problem-Agitate-Solution)</option>
                  <option value="BAB">BAB (Before-After-Bridge)</option>
                  <option value="testimonial">Testimonial</option>
                  <option value="feature">Feature-focused</option>
                </select>
              </div>

              {/* Number of Versions */}
              <div>
                <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Số phiên bản
                </Typography.H4>
                <select
                  value={numVersions}
                  onChange={(e) => setNumVersions(Number(e.target.value))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-all duration-200 text-sm"
                >
                  <option value={1}>1 phiên bản</option>
                  <option value={2}>2 phiên bản</option>
                  <option value={3}>3 phiên bản</option>
                </select>
              </div>

              {/* Model Selection */}
              <div>
                <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                  Chọn AI Model
                </Typography.H4>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all duration-200 text-sm"
                >
                  <option value="openai/gpt-4o-mini">GPT-4o Mini (Nhanh, ổn định)</option>
                  <option value="google/gemini-2.5-flash-preview-09-2025">Gemini 2.5 Flash (Thử nghiệm)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="w-2/3 bg-white overflow-y-auto">
            <div className="p-8">
              {/* Result Display */}
              {(adResult || adVersions.length > 0) ? (
                <div className="space-y-8">
                  <div className="text-center">
                    <Typography.H3 className="text-2xl font-bold text-gray-900 mb-2">
                      Kết quả quảng cáo
                    </Typography.H3>
                    <p className="text-gray-600">Quảng cáo đã được tạo thành công</p>
                  </div>
                  
                  {/* Platform Preview */}
                  <div className="space-y-8">
                    {/* Single Version */}
                    {adResult && renderAdPreview(adResult)}
                    
                    {/* Multiple Versions */}
                    {adVersions.length > 0 && (
                      <div className="space-y-8">
                        {adVersions.map((version, index) => renderAdPreview(version, index))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="p-6 bg-gray-100 rounded-full mb-6">
                    <Megaphone className="w-12 h-12 text-gray-400" />
                  </div>
                  <Typography.H3 className="text-xl font-semibold text-gray-900 mb-2">
                    Sẵn sàng tạo quảng cáo
                  </Typography.H3>
                  <p className="text-gray-600 max-w-md">
                    Chọn nền tảng, mode và dữ liệu để tạo quảng cáo hiệu quả cho sản phẩm của bạn
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Pin Generate Button */}
        <div className="border-t border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {isGenerateEnabled() ? (
                <span className="text-green-600 font-medium">Tất cả cài đặt đã hoàn thành</span>
              ) : (
                <span>Vui lòng hoàn thành tất cả cài đặt</span>
              )}
            </div>
            <Button
              onClick={handleGenerateAds}
              disabled={!isGenerateEnabled() || isGenerating}
              className="px-8 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tạo quảng cáo...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Tạo quảng cáo
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductAdsGeneratorModal;
