// i18n system with external JSON files
export type Language = 'vi' | 'en';

export interface Translations {
  [key: string]: string | Translations;
}

// Import translations from JSON files
import viTranslations from '../locales/vi.json';
import enTranslations from '../locales/en.json';

const translations: Record<Language, Translations> = {
  vi: viTranslations,
  en: enTranslations
};

let currentLanguage: Language = 'vi';

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
  localStorage.setItem('app-language', lang);
};

export const getLanguage = (): Language => {
  const saved = localStorage.getItem('app-language') as Language;
  return saved || 'vi';
};

export const t = (key: string): string => {
  const keys = key.split('.');
  let value: any = translations[currentLanguage];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to Vietnamese if key not found
      value = translations.vi;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Return key if not found in any language
        }
      }
      break;
    }
  }
  
  return typeof value === 'string' ? value : key;
};

// Initialize language from localStorage
currentLanguage = getLanguage();
