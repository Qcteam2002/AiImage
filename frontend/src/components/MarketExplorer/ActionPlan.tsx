import React from 'react';
import { Card } from '../ui/Card';
import Typography from '../design-system/Typography';
import Spacing from '../design-system/Spacing';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Target, Wrench, Rocket, BarChart3, Trophy, Settings } from 'lucide-react';

interface ActionPlanProps {
  analysisResult: any;
}

const ActionPlan: React.FC<ActionPlanProps> = ({ analysisResult }) => {
  const { t } = useTranslation();

  const actionPlan = analysisResult?.market_analysis?.E?.action_plan || analysisResult?.E_LoTrinhHanhDong5Buoc || {};

  if (!actionPlan || Object.keys(actionPlan).length === 0) {
    return null;
  }

  const getStepIcon = (stepNumber: number) => {
    const icons = [CheckCircle, Target, Wrench, Rocket, BarChart3];
    return icons[stepNumber - 1] || CheckCircle;
  };

  const steps = [
    { key: 'buoc_1_validate_niche_product', number: 1, title: t('marketExplorer.step1Validate') },
    { key: 'buoc_2_define_your_angle', number: 2, title: t('marketExplorer.step2Define') },
    { key: 'buoc_3_build_minimum_viable_channel', number: 3, title: t('marketExplorer.step3Build') },
    { key: 'buoc_4_launch_test_campaign', number: 4, title: t('marketExplorer.step4Launch') },
    { key: 'buoc_5_analyze_iterate', number: 5, title: t('marketExplorer.step5Analyze') }
  ];

  return (
    <Card className={Spacing.section}>
      <div className={Spacing.cardPadding}>
        <Typography.H2 className="mb-6">
          {t('marketExplorer.actionPlan')}
        </Typography.H2>

        {/* 5-Step Action Plan */}
        <div className="space-y-6">
          {steps.map((step) => {
            const stepData = actionPlan[step.key];
            if (!stepData) return null;

            const Icon = getStepIcon(step.number);

            return (
              <div key={step.key} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-medium text-gray-500">Bước {step.number}</span>
                      <Typography.H3>{step.title}</Typography.H3>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Action */}
                      {stepData.action && (
                        <div>
                          <Typography.Body className="font-semibold mb-2">{t('marketExplorer.action')}</Typography.Body>
                          <Typography.BodySmall className="text-gray-600 bg-gray-50 rounded-lg p-3">
                            {stepData.action}
                          </Typography.BodySmall>
                        </div>
                      )}
                      
                      {/* Target */}
                      {stepData.target && (
                        <div>
                          <Typography.Body className="font-semibold mb-2">{t('marketExplorer.target')}</Typography.Body>
                          <Typography.BodySmall className="text-gray-600 bg-gray-50 rounded-lg p-3">
                            {stepData.target}
                          </Typography.BodySmall>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expected Outcome */}
        {actionPlan.expected_outcome && (
          <div className="mt-6">
            <Typography.H3 className="mb-3">
              {t('marketExplorer.expectedOutcome')}
            </Typography.H3>
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300">
              <Typography.BodySmall className="text-gray-600">{actionPlan.expected_outcome}</Typography.BodySmall>
            </div>
          </div>
        )}

        {/* Tools or KPIs */}
        {actionPlan.tools_or_kpis && (
          <div className="mt-6">
            <Typography.H3 className="mb-3">
              {t('marketExplorer.toolsOrKPIs')}
            </Typography.H3>
            <div className="bg-gray-50 rounded-lg p-4">
              <Typography.BodySmall className="text-gray-600">{actionPlan.tools_or_kpis}</Typography.BodySmall>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ActionPlan;