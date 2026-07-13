import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import i18n, { LANGUAGE_STORAGE_KEY } from '../i18n';

export type LanguageCode = 'es' | 'en';

interface LanguageContextValue {
  language: LanguageCode;
  isEnglish: boolean;
  toggleLanguage: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

const normalizeLanguage = (value: string): LanguageCode =>
  value.toLowerCase().startsWith('en') ? 'en' : 'es';

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { t: translate } = useTranslation();
  const language = normalizeLanguage(i18n.language);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const toggleLanguage = useCallback(() => {
    const nextLanguage = normalizeLanguage(i18n.language) === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nextLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }, []);

  const t = useCallback(
    (key: string, values?: Record<string, string | number>) => translate(key, values),
    [translate],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      isEnglish: language === 'en',
      toggleLanguage,
      t,
    }),
    [language, t, toggleLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return context;
};
