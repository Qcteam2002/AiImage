import React from 'react';

interface ChartLegendProps {
  data: Array<{
    name: string;
    color: string;
    value?: string | number;
  }>;
  className?: string;
}

const ChartLegend: React.FC<ChartLegendProps> = ({ data, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm text-gray-600">{item.name}</span>
          {item.value && (
            <span className="text-sm font-medium text-gray-900">
              ({item.value})
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChartLegend;


