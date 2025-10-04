import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  children: React.ReactNode;
  className?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  icon: Icon,
  iconColor = 'text-gray-600',
  iconBg = 'bg-gray-100',
  children,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-2xl shadow-xl border-0 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
          {title}
        </h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default SummaryCard;


