import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import Typography from '../design-system/Typography';
import Spacing from '../design-system/Spacing';
import { Button } from '../ui/Button';
import { Building2, TrendingUp, TrendingDown, ChevronDown, ChevronUp, ExternalLink, Users, DollarSign, Target, BarChart3, Globe, Smartphone, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface CompetitorLandscapeProps {
  analysisResult: any;
}

const CompetitorLandscape: React.FC<CompetitorLandscapeProps> = ({ analysisResult }) => {
  const { t } = useTranslation();
  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null);

  const competitorData = analysisResult?.B_competitor_landscape || analysisResult?.competitor_landscape || {};

  if (!competitorData || Object.keys(competitorData).length === 0) {
    return null;
  }

  const formatCurrency = (num: number, country?: string) => {
    if (country?.toLowerCase().includes('việt nam') || country?.toLowerCase().includes('vietnam')) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(num * 24000); // Approximate USD to VND conversion
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getConcentrationLevel = (score: number) => {
    if (score <= 40) return { level: t('marketExplorer.fragmented'), color: 'text-green-600', bg: 'bg-green-100' };
    if (score <= 70) return { level: t('marketExplorer.moderateCompetition'), color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: t('marketExplorer.highlyConcentrated'), color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getIntensityLevel = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return { color: 'text-green-600', bg: 'bg-green-100' };
      case 'moderate': return { color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'high': return { color: 'text-red-600', bg: 'bg-red-100' };
      default: return { color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const concentration = getConcentrationLevel(competitorData.market_structure?.market_concentration_score || 0);
  const intensity = getIntensityLevel(competitorData.market_structure?.competitive_intensity_level || '');

  // Prepare chart data
  const marketShareData = competitorData.chart_data?.market_share_over_time || [];
  const trafficData = competitorData.chart_data?.traffic_sources_distribution || [];
  const adSpendData = competitorData.chart_data?.ad_spend_trend || [];

  return (
    <Card className={Spacing.section}>
      <div className={Spacing.cardPadding}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-purple-600" />
          </div>
          <Typography.H2>{t('marketExplorer.competitorLandscape')}</Typography.H2>
        </div>

        {/* Market Structure Overview */}
        {competitorData.market_structure && (
          <div className="mb-8">
            <Typography.H3 className="mb-4">{t('marketExplorer.marketStructure')}</Typography.H3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Market Concentration */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <Typography.BodySmall className="text-gray-600">
                    {t('marketExplorer.concentrationScore')}
                  </Typography.BodySmall>
                </div>
                <Typography.H3 className="text-2xl font-bold text-blue-600 mb-1">
                  {competitorData.market_structure.market_concentration_score || 0}/100
                </Typography.H3>
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${concentration.bg}`}>
                  <span className={concentration.color}>{concentration.level}</span>
                </div>
              </div>

              {/* Market Value */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <Typography.BodySmall className="text-gray-600">
                    {t('marketExplorer.marketValue')}
                  </Typography.BodySmall>
                </div>
                <Typography.H3 className="text-2xl font-bold text-green-600">
                  ${competitorData.market_structure.market_total_value_usd_billion || 0}B
                </Typography.H3>
                <Typography.BodySmall className="text-gray-500">
                  {t('marketExplorer.totalValue')}
                </Typography.BodySmall>
              </div>

              {/* Fragmentation Index */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <Typography.BodySmall className="text-gray-600">
                    {t('marketExplorer.fragmentationIndex')}
                  </Typography.BodySmall>
                </div>
                <Typography.H3 className="text-2xl font-bold text-purple-600">
                  {(competitorData.market_structure.market_fragmentation_index || 0).toFixed(2)}
                </Typography.H3>
                <Typography.BodySmall className="text-gray-500">
                  {t('marketExplorer.fragmentationLevel')}
                </Typography.BodySmall>
              </div>

              {/* Competitive Intensity */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <Typography.BodySmall className="text-gray-600">
                    {t('marketExplorer.competitiveIntensity')}
                  </Typography.BodySmall>
                </div>
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${intensity.bg} mb-1`}>
                  <span className={intensity.color}>
                    {competitorData.market_structure.competitive_intensity_level || 'N/A'}
                  </span>
                </div>
                <Typography.BodySmall className="text-gray-500">
                  {t('marketExplorer.intensityLevel')}
                </Typography.BodySmall>
              </div>
            </div>

            {/* Market Insight */}
            {competitorData.market_structure.insight_summary && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Typography.Body className="text-blue-800">
                  {competitorData.market_structure.insight_summary}
                </Typography.Body>
              </div>
            )}
          </div>
        )}

        {/* Market Share Over Time Chart */}
        {marketShareData.length > 0 && (
          <div className="mb-8">
            <Typography.H3 className="mb-4">{t('marketExplorer.marketShareEvolution')}</Typography.H3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marketShareData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value}%`, '']} />
                  <Line type="monotone" dataKey="Shopee" stroke="#3B82F6" strokeWidth={3} />
                  <Line type="monotone" dataKey="Lazada" stroke="#10B981" strokeWidth={3} />
                  <Line type="monotone" dataKey="TikTok Shop" stroke="#F59E0B" strokeWidth={3} />
                  <Line type="monotone" dataKey="Others" stroke="#6B7280" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Players */}
        {competitorData.top_players && Array.isArray(competitorData.top_players) && (
          <div className="mb-8">
            <Typography.H3 className="mb-4">{t('marketExplorer.topPlayers')}</Typography.H3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {competitorData.top_players.map((player: any, index: number) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Player Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {player.competitor_name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <Typography.H4 className="mb-1">{player.competitor_name}</Typography.H4>
                        <Typography.BodySmall className="text-gray-600">
                          {player.business_model}
                        </Typography.BodySmall>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* Market Share */}
                      <div className="text-center">
                        <Typography.H3 className="text-2xl font-bold text-blue-600">
                          {typeof player.market_share_percent === 'object' 
                            ? player.market_share_percent['2025'] || 0 
                            : player.market_share_percent || 0}%
                        </Typography.H3>
                        <Typography.BodySmall className="text-gray-600">
                          {t('marketExplorer.marketShare')}
                        </Typography.BodySmall>
                      </div>

                      {/* Monthly Visits */}
                      <div className="text-center">
                        <Typography.H3 className="text-2xl font-bold text-green-600">
                          {player.avg_monthly_visits_million || 0}M
                        </Typography.H3>
                        <Typography.BodySmall className="text-gray-600">
                          {t('marketExplorer.monthlyVisits')}
                        </Typography.BodySmall>
                      </div>
                    </div>

                    {/* Additional Metrics */}
                    <div className="space-y-2 mb-4">
                      {player.customer_retention_rate_percent && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <Typography.BodySmall className="text-gray-600">
                              {t('marketExplorer.retentionRate')}
                            </Typography.BodySmall>
                          </div>
                          <Typography.BodySmall className="font-semibold">
                            {player.customer_retention_rate_percent}%
                          </Typography.BodySmall>
                        </div>
                      )}

                      {player.estimated_cac_usd && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <Typography.BodySmall className="text-gray-600">
                              {t('marketExplorer.cac')}
                            </Typography.BodySmall>
                          </div>
                          <Typography.BodySmall className="font-semibold">
                            ${player.estimated_cac_usd}
                          </Typography.BodySmall>
                        </div>
                      )}

                      {player.aov_usd && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-gray-500" />
                            <Typography.BodySmall className="text-gray-600">
                              {t('marketExplorer.aov')}
                            </Typography.BodySmall>
                          </div>
                          <Typography.BodySmall className="font-semibold">
                            ${player.aov_usd}
                          </Typography.BodySmall>
                        </div>
                      )}
                    </div>

                    {/* Core Channels */}
                    {player.core_channels && Array.isArray(player.core_channels) && (
                      <div className="mb-4">
                        <Typography.BodySmall className="text-gray-600 mb-2">
                          {t('marketExplorer.coreChannels')}
                        </Typography.BodySmall>
                        <div className="flex flex-wrap gap-1">
                          {player.core_channels.slice(0, 3).map((channel: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {channel}
                            </span>
                          ))}
                          {player.core_channels.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              +{player.core_channels.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Expand Button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setExpandedCompetitor(
                        expandedCompetitor === player.competitor_name ? null : player.competitor_name
                      )}
                      className="w-full"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {expandedCompetitor === player.competitor_name 
                        ? t('marketExplorer.hideDetails') 
                        : t('marketExplorer.viewDetails')
                      }
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  {expandedCompetitor === player.competitor_name && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        <div>
                          <Typography.H4 className="mb-3 flex items-center gap-2 text-green-700">
                            <TrendingUp className="w-4 h-4" />
                            {t('marketExplorer.strengths')}
                          </Typography.H4>
                          <ul className="space-y-2">
                            {player.key_strengths?.map((strength: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <Typography.BodySmall className="text-gray-700">
                                  {strength}
                                </Typography.BodySmall>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        <div>
                          <Typography.H4 className="mb-3 flex items-center gap-2 text-red-700">
                            <TrendingDown className="w-4 h-4" />
                            {t('marketExplorer.weaknesses')}
                          </Typography.H4>
                          <ul className="space-y-2">
                            {player.key_weaknesses?.map((weakness: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                <Typography.BodySmall className="text-gray-700">
                                  {weakness}
                                </Typography.BodySmall>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Data Source */}
                      {player.data_source && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <Typography.BodySmall className="text-gray-500 flex items-center gap-2">
                            <ExternalLink className="w-3 h-3" />
                            {t('marketExplorer.dataSource')}: {player.data_source}
                          </Typography.BodySmall>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Competitive Gap Analysis */}
        {competitorData.competitive_gap_analysis && (
          <div className="mb-8">
            <Typography.H3 className="mb-4">{t('marketExplorer.competitiveGapAnalysis')}</Typography.H3>
            
            {/* White Space Opportunities */}
            {competitorData.competitive_gap_analysis.white_space_opportunities && (
              <div className="mb-6">
                <Typography.H4 className="mb-3">{t('marketExplorer.whiteSpaceOpportunities')}</Typography.H4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {competitorData.competitive_gap_analysis.white_space_opportunities.map((opportunity: any, idx: number) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Typography.Body className="font-semibold">{opportunity.niche}</Typography.Body>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            opportunity.current_player_focus === 'Low' ? 'bg-green-100 text-green-800' :
                            opportunity.current_player_focus === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {opportunity.current_player_focus}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {opportunity.potential_index_score}/100
                          </span>
                        </div>
                      </div>
                      <Typography.BodySmall className="text-gray-600">
                        {opportunity.insight}
                      </Typography.BodySmall>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Channel Opportunity Matrix */}
            {competitorData.competitive_gap_analysis.channel_opportunity_matrix && (
              <div>
                <Typography.H4 className="mb-3">{t('marketExplorer.channelOpportunityMatrix')}</Typography.H4>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t('marketExplorer.channel')}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t('marketExplorer.avgCac')}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t('marketExplorer.avgCr')}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t('marketExplorer.avgAov')}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t('marketExplorer.growthScore')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {competitorData.competitive_gap_analysis.channel_opportunity_matrix.map((channel: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">{channel.channel}</td>
                          <td className="px-4 py-3 text-sm">${channel.avg_cac_usd}</td>
                          <td className="px-4 py-3 text-sm">{channel.avg_cr_percent}%</td>
                          <td className="px-4 py-3 text-sm">${channel.avg_aov_usd}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              channel.growth_score >= 90 ? 'bg-green-100 text-green-800' :
                              channel.growth_score >= 80 ? 'bg-blue-100 text-blue-800' :
                              channel.growth_score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {channel.growth_score}/100
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Insight Summary */}
        {competitorData.insight_summary && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <Typography.H3 className="mb-3 flex items-center gap-2 text-blue-800">
              <BarChart3 className="w-5 h-5" />
              {t('marketExplorer.insightSummary')}
            </Typography.H3>
            <Typography.Body className="text-blue-800 leading-relaxed">
              {competitorData.insight_summary}
            </Typography.Body>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CompetitorLandscape;
