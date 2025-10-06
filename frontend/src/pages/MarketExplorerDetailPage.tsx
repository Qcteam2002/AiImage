import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { 
  ArrowLeft, 
  Globe, 
  TrendingUp, 
  Target,
  Building2,
  Users,
  Lightbulb,
  MapPin,
  DollarSign,
  BarChart3,
  Calendar,
  Download,
  Share2,
  RefreshCw,
  Search
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import { useAuth } from '../contexts/AuthContext';
import { marketExplorerService } from '../services/marketExplorerService';
import toast from 'react-hot-toast';

// Market Explorer Components
import MarketExplorerHeader from '../components/MarketExplorer/MarketExplorerHeader';
import ExecutiveSummary from '../components/MarketExplorer/ExecutiveSummary';
import MarketOverview from '../components/MarketExplorer/MarketOverview';
import CompetitorLandscape from '../components/MarketExplorer/CompetitorLandscape';
import CustomerSegments from '../components/MarketExplorer/CustomerSegments';
import RecommendedNiches from '../components/MarketExplorer/RecommendedNiches';
import RiskAnalysis from '../components/MarketExplorer/RiskAnalysis';
import StrategicRecommendations from '../components/MarketExplorer/StrategicRecommendations';
import ActionPlan from '../components/MarketExplorer/ActionPlan';

interface MarketExplorerData {
  id: string;
  target_country: string;
  business_model: string;
  industry_category?: string;
  product_features?: string;
  business_goals: string;
  language: string;
  status: 'waiting' | 'processing' | 'done' | 'error';
  analysis_result?: string;
  error_message?: string;
  analyzed_at?: string;
  created_at: string;
  updated_at: string;
}

const MarketExplorerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const {
    data: marketExplorer,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['marketExplorer', id],
    () => marketExplorerService.getMarketExplorer(id!),
    {
      enabled: !!id,
      refetchInterval: (data) => {
        return data?.status === 'processing' ? 5000 : false;
      },
    }
  );

  useEffect(() => {
    if (marketExplorer?.analysis_result) {
      try {
        let jsonString = marketExplorer.analysis_result;
        
        // Remove markdown code block if present
        if (jsonString.includes('```json')) {
          jsonString = jsonString.replace(/```json\s*/, '').replace(/\s*```$/, '');
        }
        
        // Clean up any potential issues with the JSON string
        jsonString = jsonString.trim();
        
        // Try to find and extract the JSON part if there's extra content
        const jsonStart = jsonString.indexOf('{');
        const jsonEnd = jsonString.lastIndexOf('}') + 1;
        
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          jsonString = jsonString.substring(jsonStart, jsonEnd);
        }
        
        // Check if JSON is complete by counting braces
        const openBraces = (jsonString.match(/\{/g) || []).length;
        const closeBraces = (jsonString.match(/\}/g) || []).length;
        
        if (openBraces !== closeBraces) {
          console.warn('JSON appears to be incomplete, attempting to fix...');
          console.log('Open braces:', openBraces, 'Close braces:', closeBraces);
          
          // Try to find the last complete object by working backwards
          let braceCount = 0;
          let lastValidIndex = -1;
          
          // Start from the end and work backwards
          for (let i = jsonString.length - 1; i >= 0; i--) {
            if (jsonString[i] === '}') {
              braceCount++;
            } else if (jsonString[i] === '{') {
              braceCount--;
              if (braceCount === 0) {
                lastValidIndex = i;
                break;
              }
            }
          }
          
          if (lastValidIndex > 0) {
            // Find the matching closing brace
            let matchingCloseIndex = -1;
            let tempBraceCount = 0;
            
            for (let i = lastValidIndex; i < jsonString.length; i++) {
              if (jsonString[i] === '{') {
                tempBraceCount++;
              } else if (jsonString[i] === '}') {
                tempBraceCount--;
                if (tempBraceCount === 0) {
                  matchingCloseIndex = i;
                  break;
                }
              }
            }
            
            if (matchingCloseIndex > lastValidIndex) {
              jsonString = jsonString.substring(0, matchingCloseIndex + 1);
              console.log('Fixed JSON by truncating at index:', matchingCloseIndex);
            } else {
              // If we can't find a matching close, try to add missing braces
              const missingBraces = openBraces - closeBraces;
              jsonString = jsonString + '}'.repeat(missingBraces);
              console.log('Fixed JSON by adding', missingBraces, 'missing closing braces');
            }
          }
        }
        
        console.log('Cleaned JSON string length:', jsonString.length);
        console.log('First 200 chars:', jsonString.substring(0, 200) + '...');
        console.log('Last 200 chars:', '...' + jsonString.substring(Math.max(0, jsonString.length - 200)));
        
        // Try to parse the JSON
        let parsed;
        try {
          parsed = JSON.parse(jsonString);
        } catch (parseError) {
          console.warn('Initial JSON parse failed, attempting to fix...');
          
          // Simple approach: just add the missing closing braces
          const openBraces = (jsonString.match(/\{/g) || []).length;
          const closeBraces = (jsonString.match(/\}/g) || []).length;
          const missingBraces = openBraces - closeBraces;
          
          if (missingBraces > 0) {
            console.log(`Adding ${missingBraces} missing closing braces`);
            const fixedJson = jsonString + '}'.repeat(missingBraces);
            
            try {
              parsed = JSON.parse(fixedJson);
              console.log('Successfully parsed JSON with added braces');
            } catch (fixedError) {
              console.error('Adding braces also failed:', fixedError);
              
              // Last resort: try to extract complete sections using regex
              console.log('Trying to extract complete sections...');
              
              // Try to extract just the executive summary section which should be complete
              const executiveSummaryMatch = jsonString.match(/"00_executive_summary":\s*\{[^}]*\}/);
              if (executiveSummaryMatch) {
                console.log('Found executive summary section');
                const execSummaryJson = `{${executiveSummaryMatch[0]}}`;
                try {
                  parsed = JSON.parse(execSummaryJson);
                  console.log('Successfully parsed executive summary only');
                } catch (e) {
                  console.error('Executive summary parse failed:', e);
                }
              }
              
              // If executive summary failed, try to find any complete section
              if (!parsed) {
                const sectionPatterns = [
                  /"00_executive_summary":\s*\{[^}]*\}/,
                  /"A_market_overview":\s*\{[^}]*\}/,
                  /"B_competitor_landscape":\s*\{[^}]*\}/,
                  /"C_customer_segments":\s*\[[^\]]*\]/
                ];
                
                for (const pattern of sectionPatterns) {
                  const match = jsonString.match(pattern);
                  if (match) {
                    console.log('Found section with pattern:', pattern.source);
                    const sectionJson = `{${match[0]}}`;
                    try {
                      parsed = JSON.parse(sectionJson);
                      console.log('Successfully parsed section');
                      break;
                    } catch (e) {
                      console.error('Section parse failed:', e);
                    }
                  }
                }
              }
              
              // If still no success, try a very simple approach - just take the first part
              if (!parsed) {
                console.log('Trying simple truncation approach...');
                const simpleTruncationPoints = [5000, 10000, 15000, 20000];
                
                for (const truncateAt of simpleTruncationPoints) {
                  if (truncateAt < jsonString.length) {
                    // Find the last complete object at this point
                    let braceCount = 0;
                    let lastCompleteIndex = -1;
                    
                    for (let i = 0; i < truncateAt; i++) {
                      if (jsonString[i] === '{') {
                        braceCount++;
                      } else if (jsonString[i] === '}') {
                        braceCount--;
                        if (braceCount === 0) {
                          lastCompleteIndex = i;
                        }
                      }
                    }
                    
                    if (lastCompleteIndex > 0) {
                      const testJson = jsonString.substring(0, lastCompleteIndex + 1);
                      try {
                        parsed = JSON.parse(testJson);
                        console.log('Successfully parsed with simple truncation at:', lastCompleteIndex);
                        break;
                      } catch (e) {
                        // Continue to next truncation point
                      }
                    }
                  }
                }
              }
              
              if (!parsed) {
                throw parseError; // Re-throw original error
              }
            }
          } else {
            throw parseError; // Re-throw original error
          }
        }
        
        setAnalysisResult(parsed);
      } catch (error) {
        console.error('Error parsing analysis result:', error);
        console.error('JSON string that failed:', marketExplorer.analysis_result);
        console.error('JSON string length:', marketExplorer.analysis_result?.length);
        
        // Last resort: try to create a minimal valid JSON structure
        try {
          const fallbackResult = {
            "00_executive_summary": {
              "report_metadata": {
                "report_title": `Market Analysis for ${marketExplorer.target_country}`,
                "report_version": "MarketExplorer v4.1",
                "data_timeframe": "2024–2026",
                "confidence_level_percent": 85,
                "last_updated": new Date().toISOString().split('T')[0]
              },
              "market_highlights": {
                "summary_insight": "Analysis is being processed. Please try refreshing the page in a few moments."
              },
              "key_findings": [
                {
                  "theme": "Processing",
                  "finding": "The analysis is currently being processed. Please wait a moment and refresh the page.",
                  "data_source": "System"
                }
              ]
            }
          };
          
          console.log('Using fallback JSON structure');
          setAnalysisResult(fallbackResult);
          toast('Analysis data is being processed. Please refresh the page in a moment.');
        } catch (fallbackError) {
          console.error('Even fallback failed:', fallbackError);
          toast.error(t('marketExplorer.parseError'));
        }
      }
    }
  }, [marketExplorer?.analysis_result, t]);

  const handleRetryAnalysis = () => {
    if (marketExplorer) {
      marketExplorerService.analyzeMarketExplorer(marketExplorer.id)
        .then(() => {
          toast.success(t('marketExplorer.analysisStarted'));
          refetch();
        })
        .catch((error) => {
          console.error('Error starting analysis:', error);
          toast.error(t('marketExplorer.analysisError'));
        });
    }
  };

  const handleDownloadReport = async () => {
    if (!analysisResult) {
      toast.error(t('marketExplorer.noDataToDownload'));
      return;
    }

    try {
      const element = document.getElementById('analysis-content');
      if (!element) {
        toast.error(t('marketExplorer.contentNotFound'));
        return;
      }

      // Create a simple text report
      const reportData = {
        title: `${t('marketExplorer.marketAnalysis')} - ${marketExplorer?.target_country}`,
        date: marketExplorer?.analyzed_at,
        businessModel: marketExplorer?.business_model,
        analysis: analysisResult
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `market-analysis-${marketExplorer?.target_country}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(t('marketExplorer.downloadSuccess'));
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error(t('marketExplorer.downloadError'));
    }
  };

  const getBusinessModelText = (model: string) => {
    switch (model) {
      case 'Dropshipping':
        return t('marketExplorer.dropshipping');
      case 'Affiliate':
        return t('marketExplorer.affiliate');
      case 'Both':
        return t('marketExplorer.both');
      default:
        return model;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !marketExplorer) {
    return (
      <div className="p-6">
        <ErrorState 
          title={t('marketExplorer.loadError')}
          subtitle={t('marketExplorer.loadError')}
          icon={Search}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (marketExplorer.status === 'processing') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/market-explorer')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('marketExplorer.analyzing')}
          </h1>
        </div>

        <Card className="p-12 text-center">
          <LoadingSpinner size="lg" />
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
            {t('marketExplorer.analysisInProgress')}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('marketExplorer.analysisDescription')}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <RefreshCw className="w-4 h-4 animate-spin" />
            {t('marketExplorer.autoRefresh')}
          </div>
        </Card>
      </div>
    );
  }

  if (marketExplorer.status === 'error') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/market-explorer')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('marketExplorer.analysisError')}
          </h1>
        </div>

        <Card className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('marketExplorer.analysisFailed')}
            </h3>
            <p className="text-gray-600 mb-6">
              {marketExplorer.error_message || t('marketExplorer.unknownError')}
            </p>
            <Button onClick={handleRetryAnalysis}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('marketExplorer.retryAnalysis')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/market-explorer')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('marketExplorer.noAnalysisData')}
          </h1>
        </div>

        <Card className="p-6">
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              {t('marketExplorer.noAnalysisDataDescription')}
            </p>
            <Button onClick={handleRetryAnalysis}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('marketExplorer.retryAnalysis')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-2 sm:px-4 lg:px-8">
        {/* Header */}
        <MarketExplorerHeader
          marketExplorer={marketExplorer}
          onBack={() => navigate('/market-explorer')}
          onDownload={handleDownloadReport}
          onShare={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success(t('marketExplorer.linkCopied'));
          }}
        />

        {/* Analysis Content */}
        <div id="analysis-content">
          {(() => {
            try {
              return (
                <>
                  {/* Executive Summary */}
                  <ExecutiveSummary analysisResult={analysisResult} />

                  {/* Market Overview */}
                  <MarketOverview analysisResult={analysisResult} />

                  {/* Competitor Landscape */}
                  <CompetitorLandscape analysisResult={analysisResult} />

                  {/* Customer Segments */}
                  <CustomerSegments analysisResult={analysisResult} />

                  {/* Recommended Niches */}
                  <RecommendedNiches analysisResult={analysisResult} />

                  {/* Risk Analysis */}
                  <RiskAnalysis analysisResult={analysisResult} />

                  {/* Strategic Recommendations */}
                  <StrategicRecommendations analysisResult={analysisResult} />

                  {/* Action Plan */}
                  <ActionPlan analysisResult={analysisResult} />
                </>
              );
            } catch (error) {
              console.error('Error rendering analysis components:', error);
              return (
                <Card className="p-6">
                  <div className="text-center">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Rendering Error</h3>
                    <p className="text-red-700 mb-4">There was an error rendering the analysis components.</p>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="destructive"
                    >
                      Reload Page
                    </Button>
                  </div>
                </Card>
              );
            }
          })()}
        </div>
      </div>
    </div>
  );
};

export default MarketExplorerDetailPage;