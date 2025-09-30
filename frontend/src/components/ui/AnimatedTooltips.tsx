import React, { useState, useEffect } from 'react';

interface AnimatedTooltipsProps {
  tooltips: Array<{
    active?: boolean;
    payload?: Array<{
      value: string | number;
      name: string;
      color: string;
    }>;
    label?: string;
    delay?: number;
  }>;
  className?: string;
}

const AnimatedTooltips: React.FC<AnimatedTooltipsProps> = ({
  tooltips,
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
    <div className={`space-y-4 ${className}`}>
      {tooltips.map((tooltip, index) => (
        <div
          key={index}
          className={`bg-white border border-gray-200 rounded-lg shadow-lg p-4 transition-all duration-1000 transform ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: `${tooltip.delay || index * 100}ms` }}
        >
          {tooltip.label && (
            <div className="text-sm font-medium text-gray-900 mb-2">
              {tooltip.label}
            </div>
          )}
          {tooltip.payload && tooltip.payload.length > 0 && (
            <div className="space-y-2">
              {tooltip.payload.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AnimatedTooltips;