import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VendorCard } from '@/components/VendorCard';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ServiceIcon } from '@/components/icons/ServiceIcons';
import { Reveal } from '@/components/motion';
import { Seo, serviceSchema, breadcrumbSchema } from '@/lib/seo';
import { getService } from '@/lib/services';
import { getServiceVendors } from '@/lib/api';
import { IMAGES } from '@/lib/images';
import type { ServiceType, Vendor } from '@/lib/types';
import { NotFound } from './NotFound';

const SERVICE_IMAGE: Record<ServiceType, string> = {
  rooms: IMAGES.palaceDusk, tents: IMAGES.river, cabs: IMAGES.fortWater, food: IMAGES.fortWater,
  routes: IMAGES.river, emergency: IMAGES.templeDusk, parking: IMAGES.palaceDusk,
};

export function ServiceDetail() {
  const { slug = '' } = useParams();
  const t = useTranslations('services');
  const c = useTranslations('common');
  const meta = getService(slug);
  const key = slug as ServiceType;
  const [vendors, setVendors] = useState<Vendor[] | null>(null);

  const isInfoOnly = key === 'routes' || key === 'emergency';

  useEffect(() => {
    if (!meta || isInfoOnly) return;
    let on = true;
    getServiceVendors(key).then((v) => on && setVendors(v.slice(0, 6))).catch(() => on && setVendors([]));
    return () => { on = false; };
  }, [key, meta, isInfoOnly]);

  if (!meta) return <NotFound />;

  const included = (t.raw(`${key}.included`) as string[]) || [];
  const isPhase3 = Boolean(meta.phase3);

  return (
    <>
      <Seo
        title={`${t(`${key}.name`)} — Nashik Kumbh 2027`}
        description={t(`${key}.long`)}
        path={`/services/${key}`}
        jsonLd={[
          serviceSchema(t(`${key}.name`), t(`${key}.long`), `/services/${key}`),
          breadcrumbSchema([{ name: 'Home', path: '/' }, { name: t('title'), path: '/services' }, { name: t(`${key}.name`), path: `/services/${key}` }]),
        ]}
      />
      <section className="relative overflow-hidden bg-ink text-white">
        <Image src={SERVICE_IMAGE[key]} alt="" fill priority sizes="100vw" className="object-cover object-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/45" />
        <div className="container-page relative py-14">
          <nav className="mb-5 text-sm text-cream/60" aria-label="Breadcrumb">
            <Link href="/services" className="hover:text-white">{t('title')}</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{t(`${key}.name`)}</span>
          </nav>
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-gold shadow-soft ring-1 ring-white/20 backdrop-blur" aria-hidden>
              <ServiceIcon slug={key} className="h-8 w-8" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">{t(`${key}.name`)}</h1>
                {isPhase3 && <Badge tone="neutral">{c('comingSoon')}</Badge>}
              </div>
              <p className="mt-1 text-cream/70">{t(`${key}.short`)}</p>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-lg text-cream/85">{t(`${key}.long`)}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {isInfoOnly ? (
              key === 'emergency'
                ? <Button as={Link} href="/emergency" variant="danger" size="lg">{c('getHelp')}</Button>
                : <Button as={Link} href="/kumbh-guide" size="lg">{c('viewOptions')}</Button>
            ) : <Button as={Link} href={`/book?service=${key}`} size="lg">{c('bookNow')}</Button>}
            <WhatsAppButton size="lg" message={`Namaste! I'm interested in ${t(`${key}.name`)} for the Nashik Kumbh 2027.`} />
          </div>
        </div>
      </section>

      <Section tone="white">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-extrabold">{t('whatsIncluded')}</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-ink/80"><span className="mt-0.5 text-teal" aria-hidden>✓</span>{item}</li>
                ))}
              </ul>
            </div>
            {!isInfoOnly && (
              <div>
                <h2 className="text-2xl font-extrabold">{t('sampleOptions')}</h2>
                {vendors === null ? (
                  <p className="mt-4 text-muted">{c('loading')}</p>
                ) : vendors.length ? (
                  <Reveal stagger={0.08} y={24} className="mt-4 grid gap-4 sm:grid-cols-2">
                    {vendors.map((v) => <VendorCard key={v.id} vendor={v} fromLabel={c('from')} verifiedLabel={c('verified')} />)}
                  </Reveal>
                ) : <div className="mt-4"><EmptyState title={c('nothingHere')} description={c('comingSoon')} /></div>}
              </div>
            )}
          </div>
          <aside className="lg:col-span-1">
            <div className="sticky top-20 rounded-card border border-line bg-cream p-6 shadow-soft">
              <p className="eyebrow">{t('pricing')}</p>
              <p className="mt-2 font-display text-2xl font-bold text-plum">{t(`${key}.priceRange`)}</p>
              <p className="mt-2 text-sm text-muted">{t(`${key}.long`)}</p>
              <div className="mt-5 flex flex-col gap-2">
                {isInfoOnly ? (
                  key === 'emergency'
                    ? <Button as={Link} href="/emergency" variant="danger">{c('getHelp')}</Button>
                    : <Button as={Link} href="/kumbh-guide">{c('viewOptions')}</Button>
                ) : <Button as={Link} href={`/book?service=${key}`}>{c('bookNow')}</Button>}
                <WhatsAppButton message={`Namaste! Please share options for ${t(`${key}.name`)}.`} />
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
