import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import Typography from '../design-system/Typography';
import Spacing from '../design-system/Spacing';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MarketAnalysisProps {
  analysisResult: {
    market_and_keywords: {
      sales_potential: string;
      market_size_usd: number;
      cagr_percent: number;
      google_trends_change_percent: number;
      sources: string[];
      marketplace_data: {
        aliexpress: { listings: number; sales_per_month: number };
        etsy: { listings: number; sales_per_month: number };
        amazon: { listings: number; sales_per_month: number };
        shopee: { listings: number; sales_per_month: number };
      };
      keywords: {
        informational: Array<{ keyword: string; volume: number; cpc: number; competition: string }>;
        transactional: Array<{ keyword: string; volume: number; cpc: number; competition: string }>;
        comparative: Array<{ keyword: string; volume: number; cpc: number; competition: string }>;
        painpoint_related: Array<{ keyword: string; volume: number; cpc: number; competition: string }>;
      };
    };
  };
}

const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ analysisResult }) => {
  // Flatten all keyword categories into one array
  const allKeywords = [
    ...(analysisResult.market_and_keywords?.keywords?.informational || []),
    ...(analysisResult.market_and_keywords?.keywords?.transactional || []),
    ...(analysisResult.market_and_keywords?.keywords?.comparative || []),
    ...(analysisResult.market_and_keywords?.keywords?.painpoint_related || [])
  ];
  
  const keywordData = allKeywords.slice(0, 10).map(kw => ({
    keyword: kw.keyword,
    volume: kw.volume,
    cpc: kw.cpc || 0,
    competition: kw.competition || 'Unknown'
  }));

  return (
    <Card className={Spacing.section}>
      <div className={Spacing.cardPadding}>
        <Typography.H2 className="mb-8 flex items-center">
          <TrendingUp className="w-7 h-7 mr-4 text-blue-600" />
          Market Analysis
        </Typography.H2>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="border border-gray-200 p-8 rounded-lg">
            <Typography.Label className="mb-4 block">Sales Potential</Typography.Label>
            <Typography.Metric className="mb-4 block">{analysisResult.market_and_keywords?.sales_potential || 'N/A'}</Typography.Metric>
            <Typography.BodySmall className="block mb-1">Market Size: ${analysisResult.market_and_keywords?.market_size_usd?.toLocaleString() || 'N/A'}</Typography.BodySmall>
            <Typography.BodySmall className="block">CAGR: {analysisResult.market_and_keywords?.cagr_percent || 'N/A'}%</Typography.BodySmall>
          </div>
          
          <div className="border border-gray-200 p-8 rounded-lg">
            <Typography.Label className="mb-4 block">Google Trends</Typography.Label>
            <Typography.Metric className="mb-4 block">
              {(analysisResult.market_and_keywords?.google_trends_change_percent || 0) > 0 ? '+' : ''}
              {analysisResult.market_and_keywords?.google_trends_change_percent || 0}%
            </Typography.Metric>
            <Typography.BodySmall className="block">12-month change</Typography.BodySmall>
          </div>
          
          <div className="border border-gray-200 p-8 rounded-lg">
            <Typography.Label className="mb-4 block">Sources</Typography.Label>
            <div className="flex flex-wrap gap-2">
              {(analysisResult.market_and_keywords?.sources || []).map((source, index) => (
                <Typography.Badge key={index} variant="default">
                  {source}
                </Typography.Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Marketplace Data */}
        <div className="mb-10">
          <Typography.H3 className="mb-6">Marketplace Performance</Typography.H3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(analysisResult.market_and_keywords?.marketplace_data || {}).map(([platform, data]) => (
              <div key={platform} className="border border-gray-200 p-6 rounded-lg">
                <Typography.H6 className="mb-4 capitalize">{platform}</Typography.H6>
                <Typography.MetricMedium className="mb-2 block">{(data as any)?.listings?.toLocaleString() || 'N/A'}</Typography.MetricMedium>
                <Typography.BodySmall className="block mb-1">Listings</Typography.BodySmall>
                <Typography.BodySmall className="block">{(data as any)?.sales_per_month || 'N/A'} sales/month</Typography.BodySmall>
              </div>
            ))}
          </div>
        </div>

        {/* Keywords Chart */}
        <div>
          <Typography.H3 className="mb-6">Từ khóa hiệu quả</Typography.H3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={keywordData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="keyword" angle={-45} textAnchor="end" height={100} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'volume') return [value.toLocaleString(), 'Search Volume'];
                    if (name === 'cpc') return [`$${value}`, 'CPC'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Keyword: ${label}`}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="volume" fill="#3B82F6" name="Search Volume" />
                <Bar yAxisId="right" dataKey="cpc" fill="#10B981" name="CPC ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Keywords Table */}
          <div className="mt-8">
            <Typography.H4 className="mb-4">Chi tiết từ khóa</Typography.H4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Keyword
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Search Volume
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPC ($)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Competition
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {keywordData.map((keyword, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {keyword.keyword}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {keyword.volume.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${keyword.cpc}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          keyword.competition === 'Low' ? 'bg-green-100 text-green-800' :
                          keyword.competition === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {keyword.competition}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MarketAnalysis;
