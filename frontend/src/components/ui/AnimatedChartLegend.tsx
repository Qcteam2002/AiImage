import React, { useState, useEffect } from 'react';

interface AnimatedChartLegendProps {
  data: Array<{
    name: string;
    color: string;
    value?: string | number;
  }>;
  className?: string;
  delay?: number;
}

const AnimatedChartLegend: React.FC<AnimatedChartLegendProps> = ({ 
  data, 
  className = '',
  delay = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`flex flex-wrap gap-4 transition-all duration-1000 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    } ${className}`}>
      {data.map((item, index) => (
        <div 
          key={index} 
          className={`flex items-center gap-2 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          }`}
          style={{ transitionDelay: `${delay + index * 100}ms` }}
        >
          <div
            className="w-3 h-3 rounded-full transition-transform duration-500"
            style={{ 
              backgroundColor: item.color,
              transform: isVisible ? 'scale(1)' : 'scale(0)'
            }}
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

export default AnimatedChartLegend;




