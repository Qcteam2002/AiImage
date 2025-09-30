import React, { useState, useEffect } from 'react';

interface AnimatedChartLegendsProps {
  legends: Array<{
    color: string;
    label: string;
    value?: string | number;
    delay?: number;
  }>;
  className?: string;
}

const AnimatedChartLegends: React.FC<AnimatedChartLegendsProps> = ({
  legends,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {legends.map((legend, index) => (
        <div
          key={index}
          className={`flex items-center space-x-2 transition-all duration-1000 transform ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: `${legend.delay || index * 100}ms` }}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: legend.color }}
          />
          <span className="text-sm font-medium text-gray-700">
            {legend.label}
          </span>
          {legend.value && (
            <span className="text-sm font-bold text-gray-900">
              ({legend.value})
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default AnimatedChartLegends;