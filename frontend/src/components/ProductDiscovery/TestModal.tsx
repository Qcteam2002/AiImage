import React, { useState } from 'react';
import { X, TestTube, MapPin, Calendar, Package, TrendingUp, Users, Target, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Typography } from '../design-system/Typography';
import { Card } from '../ui/Card';

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TestModal: React.FC<TestModalProps> = ({ isOpen, onClose }) => {
  const [businessModel, setBusinessModel] = useState('');
  const [country, setCountry] = useState('');
  const [productCount, setProductCount] = useState(5);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const businessModels = [
    { value: 'dropshipping', label: 'Dropshipping' },
    { value: 'affiliate', label: 'Affiliate' },
    { value: 'print_design', label: 'Hình in design (lấy ý tưởng hình in cho áo)' },
    { value: 'pod', label: 'POD' },
    { value: 'freelance', label: 'Kinh doanh tự do' }
  ];

  const countries = [
    { value: 'US', label: 'United States', flag: '🇺🇸' },
    { value: 'VN', label: 'Vietnam', flag: '🇻🇳' },
    { value: 'UK', label: 'United Kingdom', flag: '🇬🇧' },
    { value: 'CA', label: 'Canada', flag: '🇨🇦' },
    { value: 'AU', label: 'Australia', flag: '🇦🇺' },
    { value: 'DE', label: 'Germany', flag: '🇩🇪' },
    { value: 'FR', label: 'France', flag: '🇫🇷' },
    { value: 'JP', label: 'Japan', flag: '🇯🇵' },
    { value: 'KR', label: 'South Korea', flag: '🇰🇷' },
    { value: 'SG', label: 'Singapore', flag: '🇸🇬' },
    { value: 'TH', label: 'Thailand', flag: '🇹🇭' },
    { value: 'MY', label: 'Malaysia', flag: '🇲🇾' },
    { value: 'ID', label: 'Indonesia', flag: '🇮🇩' },
    { value: 'PH', label: 'Philippines', flag: '🇵🇭' },
    { value: 'IN', label: 'India', flag: '🇮🇳' }
  ];

  const handleSubmit = async () => {
    if (!businessModel || !country || !startDate || !endDate) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/product-discovery/suggest-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_model: businessModel,
          country: country,
          product_count: productCount,
          start_date: startDate,
          end_date: endDate,
          submit_date: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get suggestions');
      }

      const data = await response.json();
      console.log('Test suggestions:', data);
      setResults(data);
      setShowResults(true);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra khi gửi request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestMore = async () => {
    if (!results?.test_info) return;

    setIsLoadingMore(true);
    try {
      const response = await fetch('/api/product-discovery/suggest-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_model: results.test_info.business_model,
          country: results.test_info.country,
          product_count: 5, // Always suggest 5 new ideas
          start_date: results.test_info.start_date,
          end_date: results.test_info.end_date,
          submit_date: new Date().toISOString(),
          existing_ideas: results.opportunities.map((p: any) => p.product_name) // Send existing ideas to avoid duplicates
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get more suggestions');
      }

      const data = await response.json();
      console.log('More suggestions:', data);
      
      // Merge new opportunities with existing ones
      const updatedResults = {
        ...results,
        opportunities: [...results.opportunities, ...data.opportunities]
      };
      
      setResults(updatedResults);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra khi lấy thêm ý tưởng');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleReset = () => {
    setBusinessModel('');
    setCountry('');
    setProductCount(5);
    setStartDate('');
    setEndDate('');
    setResults(null);
    setShowResults(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <TestTube className="w-5 h-5 text-white" />
            </div>
            <div>
              <Typography.H2 className="text-xl font-semibold text-gray-900">
                Test Product Discovery
              </Typography.H2>
              <Typography.Body className="text-sm text-gray-600">
                Thử nghiệm tính năng gợi ý sản phẩm
              </Typography.Body>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!showResults ? (
            <>
              {/* Business Model Selection */}
              <div>
                <Typography.H3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
                  1. Chọn mô hình kinh doanh
                </Typography.H3>
                <div className="grid grid-cols-1 gap-3">
                  {businessModels.map((model) => (
                    <label
                      key={model.value}
                      className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        businessModel === model.value
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="businessModel"
                        value={model.value}
                        checked={businessModel === model.value}
                        onChange={(e) => setBusinessModel(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <Typography.Body className="font-medium text-gray-900">
                          {model.label}
                        </Typography.Body>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Country Selection */}
              <div>
                <Typography.H3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  2. Chọn khu vực
                </Typography.H3>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn quốc gia...</option>
                  {countries.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.flag} {country.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Count */}
              <div>
                <Typography.H3 className="text-lg font-semibold text-gray-900 mb-3">
                  3. Số lượng sản phẩm gợi ý
                </Typography.H3>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={productCount}
                  onChange={(e) => setProductCount(parseInt(e.target.value) || 5)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Typography.Body className="text-sm text-gray-600 mt-1">
                  Số lượng sản phẩm AI sẽ gợi ý (1-20)
                </Typography.Body>
              </div>

              {/* Date Range */}
              <div>
                <Typography.H3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  4. Thời gian muốn bán
                </Typography.H3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography.Body className="text-sm font-medium text-gray-700 mb-2">
                      Từ ngày
                    </Typography.Body>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <Typography.Body className="text-sm font-medium text-gray-700 mb-2">
                      Đến ngày
                    </Typography.Body>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Results Display */
            <div className="space-y-6">
              {/* Test Info Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <Typography.H3 className="text-lg font-semibold text-gray-900 mb-3">
                  Thông tin Test
                </Typography.H3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Typography.Body className="font-medium text-gray-700">Mô hình:</Typography.Body>
                    <Typography.Body className="text-gray-900">{results?.test_info?.business_model}</Typography.Body>
                  </div>
                  <div>
                    <Typography.Body className="font-medium text-gray-700">Quốc gia:</Typography.Body>
                    <Typography.Body className="text-gray-900">{results?.test_info?.country}</Typography.Body>
                  </div>
                  <div>
                    <Typography.Body className="font-medium text-gray-700">Số sản phẩm:</Typography.Body>
                    <Typography.Body className="text-gray-900">{results?.test_info?.product_count}</Typography.Body>
                  </div>
                  <div>
                    <Typography.Body className="font-medium text-gray-700">Thời gian:</Typography.Body>
                    <Typography.Body className="text-gray-900">
                      {results?.test_info?.start_date} - {results?.test_info?.end_date}
                    </Typography.Body>
                  </div>
                </div>
              </div>

              {/* Products List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Typography.H3 className="text-lg font-semibold text-gray-900">
                    Sản phẩm được gợi ý ({results?.opportunities?.length || 0})
                  </Typography.H3>
                  <Button
                    variant="secondary"
                    onClick={handleSuggestMore}
                    disabled={isLoadingMore}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    {isLoadingMore ? 'Đang tạo...' : 'Suggest New Ideas'}
                  </Button>
                </div>
                <div className="space-y-4">
                  {results?.opportunities?.map((product: any, index: number) => (
                    <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <Typography.H4 className="text-lg font-semibold text-gray-900 mb-2">
                            {product.product_name}
                          </Typography.H4>
                          <Typography.Body className="text-gray-600 mb-3">
                            {product.ai_summary}
                          </Typography.Body>
                        </div>
                        <div className="ml-4 flex space-x-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Demand: {product.metrics?.demand_score}/10
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Competition: {product.metrics?.competition_score}/10
                          </span>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-1">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          </div>
                          <Typography.Body className="text-xs text-gray-600">Profit</Typography.Body>
                          <Typography.Body className="text-sm font-medium text-gray-900">
                            {product.metrics?.profit_potential}
                          </Typography.Body>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-1">
                            <Target className="w-4 h-4 text-blue-600" />
                          </div>
                          <Typography.Body className="text-xs text-gray-600">Trend</Typography.Body>
                          <Typography.Body className="text-sm font-medium text-gray-900">
                            {product.metrics?.trend}
                          </Typography.Body>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mx-auto mb-1">
                            <Calendar className="w-4 h-4 text-purple-600" />
                          </div>
                          <Typography.Body className="text-xs text-gray-600">Timing</Typography.Body>
                          <Typography.Body className="text-sm font-medium text-gray-900">
                            {product.timing_analysis?.type}
                          </Typography.Body>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full mx-auto mb-1">
                            <Users className="w-4 h-4 text-orange-600" />
                          </div>
                          <Typography.Body className="text-xs text-gray-600">Window</Typography.Body>
                          <Typography.Body className="text-sm font-medium text-gray-900">
                            {product.timing_analysis?.window}
                          </Typography.Body>
                        </div>
                      </div>

                      {/* Detailed Analysis */}
                      <div className="space-y-3">
                        <div>
                          <Typography.Body className="font-medium text-gray-700 mb-1">Cơ hội:</Typography.Body>
                          <Typography.Body className="text-sm text-gray-600">
                            {product.detailed_analysis?.opportunity_overview}
                          </Typography.Body>
                        </div>
                        
                        <div>
                          <Typography.Body className="font-medium text-gray-700 mb-1">Khách hàng mục tiêu:</Typography.Body>
                          <Typography.Body className="text-sm text-gray-600">
                            {product.detailed_analysis?.target_customer_profile?.description}
                          </Typography.Body>
                        </div>

                        <div>
                          <Typography.Body className="font-medium text-gray-700 mb-1">Góc độ marketing:</Typography.Body>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.detailed_analysis?.marketing_angles?.map((angle: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {angle}
                              </span>
                            ))}
                          </div>
                        </div>

                        {product.detailed_analysis?.potential_risks?.length > 0 && (
                          <div>
                            <Typography.Body className="font-medium text-gray-700 mb-1 flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-1 text-orange-500" />
                              Rủi ro cần lưu ý:
                            </Typography.Body>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {product.detailed_analysis?.potential_risks?.map((risk: string, idx: number) => (
                                <li key={idx} className="flex items-start">
                                  <span className="w-1 h-1 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                  {risk}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {product.shopee_search && (
                          <div className="pt-3 border-t">
                            <Typography.Body className="font-medium text-gray-700 mb-2">Tìm nhanh trên Shopee:</Typography.Body>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {product.shopee_search.keywords?.map((kw: string, idx: number) => (
                                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200">
                                  {kw}
                                </span>
                              ))}
                            </div>
                            <a
                              href={product.shopee_search.search_url || (product.shopee_search.keywords?.[0] ? `https://shopee.vn/search?keyword=${encodeURIComponent(product.shopee_search.keywords[0])}` : '#')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 text-xs font-medium rounded bg-orange-500 hover:bg-orange-600 text-white"
                            >
                              Mở trên Shopee
                            </a>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          {!showResults ? (
            <>
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isLoading || !businessModel || !country || !startDate || !endDate}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {isLoading ? 'Đang xử lý...' : 'Gửi Test'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={handleReset}
              >
                Test lại
              </Button>
              <Button
                variant="primary"
                onClick={handleClose}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                Đóng
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestModal;
