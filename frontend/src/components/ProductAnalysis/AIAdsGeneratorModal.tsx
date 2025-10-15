import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sparkles, Facebook, Instagram, Video, Target, AlertTriangle, Star, Copy, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Typography } from '../design-system/Typography';

interface AIAdsGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: any;
  product: any;
}

interface AdResult {
  ad_headline: string;
  ad_copy: string;
  ad_visual_idea: string;
  cta: string;
  expected_performance?: string;
}

interface AdVersions {
  versions: AdResult[];
}

const AIAdsGeneratorModal: React.FC<AIAdsGeneratorModalProps> = ({
  isOpen,
  onClose,
  analysisResult,
  product
}) => {
  const { t, i18n } = useTranslation();
  
  const [platform, setPlatform] = useState<'facebook' | 'instagram' | 'tiktok' | null>('facebook');
  const [mode, setMode] = useState<'segment' | 'painpoint' | 'feature' | null>('segment');
  const [format, setFormat] = useState<'PAS' | 'BAB' | 'testimonial' | 'feature' | null>('PAS');
  const [selectedSegment, setSelectedSegment] = useState<any>(null);
  const [selectedPainPoint, setSelectedPainPoint] = useState<any>(null);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [numVersions, setNumVersions] = useState<number>(1);
  const [selectedModel, setSelectedModel] = useState<string>('openai/gpt-4o-mini');
  const [isGenerating, setIsGenerating] = useState(false);
  const [adResult, setAdResult] = useState<AdResult | null>(null);
  const [adVersions, setAdVersions] = useState<AdResult[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPlatform('facebook');
      setMode('segment');
      setFormat('PAS');
      setSelectedModel('openai/gpt-4o-mini');
      setSelectedSegment(null);
      setSelectedPainPoint(null);
      setSelectedFeature(null);
      setNumVersions(1);
      setAdResult(null);
      setAdVersions([]);
      setCopiedField(null);
    }
  }, [isOpen]);

  const isGenerateEnabled = () => {
    if (!platform || !mode || !format) return false;
    if (mode === 'segment' && !selectedSegment) return false;
    if (mode === 'painpoint' && (!selectedPainPoint || !selectedPainPoint.painpoint)) return false;
    if (mode === 'feature' && !selectedFeature) return false;
    return true;
  };

  const handleModeChange = (newMode: 'segment' | 'painpoint' | 'feature') => {
    setMode(newMode);
    setSelectedSegment(null);
    setSelectedPainPoint(null);
    setSelectedFeature(null);
  };

  const handleGenerateAd = async () => {
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
        language: i18n.language,
        model: selectedModel
      };

      // Prepare data based on mode
      if (mode === 'segment') {
        payload.data = { segment_data: selectedSegment };
      } else if (mode === 'painpoint') {
        payload.data = { painpoint_data: selectedPainPoint };
      } else if (mode === 'feature') {
        payload.data = { feature_data: selectedFeature };
      }

      // Determine API endpoint based on context
      const apiEndpoint = analysisResult ? 
        `/api/product-aff/${product.id}/generate-ads` : 
        `/api/product-optimize/generate-ads/${product.id}`;
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // Only add auth header for product-aff API
      if (analysisResult) {
        headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
      }
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to generate ad');
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
      console.error('Error generating ad:', error);
      alert('Failed to generate ad. Please try again.');
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
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <Typography.H2 className="text-xl font-bold text-gray-900 mb-1">
                {t('productAnalysisAff.adsGenerator.title')}
              </Typography.H2>
              <p className="text-sm text-gray-600 font-medium">{t('productAnalysisAff.adsGenerator.readyDescription')}</p>
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
                <Typography.H3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  {t('productAnalysisAff.adsGenerator.selectPlatform')}
                </Typography.H3>
                <select
                  value={platform || ''}
                  onChange={(e) => setPlatform(e.target.value as any)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 text-sm"
                >
                  <option value="facebook">{t('productAnalysisAff.adsGenerator.platformOptions.facebook')}</option>
                  <option value="instagram">{t('productAnalysisAff.adsGenerator.platformOptions.instagram')}</option>
                  <option value="tiktok">{t('productAnalysisAff.adsGenerator.platformOptions.tiktok')}</option>
                </select>
              </div>

              {/* Mode Selection */}
              <div>
                <Typography.H3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  {t('productAnalysisAff.adsGenerator.selectMode')}
                </Typography.H3>
                <select
                  value={mode || ''}
                  onChange={(e) => handleModeChange(e.target.value as any)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 transition-all duration-200 text-sm"
                >
                  <option value="segment">{t('productAnalysisAff.adsGenerator.modeOptions.segment')}</option>
                  <option value="painpoint">{t('productAnalysisAff.adsGenerator.modeOptions.painpoint')}</option>
                  <option value="feature">{t('productAnalysisAff.adsGenerator.modeOptions.feature')}</option>
                </select>
              </div>

              {/* Data Selection based on Mode */}
              {mode === 'segment' && analysisResult?.target_customers && (
                <div>
                  <Typography.H3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                    {t('productAnalysisAff.adsGenerator.selectSegment')}
                  </Typography.H3>
                  <div className="space-y-2">
                    {analysisResult.target_customers.map((customer: any, index: number) => (
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
                          <div className="font-medium text-gray-900 text-sm">{customer.name}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {customer.common_painpoints?.slice(0, 2).join(', ')}...
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {mode === 'painpoint' && analysisResult?.target_customers && (
                <div>
                  <Typography.H3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    {t('productAnalysisAff.adsGenerator.selectPainPoint')}
                  </Typography.H3>
                  <div className="space-y-2">
                    {(() => {
                      // Debug: Log the data structure
                      console.log('Target customers:', analysisResult.target_customers);
                      
                      const painpoints = analysisResult.target_customers.flatMap((customer: any, customerIndex: number) => {
                        console.log(`Customer ${customerIndex}:`, customer);
                        console.log('Common painpoints:', customer.common_painpoints);
                        
                        // Handle different possible data structures
                        let painpointsList = [];
                        
                        if (customer.common_painpoints && Array.isArray(customer.common_painpoints)) {
                          painpointsList = customer.common_painpoints;
                        } else if (customer.painpoints && Array.isArray(customer.painpoints)) {
                          painpointsList = customer.painpoints;
                        } else if (customer.pain_points && Array.isArray(customer.pain_points)) {
                          painpointsList = customer.pain_points;
                        }
                        
                        return painpointsList.map((painpoint: string, painpointIndex: number) => ({
                          painpoint,
                          customer: customer.name || customer.segment_name || `Customer ${customerIndex + 1}`,
                          customerIndex,
                          painpointIndex
                        }));
                      });
                      
                      console.log('Final painpoints:', painpoints);
                      
                      if (painpoints.length === 0) {
                        return (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              Không tìm thấy pain points trong customer segments. 
                              Vui lòng kiểm tra lại dữ liệu phân tích.
                            </p>
                          </div>
                        );
                      }
                      
                      return painpoints.map((item: any, index: number) => {
                        // Create a unique identifier for comparison
                        const itemId = `${item.customerIndex}-${item.painpointIndex}`;
                        const isSelected = selectedPainPoint && 
                          selectedPainPoint.customerIndex === item.customerIndex && 
                          selectedPainPoint.painpointIndex === item.painpointIndex;
                        
                        return (
                          <label
                            key={itemId}
                            className={`flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? 'border-red-500 bg-red-50 shadow-sm' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name="painpoint"
                              value={index}
                              checked={isSelected}
                              onChange={() => setSelectedPainPoint(item)}
                              className="w-4 h-4 text-red-600"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">{item.painpoint}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                Từ nhóm: {item.customer}
                              </div>
                            </div>
                          </label>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {mode === 'feature' && analysisResult?.product_problems?.resolved && (
                <div>
                  <Typography.H3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    {t('productAnalysisAff.adsGenerator.selectFeature')}
                  </Typography.H3>
                  <div className="space-y-2">
                    {analysisResult.product_problems.resolved.map((feature: any, index: number) => (
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
                          <div className="font-medium text-gray-900 text-sm">{feature.problem}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {feature.satisfaction_percent}% hài lòng
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Number of Versions Selection */}
              <div>
                <Typography.H3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  {t('productAnalysisAff.adsGenerator.numberOfVersions')}
                </Typography.H3>
                <select
                  value={numVersions}
                  onChange={(e) => setNumVersions(Number(e.target.value))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-all duration-200 text-sm"
                >
                  <option value={1}>{t('productAnalysisAff.adsGenerator.version1')}</option>
                  <option value={2}>{t('productAnalysisAff.adsGenerator.version2')}</option>
                  <option value={3}>{t('productAnalysisAff.adsGenerator.version3')}</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  {t('productAnalysisAff.adsGenerator.versionDescription')}
                </p>
              </div>

              {/* Model Selection */}
              <div>
                <Typography.H3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                  Chọn AI Model
                </Typography.H3>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all duration-200 text-sm"
                >
                  <option value="openai/gpt-4o-mini">GPT-4o Mini (Nhanh, ổn định)</option>
                  <option value="google/gemini-2.5-flash-preview-09-2025">Gemini 2.5 Flash (Thử nghiệm)</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Gemini 2.5 Flash đang trong giai đoạn thử nghiệm, có thể cho kết quả khác biệt
                </p>
              </div>

              {/* Format Selection */}
              <div>
                <Typography.H3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  {t('productAnalysisAff.adsGenerator.selectFormat')}
                </Typography.H3>
                <select
                  value={format || ''}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 transition-all duration-200 text-sm"
                >
                  <option value="PAS">{t('productAnalysisAff.adsGenerator.formatOptions.PAS')}</option>
                  <option value="BAB">{t('productAnalysisAff.adsGenerator.formatOptions.BAB')}</option>
                  <option value="testimonial">{t('productAnalysisAff.adsGenerator.formatOptions.testimonial')}</option>
                  <option value="feature">{t('productAnalysisAff.adsGenerator.formatOptions.feature')}</option>
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
                      {t('productAnalysisAff.adsGenerator.results')}
                    </Typography.H3>
                    <p className="text-gray-600">{t('productAnalysisAff.adsGenerator.readyDescription')}</p>
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

                  {/* Raw Content for Copy */}
                  <div className="space-y-4">
                    <Typography.H4 className="text-gray-600">Raw Content (for copying)</Typography.H4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Ad Headline */}
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Typography.H5 className="text-sm font-medium text-gray-700">Ad Headline</Typography.H5>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(adResult?.ad_headline || '', 'headline')}
                          >
                            {copiedField === 'headline' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <Typography.Body className="text-sm">{adResult?.ad_headline}</Typography.Body>
                      </Card>

                      {/* CTA */}
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Typography.H5 className="text-sm font-medium text-gray-700">CTA</Typography.H5>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(adResult?.cta || '', 'cta')}
                          >
                            {copiedField === 'cta' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <Typography.Body className="text-sm">{adResult?.cta}</Typography.Body>
                      </Card>

                      {/* Ad Copy */}
                      <Card className="p-4 md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <Typography.H5 className="text-sm font-medium text-gray-700">Ad Copy</Typography.H5>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(adResult?.ad_copy || '', 'copy')}
                          >
                            {copiedField === 'copy' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <Typography.Body className="text-sm whitespace-pre-wrap">{adResult?.ad_copy}</Typography.Body>
                      </Card>

                      {/* Visual Idea */}
                      {adResult?.ad_visual_idea && (
                        <Card className="p-4 md:col-span-2">
                          <div className="flex items-center justify-between mb-2">
                            <Typography.H5 className="text-sm font-medium text-gray-700">Visual Idea / Script</Typography.H5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(adResult.ad_visual_idea, 'visual')}
                            >
                              {copiedField === 'visual' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                          <Typography.Body className="text-sm whitespace-pre-wrap">{adResult.ad_visual_idea}</Typography.Body>
                        </Card>
                      )}

                      {/* Expected Performance */}
                      {adResult?.expected_performance && (
                        <Card className="p-4 md:col-span-2 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <Typography.H5 className="text-sm font-medium text-green-700 flex items-center">
                              <Star className="w-4 h-4 mr-2" />
                              Expected Performance
                            </Typography.H5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(adResult.expected_performance || '', 'performance')}
                            >
                              {copiedField === 'performance' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                          <Typography.Body className="text-sm text-green-800 whitespace-pre-wrap">{adResult.expected_performance}</Typography.Body>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="p-6 bg-gray-100 rounded-full mb-6">
                    <Sparkles className="w-12 h-12 text-gray-400" />
                  </div>
                  <Typography.H3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('productAnalysisAff.adsGenerator.readyToGenerate')}
                  </Typography.H3>
                  <p className="text-gray-600 max-w-md">
                    {t('productAnalysisAff.adsGenerator.readyDescription')}
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
                <span className="text-green-600 font-medium">{t('productAnalysisAff.adsGenerator.allSettingsComplete')}</span>
              ) : (
                <span>{t('productAnalysisAff.adsGenerator.pleaseCompleteSettings')}</span>
              )}
            </div>
            <Button
              onClick={handleGenerateAd}
              disabled={!isGenerateEnabled() || isGenerating}
              className="px-8 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('productAnalysisAff.adsGenerator.generating')}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('productAnalysisAff.adsGenerator.generateAd')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAdsGeneratorModal;