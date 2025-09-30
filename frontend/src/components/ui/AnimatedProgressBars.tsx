import React, { useState, useEffect } from 'react';

interface AnimatedProgressBarsProps {
  bars: Array<{
    label: string;
    value: number;
    max?: number;
    color?: string;
    delay?: number;
  }>;
  className?: string;
}

const AnimatedProgressBars: React.FC<AnimatedProgressBarsProps> = ({
  bars,
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
    <div className={`space-y-6 ${className}`}>
      {bars.map((bar, index) => (
        <div
          key={index}
          className={`transition-all duration-1000 transform ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: `${bar.delay || index * 100}ms` }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">{bar.label}</span>
            <span className="text-sm font-bold text-gray-900">
              {bar.value}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-2000 ease-out ${
                bar.color || 'bg-gradient-to-r from-blue-500 to-purple-600'
              }`}
              style={{
                width: isVisible ? `${bar.value}%` : '0%',
                transitionDelay: `${(bar.delay || index * 100) + 200}ms`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnimatedProgressBars;