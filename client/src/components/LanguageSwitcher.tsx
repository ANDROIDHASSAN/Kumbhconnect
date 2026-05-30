import { useI18n, locales, localeNames, type Locale } from '@/i18n';
import { useTranslations } from 'next-intl';

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const t = useTranslations('lang');
  return (
    <label className="inline-flex items-center gap-1.5 text-sm">
      <span className="sr-only">{t('label')}</span>
      <span aria-hidden className="text-base">🌐</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label={t('label')}
        className="rounded-full border border-line bg-white px-2.5 py-1.5 text-sm font-medium text-ink focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/30"
      >
        {locales.map((l) => (
          <option key={l} value={l}>{localeNames[l]}</option>
        ))}
      </select>
    </label>
  );
}
