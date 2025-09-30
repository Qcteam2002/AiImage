import React, { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

interface AnimatedMetricCardsProps {
  data: Array<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    gradient?: string;
    trend?: {
      value: number;
      isPositive: boolean;
    };
  }>;
  className?: string;
  delay?: number;
}

const AnimatedMetricCards: React.FC<AnimatedMetricCardsProps> = ({
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
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {data.map((item, index) => (
        <div
          key={index}
          className={`bg-gradient-to-r ${item.gradient || 'from-blue-500 to-blue-600'} text-white p-6 rounded-xl shadow-lg transition-all duration-1000 transform ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: `${delay + index * 100}ms` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center transition-transform duration-500 ${
                isVisible ? 'scale-100' : 'scale-0'
              }`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}>
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className={`text-sm opacity-90 transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                  }`}>
                    {item.subtitle}
                  </p>
                )}
              </div>
            </div>
            {item.trend && (
              <div className={`flex items-center gap-1 text-sm transition-all duration-700 ${
                item.trend.isPositive ? 'text-green-200' : 'text-red-200'
              } ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                <span className="font-bold">
                  {item.trend.isPositive ? '+' : ''}{item.trend.value}%
                </span>
                <span className="text-xs">vs trước</span>
              </div>
            )}
          </div>
          
          <div className={`text-3xl font-bold mb-2 transition-all duration-700 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}>
            {item.value}
          </div>
          
          {item.trend && (
            <div className="w-full bg-white bg-opacity-20 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-1000 ${
                  item.trend.isPositive ? 'bg-green-300' : 'bg-red-300'
                }`}
                style={{ 
                  width: `${Math.min(Math.abs(item.trend.value), 100)}%`,
                  transitionDelay: `${delay + index * 100 + 500}ms`
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AnimatedMetricCards;