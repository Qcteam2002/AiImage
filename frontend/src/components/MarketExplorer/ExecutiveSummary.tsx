import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import Typography from '../design-system/Typography';
import Spacing from '../design-system/Spacing';
import { TrendingUp, Target, Users, Building2, Calendar, BarChart3, AlertTriangle, CheckCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface ExecutiveSummaryProps {
  analysisResult: any;
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ analysisResult }) => {
  const { t } = useTranslation();

  const summary = analysisResult?.['00_executive_summary'] || analysisResult?.executive_summary || {};

  if (!summary || Object.keys(summary).length === 0) {
    return null;
  }

  const formatCurrency = (num: number, country?: string) => {
    if (country?.toLowerCase().includes('việt nam') || country?.toLowerCase().includes('vietnam')) {
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

  // Prepare chart data
  const marketGrowthData = summary.market_highlights?.market_value_usd_billion ? 
    Object.entries(summary.market_highlights.market_value_usd_billion).map(([year, value]) => ({
      year: year.replace('_forecast', ''),
      value: value,
      isForecast: year.includes('forecast')
    })) : [];

  const userBaseData = summary.market_highlights?.user_base_million ?
    Object.entries(summary.market_highlights.user_base_million).map(([year, value]) => ({
      year: year,
      users: value
    })) : [];

  const opportunityData = summary.strategic_outlook?.top_opportunities?.map((opp: any) => ({
    name: opp.area.split(' ').slice(0, 3).join(' '),
    impact: opp.impact_score,
    confidence: opp.confidence_score * 100
  })) || [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

  return (
    <Card className={Spacing.section}>
      <div className={Spacing.cardPadding}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <Typography.H2>{t('marketExplorer.executiveSummary')}</Typography.H2>
            {summary.report_metadata?.report_version && (
              <Typography.BodySmall className="text-gray-500">
                {summary.report_metadata.report_version}
              </Typography.BodySmall>
            )}
          </div>
        </div>

        {/* Report Metadata */}
        {summary.report_metadata && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <Typography.H3 className="text-blue-900 mb-3">
              {summary.report_metadata.report_title}
            </Typography.H3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <Typography.LabelSmall className="text-blue-700">Thời gian dữ liệu</Typography.LabelSmall>
                <Typography.BodySmall className="text-blue-800">{summary.report_metadata.data_timeframe}</Typography.BodySmall>
              </div>
              <div>
                <Typography.LabelSmall className="text-blue-700">Dự báo đến</Typography.LabelSmall>
                <Typography.BodySmall className="text-blue-800">{summary.report_metadata.forecast_horizon}</Typography.BodySmall>
              </div>
              <div>
                <Typography.LabelSmall className="text-blue-700">Độ tin cậy</Typography.LabelSmall>
                <Typography.BodySmall className="text-blue-800">{summary.report_metadata.confidence_level_percent}%</Typography.BodySmall>
              </div>
              <div>
                <Typography.LabelSmall className="text-blue-700">Cập nhật</Typography.LabelSmall>
                <Typography.BodySmall className="text-blue-800">{summary.report_metadata.last_updated}</Typography.BodySmall>
              </div>
            </div>
          </div>
        )}

        {/* Market Highlights */}
        {summary.market_highlights && (
          <div className="mb-6">
            <Typography.H3 className="mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              {t('marketExplorer.marketHighlights')}
            </Typography.H3>
            
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
                <Typography.LabelSmall className="text-gray-500 mb-1">CAGR</Typography.LabelSmall>
                <Typography.H4 className="text-green-600">{summary.market_highlights.cagr_percent}%</Typography.H4>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
                <Typography.LabelSmall className="text-gray-500 mb-1">Thâm nhập</Typography.LabelSmall>
                <Typography.H4 className="text-blue-600">{summary.market_highlights.penetration_rate_percent}%</Typography.H4>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
                <Typography.LabelSmall className="text-gray-500 mb-1">ARPU</Typography.LabelSmall>
                <Typography.H4 className="text-purple-600">{formatCurrency(summary.market_highlights.arpu_usd, analysisResult?.target_country)}</Typography.H4>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
                <Typography.LabelSmall className="text-gray-500 mb-1">Người dùng 2025</Typography.LabelSmall>
                <Typography.H4 className="text-orange-600">{summary.market_highlights.user_base_million?.['2025']}M</Typography.H4>
              </div>
            </div>

            {/* Market Growth Chart */}
            {marketGrowthData.length > 0 && (
              <div className="mb-6">
                <Typography.H4 className="mb-3">Tăng trưởng thị trường (Tỷ USD)</Typography.H4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={marketGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}B USD`, 'Giá trị thị trường']} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Summary Insight */}
            {summary.market_highlights.summary_insight && (
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                <Typography.Body className="text-blue-800">
                  {summary.market_highlights.summary_insight}
                </Typography.Body>
              </div>
            )}
          </div>
        )}

        {/* Key Findings */}
        {summary.key_findings && Array.isArray(summary.key_findings) && (
          <div className="mb-6">
            <Typography.H3 className="mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              {t('marketExplorer.keyFindings')}
            </Typography.H3>
            <div className="space-y-4">
              {summary.key_findings.map((finding: any, index: number) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm font-semibold">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <Typography.H5 className="text-gray-900 mb-1">{finding.theme}</Typography.H5>
                    <Typography.Body className="text-gray-700 mb-2">{finding.finding}</Typography.Body>
                    {finding.data_source && (
                      <Typography.BodySmall className="text-gray-500">
                        Nguồn: {finding.data_source}
                      </Typography.BodySmall>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Growth Drivers & Challenges */}
        {summary.growth_drivers_and_challenges && (
          <div className="mb-6">
            <Typography.H3 className="mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Động lực tăng trưởng & Thách thức
            </Typography.H3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Drivers */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <Typography.H4 className="text-green-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Động lực tăng trưởng
                </Typography.H4>
                <ul className="space-y-2">
                  {summary.growth_drivers_and_challenges.key_drivers?.map((driver: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-green-700">
                      <ArrowUp className="w-3 h-3 text-green-600 mt-1 flex-shrink-0" />
                      {driver}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Challenges */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <Typography.H4 className="text-red-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Thách thức
                </Typography.H4>
                <ul className="space-y-2">
                  {summary.growth_drivers_and_challenges.key_challenges?.map((challenge: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-red-700">
                      <ArrowDown className="w-3 h-3 text-red-600 mt-1 flex-shrink-0" />
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Strategic Outlook */}
        {summary.strategic_outlook && (
          <div className="mb-6">
            <Typography.H3 className="mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              Triển vọng chiến lược
            </Typography.H3>
            
            {/* Top Opportunities */}
            {summary.strategic_outlook.top_opportunities && (
              <div className="mb-4">
                <Typography.H4 className="mb-3">Cơ hội hàng đầu</Typography.H4>
                <div className="space-y-3">
                  {summary.strategic_outlook.top_opportunities.map((opp: any, index: number) => (
                    <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <Typography.H5 className="text-purple-900">{opp.area}</Typography.H5>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-medium">
                            Impact: {opp.impact_score}/100
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-medium">
                            Confidence: {(opp.confidence_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <Typography.Body className="text-purple-800">{opp.summary}</Typography.Body>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Outlook Summary */}
            {summary.strategic_outlook.market_outlook_summary && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                <Typography.H4 className="text-purple-900 mb-2">Tóm tắt triển vọng thị trường</Typography.H4>
                <Typography.Body className="text-purple-800">
                  {summary.strategic_outlook.market_outlook_summary}
                </Typography.Body>
              </div>
            )}
          </div>
        )}

        {/* Strategic Recommendations */}
        {summary.strategic_recommendations && Array.isArray(summary.strategic_recommendations) && (
          <div className="mb-6">
            <Typography.H3 className="mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              Khuyến nghị chiến lược
            </Typography.H3>
            <div className="space-y-4">
              {summary.strategic_recommendations.map((rec: any, index: number) => (
                <div key={index} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <Typography.H5 className="text-orange-900">
                      Ưu tiên {rec.priority_rank}: {rec.recommendation}
                    </Typography.H5>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm font-medium">
                      {(rec.confidence_score * 100).toFixed(0)}% tin cậy
                    </span>
                  </div>
                  <Typography.Body className="text-orange-800">
                    <strong>Tác động dự kiến:</strong> {rec.expected_impact}
                  </Typography.Body>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ExecutiveSummary;
