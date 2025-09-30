import React, { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

interface AnimatedMetricCardProps {
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
  delay?: number;
}

const AnimatedMetricCard: React.FC<AnimatedMetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient = 'from-blue-500 to-blue-600',
  trend,
  className = '',
  delay = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (isVisible && typeof value === 'number') {
      const duration = 1000;
      const start = 0;
      const end = value;
      const increment = (end - start) / (duration / 16);
      
      let current = start;
      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          setAnimatedValue(end);
          clearInterval(timer);
        } else {
          setAnimatedValue(Math.floor(current));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isVisible, value]);

  return (
    <div 
      className={`bg-gradient-to-r ${gradient} text-white p-6 rounded-xl shadow-lg transition-all duration-1000 transform ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center transition-transform duration-500 ${
            isVisible ? 'scale-100' : 'scale-0'
          }`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`}>
              {title}
            </h3>
            {subtitle && (
              <p className={`text-sm opacity-90 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
              }`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm transition-all duration-700 ${
            trend.isPositive ? 'text-green-200' : 'text-red-200'
          } ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
            <span className="font-bold">
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs">vs trước</span>
          </div>
        )}
      </div>
      
      <div className={`text-3xl font-bold mb-2 transition-all duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}>
        {typeof value === 'number' ? animatedValue : value}
      </div>
      
      {trend && (
        <div className="w-full bg-white bg-opacity-20 rounded-full h-1">
          <div 
            className={`h-1 rounded-full transition-all duration-1000 ${
              trend.isPositive ? 'bg-green-300' : 'bg-red-300'
            }`}
            style={{ 
              width: `${Math.min(Math.abs(trend.value), 100)}%`,
              transitionDelay: `${delay + 500}ms`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AnimatedMetricCard;
