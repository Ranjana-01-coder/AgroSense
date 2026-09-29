
'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAgroStore, Language } from './store';
import { z } from 'zod';
import en from './locales/en.json';
import hi from './locales/hi.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import mr from './locales/mr.json';
import ta from './locales/ta.json';
import te from './locales/te.json';

const translations = {
  English: en,
  Hindi: hi,
  Kannada: kn,
  Malayalam: ml,
  Marathi: mr,
  Tamil: ta,
  Telugu: te,
};

type TranslationContextType = {
  t: (key: string, options?: { [key: string]: string | number }) => string;
  language: Language;
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const { language } = useAgroStore();
  const localeData = translations[language] || en;

  const t = (key: string, options?: { [key: string]: string | number }): string => {
    let translation = getNestedValue(localeData, key) || key;
    if (options) {
      Object.keys(options).forEach((k) => {
        translation = translation.replace(`{{${k}}}`, String(options[k]));
      });
    }
    return translation;
  };

  const value = useMemo(() => ({ t, language }), [language]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
