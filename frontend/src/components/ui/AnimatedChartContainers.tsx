import React, { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

interface AnimatedChartContainersProps {
  charts: Array<{
    title: string;
    icon: LucideIcon;
    iconColor?: string;
    iconBg?: string;
    children: React.ReactNode;
    delay?: number;
  }>;
  className?: string;
}

const AnimatedChartContainers: React.FC<AnimatedChartContainersProps> = ({
  charts,
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
      {charts.map((chart, index) => (
        <div
          key={index}
          className={`bg-white rounded-2xl shadow-xl border-0 transition-all duration-1000 transform ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: `${chart.delay || index * 100}ms` }}
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 ${chart.iconBg || 'bg-blue-100'} rounded-xl flex items-center justify-center transition-transform duration-500 ${
                isVisible ? 'scale-100' : 'scale-0'
              }`}>
                <chart.icon className={`w-5 h-5 ${chart.iconColor || 'text-blue-600'}`} />
              </div>
              <h3 className={`text-xl font-bold text-gray-900 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
              }`}>
                {chart.title}
              </h3>
            </div>
          </div>
          <div className="p-6">
            <div className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}>
              {chart.children}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnimatedChartContainers;