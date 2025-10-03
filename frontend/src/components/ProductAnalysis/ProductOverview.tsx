import React from 'react';
import { Card } from '../ui/Card';
import Typography from '../design-system/Typography';
import Spacing from '../design-system/Spacing';

interface ProductOverviewProps {
  product: {
    image1?: string;
    image2?: string;
    description?: string;
  };
  analysisResult: {
    market_and_keywords: {
      market_size_usd: number;
      cagr_percent: number;
      google_trends_change_percent: number;
    };
  };
}

const ProductOverview: React.FC<ProductOverviewProps> = ({ product, analysisResult }) => {
  return (
    <Card className={Spacing.section}>
      <div className={Spacing.cardPadding}>
        <div className="flex items-start space-x-6">
          {/* Product Images */}
          <div className="flex-shrink-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={product.image1} 
                  alt="Product" 
                  className="w-full h-full object-cover"
                />
              </div>
              {product.image2 && (
                <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={product.image2} 
                    alt="Product" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="flex-1 min-w-0 flex items-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              <div className="text-center">
                <Typography.Label className="mb-3 block">Market Size</Typography.Label>
                <Typography.Metric className="block">
                  ${analysisResult.market_and_keywords.market_size_usd.toLocaleString()}
                </Typography.Metric>
              </div>
              <div className="text-center">
                <Typography.Label className="mb-3 block">Growth Rate</Typography.Label>
                <Typography.Metric className="block">
                  {analysisResult.market_and_keywords.cagr_percent}%
                </Typography.Metric>
              </div>
              <div className="text-center">
                <Typography.Label className="mb-3 block">Trend Change</Typography.Label>
                <Typography.Metric className="block">
                  {analysisResult.market_and_keywords.google_trends_change_percent}%
                </Typography.Metric>
              </div>
            </div>
            
            {product.description && (
              <div className="mt-8">
                <Typography.Label className="mb-3 block">Description</Typography.Label>
                <Typography.BodyMedium>{product.description}</Typography.BodyMedium>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductOverview;
