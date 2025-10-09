import React from 'react';

interface AnimatedTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: string | number;
    color: string;
  }>;
  label?: string;
  className?: string;
}

const AnimatedTooltip: React.FC<AnimatedTooltipProps> = ({
  active,
  payload,
  label,
  className = ''
}) => {
  if (active && payload && payload.length) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg shadow-lg p-4 transition-all duration-300 transform ${
        active ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      } ${className}`}>
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div 
            key={index} 
            className="flex items-center gap-2 mb-1 transition-all duration-200"
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <div
              className="w-3 h-3 rounded-full transition-transform duration-200"
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

export default AnimatedTooltip;




