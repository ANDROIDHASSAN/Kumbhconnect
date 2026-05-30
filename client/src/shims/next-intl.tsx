// Shim mapping `next-intl` imports to our React i18n context.
export { useTranslations, useLocale } from '@/i18n';
import type { ReactNode } from 'react';

export function NextIntlClientProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
export function useMessages() {
  return {};
}
export function hasLocale() {
  return true;
}
