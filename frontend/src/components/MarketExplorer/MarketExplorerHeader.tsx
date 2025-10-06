import React from 'react';
import { ArrowLeft, Download, Share2, MapPin, Calendar, Building2 } from 'lucide-react';
import { Button } from '../ui/Button';
import Typography from '../design-system/Typography';
import Spacing from '../design-system/Spacing';
import { useTranslation } from 'react-i18next';

interface MarketExplorerHeaderProps {
  marketExplorer: {
    id: string;
    target_country: string;
    business_model: string;
    industry_category?: string;
    analyzed_at?: string;
  };
  onBack: () => void;
  onDownload: () => void;
  onShare: () => void;
}

const MarketExplorerHeader: React.FC<MarketExplorerHeaderProps> = ({
  marketExplorer,
  onBack,
  onDownload,
  onShare,
}) => {
  const { t } = useTranslation();

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className={Spacing.section}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Button
            variant="secondary"
            onClick={onBack}
            className="flex items-center self-start"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          <div className="max-w-2xl">
            <Typography.H1 className="leading-tight text-lg sm:text-2xl lg:text-3xl">
              {t('marketExplorer.marketAnalysis')} - {marketExplorer.target_country}
            </Typography.H1>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 mt-3">
              <div className="flex items-center">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" />
                <Typography.BodySmall className="text-gray-600 sm:text-base">
                  {marketExplorer.business_model}
                </Typography.BodySmall>
              </div>
              
              {marketExplorer.industry_category && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" />
                  <Typography.BodySmall className="text-gray-600 sm:text-base">
                    {marketExplorer.industry_category}
                  </Typography.BodySmall>
                </div>
              )}
              
              {marketExplorer.analyzed_at && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" />
                  <Typography.BodySmall className="text-gray-600 sm:text-base">
                    {formatDate(marketExplorer.analyzed_at)}
                  </Typography.BodySmall>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={onDownload}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t('marketExplorer.downloadReport')}
          </Button>
          
          <Button
            variant="secondary"
            onClick={onShare}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            {t('marketExplorer.share')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MarketExplorerHeader;
