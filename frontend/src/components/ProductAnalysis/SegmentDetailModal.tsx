import React, { useState } from 'react';
import { X, Users, TrendingUp, Target, MapPin, Clock, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import Typography from '../design-system/Typography';
import Spacing from '../design-system/Spacing';

interface SegmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  segment: {
    name: string;
    market_share_percent: number;
    age_range: string;
    average_budget_usd: number;
    purchase_frequency: string;
    buying_behavior: string;
    gender_ratio?: { male: number; female: number };
    main_channels?: string[];
    emotional_motivations: string;
    usage_context: string;
    occupations?: string[];
    locations?: string[];
    repurchase_or_upsell?: { estimated_percent: number };
    solutions_and_content?: Array<{
      pain_point: string;
      percent_of_customers: number;
      usp: string;
      content_hook: string;
      ad_visual_idea: string;
    }>;
  } | null;
  segmentIndex: number;
}

const SegmentDetailModal: React.FC<SegmentDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  segment, 
  segmentIndex 
}) => {
  const [expandedProblems, setExpandedProblems] = useState<number[]>([]);
  
  if (!isOpen || !segment) return null;

  const toggleProblem = (index: number) => {
    setExpandedProblems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* Header - Clean & Simple */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <Typography.H3 className="mb-2 text-gray-900">
                {segment.name}
              </Typography.H3>
              <div className="flex items-center space-x-3">
                <div className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded text-sm font-medium">
                  {segment.market_share_percent}% Market Share
                </div>
                <div className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded text-sm font-medium">
                  ${segment.average_budget_usd} Budget
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - Single Column Flow */}
        <div className="p-6 space-y-6">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
              <Typography.LabelSmall className="mb-1 text-gray-500">Age Range</Typography.LabelSmall>
              <Typography.BodyMedium className="font-semibold text-gray-900">{segment.age_range}</Typography.BodyMedium>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
              <Typography.LabelSmall className="mb-1 text-gray-500">Gender</Typography.LabelSmall>
              <Typography.BodyMedium className="font-semibold text-gray-900">
                {segment.gender_ratio?.male || 0}%M / {segment.gender_ratio?.female || 0}%F
              </Typography.BodyMedium>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
              <Typography.LabelSmall className="mb-1 text-gray-500">Frequency</Typography.LabelSmall>
              <Typography.BodySmall className="font-medium text-gray-900">{segment.purchase_frequency}</Typography.BodySmall>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
              <Typography.LabelSmall className="mb-1 text-gray-500">Channels</Typography.LabelSmall>
              <Typography.BodyMedium className="font-semibold text-gray-900">{segment.main_channels?.length || 0}</Typography.BodyMedium>
            </div>
          </div>

          {/* Main Content - Clear Sections */}
          <div className="space-y-6">
            {/* Who They Are */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <Typography.H4 className="mb-4 flex items-center text-gray-900">
                <Users className="w-5 h-5 mr-2 text-gray-600" />
                Who They Are
              </Typography.H4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-l-2 border-gray-200 pl-4">
                  <Typography.LabelSmall className="mb-2 text-gray-500">Buying Behavior</Typography.LabelSmall>
                  <Typography.BodySmall className="text-gray-700">{segment.buying_behavior}</Typography.BodySmall>
                </div>
                <div className="border-l-2 border-gray-200 pl-4">
                  <Typography.LabelSmall className="mb-2 text-gray-500">Emotional Motivations</Typography.LabelSmall>
                  <Typography.BodySmall className="text-gray-700">{segment.emotional_motivations}</Typography.BodySmall>
                </div>
                <div className="md:col-span-2 border-l-2 border-gray-200 pl-4">
                  <Typography.LabelSmall className="mb-2 text-gray-500">Usage Context</Typography.LabelSmall>
                  <Typography.BodySmall className="text-gray-700">{segment.usage_context}</Typography.BodySmall>
                </div>
              </div>
            </div>

            {/* Where They Are */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <Typography.H4 className="mb-4 flex items-center text-gray-900">
                <MapPin className="w-5 h-5 mr-2 text-gray-600" />
                Where They Are
              </Typography.H4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography.LabelSmall className="mb-3 text-gray-500">Locations</Typography.LabelSmall>
                  <div className="flex flex-wrap gap-2">
                    {segment.locations?.map((location, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded text-sm">
                        {location}
                      </span>
                    )) || <Typography.BodySmall className="text-gray-500">N/A</Typography.BodySmall>}
                  </div>
                </div>
                <div>
                  <Typography.LabelSmall className="mb-3 text-gray-500">Occupations</Typography.LabelSmall>
                  <div className="flex flex-wrap gap-2">
                    {segment.occupations?.map((occupation, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded text-sm">
                        {occupation}
                      </span>
                    )) || <Typography.BodySmall className="text-gray-500">N/A</Typography.BodySmall>}
                  </div>
                </div>
              </div>
            </div>

            {/* How to Reach Them */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <Typography.H4 className="mb-4 flex items-center text-gray-900">
                <Clock className="w-5 h-5 mr-2 text-gray-600" />
                How to Reach Them
              </Typography.H4>
              <div className="flex flex-wrap gap-2">
                {segment.main_channels?.map((channel, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded text-sm">
                    {channel}
                  </span>
                )) || <Typography.BodySmall className="text-gray-500">N/A</Typography.BodySmall>}
              </div>
            </div>

            {/* Pain Points & Solutions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <Typography.H4 className="mb-4 flex items-center text-gray-900">
                <Target className="w-5 h-5 mr-2 text-gray-600" />
                Pain Points & Solutions
              </Typography.H4>
              <div className="space-y-3">
                {(segment.solutions_and_content || []).map((solution, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                    {/* Problem Header - Always Visible */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleProblem(index)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1 mr-4">
                          <Typography.H6 className="text-gray-900 mb-1">
                            {solution.pain_point.replace(/\(\d+% khách hàng.*?\)/g, '').trim()}
                          </Typography.H6>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded text-sm font-medium">
                            {(() => {
                              // Try to extract percentage from pain_point if percent_of_customers is not available
                              const match = solution.pain_point.match(/\((\d+)% khách hàng.*?\)/);
                              const percentage = solution.percent_of_customers || (match ? match[1] : null);
                              return percentage ? `${percentage}% affected` : 'N/A% affected';
                            })()}
                          </span>
                          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                            {expandedProblems.includes(index) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Collapsible Content */}
                    {expandedProblems.includes(index) && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <div className="space-y-4">
                          <div className="bg-white border border-gray-200 rounded p-4">
                            <Typography.LabelSmall className="mb-2 text-gray-500 flex items-center">
                              💡 USP (Unique Selling Point)
                            </Typography.LabelSmall>
                            <Typography.BodySmall className="text-gray-700">{solution.usp}</Typography.BodySmall>
                          </div>
                          
                          <div className="bg-white border border-gray-200 rounded p-4">
                            <Typography.LabelSmall className="mb-2 text-gray-500 flex items-center">
                              📝 Content Hook (for social media)
                            </Typography.LabelSmall>
                            <Typography.BodySmall className="text-gray-700 bg-gray-50 p-3 rounded border-l-2 border-gray-300">
                              {solution.content_hook}
                            </Typography.BodySmall>
                          </div>
                          
                          <div className="bg-white border border-gray-200 rounded p-4">
                            <Typography.LabelSmall className="mb-2 text-gray-500 flex items-center">
                              🎬 Visual Idea (for ads)
                            </Typography.LabelSmall>
                            <Typography.BodySmall className="text-gray-700 bg-gray-50 p-3 rounded border-l-2 border-gray-300">
                              {solution.ad_visual_idea}
                            </Typography.BodySmall>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 -mx-6 -mb-6 rounded-b-xl">
            <div className="flex justify-between items-center">
              <Typography.BodySmall className="text-gray-500">
                💡 Use this information to create targeted marketing campaigns
              </Typography.BodySmall>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Got it, Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SegmentDetailModal;
