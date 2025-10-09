import React, { useState } from 'react';
import { Card } from '../ui/Card';
import Typography from '../design-system/Typography';
import Spacing from '../design-system/Spacing';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CustomerSegmentDetailModal from './CustomerSegmentDetailModal';

interface CustomerSegmentsProps {
  analysisResult: any;
}

const CustomerSegments: React.FC<CustomerSegmentsProps> = ({ analysisResult }) => {
  const { t } = useTranslation();
  const [selectedSegment, setSelectedSegment] = useState<any>(null);
  const [showSegmentModal, setShowSegmentModal] = useState(false);

  const segments = analysisResult?.C_customer_segments || analysisResult?.market_analysis?.B?.potential_customer_segments || analysisResult?.B_PhanTichKhachHangTiemNang || [];

  if (!segments || !Array.isArray(segments) || segments.length === 0) {
    return null;
  }

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

  // Prepare chart data
  const chartData = segments.map((segment: any, index: number) => ({
    name: segment.segment_name,
    value: segment.segment_size_percent || 0
  }));

  return (
    <Card className={Spacing.section}>
      <div className={Spacing.cardPadding}>
        <Typography.H2 className="mb-6 flex items-center">
          <Users className="w-6 h-6 mr-3 text-blue-600" />
          {t('marketExplorer.customerSegments')}
        </Typography.H2>
        
        {/* Market Share Distribution Chart */}
        <div className="mb-8">
          <Typography.H3 className="mb-4">{t('marketExplorer.segmentSize')} Distribution</Typography.H3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Market Share']} />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Groups */}
        <div>
          <Typography.H3 className="mb-4">{t('marketExplorer.customerGroups')}</Typography.H3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.map((segment: any, index: number) => (
              <div key={index} className="border border-gray-200 p-4 rounded-lg flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <Typography.H4 className="flex-1 mr-2">
                    {segment.segment_name}
                  </Typography.H4>
                  <span className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded text-sm font-medium">
                    {segment.segment_size_percent || 0}%
                  </span>
                </div>
                
                <div className={`${Spacing.elementSmall} text-sm flex-grow`}>
                  {segment.demographics?.age_range && (
                    <Typography.BodySmall>
                      <span className="font-medium">{t('marketExplorer.ageRange')}:</span> {segment.demographics.age_range[0]} - {segment.demographics.age_range[1]} tuổi
                    </Typography.BodySmall>
                  )}
                  {segment.demographics?.gender_ratio && (
                    <Typography.BodySmall>
                      <span className="font-medium">{t('marketExplorer.genderDistribution')}:</span> {segment.demographics.gender_ratio.female}%F / {segment.demographics.gender_ratio.male}%M
                    </Typography.BodySmall>
                  )}
                  {segment.purchasing_power?.aov_usd && (
                    <Typography.BodySmall>
                      <span className="font-medium">{t('marketExplorer.avgOrderValue')}:</span> {formatCurrency(segment.purchasing_power.aov_usd[0], analysisResult?.target_country)} - {formatCurrency(segment.purchasing_power.aov_usd[1], analysisResult?.target_country)}
                    </Typography.BodySmall>
                  )}
                  {segment.purchasing_power?.purchase_frequency_per_month && (
                    <Typography.BodySmall>
                      <span className="font-medium">{t('marketExplorer.purchaseFrequency')}:</span> {segment.purchasing_power.purchase_frequency_per_month} lần/tháng
                    </Typography.BodySmall>
                  )}
                  {segment.confidence_score && (
                    <Typography.BodySmall>
                      <span className="font-medium">{t('marketExplorer.confidence')}:</span> {(segment.confidence_score * 100).toFixed(0)}%
                    </Typography.BodySmall>
                  )}
                </div>
                
                <div className="mt-3 mb-4">
                  <Typography.H6 className="mb-1">{t('marketExplorer.mainChannels')}</Typography.H6>
                  <div className="flex flex-wrap gap-1">
                    {segment.online_behavior?.main_channels?.slice(0, 3).map((channel: string, channelIndex: number) => (
                      <Typography.Badge key={channelIndex} variant="default" className="text-xs">
                        {channel}
                      </Typography.Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-auto">
                  <button
                    onClick={() => {
                      setSelectedSegment(segment);
                      setShowSegmentModal(true);
                    }}
                    className="w-full text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 px-3 py-2 rounded-md transition-colors"
                  >
                    {t('marketExplorer.viewDetail')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Segment Detail Modal */}
        <CustomerSegmentDetailModal
          isOpen={showSegmentModal}
          onClose={() => {
            setShowSegmentModal(false);
            setSelectedSegment(null);
          }}
          segment={selectedSegment}
          segmentIndex={selectedSegment ? segments.indexOf(selectedSegment) : 0}
          targetCountry={analysisResult?.target_country}
        />
      </div>
    </Card>
  );
};

export default CustomerSegments;