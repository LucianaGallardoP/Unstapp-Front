import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';
import en from './locales/en.json';

export const LANGUAGE_STORAGE_KEY = 'unstapp_language';

const getInitialLanguage = () => {
  if (typeof window === 'undefined') {
    return 'es';
  }

  const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

  return storedLanguage === 'en' || storedLanguage === 'es' ? storedLanguage : 'es';
};

i18n.use(initReactI18next).init({
  resources: {
    es,
    en,
  },
  lng: getInitialLanguage(),
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false,
    prefix: '{',
    suffix: '}',
  },
});

export default i18n;
