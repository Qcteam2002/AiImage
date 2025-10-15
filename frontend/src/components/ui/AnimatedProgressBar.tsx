import React, { useState, useEffect } from 'react';

interface AnimatedProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  delay?: number;
  duration?: number;
}

const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  value,
  max = 100,
  color = 'bg-blue-600',
  size = 'md',
  showLabel = true,
  className = '',
  delay = 0,
  duration = 1000
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
    if (isVisible) {
      const targetValue = Math.min((value / max) * 100, 100);
      const increment = targetValue / (duration / 16);
      
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
          setAnimatedValue(targetValue);
          clearInterval(timer);
        } else {
          setAnimatedValue(current);
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isVisible, value, max, duration]);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{value}%</span>
          <span>{max}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${color} h-full rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${animatedValue}%` }}
        />
      </div>
    </div>
  );
};

export default AnimatedProgressBar;





