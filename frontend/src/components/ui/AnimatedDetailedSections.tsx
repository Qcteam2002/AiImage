import React, { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

interface AnimatedDetailedSectionsProps {
  sections: Array<{
    title: string;
    icon: LucideIcon;
    iconColor?: string;
    iconBg?: string;
    children: React.ReactNode;
    delay?: number;
  }>;
  className?: string;
}

const AnimatedDetailedSections: React.FC<AnimatedDetailedSectionsProps> = ({
  sections,
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
      {sections.map((section, index) => (
        <div
          key={index}
          className={`bg-white rounded-2xl shadow-xl border-0 mt-8 transition-all duration-1000 transform ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: `${section.delay || index * 100}ms` }}
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 ${section.iconBg || 'bg-red-100'} rounded-xl flex items-center justify-center transition-transform duration-500 ${
                isVisible ? 'scale-100' : 'scale-0'
              }`}>
                <section.icon className={`w-5 h-5 ${section.iconColor || 'text-red-600'}`} />
              </div>
              <h3 className={`text-xl font-bold text-gray-900 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
              }`}>
                {section.title}
              </h3>
            </div>
          </div>
          <div className="p-6">
            <div className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}>
              {section.children}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnimatedDetailedSections;