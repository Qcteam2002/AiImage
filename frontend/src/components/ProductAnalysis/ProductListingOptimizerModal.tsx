import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Lightbulb, Copy, Sparkles, Target, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ProductListingOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: any;
  product?: any;
  originalTitle?: string;
  originalDescription?: string;
  targetMarket?: string;
}

interface OptimizedContent {
  new_title: string;
  new_description: string;
}

const ProductListingOptimizerModal: React.FC<ProductListingOptimizerModalProps> = ({
  isOpen,
  onClose,
  analysisResult,
  product
}) => {
  const { t } = useTranslation();
  const [method, setMethod] = useState<string>('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<any>(null);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [optimizedContent, setOptimizedContent] = useState<OptimizedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'text' | 'html'>('text');
  const [tone, setTone] = useState<string>('Expert');
  const [customTone, setCustomTone] = useState<string>('');

  const toneOptions = ['Expert', 'Daring', 'Playful', 'Sophisticated', 'Persuasive', 'Supportive', 'Custom'];

  // Extract keywords from analysis result
  const keywords = React.useMemo(() => {
    console.log('🔍 [Product Optimizer] Analysis result:', analysisResult);
    console.log('🔍 [Product Optimizer] Market and keywords:', analysisResult?.market_and_keywords);
    
    if (!analysisResult?.market_and_keywords?.keywords) {
      console.log('❌ [Product Optimizer] No keywords found in analysis result');
      return [];
    }
    
    const allKeywords: any[] = [];
    const keywordData = analysisResult.market_and_keywords.keywords;
    console.log('🔍 [Product Optimizer] Keyword data:', keywordData);
    
    // Extract from all categories
    Object.keys(keywordData).forEach(category => {
      console.log(`🔍 [Product Optimizer] Processing category: ${category}`, keywordData[category]);
      if (Array.isArray(keywordData[category])) {
        keywordData[category].forEach((keyword: any) => {
          // Handle both string and object keywords
          const keywordText = typeof keyword === 'string' ? keyword : keyword.keyword || keyword.text || String(keyword);
          allKeywords.push({
            keyword: keywordText,
            category,
            volume: Math.floor(Math.random() * 10000) + 1000, // Mock data
            cpc: (Math.random() * 2 + 0.5).toFixed(2),
            competition: Math.floor(Math.random() * 100)
          });
        });
      }
    });
    
    console.log('✅ [Product Optimizer] Final keywords:', allKeywords);
    return allKeywords;
  }, [analysisResult]);

  // Extract target customers
  const targetCustomers = React.useMemo(() => {
    return analysisResult?.target_customers || [];
  }, [analysisResult]);

  // Extract product features
  const productFeatures = React.useMemo(() => {
    if (!analysisResult?.product_problems) return { resolved: [], unresolved: [] };
    
    return {
      resolved: analysisResult.product_problems.resolved || [],
      unresolved: analysisResult.product_problems.unresolved || []
    };
  }, [analysisResult]);

  useEffect(() => {
    if (isOpen) {
      setMethod('');
      setSelectedKeywords([]);
      setSelectedSegment(null);
      setSelectedFeature(null);
      setOptimizedContent(null);
      setViewMode('text');
      setTone('Expert');
      setCustomTone('');
    }
  }, [isOpen]);

  const handleMethodChange = (newMethod: string) => {
    setMethod(newMethod);
    setSelectedKeywords([]);
    setSelectedSegment(null);
    setSelectedFeature(null);
    setOptimizedContent(null);
  };

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const handleSegmentSelect = (segment: any) => {
    setSelectedSegment(segment);
  };

  const handleFeatureSelect = (feature: any) => {
    setSelectedFeature(feature);
  };

  const isGenerateEnabled = () => {
    if (!method) return false;
    
    switch (method) {
      case 'keyword':
        return selectedKeywords.length > 0;
      case 'segmentation':
        return selectedSegment !== null;
      case 'painpoint':
        return selectedSegment !== null;
      case 'feature':
        return selectedFeature !== null;
      default:
        return false;
    }
  };

  const handleGenerate = async () => {
    if (!isGenerateEnabled()) return;

    console.log('🚀 [Product Optimizer] Analysis result:', analysisResult);
    console.log('🚀 [Product Optimizer] Product:', product);
    console.log('🚀 [Product Optimizer] Product ID:', product?.id);
    
    const productId = product?.id;
    if (!productId) {
      console.error('❌ [Product Optimizer] No product ID found');
      alert('Không tìm thấy ID sản phẩm. Vui lòng thử lại.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        type: method,
        data: {}
      };

      switch (method) {
        case 'keyword':
          payload.data = {
            keywords: selectedKeywords,
            original_title: product?.title || '',
            original_description: product?.description || '',
            tone: tone === 'Custom' ? customTone : tone
          };
          break;
        case 'segmentation':
          payload.data = {
            segment_data: selectedSegment,
            tone: tone === 'Custom' ? customTone : tone
          };
          break;
        case 'painpoint':
          // Find the customer and painpoint info from selectedSegment
          let painpointData = null;
          if (selectedSegment) {
            targetCustomers.forEach((customer: any, customerIndex: number) => {
              customer.common_painpoints?.forEach((painpoint: string, painpointIndex: number) => {
                if (painpoint === selectedSegment) {
                  painpointData = {
                    painpoint: painpoint,
                    customer: customer.name
                  };
                }
              });
            });
          }
          
          payload.data = {
            painpoint_data: painpointData,
            tone: tone === 'Custom' ? customTone : tone
          };
          break;
        case 'feature':
          payload.data = {
            resolved_features: productFeatures.resolved,
            unresolved_problems: productFeatures.unresolved,
            tone: tone === 'Custom' ? customTone : tone
          };
          break;
      }

      console.log('🚀 [ProductListingOptimizer] Sending payload:', JSON.stringify(payload, null, 2));
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/product-aff/${productId}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to generate optimized content');
      }

      const result = await response.json();
      setOptimizedContent(result);
    } catch (error) {
      console.error('Error generating optimized content:', error);
    } finally {
      setLoading(false);
    }
  };

  const htmlToText = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lightbulb className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Product Listing Optimizer</h2>
              <p className="text-sm text-gray-600 font-medium">Tối ưu hóa tiêu đề và mô tả sản phẩm với AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg p-2 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Content - Two Columns */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column - Settings */}
          <div className="w-1/3 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Method Selection */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  {t('productAnalysisAff.optimizer.chooseMethod')}
                </h3>
                <select
                  value={method || ''}
                  onChange={(e) => handleMethodChange(e.target.value as any)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 text-sm"
                >
                  <option value="">Chọn phương pháp...</option>
                  <option value="keyword">{t('productAnalysisAff.optimizer.keywordMethod')} ({keywords.length} keywords)</option>
                  <option value="segmentation">{t('productAnalysisAff.optimizer.segmentationMethod')}</option>
                  <option value="painpoint">Dựa trên Nỗi đau (Pain Points)</option>
                  <option value="feature">{t('productAnalysisAff.optimizer.featureMethod')}</option>
                </select>
              </div>

              {/* Keyword Selection (conditional) */}
              {method === 'keyword' && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {t('productAnalysisAff.optimizer.selectKeywords')}
                  </h3>
                  <div className="text-sm text-gray-500 mb-3">
                    {selectedKeywords.length} / {keywords.length} {t('productAnalysisAff.optimizer.selectedKeywords')}
                  </div>
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
                    {keywords.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No keywords available from analysis result</p>
                        <p className="text-xs mt-2">Check console for debug information</p>
                        <p className="text-xs mt-1">Analysis result ID: {analysisResult?.id}</p>
                        <button
                          onClick={() => {
                            // Force refresh keywords
                            window.location.reload();
                          }}
                          className="mt-3 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Refresh Data
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {keywords.map((keywordData, index) => (
                          <label
                            key={index}
                            className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded cursor-pointer border border-gray-200"
                          >
                            <input
                              type="checkbox"
                              checked={selectedKeywords.includes(keywordData.keyword)}
                              onChange={() => handleKeywordToggle(keywordData.keyword)}
                              className="w-4 h-4 text-blue-600 rounded mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">
                                  {String(keywordData.keyword || '')}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  keywordData.category === 'informational' ? 'bg-blue-100 text-blue-700' :
                                  keywordData.category === 'transactional' ? 'bg-green-100 text-green-700' :
                                  keywordData.category === 'comparative' ? 'bg-purple-100 text-purple-700' :
                                  keywordData.category === 'painpoint_related' ? 'bg-orange-100 text-orange-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {keywordData.category === 'informational' ? 'Info' :
                                   keywordData.category === 'transactional' ? 'Buy' :
                                   keywordData.category === 'comparative' ? 'Compare' :
                                   keywordData.category === 'painpoint_related' ? 'Pain' : 'Other'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                <span>Volume: {typeof keywordData.volume === 'number' ? keywordData.volume.toLocaleString() : String(keywordData.volume || 0)}</span>
                                <span>CPC: ${String(keywordData.cpc || '0.00')}</span>
                                <span>Competition: {String(keywordData.competition || 0)}%</span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Segment Selection (conditional) */}
              {method === 'segmentation' && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                    {t('productAnalysisAff.optimizer.selectSegment')}
                  </h3>
                  <div className="space-y-2">
                    {targetCustomers.map((customer: any, index: number) => (
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
                          onChange={() => handleSegmentSelect(customer)}
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

              {/* Painpoint Selection (conditional) */}
              {method === 'painpoint' && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Chọn Nỗi đau (Pain Points)
                  </h3>
                  <div className="space-y-2">
                    {targetCustomers.map((customer: any, customerIndex: number) => (
                      customer.common_painpoints?.map((painpoint: string, painpointIndex: number) => (
                        <label
                          key={`${customerIndex}-${painpointIndex}`}
                          className={`flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedSegment === painpoint 
                              ? 'border-red-500 bg-red-50 shadow-sm' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="painpoint"
                            value={`${customerIndex}-${painpointIndex}`}
                            checked={selectedSegment === painpoint}
                            onChange={() => handleSegmentSelect(painpoint)}
                            className="w-4 h-4 text-red-600"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">{painpoint}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              Từ phân khúc: {customer.name}
                            </div>
                          </div>
                        </label>
                      ))
                    ))}
                  </div>
                </div>
              )}

              {/* Feature Selection (conditional) */}
              {method === 'feature' && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                    {t('productAnalysisAff.optimizer.selectFeature')}
                  </h3>
                  <div className="space-y-2">
                    {productFeatures.resolved.map((feature: any, index: number) => (
                      <label
                        key={index}
                        className={`flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedFeature === feature 
                            ? 'border-orange-500 bg-orange-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="feature"
                          value={index}
                          checked={selectedFeature === feature}
                          onChange={() => handleFeatureSelect(feature)}
                          className="w-4 h-4 text-orange-600"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">{feature.feature}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {t('productAnalysisAff.optimizer.satisfied')}: {feature.satisfied_percent}%
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Tone Selection */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  {t('productAnalysisAff.optimizer.toneSelection')}
                </h3>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-all duration-200 text-sm"
                >
                  {toneOptions.map(option => (
                    <option key={option} value={option}>
                      {option === 'Custom' ? t('productAnalysisAff.optimizer.customTone') : option}
                    </option>
                  ))}
                </select>
                
                {tone === 'Custom' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={customTone}
                      onChange={(e) => setCustomTone(e.target.value)}
                      placeholder={t('productAnalysisAff.optimizer.customTonePlaceholder')}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-all duration-200 text-sm"
                    />
                  </div>
                )}
              </div>

          </div>
        </div>

          {/* Right Column - Results */}
          <div className="w-2/3 bg-white overflow-y-auto">
            <div className="p-6">
              {optimizedContent ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {t('productAnalysisAff.optimizer.results')}
                  </h3>

                  {/* Optimized Title */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('productAnalysisAff.optimizer.optimizedTitle')}
                    </label>
                    <div className="relative">
                      <textarea
                        value={optimizedContent.new_title}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(optimizedContent.new_title);
                          // You can add a toast notification here
                        }}
                        className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 bg-white rounded shadow-sm border"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Optimized Description */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        {t('productAnalysisAff.optimizer.optimizedDescription')}
                      </label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setViewMode('text')}
                          className={`px-3 py-1 text-xs rounded ${
                            viewMode === 'text' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {t('productAnalysisAff.optimizer.textView')}
                        </button>
                        <button
                          onClick={() => setViewMode('html')}
                          className={`px-3 py-1 text-xs rounded ${
                            viewMode === 'html' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {t('productAnalysisAff.optimizer.htmlView')}
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative">
                      {viewMode === 'text' ? (
                        <textarea
                          value={htmlToText(optimizedContent.new_description)}
                          readOnly
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={6}
                        />
                      ) : (
                        <div className="w-full p-4 border border-gray-300 rounded-lg bg-white min-h-[200px] overflow-auto">
                          <div 
                            dangerouslySetInnerHTML={{ __html: optimizedContent.new_description }}
                            className="prose prose-sm max-w-none
                              [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-3 [&_h2]:mt-4 [&_h2]:border-b [&_h2]:border-gray-200 [&_h2]:pb-2
                              [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mb-2 [&_h3]:mt-3
                              [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-gray-700 [&_h4]:mb-2 [&_h4]:mt-2
                              [&_p]:text-sm [&_p]:text-gray-700 [&_p]:mb-3 [&_p]:leading-relaxed
                              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ul]:space-y-1
                              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_ol]:space-y-1
                              [&_li]:text-sm [&_li]:text-gray-700 [&_li]:leading-relaxed
                              [&_strong]:font-semibold [&_strong]:text-gray-900
                              [&_em]:italic [&_em]:text-gray-600
                              [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4 [&_table]:text-sm [&_table]:shadow-sm [&_table]:rounded-lg [&_table]:overflow-hidden
                              [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-gray-700
                              [&_td]:border [&_td]:border-gray-300 [&_td]:px-3 [&_td]:py-2 [&_td]:text-gray-700
                              [&_div]:mb-2
                              [&_span]:text-sm
                            "
                          />
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          const content = viewMode === 'text' 
                            ? htmlToText(optimizedContent.new_description)
                            : optimizedContent.new_description;
                          navigator.clipboard.writeText(content);
                          // You can add a toast notification here
                        }}
                        className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 bg-white rounded shadow-sm border"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-500">
                      {viewMode === 'text' 
                        ? t('productAnalysisAff.optimizer.textDescription')
                        : t('productAnalysisAff.optimizer.htmlDescription')
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có kết quả</h3>
                    <p className="text-gray-500">Chọn phương pháp và click "Generate Content" để tạo nội dung tối ưu</p>
                  </div>
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
                <span>Vui lòng hoàn thành các cài đặt</span>
              )}
            </div>
            <button
              onClick={handleGenerate}
              disabled={!isGenerateEnabled() || loading || (tone === 'Custom' && !customTone.trim())}
              className="px-8 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  {t('productAnalysisAff.optimizer.generating')}
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2 inline-block" />
                  {t('productAnalysisAff.optimizer.generateContent')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListingOptimizerModal;