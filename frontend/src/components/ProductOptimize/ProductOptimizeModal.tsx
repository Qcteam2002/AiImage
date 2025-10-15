import React, { useState, useEffect } from 'react';
import { X, Lightbulb, Copy, Sparkles, Target, Zap, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Typography } from '../design-system/Typography';

interface ProductOptimizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

interface OptimizedContent {
  new_title: string;
  new_description: string;
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

const ProductOptimizeModal: React.FC<ProductOptimizeModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const [method, setMethod] = useState<string>('');
  const [inputMode, setInputMode] = useState<'manual' | 'suggest'>('manual');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<any>(null);
  const [selectedPainpoint, setSelectedPainpoint] = useState<string>('');
  const [optimizedContent, setOptimizedContent] = useState<OptimizedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestData, setSuggestData] = useState<SuggestData | null>(null);
  const [viewMode, setViewMode] = useState<'text' | 'html'>('text');
  const [tone, setTone] = useState<string>('Expert');
  const [customTone, setCustomTone] = useState<string>('');

  // Manual input states
  const [manualKeywords, setManualKeywords] = useState<string>('');
  const [manualSegment, setManualSegment] = useState<string>('');
  const [manualPainpoint, setManualPainpoint] = useState<string>('');

  const toneOptions = ['Expert', 'Daring', 'Playful', 'Sophisticated', 'Persuasive', 'Supportive', 'Custom'];

  useEffect(() => {
    if (isOpen) {
      setMethod('');
      setInputMode('manual');
      setSelectedKeywords([]);
      setSelectedSegment(null);
      setSelectedPainpoint('');
      setOptimizedContent(null);
      setSuggestData(null);
      setViewMode('text');
      setTone('Expert');
      setCustomTone('');
      setManualKeywords('');
      setManualSegment('');
      setManualPainpoint('');
      
      // Try to load cached suggest data
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
        console.log('Loaded cached suggest data:', data);
      } else if (response.status === 404) {
        console.log('No cached data found for this product');
      } else {
        throw new Error('Failed to load cached data');
      }
    } catch (error) {
      console.error('Error loading cached suggest data:', error);
      // Don't show error to user, just silently fail
    }
  };

  const handleMethodChange = (newMethod: string) => {
    setMethod(newMethod);
    setSelectedKeywords([]);
    setSelectedSegment(null);
    setSelectedPainpoint('');
    setOptimizedContent(null);
  };

  const handleSuggestData = async () => {
    if (!product) return;

    setSuggestLoading(true);
    try {
      const response = await fetch('/api/product-optimize/suggest-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_title: product.name,
          product_description: product.description,
          product_id: product.id, // Add product_id to save cache
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestData(data);
      } else {
        throw new Error('Failed to get suggest data');
      }
    } catch (error) {
      console.error('Error getting suggest data:', error);
      alert('Có lỗi xảy ra khi lấy dữ liệu gợi ý');
    } finally {
      setSuggestLoading(false);
    }
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
    setSelectedPainpoint(''); // Reset painpoint when segment changes
  };

  const handlePainpointSelect = (painpoint: string) => {
    setSelectedPainpoint(painpoint);
  };

  const isGenerateEnabled = () => {
    if (!method) return false;
    
    switch (method) {
      case 'keyword':
        return inputMode === 'manual' ? manualKeywords.trim() !== '' : selectedKeywords.length > 0;
      case 'segmentation':
        return inputMode === 'manual' ? manualSegment.trim() !== '' : selectedSegment !== null;
      case 'painpoint':
        return inputMode === 'manual' ? manualPainpoint.trim() !== '' : selectedPainpoint !== '';
      default:
        return false;
    }
  };

  const handleGenerate = async () => {
    if (!isGenerateEnabled() || !product) return;

    setLoading(true);
    try {
      const payload: any = {
        type: method,
        product_id: product.id,
        data: {
          product_title: product.name,
          product_description: product.description,
          tone: tone === 'Custom' ? customTone : tone
        }
      };

      switch (method) {
        case 'keyword':
          if (inputMode === 'manual') {
            payload.data.keywords = manualKeywords.split(',').map(k => k.trim()).filter(k => k);
          } else {
            payload.data.keywords = selectedKeywords;
          }
          break;
        case 'segmentation':
          if (inputMode === 'manual') {
            payload.data.segment_data = {
              name: manualSegment,
              description: manualSegment
            };
          } else {
            payload.data.segment_data = selectedSegment;
          }
          break;
        case 'painpoint':
          if (inputMode === 'manual') {
            payload.data.painpoint_data = {
              painpoint: manualPainpoint,
              customer: 'Manual Input'
            };
          } else {
            // Find which customer segment this painpoint belongs to
            let customerName = 'Unknown';
            for (const customer of suggestData?.target_customers || []) {
              if (customer.common_painpoints?.includes(selectedPainpoint)) {
                customerName = customer.name;
                break;
              }
            }
            payload.data.painpoint_data = {
              painpoint: selectedPainpoint,
              customer: customerName
            };
          }
          break;
      }

      const response = await fetch('/api/product-optimize/optimize', {
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
      setOptimizedContent(result);
    } catch (error) {
      console.error('Error generating optimized content:', error);
      alert('Có lỗi xảy ra khi tạo nội dung tối ưu');
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
              <Typography.H2 className="text-xl font-bold text-gray-900 mb-1">Product Content Optimizer</Typography.H2>
              <Typography.BodySmall className="text-gray-600 font-medium">
                Tối ưu hóa tiêu đề và mô tả sản phẩm: {product?.name}
              </Typography.BodySmall>
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
                <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Chọn phương pháp tối ưu
                </Typography.H4>
                <select
                  value={method || ''}
                  onChange={(e) => handleMethodChange(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 text-sm"
                >
                  <option value="">Chọn phương pháp...</option>
                  <option value="keyword">Dựa trên Keywords</option>
                  <option value="segmentation">Dựa trên Phân khúc khách hàng</option>
                  <option value="painpoint">Dựa trên Nỗi đau (Pain Points)</option>
                </select>
              </div>

              {/* Input Mode Selection */}
              {method && (
                <div>
                  <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Chế độ nhập liệu
                  </Typography.H4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setInputMode('manual')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        inputMode === 'manual'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Typography.Body className="text-center text-sm">Nhập thủ công</Typography.Body>
                    </button>
                    <button
                      onClick={() => setInputMode('suggest')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        inputMode === 'suggest'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Typography.Body className="text-center text-sm">AI Gợi ý</Typography.Body>
                    </button>
                  </div>
                </div>
              )}

              {/* Suggest Button */}
              {method && inputMode === 'suggest' && (
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
              {method && inputMode === 'manual' && (
                <div>
                  {method === 'keyword' && (
                    <div>
                      <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Nhập Keywords
                      </Typography.H4>
                      <textarea
                        value={manualKeywords}
                        onChange={(e) => setManualKeywords(e.target.value)}
                        placeholder="Nhập keywords, phân cách bằng dấu phẩy..."
                        rows={3}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 transition-all duration-200 text-sm"
                      />
                    </div>
                  )}

                  {method === 'segmentation' && (
                    <div>
                      <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                        Nhập thông tin phân khúc
                      </Typography.H4>
                      <textarea
                        value={manualSegment}
                        onChange={(e) => setManualSegment(e.target.value)}
                        placeholder="Mô tả phân khúc khách hàng mục tiêu..."
                        rows={3}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all duration-200 text-sm"
                      />
                    </div>
                  )}

                  {method === 'painpoint' && (
                    <div>
                      <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        Nhập Pain Point
                      </Typography.H4>
                      <textarea
                        value={manualPainpoint}
                        onChange={(e) => setManualPainpoint(e.target.value)}
                        placeholder="Mô tả nỗi đau của khách hàng..."
                        rows={3}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 transition-all duration-200 text-sm"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* AI Suggest Data Display */}
              {method && inputMode === 'suggest' && suggestData && (
                <div>
                  {method === 'keyword' && (
                    <div>
                      <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Chọn Keywords ({selectedKeywords.length} đã chọn)
                      </Typography.H4>
                      <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-2">
                        {Object.entries(suggestData.keywords).map(([category, keywords]) => (
                          <div key={category}>
                            <Typography.BodySmall className="font-semibold text-gray-700 mb-2">
                              {category === 'informational' ? 'Thông tin' :
                               category === 'transactional' ? 'Mua hàng' :
                               category === 'comparative' ? 'So sánh' :
                               'Pain Point'}
                            </Typography.BodySmall>
                            {keywords.map((keywordData, index) => (
                              <label
                                key={index}
                                className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedKeywords.includes(keywordData.keyword)}
                                  onChange={() => handleKeywordToggle(keywordData.keyword)}
                                  className="w-4 h-4 text-blue-600 rounded mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                  <Typography.BodySmall className="font-medium text-gray-900">
                                    {keywordData.keyword}
                                  </Typography.BodySmall>
                                  <Typography.Caption className="text-gray-500">
                                    Vol: {keywordData.volume.toLocaleString()} | CPC: ${keywordData.cpc} | Comp: {keywordData.competition}
                                  </Typography.Caption>
                                </div>
                              </label>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {method === 'segmentation' && (
                    <div>
                      <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                        Chọn phân khúc khách hàng
                      </Typography.H4>
                      <div className="space-y-2">
                        {suggestData.target_customers.map((customer, index) => (
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
                              <Typography.Body className="font-medium text-gray-900 text-sm">{customer.name}</Typography.Body>
                              <Typography.BodySmall className="text-gray-600 mt-1">
                                {customer.age_range} | {customer.locations.slice(0, 2).join(', ')}
                              </Typography.BodySmall>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {method === 'painpoint' && (
                    <div>
                      <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        Chọn Pain Point
                      </Typography.H4>
                      <div className="space-y-2">
                        {suggestData.target_customers.map((customer, customerIndex) => (
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
                                    onChange={() => handlePainpointSelect(painpoint)}
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
                </div>
              )}

              {/* Tone Selection */}
              <div>
                <Typography.H4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Chọn tone nội dung
                </Typography.H4>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-all duration-200 text-sm"
                >
                  {toneOptions.map(option => (
                    <option key={option} value={option}>
                      {option === 'Custom' ? 'Tùy chỉnh' : option}
                    </option>
                  ))}
                </select>
                
                {tone === 'Custom' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={customTone}
                      onChange={(e) => setCustomTone(e.target.value)}
                      placeholder="Nhập tone tùy chỉnh..."
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
                  <Typography.H3 className="text-lg font-medium text-gray-900">
                    Kết quả tối ưu hóa
                  </Typography.H3>

                  {/* Optimized Title */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tiêu đề tối ưu
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
                        Mô tả tối ưu
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
                          Text
                        </button>
                        <button
                          onClick={() => setViewMode('html')}
                          className={`px-3 py-1 text-xs rounded ${
                            viewMode === 'html' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          HTML
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
                            className="prose prose-sm max-w-none [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mb-2 [&_p]:text-gray-700 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:ml-4 [&_li]:text-gray-700 [&_li]:mb-1 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_em]:italic [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:shadow-sm [&_img]:mb-3"
                          />
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          const content = viewMode === 'text' 
                            ? htmlToText(optimizedContent.new_description)
                            : optimizedContent.new_description;
                          navigator.clipboard.writeText(content);
                        }}
                        className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 bg-white rounded shadow-sm border"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <Typography.H3 className="text-lg font-medium text-gray-900 mb-2">Chưa có kết quả</Typography.H3>
                    <Typography.Body className="text-gray-500">Chọn phương pháp và click "Generate Content" để tạo nội dung tối ưu</Typography.Body>
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
            <Button
              onClick={handleGenerate}
              disabled={!isGenerateEnabled() || loading || (tone === 'Custom' && !customTone.trim())}
              className="px-8 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Đang tạo nội dung...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2 inline-block" />
                  Generate Content
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductOptimizeModal;
