import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  
  const handleLanguageChange = (lang: string) => {
    console.log('Changing language to:', lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    // Force re-render by updating document
    document.documentElement.lang = lang;
  };

  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-[#6D7175]" />
      <select
        value={i18n.language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="text-sm border border-[#D1D3D4] rounded-md px-2 py-1 bg-white text-[#212326] focus:outline-none focus:ring-2 focus:ring-[#212326] focus:border-transparent hover:border-[#8C9196] transition-colors duration-150"
      >
        <option value="vi">🇻🇳 Tiếng Việt</option>
        <option value="en">🇺🇸 English</option>
      </select>
    </div>
  );
};
