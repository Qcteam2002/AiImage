import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import Typography from '../design-system/Typography';
import Spacing from '../design-system/Spacing';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, TrendingUp, Target, DollarSign } from 'lucide-react';
import NicheDetailModal from './NicheDetailModal';

interface RecommendedNichesProps {
  analysisResult: any;
}

const RecommendedNiches: React.FC<RecommendedNichesProps> = ({ analysisResult }) => {
  const { t } = useTranslation();
  const [selectedNiche, setSelectedNiche] = useState<any>(null);
  const [showNicheModal, setShowNicheModal] = useState(false);

  const niches = analysisResult?.D_niche_opportunities || analysisResult?.market_analysis?.C?.potential_niches || analysisResult?.C_NicheTiemNangTheoMoHinhBoth || [];

  if (!niches || !Array.isArray(niches) || niches.length === 0) {
    return null;
  }

  // Prepare chart data for niche potential scores
  const chartData = niches.map((niche: any, index: number) => ({
    name: niche.niche_name || `Niche ${index + 1}`,
    potential_score: niche.potential_score || 0,
    competition_score: niche.competition_profit_metrics?.competition_level_score || 50,
    profit_margin: niche.competition_profit_metrics?.estimated_profit_margin_percent?.[0] || 30,
  }));

  const handleViewDetail = (niche: any) => {
    setSelectedNiche(niche);
    setShowNicheModal(true);
  };

  const getPotentialScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCompetitionColor = (competition: string | number) => {
    // Handle numeric scores (v4.0)
    if (typeof competition === 'number') {
      if (competition <= 40) return 'text-green-600 bg-green-100';
      if (competition <= 70) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    }
    
    // Handle string descriptions (old format)
    const lower = competition?.toLowerCase() || '';
    if (lower.includes('thấp') || lower.includes('low')) return 'text-green-600 bg-green-100';
    if (lower.includes('trung bình') || lower.includes('medium')) return 'text-yellow-600 bg-yellow-100';
    if (lower.includes('cao') || lower.includes('high')) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <Card className={Spacing.section}>
      <div className={Spacing.cardPadding}>
        <Typography.H2 className="mb-6">
          {t('marketExplorer.recommendedNiches')}
        </Typography.H2>

        {/* Niche Potential Chart */}
        <div className="mb-8">
          <Typography.H3 className="mb-4">
            {t('marketExplorer.nichePotentialComparison')}
          </Typography.H3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `${value}${name === 'potential_score' ? '/100' : name === 'profit_margin' ? '%' : ''}`,
                    name === 'potential_score' ? t('marketExplorer.potentialScore') :
                    name === 'competition_score' ? t('marketExplorer.competitionScore') :
                    name === 'profit_margin' ? t('marketExplorer.profitMargin') : name
                  ]}
                />
                <Bar dataKey="potential_score" fill="#3B82F6" name="potential_score" />
                <Bar dataKey="competition_score" fill="#EF4444" name="competition_score" />
                <Bar dataKey="profit_margin" fill="#10B981" name="profit_margin" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Niche Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {niches.map((niche: any, index: number) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Typography.H3 className="mb-2 text-lg">
                    {niche.niche_name || `Niche ${index + 1}`}
                  </Typography.H3>
                  <Typography.BodySmall className="text-gray-600 mb-3 line-clamp-2">
                    {niche.description}
                  </Typography.BodySmall>
                </div>
                
                {/* Potential Score Badge */}
                {niche.potential_score && (
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getPotentialScoreColor(niche.potential_score)}`}>
                    {niche.potential_score}/100
                  </div>
                )}
              </div>

              {/* Key Metrics */}
              <div className="space-y-3 mb-4">
                {/* Competition Level */}
                {niche.competition_profit_metrics?.competition_level_score && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <Typography.BodySmall className="text-gray-600">
                        {t('marketExplorer.competition')}
                      </Typography.BodySmall>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompetitionColor(niche.competition_profit_metrics.competition_level_score)}`}>
                      {niche.competition_profit_metrics.competition_level_score}/100
                    </span>
                  </div>
                )}

                {/* Profit Margin */}
                {niche.competition_profit_metrics?.estimated_profit_margin_percent && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <Typography.BodySmall className="text-gray-600">
                        {t('marketExplorer.profitMargin')}
                      </Typography.BodySmall>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                      {niche.competition_profit_metrics.estimated_profit_margin_percent[0]}% - {niche.competition_profit_metrics.estimated_profit_margin_percent[1]}%
                    </span>
                  </div>
                )}

                {/* Model Suitability */}
                {niche.model_suitability && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      <Typography.BodySmall className="text-gray-600">
                        {t('marketExplorer.modelSuitability')}
                      </Typography.BodySmall>
                    </div>
                    <div className="flex gap-1">
                      {niche.model_suitability.dropshipping_score && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
                          D: {niche.model_suitability.dropshipping_score}
                        </span>
                      )}
                      {niche.model_suitability.affiliate_score && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                          A: {niche.model_suitability.affiliate_score}
                        </span>
                      )}
                      {niche.model_suitability.self_business_score && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-purple-600 bg-purple-100">
                          S: {niche.model_suitability.self_business_score}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Target Segment */}
              {niche.target_customer_segment && (
                <div className="mb-4">
                  <Typography.BodySmall className="text-gray-600 mb-1">
                    {t('marketExplorer.targetSegment')}
                  </Typography.BodySmall>
                  <Typography.BodySmall className="text-gray-800 font-medium">
                    {niche.target_customer_segment}
                  </Typography.BodySmall>
                </div>
              )}

              {/* Main Channels */}
              {niche.recommended_channels && Array.isArray(niche.recommended_channels) && niche.recommended_channels.length > 0 && (
                <div className="mb-4">
                  <Typography.BodySmall className="text-gray-600 mb-2">
                    {t('marketExplorer.mainChannels')}
                  </Typography.BodySmall>
                  <div className="flex flex-wrap gap-1">
                    {niche.recommended_channels.slice(0, 3).map((channel: string, channelIndex: number) => (
                      <span key={channelIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {channel}
                      </span>
                    ))}
                    {niche.recommended_channels.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{niche.recommended_channels.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* View Detail Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleViewDetail(niche)}
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                {t('marketExplorer.viewDetail')}
              </Button>
            </div>
          ))}
        </div>

        {/* Niche Detail Modal */}
        {showNicheModal && selectedNiche && (
          <NicheDetailModal
            niche={selectedNiche}
            onClose={() => {
              setShowNicheModal(false);
              setSelectedNiche(null);
            }}
          />
        )}
      </div>
    </Card>
  );
};

export default RecommendedNiches;