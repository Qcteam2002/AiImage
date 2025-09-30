import React from 'react';

interface EnhancedTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: string | number;
    color: string;
  }>;
  label?: string;
  className?: string;
}

const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  active,
  payload,
  label,
  className = ''
}) => {
  if (active && payload && payload.length) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg shadow-lg p-4 ${className}`}>
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.name}:</span>
            <span className="text-sm font-medium text-gray-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default EnhancedTooltip;
