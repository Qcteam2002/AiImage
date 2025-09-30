import React, { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

interface AnimatedSummaryCardsProps {
  cards: Array<{
    title: string;
    icon: LucideIcon;
    iconColor?: string;
    iconBg?: string;
    children: React.ReactNode;
    delay?: number;
  }>;
  className?: string;
}

const AnimatedSummaryCards: React.FC<AnimatedSummaryCardsProps> = ({
  cards,
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
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-white rounded-2xl shadow-xl border-0 transition-all duration-1000 transform ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: `${card.delay || index * 100}ms` }}
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className={`text-lg font-bold text-gray-900 flex items-center gap-2 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`}>
              <div className={`w-8 h-8 ${card.iconBg || 'bg-gray-100'} rounded-lg flex items-center justify-center transition-transform duration-500 ${
                isVisible ? 'scale-100' : 'scale-0'
              }`}>
                <card.icon className={`w-4 h-4 ${card.iconColor || 'text-gray-600'}`} />
              </div>
              {card.title}
            </h3>
          </div>
          <div className="p-6">
            <div className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}>
              {card.children}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnimatedSummaryCards;