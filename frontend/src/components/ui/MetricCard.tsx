import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient = 'from-blue-500 to-blue-600',
  trend,
  className = ''
}) => {
  return (
    <div className={`bg-gradient-to-r ${gradient} text-white p-6 rounded-xl shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {subtitle && <p className="text-sm opacity-90">{subtitle}</p>}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend.isPositive ? 'text-green-200' : 'text-red-200'
          }`}>
            <span className="font-bold">
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs">vs trước</span>
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold mb-2">{value}</div>
      
      {trend && (
        <div className="w-full bg-white bg-opacity-20 rounded-full h-1">
          <div 
            className={`h-1 rounded-full transition-all duration-1000 ${
              trend.isPositive ? 'bg-green-300' : 'bg-red-300'
            }`}
            style={{ width: `${Math.min(Math.abs(trend.value), 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default MetricCard;





