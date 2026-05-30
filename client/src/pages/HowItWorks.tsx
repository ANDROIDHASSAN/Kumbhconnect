import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/PageHeader';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { useTitle } from '@/lib/useTitle';

export function HowItWorks() {
  const t = useTranslations('home');
  const nav = useTranslations('nav');
  const c = useTranslations('common');
  useTitle(nav('howItWorks'));
  return (
    <>
      <PageHeader title={nav('howItWorks')} subtitle={t('servicesSubtitle')} image="river" />
      <Section tone="white">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="relative rounded-card border border-line bg-white p-7 shadow-soft">
              <span className="font-display text-5xl font-bold text-saffron/30">0{n}</span>
              <h3 className="mt-3 text-xl font-bold text-ink">{t(`how.step${n}`)}</h3>
              <p className="mt-2 text-muted">{t(`how.step${n}Desc`)}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section tone="cream">
        <div className="rounded-card border border-line bg-white p-8 text-center shadow-soft">
          <h2 className="text-2xl font-extrabold">{t('ctaTitle')}</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted">{t('ctaSubtitle')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button as={Link} href="/book" size="lg">{c('bookNow')}</Button>
            <WhatsAppButton size="lg" message="Namaste! I'd like to know how Kumbh Connect works." />
          </div>
        </div>
      </Section>
    </>
  );
}
