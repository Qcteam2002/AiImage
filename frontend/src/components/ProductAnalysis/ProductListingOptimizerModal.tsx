import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Lightbulb, Sparkles, Copy, Check } from 'lucide-react';
import { productAffService } from '../../services/productAffService';

interface OptimizedContent {
  new_title: string;
  new_description: string;
}

interface ProductListingOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: any;
  product?: any;
  originalTitle?: string;
  originalDescription?: string;
  targetMarket?: string;
}

const ProductListingOptimizerModal: React.FC<ProductListingOptimizerModalProps> = ({
  isOpen,
  onClose,
  analysisResult,
  product,
  originalTitle = '',
  originalDescription = '',
  targetMarket = ''
}) => {
  const { t } = useTranslation();
  const [method, setMethod] = useState<'keyword' | 'segmentation' | 'feature' | null>(null);
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [optimizedContent, setOptimizedContent] = useState<OptimizedContent | null>(null);
  const [viewMode, setViewMode] = useState<'text' | 'html'>('text');
  const [tone, setTone] = useState<string>('Expert');
  const [customTone, setCustomTone] = useState<string>('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMethod(null);
      setSelectedSegmentIndex(null);
      setSelectedKeywords([]);
      setSelectedFeatures([]);
      setOptimizedContent(null);
      setTone('Expert');
      setCustomTone('');
    }
  }, [isOpen]);

  // Get target customers from analysis result
  const targetCustomers = Array.isArray(analysisResult?.target_customers) 
    ? analysisResult.target_customers 
    : [];

  // Get keywords from analysis result
  const getKeywords = () => {
    // Try to get keywords from market_and_keywords.keywords
    const keywordsData = analysisResult?.market_and_keywords?.keywords;
    
    console.log('🔍 [ProductListingOptimizer] Raw keywords data:', keywordsData);
    
    if (!keywordsData || typeof keywordsData !== 'object') {
      console.log('🔍 [ProductListingOptimizer] No keywords data found, using fallback');
      return [
        { keyword: 'comfortable bedding', volume: 12000, cpc: 1.25, competition: 'medium' },
        { keyword: 'luxury comforter', volume: 8500, cpc: 2.10, competition: 'high' },
        { keyword: 'hypoallergenic blanket', volume: 3200, cpc: 1.80, competition: 'low' },
        { keyword: 'machine washable comforter', volume: 2100, cpc: 1.45, competition: 'low' },
        { keyword: 'down alternative bedding', volume: 1800, cpc: 1.90, competition: 'medium' }
      ];
    }
    
    // Combine all keyword categories into one array
    const allKeywords = [
      ...(keywordsData.informational || []),
      ...(keywordsData.transactional || []),
      ...(keywordsData.comparative || []),
      ...(keywordsData.painpoint_related || [])
    ];
    
    console.log('🔍 [ProductListingOptimizer] All keywords from categories:', allKeywords);
    
    const processed = allKeywords
      .map((item: any, index: number) => {
        // Determine category based on which array the item came from
        let category = 'other';
        if (keywordsData.informational?.includes(item)) category = 'informational';
        else if (keywordsData.transactional?.includes(item)) category = 'transactional';
        else if (keywordsData.comparative?.includes(item)) category = 'comparative';
        else if (keywordsData.painpoint_related?.includes(item)) category = 'painpoint_related';
        
        return {
          keyword: item.keyword || item.term || item,
          volume: item.volume || item.search_volume || 0,
          cpc: item.cpc || item.cost_per_click || 0,
          competition: item.competition || item.competition_level || 'low',
          category: category
        };
      })
      .filter((item: any) => item.keyword && item.keyword.trim())
      .sort((a: any, b: any) => b.volume - a.volume);
    
    console.log('🔍 [ProductListingOptimizer] Processed keywords:', processed);
    return processed;
  };

  const keywords = getKeywords();
  
  // Debug log
  console.log('🔍 [ProductListingOptimizer] Analysis result:', analysisResult);
  console.log('🔍 [ProductListingOptimizer] Keywords data:', analysisResult?.market_and_keywords?.keywords);
  console.log('🔍 [ProductListingOptimizer] Keywords processed:', keywords);
  
  // Get product features from analysis result
  const getProductFeatures = () => {
    const productProblems = analysisResult?.product_problems;
    if (!productProblems) return { resolved: [], unresolved: [] };
    
    const resolvedFeatures = productProblems.resolved || [];
    const unresolvedProblems = productProblems.unresolved || [];
    
    return {
      resolved: resolvedFeatures.map((item: any) => ({
        id: `resolved_${item.problem}`,
        type: 'resolved',
        problem: item.problem,
        satisfaction_percent: item.satisfaction_percent,
        reason: item.reason
      })),
      unresolved: unresolvedProblems.map((item: any) => ({
        id: `unresolved_${item.problem}`,
        type: 'unresolved',
        problem: item.problem,
        unsatisfied_percent: item.unsatisfied_percent,
        example_feedback: item.example_feedback
      }))
    };
  };
  
  const productFeatures = getProductFeatures();
  
  // Tone options
  const toneOptions = [
    'Expert',
    'Daring', 
    'Playful',
    'Sophisticated',
    'Persuasive',
    'Supportive',
    'Custom'
  ];

  const getCurrentTone = () => {
    return tone === 'Custom' ? customTone : tone;
  };

  const handleMethodChange = (selectedMethod: 'keyword' | 'segmentation' | 'feature') => {
    setMethod(selectedMethod);
    setSelectedSegmentIndex(null);
    setSelectedKeywords([]);
    setSelectedFeatures([]);
    setOptimizedContent(null);
  };

  const handleSegmentChange = (index: number) => {
    setSelectedSegmentIndex(index);
    setOptimizedContent(null);
  };

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
    setOptimizedContent(null);
  };

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    );
    setOptimizedContent(null);
  };

  // Convert HTML to plain text
  const htmlToText = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  const isGenerateEnabled = () => {
    if (method === 'keyword') return selectedKeywords.length > 0;
    if (method === 'segmentation') return selectedSegmentIndex !== null;
    if (method === 'feature') return selectedFeatures.length > 0;
    return false;
  };

  const handleGenerate = async () => {
    if (!isGenerateEnabled()) return;

    setLoading(true);
    try {
      let payload;
      
      if (method === 'keyword') {
        payload = {
          type: method,
          data: {
            keywords: selectedKeywords,
            original_title: originalTitle,
            original_description: originalDescription,
            tone: getCurrentTone()
          }
        };
      } else if (method === 'segmentation') {
        payload = {
          type: method,
          data: {
            segment_data: targetCustomers[selectedSegmentIndex!] || {},
            tone: getCurrentTone()
          }
        };
      } else if (method === 'feature') {
        const selectedResolvedFeatures = productFeatures.resolved.filter((feature: any) => 
          selectedFeatures.includes(feature.id)
        );
        const selectedUnresolvedFeatures = productFeatures.unresolved.filter((feature: any) => 
          selectedFeatures.includes(feature.id)
        );
        
        payload = {
          type: method,
          data: {
            resolved_features: selectedResolvedFeatures,
            unresolved_problems: selectedUnresolvedFeatures,
            tone: getCurrentTone()
          }
        };
      }

      const result = await productAffService.optimizeProduct(
        analysisResult.id || product?.id || 'current',
        payload
      );

      setOptimizedContent(result);
    } catch (error) {
      console.error('Error generating optimized content:', error);
      // You can add a toast notification here
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('productAnalysisAff.optimizer.newTitle')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Method Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('productAnalysisAff.optimizer.chooseMethod')}
              </h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="method"
                    value="keyword"
                    checked={method === 'keyword'}
                    onChange={() => handleMethodChange('keyword')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium">{t('productAnalysisAff.optimizer.keywordMethod')}</span>
                  </div>
                  <span className="text-sm text-gray-500 ml-auto">
                    {keywords.length} {t('productAnalysisAff.optimizer.keywordsAvailable')}
                  </span>
                </label>

                <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="method"
                    value="segmentation"
                    checked={method === 'segmentation'}
                    onChange={() => handleMethodChange('segmentation')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">{t('productAnalysisAff.optimizer.segmentationMethod')}</span>
                  </div>
                  <span className="text-sm text-gray-500 ml-auto">
                    {targetCustomers.length} {t('productAnalysisAff.optimizer.segmentsAvailable')}
                  </span>
                </label>

                <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="method"
                    value="feature"
                    checked={method === 'feature'}
                    onChange={() => handleMethodChange('feature')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-green-500" />
                    <span className="font-medium">{t('productAnalysisAff.optimizer.featureMethod')}</span>
                  </div>
                  <span className="text-sm text-gray-500 ml-auto">
                    {productFeatures.resolved.length + productFeatures.unresolved.length} {t('productAnalysisAff.optimizer.featuresAvailable')}
                  </span>
                </label>
              </div>
            </div>

            {/* Keyword Selection (conditional) */}
            {method === 'keyword' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {t('productAnalysisAff.optimizer.selectKeywords')}
                  </h3>
                  <div className="text-sm text-gray-500">
                    {selectedKeywords.length} / {keywords.length} {t('productAnalysisAff.optimizer.selectedKeywords')}
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
                  {keywords.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No keywords available from analysis result</p>
                      <p className="text-xs mt-2">Check console for debug information</p>
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
                              {keywordData.keyword}
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
                          <div className="flex space-x-4 text-xs text-gray-500 mt-1">
                            <span>{t('productAnalysisAff.optimizer.volume')}: {keywordData.volume.toLocaleString()}</span>
                            <span>{t('productAnalysisAff.optimizer.cpc')}: ${keywordData.cpc}</span>
                            <span>{t('productAnalysisAff.optimizer.competition')}: {
                              keywordData.competition === 'low' ? t('productAnalysisAff.optimizer.low') :
                              keywordData.competition === 'medium' ? t('productAnalysisAff.optimizer.medium') :
                              t('productAnalysisAff.optimizer.high')
                            }</span>
                          </div>
                        </div>
                      </label>
                    ))}
                    </div>
                  )}
                </div>
                {selectedKeywords.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {t('productAnalysisAff.optimizer.selectedKeywords')}: {selectedKeywords.length}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Segment Selection (conditional) */}
            {method === 'segmentation' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('productAnalysisAff.optimizer.selectSegment')}
                </h3>
                <div className="space-y-2">
                  {targetCustomers.map((customer: any, index: number) => (
                    <label
                      key={index}
                      className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="segment"
                        value={index}
                        checked={selectedSegmentIndex === index}
                        onChange={() => handleSegmentChange(index)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {t('productAnalysisAff.optimizer.group')} {index + 1}: {customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.common_painpoints?.slice(0, 2).join(', ')}...
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Product Feature Selection (conditional) */}
            {method === 'feature' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {t('productAnalysisAff.optimizer.selectFeatures')}
                  </h3>
                  <div className="text-sm text-gray-500">
                    {selectedFeatures.length} / {productFeatures.resolved.length + productFeatures.unresolved.length} {t('productAnalysisAff.optimizer.selectedFeatures')}
                  </div>
                </div>
                
                {/* Resolved Features */}
                {productFeatures.resolved.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-green-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {t('productAnalysisAff.optimizer.resolvedFeatures')} ({productFeatures.resolved.length})
                    </h4>
                    <div className="space-y-2">
                      {productFeatures.resolved.map((feature: any) => (
                        <label
                          key={feature.id}
                          className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded cursor-pointer border border-gray-200"
                        >
                          <input
                            type="checkbox"
                            checked={selectedFeatures.includes(feature.id)}
                            onChange={() => handleFeatureToggle(feature.id)}
                            className="w-4 h-4 text-blue-600 rounded mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900">
                              {feature.problem}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {feature.reason}
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              {t('productAnalysisAff.optimizer.satisfaction')}: {feature.satisfaction_percent}%
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Unresolved Problems */}
                {productFeatures.unresolved.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-orange-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      {t('productAnalysisAff.optimizer.unresolvedProblems')} ({productFeatures.unresolved.length})
                    </h4>
                    <div className="space-y-2">
                      {productFeatures.unresolved.map((feature: any) => (
                        <label
                          key={feature.id}
                          className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded cursor-pointer border border-gray-200"
                        >
                          <input
                            type="checkbox"
                            checked={selectedFeatures.includes(feature.id)}
                            onChange={() => handleFeatureToggle(feature.id)}
                            className="w-4 h-4 text-blue-600 rounded mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900">
                              {feature.problem}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {feature.example_feedback}
                            </div>
                            <div className="text-xs text-orange-600 mt-1">
                              {t('productAnalysisAff.optimizer.unsatisfied')}: {feature.unsatisfied_percent}%
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Results Display */}
            {optimizedContent && (
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
                            [&_blockquote]:border-l-4 [&_blockquote]:border-blue-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600
                            [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono"
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
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('productAnalysisAff.optimizer.toneSelection')}
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {toneOptions.map(option => (
                    <option key={option} value={option}>
                      {option === 'Custom' ? t('productAnalysisAff.optimizer.customTone') : option}
                    </option>
                  ))}
                </select>
              </div>
              
              {tone === 'Custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('productAnalysisAff.optimizer.customToneInput')}
                  </label>
                  <input
                    type="text"
                    value={customTone}
                    onChange={(e) => setCustomTone(e.target.value)}
                    placeholder={t('productAnalysisAff.optimizer.customTonePlaceholder')}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Close
              </button>
              <button
                onClick={handleGenerate}
                disabled={!isGenerateEnabled() || loading || (tone === 'Custom' && !customTone.trim())}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('productAnalysisAff.optimizer.generating') : t('productAnalysisAff.optimizer.generateContent')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListingOptimizerModal;
