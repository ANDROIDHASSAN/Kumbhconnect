import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import en from './messages/en.json';
import hi from './messages/hi.json';
import mr from './messages/mr.json';

export const locales = ['en', 'hi', 'mr'] as const;
export type Locale = (typeof locales)[number];
export const localeNames: Record<Locale, string> = { en: 'English', hi: 'हिंदी', mr: 'मराठी' };

const MESSAGES: Record<Locale, any> = { en, hi, mr };

function resolve(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

interface Ctx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  messages: any;
}
const I18nContext = createContext<Ctx>({ locale: 'en', setLocale: () => {}, messages: en });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = typeof localStorage !== 'undefined' ? (localStorage.getItem('kc-locale') as Locale) : null;
    return saved && locales.includes(saved) ? saved : 'en';
  });
  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem('kc-locale', l);
    document.documentElement.lang = l;
    setLocaleState(l);
  }, []);
  return <I18nContext.Provider value={{ locale, setLocale, messages: MESSAGES[locale] }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
export function useLocale(): Locale {
  return useContext(I18nContext).locale;
}

/** next-intl-compatible translator: const t = useTranslations('home'); t('heroTitle'); t.raw('list'). */
export function useTranslations(namespace?: string) {
  const { messages } = useContext(I18nContext);
  const t = ((key: string, vals?: Record<string, string | number>) => {
    const full = namespace ? `${namespace}.${key}` : key;
    let v = resolve(messages, full);
    if (v == null) return full;
    if (typeof v === 'string' && vals) {
      for (const [k, val] of Object.entries(vals)) v = (v as string).replaceAll(`{${k}}`, String(val));
    }
    return v as string;
  }) as ((key: string, vals?: Record<string, string | number>) => string) & { raw: (key: string) => any };
  t.raw = (key: string) => resolve(messages, namespace ? `${namespace}.${key}` : key);
  return t;
}
