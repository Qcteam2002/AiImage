import React from 'react';
import { ArrowLeft, Globe, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import Typography from '../design-system/Typography';

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
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            onClick={onBack}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="max-w-2xl">
            <Typography.H1 className="leading-tight truncate">
              {product.title || 'Untitled Product'}
            </Typography.H1>
            <div className="flex items-center space-x-6 mt-3">
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-gray-500" />
                <Typography.BodyMedium className="text-gray-600">
                  {product.target_market}
                </Typography.BodyMedium>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                <Typography.BodyMedium className="text-gray-600">
                  {product.analyzed_at ? new Date(product.analyzed_at).toLocaleDateString('en-US') : 'Not analyzed'}
                </Typography.BodyMedium>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;
