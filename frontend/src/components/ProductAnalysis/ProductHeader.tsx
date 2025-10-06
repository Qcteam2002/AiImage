import React from 'react';
import { ArrowLeft, Globe, Calendar, Sparkles } from 'lucide-react';
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
  onOptimize?: () => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  product,
  onBack,
  onOptimize
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        {/* Left side - Back button and Product info */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <Button
            variant="secondary"
            onClick={onBack}
            className="flex items-center self-start"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('productAnalysisAff.back')}
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-base font-medium text-gray-900 truncate" title={product.title || t('productAnalysisAff.noTitle')}>
              {product.title || t('productAnalysisAff.noTitle')}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1">
              <div className="flex items-center">
                <Globe className="w-3 h-3 mr-1.5 text-gray-500" />
                <span className="text-xs text-gray-600 truncate">
                  {product.target_market || t('productAnalysisAff.noTargetMarket')}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1.5 text-gray-500" />
                <span className="text-xs text-gray-600">
                  {product.analyzed_at ? new Date(product.analyzed_at).toLocaleDateString() : t('productAnalysisAff.status.waiting')}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Optimize button */}
        {onOptimize && (
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={onOptimize}
              className="flex items-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t('productAnalysisAff.optimizer.newTitle')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductHeader;
