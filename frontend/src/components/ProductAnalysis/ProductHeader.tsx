import React from 'react';
import { ArrowLeft, Globe, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import Typography from '../design-system/Typography';
import { useTranslation } from 'react-i18next';

interface ProductHeaderProps {
  product: {
    title?: string;
    target_market?: string;
    analyzed_at?: string;
  };
  onBack: () => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  product,
  onBack
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Button
            variant="secondary"
            onClick={onBack}
            className="flex items-center self-start"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('productAnalysisAff.back')}
          </Button>
          <div className="max-w-2xl">
            <Typography.H1 className="leading-tight text-lg sm:text-2xl lg:text-3xl">
              {product.title || t('productAnalysisAff.noTitle')}
            </Typography.H1>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 mt-3">
              <div className="flex items-center">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" />
                <Typography.BodySmall className="text-gray-600 sm:text-base">
                  {product.target_market || t('productAnalysisAff.noTargetMarket')}
                </Typography.BodySmall>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" />
                <Typography.BodySmall className="text-gray-600 sm:text-base">
                  {product.analyzed_at ? new Date(product.analyzed_at).toLocaleDateString() : t('productAnalysisAff.status.waiting')}
                </Typography.BodySmall>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;
