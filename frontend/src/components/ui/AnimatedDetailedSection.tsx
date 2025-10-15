import React, { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

interface AnimatedDetailedSectionProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedDetailedSection: React.FC<AnimatedDetailedSectionProps> = ({
  title,
  icon: Icon,
  iconColor = 'text-red-600',
  iconBg = 'bg-red-100',
  children,
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
    <div 
      className={`bg-white rounded-2xl shadow-xl border-0 mt-8 transition-all duration-1000 transform ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center transition-transform duration-500 ${
            isVisible ? 'scale-100' : 'scale-0'
          }`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <h3 className={`text-xl font-bold text-gray-900 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          }`}>
            {title}
          </h3>
        </div>
      </div>
      <div className="p-6">
        <div className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AnimatedDetailedSection;





