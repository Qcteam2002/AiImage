import React from 'react';
import { X, Target, DollarSign, TrendingUp, Users, Package, BarChart3, Globe, Lightbulb } from 'lucide-react';
import Typography from '../design-system/Typography';
import Spacing from '../design-system/Spacing';
import { useTranslation } from 'react-i18next';

interface NicheDetailModalProps {
  niche: any;
  onClose: () => void;
}

const NicheDetailModal: React.FC<NicheDetailModalProps> = ({ niche, onClose }) => {
  const { t } = useTranslation();

  const getPotentialScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCompetitionColor = (competition: string | number) => {
    if (typeof competition === 'number') {
      if (competition <= 40) return 'text-green-600 bg-green-100';
      if (competition <= 70) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    }
    
    const lower = competition?.toLowerCase() || '';
    if (lower.includes('thấp') || lower.includes('low')) return 'text-green-600 bg-green-100';
    if (lower.includes('trung bình') || lower.includes('medium')) return 'text-yellow-600 bg-yellow-100';
    if (lower.includes('cao') || lower.includes('high')) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-600" />
            <div>
              <Typography.H2 className="text-xl">
                {niche.niche_name || 'Niche Detail'}
              </Typography.H2>
              <Typography.BodySmall className="text-gray-600">
                {t('marketExplorer.nicheAnalysis')}
              </Typography.BodySmall>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <Typography.H3 className="mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              {t('marketExplorer.overview')}
            </Typography.H3>
            <Typography.Body className="text-gray-700 leading-relaxed">
              {niche.description}
            </Typography.Body>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Potential Score */}
            {niche.potential_score && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <Typography.BodySmall className="text-gray-600 mb-1">
                  {t('marketExplorer.potentialScore')}
                </Typography.BodySmall>
                <div className={`inline-block px-3 py-1 rounded-full text-lg font-semibold ${getPotentialScoreColor(niche.potential_score)}`}>
                  {niche.potential_score}/100
                </div>
              </div>
            )}

            {/* Competition Level */}
            {niche.competition_profit_metrics?.competition_level_score && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <Target className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <Typography.BodySmall className="text-gray-600 mb-1">
                  {t('marketExplorer.competition')}
                </Typography.BodySmall>
                <div className={`inline-block px-3 py-1 rounded-full text-lg font-semibold ${getCompetitionColor(niche.competition_profit_metrics.competition_level_score)}`}>
                  {niche.competition_profit_metrics.competition_level_score}/100
                </div>
              </div>
            )}

            {/* Profit Margin */}
            {niche.competition_profit_metrics?.estimated_profit_margin_percent && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <Typography.BodySmall className="text-gray-600 mb-1">
                  {t('marketExplorer.profitMargin')}
                </Typography.BodySmall>
                <div className="text-lg font-semibold text-green-600">
                  {niche.competition_profit_metrics.estimated_profit_margin_percent[0]}% - {niche.competition_profit_metrics.estimated_profit_margin_percent[1]}%
                </div>
              </div>
            )}
          </div>

          {/* Model Suitability */}
          {niche.model_suitability && (
            <div>
              <Typography.H3 className="mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                {t('marketExplorer.modelSuitability')}
              </Typography.H3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {niche.model_suitability.dropshipping_score && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <Typography.Body className="font-semibold text-blue-800 mb-2">
                      Dropshipping
                    </Typography.Body>
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {niche.model_suitability.dropshipping_score}/100
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${niche.model_suitability.dropshipping_score}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {niche.model_suitability.affiliate_score && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <Typography.Body className="font-semibold text-green-800 mb-2">
                      Affiliate
                    </Typography.Body>
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {niche.model_suitability.affiliate_score}/100
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${niche.model_suitability.affiliate_score}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {niche.model_suitability.self_business_score && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <Typography.Body className="font-semibold text-purple-800 mb-2">
                      {t('marketExplorer.businessModel.selfBusiness')}
                    </Typography.Body>
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {niche.model_suitability.self_business_score}/100
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${niche.model_suitability.self_business_score}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              {niche.model_suitability.reason && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <Typography.BodySmall className="text-gray-700">
                    {niche.model_suitability.reason}
                  </Typography.BodySmall>
                </div>
              )}
            </div>
          )}

          {/* Product Ideas */}
          {niche.product_ideas && Array.isArray(niche.product_ideas) && (
            <div>
              <Typography.H3 className="mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                {t('marketExplorer.productIdeas')}
              </Typography.H3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {niche.product_ideas.map((idea: any, ideaIndex: number) => {
                  if (typeof idea === 'string') {
                    return (
                      <div key={ideaIndex} className="bg-white border border-gray-200 rounded-lg p-4">
                        <Typography.Body className="font-medium text-gray-800">
                          {idea}
                        </Typography.Body>
                      </div>
                    );
                  } else {
                    return (
                      <div key={ideaIndex} className="bg-white border border-gray-200 rounded-lg p-4">
                        <Typography.Body className="font-medium text-gray-800 mb-2">
                          {idea.product_name}
                        </Typography.Body>
                        <Typography.BodySmall className="text-gray-600">
                          {idea.insight}
                        </Typography.BodySmall>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}

          {/* Target Customer Segment */}
          {niche.target_customer_segment && (
            <div>
              <Typography.H3 className="mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                {t('marketExplorer.targetSegment')}
              </Typography.H3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <Typography.Body className="text-gray-800">
                  {niche.target_customer_segment}
                </Typography.Body>
              </div>
            </div>
          )}

          {/* Sourcing & Logistics */}
          {niche.sourcing_logistics && (
            <div>
              <Typography.H3 className="mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                {t('marketExplorer.sourcingLogistics')}
              </Typography.H3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <Typography.Body className="text-gray-800">
                  {niche.sourcing_logistics}
                </Typography.Body>
              </div>
            </div>
          )}

          {/* Recommended Channels */}
          {niche.recommended_channels && Array.isArray(niche.recommended_channels) && (
            <div>
              <Typography.H3 className="mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                {t('marketExplorer.recommendedChannels')}
              </Typography.H3>
              <div className="flex flex-wrap gap-2">
                {niche.recommended_channels.map((channel: string, channelIndex: number) => (
                  <span key={channelIndex} className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {channel}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Marketing Strategy */}
          {niche.marketing_strategy && (
            <div>
              <Typography.H3 className="mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                {t('marketExplorer.marketingStrategy')}
              </Typography.H3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                {niche.marketing_strategy.kenh_chinh && (
                  <div>
                    <Typography.Body className="font-semibold text-gray-900 mb-1">
                      {t('marketExplorer.mainChannel')}:
                    </Typography.Body>
                    <Typography.Body className="text-gray-700">
                      {niche.marketing_strategy.kenh_chinh}
                    </Typography.Body>
                  </div>
                )}
                {niche.marketing_strategy.thong_diep_chu_dao && (
                  <div>
                    <Typography.Body className="font-semibold text-gray-900 mb-1">
                      {t('marketExplorer.mainMessage')}:
                    </Typography.Body>
                    <Typography.Body className="text-gray-700">
                      {niche.marketing_strategy.thong_diep_chu_dao}
                    </Typography.Body>
                  </div>
                )}
                {niche.marketing_strategy.loai_noi_dung_hieu_qua && (
                  <div>
                    <Typography.Body className="font-semibold text-gray-900 mb-1">
                      {t('marketExplorer.effectiveContent')}:
                    </Typography.Body>
                    <Typography.Body className="text-gray-700">
                      {niche.marketing_strategy.loai_noi_dung_hieu_qua}
                    </Typography.Body>
                  </div>
                )}
                {niche.marketing_strategy.chien_luoc_gia_uu_dai && (
                  <div>
                    <Typography.Body className="font-semibold text-gray-900 mb-1">
                      {t('marketExplorer.pricingStrategy')}:
                    </Typography.Body>
                    <Typography.Body className="text-gray-700">
                      {niche.marketing_strategy.chien_luoc_gia_uu_dai}
                    </Typography.Body>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Data Source */}
          {niche.competition_profit_metrics?.data_source && (
            <div className="bg-gray-50 rounded-lg p-4">
              <Typography.BodySmall className="text-gray-600">
                <strong>{t('marketExplorer.dataSource')}:</strong> {niche.competition_profit_metrics.data_source}
              </Typography.BodySmall>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NicheDetailModal;
