import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Card } from '../ui/Card';
import Typography from '../design-system/Typography';
import Spacing from '../design-system/Spacing';

interface ExecutiveSummaryProps {
  analysisResult: {
    executive_summary: {
      recommendation: string;
      biggest_opportunity: string;
      biggest_risk: string;
      key_points: string[];
    };
  };
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ analysisResult }) => {
  return (
    <Card className={Spacing.section}>
      <div className={Spacing.cardPadding}>
        <Typography.H2 className="mb-8 flex items-center">
          <BarChart3 className="w-7 h-7 mr-4 text-blue-600" />
          Executive Summary
        </Typography.H2>
        
        <div className={Spacing.stack}>
          <div>
            <Typography.Label className="mb-4 block">Recommendation</Typography.Label>
            <Typography.Body>{analysisResult.executive_summary.recommendation}</Typography.Body>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Typography.Label className="mb-4 block">Biggest Opportunity</Typography.Label>
              <Typography.BodyMedium>{analysisResult.executive_summary.biggest_opportunity}</Typography.BodyMedium>
            </div>
            <div>
              <Typography.Label className="mb-4 block">Biggest Risk</Typography.Label>
              <Typography.BodyMedium>{analysisResult.executive_summary.biggest_risk}</Typography.BodyMedium>
            </div>
          </div>
          
          <div>
            <Typography.Label className="mb-4 block">Key Points</Typography.Label>
            <ul className={Spacing.elementSmall}>
              {analysisResult.executive_summary.key_points.map((point, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-3 h-3 bg-blue-600 rounded-full mt-2 mr-4"></div>
                  <Typography.BodyMedium>{point}</Typography.BodyMedium>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExecutiveSummary;
