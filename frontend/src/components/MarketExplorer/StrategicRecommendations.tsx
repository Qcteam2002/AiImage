import React from 'react';
import { Card } from '../ui/Card';
import Typography from '../design-system/Typography';
import Spacing from '../design-system/Spacing';
import { useTranslation } from 'react-i18next';

interface StrategicRecommendationsProps {
  analysisResult: any;
}

const StrategicRecommendations: React.FC<StrategicRecommendationsProps> = ({ analysisResult }) => {
  const { t } = useTranslation();

  const strategicData = analysisResult?.F_strategic_notes_and_tools || analysisResult?.market_analysis?.D?.strategic_notes || analysisResult?.D_LuuYChienLuocVaKhuyenNghiHanhDong || {};

  if (!strategicData || Object.keys(strategicData).length === 0) {
    return null;
  }

  return (
    <Card className={Spacing.section}>
      <div className={Spacing.cardPadding}>
        <Typography.H2 className="mb-6">
          {t('marketExplorer.strategicRecommendations')}
        </Typography.H2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Regulations & Taxes */}
          {strategicData.regulations_taxes && (
            <div>
              <Typography.H3 className="mb-3">
                {t('marketExplorer.regulationsTaxes')}
              </Typography.H3>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300">
                {strategicData.regulations_taxes.summary && (
                  <Typography.BodySmall className="text-gray-600 mb-3">
                    {strategicData.regulations_taxes.summary}
                  </Typography.BodySmall>
                )}
                {strategicData.regulations_taxes.vat_gst_percent && (
                  <div className="flex items-center gap-2">
                    <Typography.BodySmall className="font-medium text-gray-900">
                      {t('marketExplorer.vatGstRate')}:
                    </Typography.BodySmall>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      {strategicData.regulations_taxes.vat_gst_percent}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Gateways */}
          {strategicData.payment_gateways && Array.isArray(strategicData.payment_gateways) && (
            <div>
              <Typography.H3 className="mb-3">
                {t('marketExplorer.paymentGateways')}
              </Typography.H3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex flex-wrap gap-2">
                  {strategicData.payment_gateways.map((gateway: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {gateway}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Logistics Landscape */}
          {strategicData.logistics_landscape && (
            <div>
              <Typography.H3 className="mb-3">
                {t('marketExplorer.logisticsLandscape')}
              </Typography.H3>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300">
                {strategicData.logistics_landscape.avg_delivery_time_days && (
                  <div className="mb-3">
                    <Typography.BodySmall className="font-medium text-gray-900 mb-2">
                      {t('marketExplorer.deliveryTime')}:
                    </Typography.BodySmall>
                    <div className="space-y-1">
                      <Typography.BodySmall className="text-gray-600">
                        {t('marketExplorer.domestic')}: {strategicData.logistics_landscape.avg_delivery_time_days.domestic[0]} - {strategicData.logistics_landscape.avg_delivery_time_days.domestic[1]} ngày
                      </Typography.BodySmall>
                      <Typography.BodySmall className="text-gray-600">
                        {t('marketExplorer.international')}: {strategicData.logistics_landscape.avg_delivery_time_days.international[0]} - {strategicData.logistics_landscape.avg_delivery_time_days.international[1]} ngày
                      </Typography.BodySmall>
                    </div>
                  </div>
                )}
                
                {strategicData.logistics_landscape.top_providers && Array.isArray(strategicData.logistics_landscape.top_providers) && (
                  <div>
                    <Typography.BodySmall className="font-medium text-gray-900 mb-2">
                      {t('marketExplorer.topProviders')}:
                    </Typography.BodySmall>
                    <div className="flex flex-wrap gap-2">
                      {strategicData.logistics_landscape.top_providers.map((provider: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {provider}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cultural Marketing Tips */}
          {strategicData.cultural_marketing_tips && (
            <div>
              <Typography.H3 className="mb-3">
                {t('marketExplorer.culturalMarketingTips')}
              </Typography.H3>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300">
                <Typography.BodySmall className="text-gray-600">{strategicData.cultural_marketing_tips}</Typography.BodySmall>
              </div>
            </div>
          )}
        </div>

        {/* Recommended Tools */}
        {strategicData.recommended_tools && Array.isArray(strategicData.recommended_tools) && (
          <div className="mt-6">
            <Typography.H3 className="mb-3">
              {t('marketExplorer.recommendedTools')}
            </Typography.H3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                {strategicData.recommended_tools.map((toolItem: any, index: number) => {
                  // Handle both string and object formats
                  const toolName = typeof toolItem === 'string' ? toolItem : toolItem.tool;
                  const useCase = typeof toolItem === 'object' ? toolItem.use_case : null;
                  
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></span>
                      <div>
                        <Typography.BodySmall className="text-gray-900 font-medium">
                          {toolName}
                        </Typography.BodySmall>
                        {useCase && (
                          <Typography.BodySmall className="text-gray-600 mt-1">
                            {useCase}
                          </Typography.BodySmall>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Strategic Recommendations Summary */}
        {strategicData.strategic_recommendations_summary && Array.isArray(strategicData.strategic_recommendations_summary) && (
          <div className="mt-6">
            <Typography.H3 className="mb-3">
              {t('marketExplorer.strategicSummary')}
            </Typography.H3>
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300">
              <ul className="space-y-2">
                {strategicData.strategic_recommendations_summary.map((recommendation: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></span>
                    <Typography.BodySmall className="text-gray-600">{recommendation}</Typography.BodySmall>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Chart Data - Priority Matrix */}
        {strategicData.chart_data?.priority_matrix && Array.isArray(strategicData.chart_data.priority_matrix) && (
          <div className="mt-6">
            <Typography.H3 className="mb-3">
              {t('marketExplorer.priorityMatrix')}
            </Typography.H3>
            <div className="space-y-3">
              {strategicData.chart_data.priority_matrix.map((item: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <Typography.Body className="font-semibold mb-2">{item.strategy}</Typography.Body>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Typography.BodySmall className="text-gray-600 mb-1">
                        {t('marketExplorer.impact')}:
                      </Typography.BodySmall>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${item.impact}%` }}
                          ></div>
                        </div>
                        <Typography.BodySmall className="text-gray-600">
                          {item.impact}%
                        </Typography.BodySmall>
                      </div>
                    </div>
                    <div>
                      <Typography.BodySmall className="text-gray-600 mb-1">
                        {t('marketExplorer.feasibility')}:
                      </Typography.BodySmall>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${item.feasibility}%` }}
                          ></div>
                        </div>
                        <Typography.BodySmall className="text-gray-600">
                          {item.feasibility}%
                        </Typography.BodySmall>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StrategicRecommendations;