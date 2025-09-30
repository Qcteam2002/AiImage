import React, { useState, useEffect } from 'react';

interface AnimatedLoadingSpinnersProps {
  spinners: Array<{
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: string;
    text?: string;
    delay?: number;
  }>;
  className?: string;
}

const AnimatedLoadingSpinners: React.FC<AnimatedLoadingSpinnersProps> = ({
  spinners,
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
    <div className={`space-y-8 ${className}`}>
      {spinners.map((spinner, index) => (
        <div
          key={index}
          className={`flex flex-col items-center justify-center transition-all duration-1000 transform ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: `${spinner.delay || index * 100}ms` }}
        >
          <div className={`${spinner.size === 'sm' ? 'w-4 h-4' : spinner.size === 'md' ? 'w-8 h-8' : spinner.size === 'lg' ? 'w-12 h-12' : 'w-16 h-16'} ${spinner.color || 'text-blue-600'} animate-spin mb-4`}>
            <svg
              className="w-full h-full"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          {spinner.text && (
            <p className="text-gray-600 text-lg animate-pulse">{spinner.text}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default AnimatedLoadingSpinners;