import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { ServiceTile } from '@/components/ServiceTile';
import { Reveal, SplitHeading } from '@/components/motion';
import { Seo, breadcrumbSchema } from '@/lib/seo';
import { SERVICES } from '@/lib/services';

export function Services() {
  const t = useTranslations('services');
  return (
    <>
      <Seo
        title={`${t('title')} — Kumbh Connect`}
        description={t('subtitle')}
        path="/services"
        jsonLd={[breadcrumbSchema([{ name: 'Home', path: '/' }, { name: t('title'), path: '/services' }])]}
      />
      <Section tone="cream">
        <div className="text-center">
          <SplitHeading as="h1" text={t('title')} className="mx-auto font-display text-4xl font-bold sm:text-5xl" />
          <Reveal y={14} delay={0.1}><p className="mx-auto mt-3 max-w-xl text-lg text-muted">{t('subtitle')}</p></Reveal>
        </div>
        <Reveal stagger={0.08} y={28} className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => <ServiceTile key={s.slug} service={s} />)}
        </Reveal>
      </Section>
    </>
  );
}
