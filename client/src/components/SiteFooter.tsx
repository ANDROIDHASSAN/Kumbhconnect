import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { BrandMark } from '@/components/icons/ServiceIcons';
import { SERVICES } from '@/lib/services';

export function SiteFooter() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const svc = useTranslations('services');
  const brand = useTranslations('brand');
  const year = 2027;

  return (
    <footer className="border-t border-line bg-ink text-cream/80">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-saffron to-saffron-dark text-white" aria-hidden>
              <BrandMark className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-bold text-white">{brand('name')}</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-cream/60">{t('tagline')}</p>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-white">{t('services')}</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {SERVICES.slice(0, 5).map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="text-cream/70 hover:text-white">
                  {svc(`${s.slug}.name`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-white">{t('company')}</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about" className="text-cream/70 hover:text-white">{nav('about')}</Link></li>
            <li><Link href="/kumbh-guide" className="text-cream/70 hover:text-white">{nav('guide')}</Link></li>
            <li><Link href="/vendors" className="text-cream/70 hover:text-white">{nav('vendors')}</Link></li>
            <li><Link href="/contact" className="text-cream/70 hover:text-white">{nav('contact')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-white">{t('legal')}</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/safety" className="text-cream/70 hover:text-white">{nav('safety')}</Link></li>
            <li><Link href="/privacy" className="text-cream/70 hover:text-white">{t('privacy')}</Link></li>
            <li><Link href="/refunds" className="text-cream/70 hover:text-white">{t('refunds')}</Link></li>
            <li><Link href="/terms" className="text-cream/70 hover:text-white">{t('terms')}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-cream/50 sm:flex-row">
          <p>© {year} {brand('name')}. {t('rights')}</p>
          <p>{t('madeWith')}</p>
        </div>
      </div>
    </footer>
  );
}
