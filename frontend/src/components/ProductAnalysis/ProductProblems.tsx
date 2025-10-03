import React from 'react';
import { Target } from 'lucide-react';
import { Card } from '../ui/Card';
import Typography from '../design-system/Typography';
import Spacing from '../design-system/Spacing';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProductProblemsProps {
  analysisResult: {
    product_problems: {
      resolved: Array<{
        problem: string;
        satisfaction_percent: number;
      }>;
      unresolved: Array<{
        problem: string;
        unsatisfied_percent: number;
        example_feedback?: string;
      }>;
    };
  };
}

const ProductProblems: React.FC<ProductProblemsProps> = ({ analysisResult }) => {
  const chartData = [
    { name: 'Resolved', count: analysisResult.product_problems?.resolved?.length || 0 },
    { name: 'Unresolved', count: analysisResult.product_problems?.unresolved?.length || 0 }
  ];

  return (
    <Card className={Spacing.section}>
      <div className={Spacing.cardPadding}>
        <Typography.H2 className="mb-6 flex items-center">
          <Target className="w-6 h-6 mr-3 text-blue-600" />
          Product Problems Analysis
        </Typography.H2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-1">
            <Typography.H3 className="mb-4">Problem Resolution Overview</Typography.H3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Problems Lists */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resolved Problems */}
            <div>
              <Typography.Label className="mb-3">Resolved Problems</Typography.Label>
              <div className={Spacing.elementSmall}>
                {(analysisResult.product_problems?.resolved || []).map((problem, index) => (
                  <div key={index} className="border border-gray-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Typography.H6>{problem.problem}</Typography.H6>
                      <Typography.Badge variant="success">
                        {problem.satisfaction_percent}%
                      </Typography.Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Unresolved Problems */}
            <div>
              <Typography.Label className="mb-3">Unresolved Problems</Typography.Label>
              <div className={Spacing.elementSmall}>
                {(analysisResult.product_problems?.unresolved || []).map((problem, index) => (
                  <div key={index} className="border border-gray-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Typography.H6>{problem.problem}</Typography.H6>
                      <Typography.Badge variant="error">
                        {problem.unsatisfied_percent}%
                      </Typography.Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductProblems;
