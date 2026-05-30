import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { Seo } from '@/lib/seo';

export function NotFound() {
  const t = useTranslations('nav');
  return (
    <div className="container-page section text-center">
      <Seo title="Page not found" description="This page may have moved." noindex />
      <p className="eyebrow justify-center">404</p>
      <h1 className="mt-3 text-3xl font-extrabold">Page not found</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">This page may have moved. Head back home or chat with us on WhatsApp.</p>
      <div className="mt-6 flex justify-center"><Button as={Link} href="/">{t('home')}</Button></div>
    </div>
  );
}
