import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import Typography from '../design-system/Typography';
import Spacing from '../design-system/Spacing';
import { Button } from '../ui/Button';
import { AlertTriangle, Shield, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';

interface RiskAnalysisProps {
  analysisResult: any;
}

const RiskAnalysis: React.FC<RiskAnalysisProps> = ({ analysisResult }) => {
  const { t } = useTranslation();
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);

  const riskData = analysisResult?.E_risk_analysis || analysisResult?.risk_analysis || {};

  if (!riskData || Object.keys(riskData).length === 0) {
    return null;
  }

  const getRiskColor = (score: number) => {
    if (score <= 40) return { color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' };
    if (score <= 70) return { color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' };
    return { color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' };
  };

  const getRiskLevel = (score: number) => {
    if (score <= 40) return t('marketExplorer.lowRisk');
    if (score <= 70) return t('marketExplorer.mediumRisk');
    return t('marketExplorer.highRisk');
  };

  const RiskCard: React.FC<{ risk: any; index: number; type: 'market' | 'operational' }> = ({ risk, index, type }) => {
    const riskColor = getRiskColor(risk.severity_score || 0);
    const riskLevel = getRiskLevel(risk.severity_score || 0);
    const isExpanded = expandedRisk === `${type}-${index}`;

    return (
      <div className={`border rounded-lg overflow-hidden ${riskColor.border}`}>
        <div 
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpandedRisk(isExpanded ? null : `${type}-${index}`)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${riskColor.bg}`}>
                <AlertTriangle className={`w-4 h-4 ${riskColor.color}`} />
              </div>
              <div>
                <Typography.Body className="font-medium">{risk.risk}</Typography.Body>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColor.bg} ${riskColor.color}`}>
                    {riskLevel}
                  </span>
                  <span className="text-sm text-gray-500">
                    {risk.severity_score}/100
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                    risk.severity_score <= 40 ? 'bg-green-500' : 
                    risk.severity_score <= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${risk.severity_score || 0}%` }}
                ></div>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <Typography.BodySmall className="font-medium text-gray-900 mb-2">
                  {t('marketExplorer.mitigationStrategy')}:
                </Typography.BodySmall>
                <Typography.BodySmall className="text-gray-700">
                  {risk.mitigation}
                </Typography.BodySmall>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={Spacing.section}>
      <div className={Spacing.cardPadding}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <Typography.H2>{t('marketExplorer.riskAnalysis')}</Typography.H2>
        </div>

        {/* Market Risks */}
        {riskData.market_risks && Array.isArray(riskData.market_risks) && riskData.market_risks.length > 0 && (
          <div className="mb-8">
            <Typography.H3 className="mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              {t('marketExplorer.marketRisks')}
            </Typography.H3>
            <div className="space-y-3">
              {riskData.market_risks.map((risk: any, index: number) => (
                <RiskCard key={index} risk={risk} index={index} type="market" />
              ))}
            </div>
          </div>
        )}

        {/* Operational Risks */}
        {riskData.operational_risks && Array.isArray(riskData.operational_risks) && riskData.operational_risks.length > 0 && (
          <div>
            <Typography.H3 className="mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-purple-600" />
              {t('marketExplorer.operationalRisks')}
            </Typography.H3>
            <div className="space-y-3">
              {riskData.operational_risks.map((risk: any, index: number) => (
                <RiskCard key={index} risk={risk} index={index} type="operational" />
              ))}
            </div>
          </div>
        )}

        {/* Risk Summary */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <Typography.H4 className="text-blue-900 mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t('marketExplorer.riskManagementTip')}
          </Typography.H4>
          <Typography.BodySmall className="text-blue-800">
            {t('marketExplorer.riskManagementDescription')}
          </Typography.BodySmall>
        </div>
      </div>
    </Card>
  );
};

export default RiskAnalysis;
