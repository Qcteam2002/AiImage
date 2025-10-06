import React, { useState } from 'react';
import { X, Users, TrendingUp, Target, MapPin, Clock, DollarSign, ChevronDown, ChevronUp, Smartphone, Monitor, BarChart3 } from 'lucide-react';
import Typography from '../design-system/Typography';
import Spacing from '../design-system/Spacing';
import { useTranslation } from 'react-i18next';

interface CustomerSegmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  segment: any;
  segmentIndex: number;
  targetCountry?: string;
}

const CustomerSegmentDetailModal: React.FC<CustomerSegmentDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  segment, 
  segmentIndex,
  targetCountry 
}) => {
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  if (!isOpen || !segment) return null;

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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <Typography.H3 className="mb-2 text-gray-900">
                {segment.segment_name || `Customer Segment ${segmentIndex + 1}`}
              </Typography.H3>
              <div className="flex items-center space-x-3">
                {segment.segment_size_percent && (
                  <div className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded text-sm font-medium">
                    {segment.segment_size_percent}% {t('marketExplorer.segmentSize')}
                  </div>
                )}
                {segment.confidence_score && (
                  <div className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded text-sm font-medium">
                    {(segment.confidence_score * 100).toFixed(0)}% {t('marketExplorer.confidence')}
                  </div>
                )}
                {segment.priority_rank && (
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                    #{segment.priority_rank} {t('marketExplorer.priority')}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {segment.demographics?.age_range && (
              <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
                <Typography.LabelSmall className="mb-1 text-gray-500">{t('marketExplorer.ageRange')}</Typography.LabelSmall>
                <Typography.BodyMedium className="font-semibold text-gray-900">
                  {segment.demographics.age_range[0]} - {segment.demographics.age_range[1]} tuổi
                </Typography.BodyMedium>
              </div>
            )}
            {segment.demographics?.gender_ratio && (
              <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
                <Typography.LabelSmall className="mb-1 text-gray-500">{t('marketExplorer.genderDistribution')}</Typography.LabelSmall>
                <Typography.BodyMedium className="font-semibold text-gray-900">
                  {segment.demographics.gender_ratio.female}%F / {segment.demographics.gender_ratio.male}%M
                </Typography.BodyMedium>
              </div>
            )}
            {segment.purchasing_power?.aov_usd && (
              <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
                <Typography.LabelSmall className="mb-1 text-gray-500">{t('marketExplorer.avgOrderValue')}</Typography.LabelSmall>
                <Typography.BodyMedium className="font-semibold text-gray-900">
                  {formatCurrency(segment.purchasing_power.aov_usd[0], targetCountry)} - {formatCurrency(segment.purchasing_power.aov_usd[1], targetCountry)}
                </Typography.BodyMedium>
              </div>
            )}
            {segment.purchasing_power?.purchase_frequency_per_month && (
              <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
                <Typography.LabelSmall className="mb-1 text-gray-500">{t('marketExplorer.purchaseFrequency')}</Typography.LabelSmall>
                <Typography.BodyMedium className="font-semibold text-gray-900">
                  {segment.purchasing_power.purchase_frequency_per_month} lần/tháng
                </Typography.BodyMedium>
              </div>
            )}
          </div>

          {/* Demographics */}
          {segment.demographics && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <Typography.H4 className="mb-4 flex items-center text-gray-900">
                <Users className="w-5 h-5 mr-2 text-gray-600" />
                {t('marketExplorer.demographics')}
              </Typography.H4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {segment.demographics.avg_income_usd_per_month && (
                  <div className="border-l-2 border-gray-200 pl-4">
                    <Typography.LabelSmall className="mb-2 text-gray-500">{t('marketExplorer.avgIncome')}</Typography.LabelSmall>
                    <Typography.BodySmall className="text-gray-700">
                      {formatCurrency(segment.demographics.avg_income_usd_per_month, targetCountry)}/tháng
                    </Typography.BodySmall>
                  </div>
                )}
                {segment.demographics.location_distribution && (
                  <div className="border-l-2 border-gray-200 pl-4">
                    <Typography.LabelSmall className="mb-2 text-gray-500">{t('marketExplorer.locationDistribution')}</Typography.LabelSmall>
                    <div className="flex flex-wrap gap-2">
                      {segment.demographics.location_distribution.map((location: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded text-sm">
                          {location}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Psychographics */}
          {segment.psychographics && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <Typography.H4 className="mb-4 flex items-center text-gray-900">
                <Target className="w-5 h-5 mr-2 text-gray-600" />
                {t('marketExplorer.psychographics')}
              </Typography.H4>
              <div className="space-y-4">
                {segment.psychographics.values && (
                  <div>
                    <Typography.LabelSmall className="mb-2 text-gray-500">{t('marketExplorer.values')}</Typography.LabelSmall>
                    <div className="flex flex-wrap gap-2">
                      {segment.psychographics.values.map((value: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {segment.psychographics.motivations && (
                  <div>
                    <Typography.LabelSmall className="mb-2 text-gray-500">{t('marketExplorer.motivations')}</Typography.LabelSmall>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {segment.psychographics.motivations.map((motivation: string, index: number) => (
                        <li key={index} className="text-sm text-gray-600 leading-relaxed">
                          {motivation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {segment.psychographics.pain_points && (
                  <div>
                    <Typography.LabelSmall className="mb-2 text-gray-500">{t('marketExplorer.painPoints')}</Typography.LabelSmall>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {segment.psychographics.pain_points.map((pain: string, index: number) => (
                        <li key={index} className="text-sm text-gray-600 leading-relaxed">
                          {pain}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Online Behavior */}
          {segment.online_behavior && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <Typography.H4 className="mb-4 flex items-center text-gray-900">
                <Clock className="w-5 h-5 mr-2 text-gray-600" />
                {t('marketExplorer.onlineBehavior')}
              </Typography.H4>
              <div className="space-y-4">
                {segment.online_behavior.main_channels && (
                  <div>
                    <Typography.LabelSmall className="mb-2 text-gray-500">{t('marketExplorer.mainChannels')}</Typography.LabelSmall>
                    <div className="flex flex-wrap gap-2">
                      {segment.online_behavior.main_channels.map((channel: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {segment.online_behavior.purchase_influencers && (
                  <div>
                    <Typography.LabelSmall className="mb-2 text-gray-500">{t('marketExplorer.purchaseInfluencers')}</Typography.LabelSmall>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {segment.online_behavior.purchase_influencers.map((influencer: string, index: number) => (
                        <li key={index} className="text-sm text-gray-600 leading-relaxed">
                          {influencer}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {segment.online_behavior.device_usage && (
                  <div>
                    <Typography.LabelSmall className="mb-2 text-gray-500">{t('marketExplorer.deviceUsage')}</Typography.LabelSmall>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-gray-600" />
                        <Typography.BodySmall className="text-gray-700 font-medium">
                          Mobile: {segment.online_behavior.device_usage.mobile_percent}%
                        </Typography.BodySmall>
                      </div>
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-gray-600" />
                        <Typography.BodySmall className="text-gray-700 font-medium">
                          Desktop: {segment.online_behavior.device_usage.desktop_percent}%
                        </Typography.BodySmall>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer Journey */}
          {segment.customer_journey && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <Typography.H4 className="mb-4 flex items-center text-gray-900">
                <MapPin className="w-5 h-5 mr-2 text-gray-600" />
                {t('marketExplorer.customerJourney')}
              </Typography.H4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(segment.customer_journey).map(([stage, description]: [string, any]) => (
                  <div key={stage} className="bg-gray-50 rounded-lg p-4">
                    <Typography.BodySmall className="font-medium text-gray-900 mb-2 capitalize">
                      {stage === 'awareness' && t('marketExplorer.awareness')}
                      {stage === 'consideration' && t('marketExplorer.consideration')}
                      {stage === 'conversion' && t('marketExplorer.conversion')}
                      {stage === 'retention' && t('marketExplorer.retention')}
                    </Typography.BodySmall>
                    <Typography.BodySmall className="text-gray-600">
                      {description}
                    </Typography.BodySmall>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Marketing Strategy */}
          {segment.marketing_strategy && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <Typography.H4 className="mb-4 flex items-center text-gray-900">
                <TrendingUp className="w-5 h-5 mr-2 text-gray-600" />
                {t('marketExplorer.marketingStrategy')}
              </Typography.H4>
              <div className="space-y-4">
                {segment.marketing_strategy.core_message && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                    <Typography.LabelSmall className="mb-1 text-blue-900 font-medium">
                      {t('marketExplorer.coreMessage')}:
                    </Typography.LabelSmall>
                    <Typography.BodySmall className="text-blue-800">
                      {segment.marketing_strategy.core_message}
                    </Typography.BodySmall>
                  </div>
                )}
                {segment.marketing_strategy.effective_channels && (
                  <div>
                    <Typography.LabelSmall className="mb-2 text-gray-500">{t('marketExplorer.effectiveChannels')}</Typography.LabelSmall>
                    <div className="flex flex-wrap gap-2">
                      {segment.marketing_strategy.effective_channels.map((channel: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {segment.marketing_strategy.content_examples && (
                  <div>
                    <Typography.LabelSmall className="mb-2 text-gray-500">{t('marketExplorer.contentExamples')}</Typography.LabelSmall>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {segment.marketing_strategy.content_examples.map((example: string, index: number) => (
                        <li key={index} className="text-sm text-gray-600 leading-relaxed">
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chart Data */}
          {segment.chart_data && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <Typography.H4 className="mb-4 flex items-center text-gray-900">
                <BarChart3 className="w-5 h-5 mr-2 text-gray-600" />
                {t('marketExplorer.analytics')}
              </Typography.H4>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Channel Usage */}
                {segment.chart_data.channel_usage && (
                  <div>
                    <Typography.LabelSmall className="mb-3 text-gray-500">{t('marketExplorer.channelUsage')}</Typography.LabelSmall>
                    <div className="space-y-2">
                      {segment.chart_data.channel_usage.map((channel: any, index: number) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <Typography.BodySmall className="font-medium">{channel.platform}</Typography.BodySmall>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${channel.percent}%` }}
                              ></div>
                            </div>
                            <Typography.BodySmall className="text-gray-600 w-12 text-right">
                              {channel.percent}%
                            </Typography.BodySmall>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spending Pattern */}
                {segment.chart_data.spending_pattern && (
                  <div>
                    <Typography.LabelSmall className="mb-3 text-gray-500">{t('marketExplorer.spendingPattern')}</Typography.LabelSmall>
                    <div className="space-y-2">
                      {segment.chart_data.spending_pattern.map((category: any, index: number) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <Typography.BodySmall className="font-medium">{category.category}</Typography.BodySmall>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${category.share_percent}%` }}
                              ></div>
                            </div>
                            <Typography.BodySmall className="text-gray-600 w-12 text-right">
                              {category.share_percent}%
                            </Typography.BodySmall>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Related Niches */}
          {segment.related_niches && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <Typography.H4 className="mb-4 text-gray-900">
                {t('marketExplorer.relatedNiches')}
              </Typography.H4>
              <div className="flex flex-wrap gap-2">
                {segment.related_niches.map((niche: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {niche}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Data Source */}
          {segment.data_source && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <Typography.BodySmall className="text-gray-500 text-xs">
                {t('marketExplorer.dataSource')}: {segment.data_source}
              </Typography.BodySmall>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 -mx-6 -mb-6 rounded-b-xl">
          <div className="flex justify-between items-center">
            <Typography.BodySmall className="text-gray-500">
              💡 {t('marketExplorer.useThisInformation')}
            </Typography.BodySmall>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              {t('marketExplorer.gotIt')}, {t('marketExplorer.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSegmentDetailModal;
