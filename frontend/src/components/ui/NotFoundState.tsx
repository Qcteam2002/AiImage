import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NotFoundStateProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  showBack?: boolean;
  onBack?: () => void;
  className?: string;
}

const NotFoundState: React.FC<NotFoundStateProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-gray-600',
  iconBg = 'bg-gray-100',
  showBack = true,
  onBack,
  className = ''
}) => {
  return (
    <div className={`p-6 max-w-6xl mx-auto ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
      </div>

      <div className="text-center py-12">
        <div className={`w-16 h-16 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Icon className={`w-8 h-8 ${iconColor}`} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{subtitle}</p>
        {showBack && onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách
          </button>
        )}
      </div>
    </div>
  );
};

export default NotFoundState;


