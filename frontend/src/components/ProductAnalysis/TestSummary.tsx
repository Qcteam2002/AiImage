import React, { useState } from 'react';
import { TestTube, Target, TrendingUp, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import Typography from '../design-system/Typography';
import Spacing from '../design-system/Spacing';

interface TestSummaryProps {
  analysisResult: {
    executive_summary?: {
      // New structure (object)
      recommendation?: {
        decision?: string;
        reason?: string;
        conditions?: string[];
        kpi_thresholds?: {
          gross_margin_min_pct?: string;
          cpa_max?: string;
          break_even_orders_per_month_max?: string;
        };
        confidence?: string;
      } | string; // Fallback to old structure (string)
      key_points?: Array<{
        title?: string;
        detail?: string;
        evidence?: string;
        impact?: string;
      }> | string[]; // Fallback to old structure (string array)
      biggest_opportunity?: {
        description?: string;
        win_rate_pct?: string;
        validation_metrics?: {
          search_volume?: string;
          ctr?: string;
          cr?: string;
          cpc?: string;
        };
        source?: string;
        action_plan?: string[];
      } | string; // Fallback to old structure (string)
      biggest_risk?: {
        description?: string;
        probability_pct?: string;
        impact?: string;
        early_signals?: string[];
        evidence?: {
          metric?: string;
          value?: string;
          source?: string;
        };
        mitigations?: string[];
      } | string; // Fallback to old structure (string)
    };
  };
}

const TestSummary: React.FC<TestSummaryProps> = ({ analysisResult }) => {
  const executiveSummary = analysisResult.executive_summary;
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  if (!executiveSummary) {
    return null;
  }

  // Check if we have new structure or old structure
  const isNewStructure = typeof executiveSummary.recommendation === 'object';

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };
  
  const getDecisionIcon = (decision?: string) => {
    if (!decision) return <Target className="w-5 h-5 text-gray-400" />;
    
    if (decision.includes('Nên')) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (decision.includes('Không nên')) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    } else {
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getDecisionColor = (decision?: string) => {
    if (!decision) return 'text-gray-600';
    
    if (decision.includes('Nên')) {
      return 'text-green-700';
    } else if (decision.includes('Không nên')) {
      return 'text-red-700';
    } else {
      return 'text-yellow-700';
    }
  };

  // Function to format text with bullet points
  const formatTextWithBullets = (text: string) => {
    if (!text) return text;
    
    // Split by common bullet point patterns and format
    return text
      .split(/\n/)
      .map((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
          return `• ${trimmedLine.substring(1).trim()}`;
        }
        if (trimmedLine.match(/^\d+\./)) {
          return trimmedLine;
        }
        if (trimmedLine.length > 0) {
          return `• ${trimmedLine}`;
        }
        return trimmedLine;
      })
      .join('\n');
  };

  // Compact Summary Component
  const CompactSummary = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <Typography.H3 className="mb-6 flex items-center text-gray-900">
        <TestTube className="w-6 h-6 mr-3 text-gray-600" />
        Test Summary
      </Typography.H3>

      {/* Recommendation - Always Visible */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <Typography.H4 className="text-gray-900">Recommendation</Typography.H4>
          <button
            onClick={() => toggleSection('recommendation')}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
            {expandedSections.has('recommendation') ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          {isNewStructure && typeof executiveSummary.recommendation === 'object' ? (
            <div className="flex items-center space-x-4">
              {getDecisionIcon(executiveSummary.recommendation.decision)}
              <div className="flex-1">
                <Typography.H5 className={getDecisionColor(executiveSummary.recommendation.decision)}>
                  {executiveSummary.recommendation.decision || 'N/A'}
                </Typography.H5>
                {executiveSummary.recommendation.confidence && (
                  <span className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded text-sm font-medium">
                    {executiveSummary.recommendation.confidence} confidence
                  </span>
                )}
              </div>
            </div>
          ) : (
            <Typography.Body className="text-gray-700">
              {typeof executiveSummary.recommendation === 'string' 
                ? executiveSummary.recommendation.substring(0, 100) + (executiveSummary.recommendation.length > 100 ? '...' : '')
                : 'N/A'
              }
            </Typography.Body>
          )}
        </div>

        {/* Expanded Details */}
        {expandedSections.has('recommendation') && (
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            {isNewStructure && typeof executiveSummary.recommendation === 'object' ? (
              <div className="space-y-4">
                {executiveSummary.recommendation.reason && (
                  <div>
                    <Typography.LabelSmall className="text-gray-600 mb-2">Reason</Typography.LabelSmall>
                    <Typography.BodySmall className="text-gray-700 whitespace-pre-line">
                      {formatTextWithBullets(executiveSummary.recommendation.reason)}
                    </Typography.BodySmall>
                  </div>
                )}
                
                {executiveSummary.recommendation.kpi_thresholds && (
                  <div>
                    <Typography.LabelSmall className="text-gray-600 mb-2">KPI Thresholds</Typography.LabelSmall>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-white border border-gray-200 rounded p-2">
                        <Typography.LabelSmall className="text-gray-500">Gross Margin Min</Typography.LabelSmall>
                        <Typography.BodySmall className="font-semibold">
                          {executiveSummary.recommendation.kpi_thresholds.gross_margin_min_pct || 'N/A'}%
                        </Typography.BodySmall>
                      </div>
                      <div className="bg-white border border-gray-200 rounded p-2">
                        <Typography.LabelSmall className="text-gray-500">CPA Max</Typography.LabelSmall>
                        <Typography.BodySmall className="font-semibold">
                          ${executiveSummary.recommendation.kpi_thresholds.cpa_max || 'N/A'}
                        </Typography.BodySmall>
                      </div>
                      <div className="bg-white border border-gray-200 rounded p-2">
                        <Typography.LabelSmall className="text-gray-500">Break Even Orders</Typography.LabelSmall>
                        <Typography.BodySmall className="font-semibold">
                          {executiveSummary.recommendation.kpi_thresholds.break_even_orders_per_month_max || 'N/A'}/month
                        </Typography.BodySmall>
                      </div>
                    </div>
                  </div>
                )}

                {executiveSummary.recommendation.conditions && executiveSummary.recommendation.conditions.length > 0 && (
                  <div>
                    <Typography.LabelSmall className="text-gray-600 mb-2">Conditions</Typography.LabelSmall>
                    <ul className="space-y-1">
                      {executiveSummary.recommendation.conditions.map((condition, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-gray-400 mt-1">•</span>
                          <Typography.BodySmall className="text-gray-700">{condition}</Typography.BodySmall>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <Typography.Body className="text-gray-700 whitespace-pre-line">
                {formatTextWithBullets(typeof executiveSummary.recommendation === 'string' ? executiveSummary.recommendation : 'N/A')}
              </Typography.Body>
            )}
          </div>
        )}
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Biggest Opportunity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Typography.H4 className="text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Biggest Opportunity
            </Typography.H4>
            <button
              onClick={() => toggleSection('opportunity')}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
              {expandedSections.has('opportunity') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            {isNewStructure && typeof executiveSummary.biggest_opportunity === 'object' ? (
              <div>
                <Typography.Body className="text-gray-800 mb-2">
                  {executiveSummary.biggest_opportunity.description?.substring(0, 80) + '...' || 'N/A'}
                </Typography.Body>
                {executiveSummary.biggest_opportunity.win_rate_pct && (
                  <span className="px-2 py-1 bg-green-100 border border-green-200 text-green-700 rounded text-sm font-medium">
                    Win Rate: {executiveSummary.biggest_opportunity.win_rate_pct}
                  </span>
                )}
              </div>
            ) : (
              <Typography.Body className="text-gray-800">
                {typeof executiveSummary.biggest_opportunity === 'string' 
                  ? executiveSummary.biggest_opportunity.substring(0, 80) + '...'
                  : 'N/A'
                }
              </Typography.Body>
            )}
          </div>

          {/* Expanded Details */}
          {expandedSections.has('opportunity') && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              {isNewStructure && typeof executiveSummary.biggest_opportunity === 'object' ? (
                <div className="space-y-4">
                  <Typography.Body className="text-gray-800 whitespace-pre-line">
                    {formatTextWithBullets(executiveSummary.biggest_opportunity.description || 'N/A')}
                  </Typography.Body>
                  
                  {executiveSummary.biggest_opportunity.validation_metrics && (
                    <div>
                      <Typography.LabelSmall className="text-gray-600 mb-2">Validation Metrics</Typography.LabelSmall>
                      <div className="grid grid-cols-2 gap-2">
                        <Typography.BodySmall className="text-gray-700">
                          SV: {executiveSummary.biggest_opportunity.validation_metrics.search_volume || 'N/A'}
                        </Typography.BodySmall>
                        <Typography.BodySmall className="text-gray-700">
                          CTR: {executiveSummary.biggest_opportunity.validation_metrics.ctr || 'N/A'}
                        </Typography.BodySmall>
                        <Typography.BodySmall className="text-gray-700">
                          CR: {executiveSummary.biggest_opportunity.validation_metrics.cr || 'N/A'}
                        </Typography.BodySmall>
                        <Typography.BodySmall className="text-gray-700">
                          CPC: ${executiveSummary.biggest_opportunity.validation_metrics.cpc || 'N/A'}
                        </Typography.BodySmall>
                      </div>
                    </div>
                  )}

                  {executiveSummary.biggest_opportunity.action_plan && executiveSummary.biggest_opportunity.action_plan.length > 0 && (
                    <div>
                      <Typography.LabelSmall className="text-gray-600 mb-2">Action Plan</Typography.LabelSmall>
                      <ol className="space-y-1">
                        {executiveSummary.biggest_opportunity.action_plan.map((step, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-green-600 font-semibold">{index + 1}.</span>
                            <Typography.BodySmall className="text-gray-700">{step}</Typography.BodySmall>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ) : (
                <Typography.Body className="text-gray-800 whitespace-pre-line">
                  {formatTextWithBullets(typeof executiveSummary.biggest_opportunity === 'string' ? executiveSummary.biggest_opportunity : 'N/A')}
                </Typography.Body>
              )}
            </div>
          )}
        </div>

        {/* Biggest Risk */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Typography.H4 className="text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Biggest Risk
            </Typography.H4>
            <button
              onClick={() => toggleSection('risk')}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
              {expandedSections.has('risk') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            {isNewStructure && typeof executiveSummary.biggest_risk === 'object' ? (
              <div>
                <Typography.Body className="text-gray-800 mb-2">
                  {executiveSummary.biggest_risk.description?.substring(0, 80) + '...' || 'N/A'}
                </Typography.Body>
                {executiveSummary.biggest_risk.probability_pct && (
                  <span className="px-2 py-1 bg-red-100 border border-red-200 text-red-700 rounded text-sm font-medium">
                    Probability: {executiveSummary.biggest_risk.probability_pct}
                  </span>
                )}
              </div>
            ) : (
              <Typography.Body className="text-gray-800">
                {typeof executiveSummary.biggest_risk === 'string' 
                  ? executiveSummary.biggest_risk.substring(0, 80) + '...'
                  : 'N/A'
                }
              </Typography.Body>
            )}
          </div>

          {/* Expanded Details */}
          {expandedSections.has('risk') && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              {isNewStructure && typeof executiveSummary.biggest_risk === 'object' ? (
                <div className="space-y-4">
                  <Typography.Body className="text-gray-800 whitespace-pre-line">
                    {formatTextWithBullets(executiveSummary.biggest_risk.description || 'N/A')}
                  </Typography.Body>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Typography.LabelSmall className="text-gray-600 mb-2">Probability</Typography.LabelSmall>
                      <Typography.BodyMedium className="text-red-700">
                        {executiveSummary.biggest_risk.probability_pct || 'N/A'}
                      </Typography.BodyMedium>
                    </div>
                    <div>
                      <Typography.LabelSmall className="text-gray-600 mb-2">Impact</Typography.LabelSmall>
                      <Typography.BodyMedium className="text-gray-700">
                        {executiveSummary.biggest_risk.impact || 'N/A'}
                      </Typography.BodyMedium>
                    </div>
                  </div>

                  {executiveSummary.biggest_risk.early_signals && executiveSummary.biggest_risk.early_signals.length > 0 && (
                    <div>
                      <Typography.LabelSmall className="text-gray-600 mb-2">Early Warning Signals</Typography.LabelSmall>
                      <ul className="space-y-1">
                        {executiveSummary.biggest_risk.early_signals.map((signal, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-red-500 mt-1">⚠</span>
                            <Typography.BodySmall className="text-gray-700">{signal}</Typography.BodySmall>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {executiveSummary.biggest_risk.mitigations && executiveSummary.biggest_risk.mitigations.length > 0 && (
                    <div>
                      <Typography.LabelSmall className="text-gray-600 mb-2">Mitigation Strategies</Typography.LabelSmall>
                      <ul className="space-y-1">
                        {executiveSummary.biggest_risk.mitigations.map((mitigation, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-green-500 mt-1">✓</span>
                            <Typography.BodySmall className="text-gray-700">{mitigation}</Typography.BodySmall>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <Typography.Body className="text-gray-800 whitespace-pre-line">
                  {formatTextWithBullets(typeof executiveSummary.biggest_risk === 'string' ? executiveSummary.biggest_risk : 'N/A')}
                </Typography.Body>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Key Points - Collapsible */}
      {Array.isArray(executiveSummary.key_points) && executiveSummary.key_points.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <Typography.H4 className="text-gray-900">Key Points</Typography.H4>
            <button
              onClick={() => toggleSection('keypoints')}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
              {expandedSections.has('keypoints') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <Typography.Body className="text-gray-700">
              {executiveSummary.key_points.length} key points identified
            </Typography.Body>
          </div>

          {/* Expanded Key Points */}
          {expandedSections.has('keypoints') && (
            <div className="mt-4 space-y-3">
              {executiveSummary.key_points.map((point, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  {typeof point === 'object' ? (
                    <div>
                      <Typography.H6 className="mb-2 text-gray-900">{point.title || 'N/A'}</Typography.H6>
                      <Typography.BodySmall className="text-gray-700 mb-2 whitespace-pre-line">
                        {formatTextWithBullets(point.detail || 'N/A')}
                      </Typography.BodySmall>
                      <div className="space-y-1">
                        {point.evidence && (
                          <Typography.BodySmall className="text-gray-500">
                            <span className="font-medium">Evidence:</span> {point.evidence}
                          </Typography.BodySmall>
                        )}
                        {point.impact && (
                          <Typography.BodySmall className="text-gray-500">
                            <span className="font-medium">Impact:</span> {point.impact}
                          </Typography.BodySmall>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Typography.Body className="text-gray-700 whitespace-pre-line">
                      {formatTextWithBullets(point)}
                    </Typography.Body>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // If old structure, show simple version
  if (!isNewStructure) {
    return <CompactSummary />;
  }

  return <CompactSummary />;
};

export default TestSummary;
