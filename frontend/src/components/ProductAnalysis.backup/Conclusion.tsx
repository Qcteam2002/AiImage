import React from 'react';
import { Card } from '../ui/Card';
import Typography from '../design-system/Typography';
import Spacing from '../design-system/Spacing';
import { Target, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

interface ConclusionProps {
  analysisResult: any;
}

const Conclusion: React.FC<ConclusionProps> = ({ analysisResult }) => {
  if (!analysisResult?.conclusions || !Array.isArray(analysisResult.conclusions)) {
    return (
      <Card className={Spacing.section}>
        <div className={Spacing.cardPadding}>
          <Typography.H2 className="mb-6 flex items-center">
            <Target className="w-6 h-6 mr-3 text-blue-600" />
            Kết Luận & Khuyến Nghị
          </Typography.H2>
          <div className="text-center text-gray-500">
            <p>Conclusion data not available</p>
          </div>
        </div>
      </Card>
    );
  }

  const conclusions = analysisResult.conclusions;

  return (
    <Card className={Spacing.section}>
      <div className={Spacing.cardPadding}>
        <Typography.H2 className="mb-8 flex items-center">
          <Target className="w-6 h-6 mr-3 text-blue-600" />
          Kết Luận & Khuyến Nghị
        </Typography.H2>

        <div className="space-y-8">
          {conclusions.map((conclusion: any, index: number) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <Typography.H4 className="mb-6 text-gray-900">
                {conclusion.title || `Chiến lược ${index + 1}`}
              </Typography.H4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Focus Group Priority */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Target className="w-4 h-4 mr-2 text-blue-600" />
                    <Typography.H6 className="text-blue-900 text-sm">Nhóm Khách Hàng Ưu Tiên</Typography.H6>
                  </div>
                  <Typography.BodySmall className="text-blue-800">
                    {conclusion.focus_group_priority || 'N/A'}
                  </Typography.BodySmall>
                </div>

                {/* Best Content Angle */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                    <Typography.H6 className="text-green-900 text-sm">Góc Nội Dung Tốt Nhất</Typography.H6>
                  </div>
                  <Typography.BodySmall className="text-green-800">
                    {conclusion.best_content_angle || 'N/A'}
                  </Typography.BodySmall>
                </div>

                {/* Upsell Combo Suggestions */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Lightbulb className="w-4 h-4 mr-2 text-purple-600" />
                    <Typography.H6 className="text-purple-900 text-sm">Gợi Ý Upsell/Combo</Typography.H6>
                  </div>
                  <Typography.BodySmall className="text-purple-800">
                    {conclusion.upsell_combo_suggestions || 'N/A'}
                  </Typography.BodySmall>
                </div>

                {/* Risks to Consider */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                    <Typography.H6 className="text-orange-900 text-sm">Rủi Ro Cần Lưu Ý</Typography.H6>
                  </div>
                  <Typography.BodySmall className="text-orange-800">
                    {conclusion.risks_to_consider || 'N/A'}
                  </Typography.BodySmall>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default Conclusion;
