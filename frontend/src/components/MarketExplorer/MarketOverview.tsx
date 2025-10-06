import React from 'react';
import { Card } from '../ui/Card';
import Typography from '../design-system/Typography';
import Spacing from '../design-system/Spacing';
import { useTranslation } from 'react-i18next';

interface MarketOverviewProps {
  analysisResult: any;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ analysisResult }) => {
  const { t } = useTranslation();

  const marketData = analysisResult?.A_market_overview || analysisResult?.market_analysis?.A?.market_overview || analysisResult?.A_TongQuanThiTruongEcom_USA || analysisResult?.A_TongQuanThiTruongEcom || {};

  if (!marketData || Object.keys(marketData).length === 0) {
    return null;
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number, country?: string) => {
    if (country?.toLowerCase().includes('việt nam') || country?.toLowerCase().includes('vietnam')) {
      // Convert USD to VND (approximate rate: 1 USD = 24,000 VND)
      const vndAmount = num * 24000;
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(vndAmount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <Card className={Spacing.section}>
      <div className={Spacing.cardPadding}>
        <Typography.H2 className="mb-6">
          {t('marketExplorer.marketOverview')}
        </Typography.H2>

        {/* Market Size */}
        {marketData.market_size && (
          <div className="mb-8">
            <Typography.H3 className="mb-4">{t('marketExplorer.marketSize')}</Typography.H3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <Typography.BodySmall className="text-gray-600 mb-2">{t('marketExplorer.marketValue')}</Typography.BodySmall>
                <Typography.Body className="font-semibold">
                  {marketData.market_size.value_usd ? formatCurrency(marketData.market_size.value_usd * 1000000000, analysisResult?.target_country) : 'N/A'}
                </Typography.Body>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <Typography.BodySmall className="text-gray-600 mb-2">{t('marketExplorer.growthRate')}</Typography.BodySmall>
                <Typography.Body className="font-semibold text-green-600">
                  {marketData.market_size.cagr_percent ? `${marketData.market_size.cagr_percent}%` : 'N/A'}
                </Typography.Body>
              </div>
            </div>
          </div>
        )}

        {/* User Metrics */}
        {marketData.user_metrics && (
          <div className="mb-8">
            <Typography.H3 className="mb-4">{t('marketExplorer.userMetrics')}</Typography.H3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <Typography.BodySmall className="text-gray-600 mb-2">{t('marketExplorer.onlineShoppers')}</Typography.BodySmall>
                <Typography.Body className="font-semibold">
                  {marketData.user_metrics.count ? formatNumber(marketData.user_metrics.count) : 'N/A'}
                </Typography.Body>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <Typography.BodySmall className="text-gray-600 mb-2">{t('marketExplorer.penetrationRate')}</Typography.BodySmall>
                <Typography.Body className="font-semibold">
                  {marketData.user_metrics.penetration_rate_percent ? `${marketData.user_metrics.penetration_rate_percent}%` : 'N/A'}
                </Typography.Body>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <Typography.BodySmall className="text-gray-600 mb-2">{t('marketExplorer.avgSpending')}</Typography.BodySmall>
                <Typography.Body className="font-semibold">
                  {marketData.user_metrics.arpu_usd ? formatCurrency(marketData.user_metrics.arpu_usd, analysisResult?.target_country) : 'N/A'}
                </Typography.Body>
              </div>
            </div>
          </div>
        )}

        {/* Key Trends */}
        {marketData.key_trends && Array.isArray(marketData.key_trends) && (
          <div className="mb-8">
            <Typography.H3 className="mb-4">{t('marketExplorer.keyTrends')}</Typography.H3>
            <div className="space-y-3">
              {marketData.key_trends.map((trend: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300">
                  <Typography.Body className="font-semibold mb-2">
                    {trend.trend_name || trend}
                  </Typography.Body>
                  {trend.supporting_data && (
                    <Typography.BodySmall className="text-gray-600">
                      {trend.supporting_data}
                    </Typography.BodySmall>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Segments */}
        {marketData.top_segments && Array.isArray(marketData.top_segments) && (
          <div className="mb-8">
            <Typography.H3 className="mb-4">{t('marketExplorer.topSegments')}</Typography.H3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketData.top_segments.map((segment: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <Typography.Body className="font-semibold mb-2">{segment.segment_name}</Typography.Body>
                  {segment.revenue_share_percent && (
                    <Typography.BodySmall className="text-gray-600">
                      {t('marketExplorer.revenueShare')}: {segment.revenue_share_percent}%
                    </Typography.BodySmall>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart Data - Market Growth Over Time */}
        {marketData.chart_data?.market_growth_over_time && (
          <div className="mb-8">
            <Typography.H3 className="mb-4">{t('marketExplorer.marketGrowthChart')}</Typography.H3>
            <div className="bg-gray-50 rounded-lg p-6">
              {/* Simple Bar Chart */}
              <div className="space-y-4">
                {marketData.chart_data.market_growth_over_time.map((data: any, index: number) => {
                  const maxValue = Math.max(...marketData.chart_data.market_growth_over_time.map((d: any) => d.market_value_usd));
                  const percentage = (data.market_value_usd / maxValue) * 100;
                  
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-16 text-sm font-medium text-gray-600">
                        {data.year}
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-6 relative">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%` }}
                          >
                            <span className="text-white text-xs font-medium">
                              {formatCurrency(data.market_value_usd / 1000000000, analysisResult?.target_country)}B
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Chart Data - Category Share */}
        {marketData.chart_data?.category_share && (
          <div className="mb-8">
            <Typography.H3 className="mb-4">{t('marketExplorer.categoryShareChart')}</Typography.H3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-4">
                {marketData.chart_data.category_share.map((category: any, index: number) => {
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500'];
                  const colorClass = colors[index % colors.length];
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${colorClass}`}></div>
                        <Typography.Body className="font-medium">{category.category}</Typography.Body>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-40 bg-gray-200 rounded-full h-3">
                          <div 
                            className={`${colorClass} h-3 rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${category.share_percent}%` }}
                          ></div>
                        </div>
                        <Typography.BodySmall className="text-gray-600 w-12 text-right font-semibold">
                          {category.share_percent}%
                        </Typography.BodySmall>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Chart Data - Consumer Spending Distribution */}
        {marketData.chart_data?.consumer_spending_distribution && (
          <div className="mb-8">
            <Typography.H3 className="mb-4">{t('marketExplorer.consumerSpendingChart')}</Typography.H3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-4">
                {marketData.chart_data.consumer_spending_distribution.map((segment: any, index: number) => {
                  const maxSpending = Math.max(...marketData.chart_data.consumer_spending_distribution.map((s: any) => s.avg_spending_usd));
                  const percentage = (segment.avg_spending_usd / maxSpending) * 100;
                  const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500'];
                  const colorClass = colors[index % colors.length];
                  
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-gray-600">
                        {segment.segment}
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-4 relative">
                          <div 
                            className={`${colorClass} h-4 rounded-full flex items-center justify-end pr-2 transition-all duration-1000 ease-out`}
                            style={{ width: `${percentage}%` }}
                          >
                            <span className="text-white text-xs font-medium">
                              {formatCurrency(segment.avg_spending_usd, analysisResult?.target_country)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Chart Data - Device Usage Distribution */}
        {marketData.chart_data?.device_usage_distribution && (
          <div className="mb-8">
            <Typography.H3 className="mb-4">{t('marketExplorer.deviceUsageChart')}</Typography.H3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-4">
                {marketData.chart_data.device_usage_distribution.map((device: any, index: number) => {
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
                  const colorClass = colors[index % colors.length];
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${colorClass}`}></div>
                        <Typography.Body className="font-medium">{device.device}</Typography.Body>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-40 bg-gray-200 rounded-full h-3">
                          <div 
                            className={`${colorClass} h-3 rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${device.percent}%` }}
                          ></div>
                        </div>
                        <Typography.BodySmall className="text-gray-600 w-12 text-right font-semibold">
                          {device.percent}%
                        </Typography.BodySmall>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PESTLE Analysis */}
        {marketData.pestle_analysis && (
          <div>
            <Typography.H3 className="mb-4">{t('marketExplorer.pestleAnalysis')}</Typography.H3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(marketData.pestle_analysis).map(([key, value]: [string, any]) => {
                const impactScore = value?.impact_score || 0;
                const getImpactColor = (score: number) => {
                  if (score >= 80) return 'text-green-600 bg-green-100';
                  if (score >= 60) return 'text-yellow-600 bg-yellow-100';
                  return 'text-red-600 bg-red-100';
                };
                
                return (
                  <div key={key} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Typography.Body className="font-semibold capitalize">
                        {key === 'political' && t('marketExplorer.political')}
                        {key === 'economic' && t('marketExplorer.economic')}
                        {key === 'social' && t('marketExplorer.social')}
                        {key === 'technological' && t('marketExplorer.technological')}
                        {key === 'legal' && t('marketExplorer.legal')}
                        {key === 'environmental' && t('marketExplorer.environmental')}
                      </Typography.Body>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(impactScore)}`}>
                        {impactScore}/100
                      </span>
                    </div>
                    <Typography.BodySmall className="text-gray-600">
                      {value?.description || (typeof value === 'string' ? value : JSON.stringify(value))}
                    </Typography.BodySmall>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                          impactScore >= 80 ? 'bg-green-500' : 
                          impactScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${impactScore}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fallback for old PEST Analysis */}
        {!marketData.pestle_analysis && marketData.pest_analysis && (
          <div>
            <Typography.H3 className="mb-4">{t('marketExplorer.pestAnalysis')}</Typography.H3>
            {typeof marketData.pest_analysis === 'string' ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <Typography.BodySmall className="text-gray-600 whitespace-pre-line">
                  {marketData.pest_analysis}
                </Typography.BodySmall>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(marketData.pest_analysis).map(([key, value]: [string, any]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4">
                    <Typography.Body className="font-semibold mb-2 capitalize">
                      {key === 'political' && t('marketExplorer.political')}
                      {key === 'economic' && t('marketExplorer.economic')}
                      {key === 'social' && t('marketExplorer.social')}
                      {key === 'technological' && t('marketExplorer.technological')}
                    </Typography.Body>
                    <Typography.BodySmall className="text-gray-600">
                      {typeof value === 'string' ? value : JSON.stringify(value)}
                    </Typography.BodySmall>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default MarketOverview;