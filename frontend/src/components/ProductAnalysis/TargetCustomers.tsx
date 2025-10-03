import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { Card } from '../ui/Card';
import Typography from '../design-system/Typography';
import Spacing from '../design-system/Spacing';
import SegmentDetailModal from './SegmentDetailModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TargetCustomersProps {
  analysisResult: {
    target_customers: Array<{
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
    }>;
  };
}

const TargetCustomers: React.FC<TargetCustomersProps> = ({ analysisResult }) => {
  const [selectedSolution, setSelectedSolution] = useState<any>(null);
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<any>(null);
  const [showSegmentModal, setShowSegmentModal] = useState(false);

  const targetCustomersData = (analysisResult.target_customers || []).map(customer => ({
    name: `Nhóm ${(analysisResult.target_customers || []).indexOf(customer) + 1}`,
    value: customer.market_share_percent
  }));

  const IdeaModal = ({ isOpen, onClose, solution }: { isOpen: boolean; onClose: () => void; solution: any }) => {
    if (!isOpen || !solution) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <Typography.H3>Content Ideas</Typography.H3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className={Spacing.stack}>
              <div>
                <Typography.H5 className="mb-2">Content Hook</Typography.H5>
                <Typography.BodySmall>{solution.content_hook}</Typography.BodySmall>
              </div>
              <div>
                <Typography.H5 className="mb-2">Visual Idea</Typography.H5>
                <Typography.BodySmall>{solution.ad_visual_idea}</Typography.BodySmall>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={Spacing.section}>
      <div className={Spacing.cardPadding}>
        <Typography.H2 className="mb-6 flex items-center">
          <Users className="w-6 h-6 mr-3 text-blue-600" />
          Target Customers Analysis
        </Typography.H2>
        
        {/* Market Share Distribution Chart */}
        <div className="mb-8">
          <Typography.H3 className="mb-4">Market Share Distribution</Typography.H3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={targetCustomersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Market Share']} />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Groups */}
        <div>
          <Typography.H3 className="mb-4">Customer Groups</Typography.H3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisResult.target_customers.map((customer, index) => (
              <div key={index} className="border border-gray-200 p-4 rounded-lg flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <Typography.H4>Nhóm {index + 1}</Typography.H4>
                  <span className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded text-sm font-medium">
                    {customer.market_share_percent}%
                  </span>
                </div>
                
                <div className="mb-3">
                  <Typography.BodySmall className="font-medium">{customer.name}</Typography.BodySmall>
                </div>
                
                <div className={`${Spacing.elementSmall} text-sm flex-grow`}>
                  <Typography.BodySmall><span className="font-medium">Độ tuổi:</span> {customer.age_range}</Typography.BodySmall>
                  <Typography.BodySmall><span className="font-medium">Ngân sách:</span> ${customer.average_budget_usd}</Typography.BodySmall>
                  <Typography.BodySmall><span className="font-medium">Tần suất:</span> {customer.purchase_frequency}</Typography.BodySmall>
                  <Typography.BodySmall><span className="font-medium">Hành vi:</span> {customer.buying_behavior}</Typography.BodySmall>
                  <Typography.BodySmall><span className="font-medium">Nam/Nữ:</span> {customer.gender_ratio?.male || 0}%/{customer.gender_ratio?.female || 0}%</Typography.BodySmall>
                </div>
                
                <div className="mt-3 mb-4">
                  <Typography.H6 className="mb-1">Kênh chính</Typography.H6>
                  <div className="flex flex-wrap gap-1">
                    {customer.main_channels?.slice(0, 3).map((channel, channelIndex) => (
                      <Typography.Badge key={channelIndex} variant="default" className="text-xs">
                        {channel}
                      </Typography.Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-auto">
                  <button
                    onClick={() => {
                      setSelectedSegment(customer);
                      setShowSegmentModal(true);
                    }}
                    className="w-full text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 px-3 py-2 rounded-md transition-colors"
                  >
                    View Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Idea Modal */}
        <IdeaModal 
          isOpen={showIdeaModal}
          onClose={() => {
            setShowIdeaModal(false);
            setSelectedSolution(null);
          }}
          solution={selectedSolution}
        />

        {/* Segment Detail Modal */}
        <SegmentDetailModal
          isOpen={showSegmentModal}
          onClose={() => {
            setShowSegmentModal(false);
            setSelectedSegment(null);
          }}
          segment={selectedSegment}
          segmentIndex={selectedSegment ? analysisResult.target_customers.indexOf(selectedSegment) : 0}
        />
      </div>
    </Card>
  );
};

export default TargetCustomers;
