import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Stars } from '@/components/Stars';
import { ServiceIcon } from '@/components/icons/ServiceIcons';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Reveal } from '@/components/motion';
import { Seo, breadcrumbSchema } from '@/lib/seo';
import { getVendor, type VendorWithInventory } from '@/lib/api';
import { vendorFromPrice } from '@/lib/data';
import { IMAGES } from '@/lib/images';
import type { ServiceType } from '@/lib/types';
import { NotFound } from './NotFound';

const SERVICE_IMAGE: Record<ServiceType, string> = {
  rooms: IMAGES.palaceDusk, tents: IMAGES.river, cabs: IMAGES.fortWater, food: IMAGES.fortWater,
  routes: IMAGES.river, emergency: IMAGES.templeDusk, parking: IMAGES.palaceDusk,
};

export function VendorDetail() {
  const { id = '' } = useParams();
  const t = useTranslations('services');
  const c = useTranslations('common');
  const [vendor, setVendor] = useState<VendorWithInventory | null | undefined>(undefined);

  useEffect(() => {
    let on = true;
    setVendor(undefined);
    getVendor(id).then((v) => on && setVendor(v)).catch(() => on && setVendor(null));
    return () => { on = false; };
  }, [id]);

  if (vendor === undefined) {
    return <div className="container-page section text-center text-muted">{c('loading')}</div>;
  }
  if (vendor === null) return <NotFound />;

  const type = vendor.type as ServiceType;
  const serviceName = t(`${type}.name`);
  const included = (t.raw(`${type}.included`) as string[]) || [];
  const rates = vendor.rates_json ? Object.entries(vendor.rates_json) : [];
  const fromPrice = vendorFromPrice(vendor);
  const bookHref = `/book?service=${type}&vendor=${vendor.id}&vendorName=${encodeURIComponent(vendor.name)}`;
  const waMsg = `Namaste! I'd like to book ${vendor.name} (${serviceName}) in ${vendor.area} for the Nashik Kumbh 2027.`;

  return (
    <>
      <Seo
        title={`${vendor.name} — ${serviceName}`}
        description={`Book ${vendor.name} in ${vendor.area} for the Nashik Kumbh 2027. Verified ${serviceName.toLowerCase()} from ₹${fromPrice.toLocaleString('en-IN')} with secure advance and live WhatsApp support.`}
        path={`/vendor/${vendor.id}`}
        jsonLd={[breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: t('title'), path: '/services' },
          { name: serviceName, path: `/services/${type}` },
          { name: vendor.name, path: `/vendor/${vendor.id}` },
        ])]}
      />

      {/* Header */}
      <section className="relative overflow-hidden bg-ink text-white">
        <img src={vendor.image_url || SERVICE_IMAGE[type]} alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/45" />
        <div className="container-page relative py-14">
          <nav className="mb-5 text-sm text-cream/60" aria-label="Breadcrumb">
            <Link href="/services" className="hover:text-white">{t('title')}</Link>
            <span className="mx-2">/</span>
            <Link href={`/services/${type}`} className="hover:text-white">{serviceName}</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{vendor.name}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-gold shadow-soft ring-1 ring-white/20" aria-hidden>
              <ServiceIcon slug={type} className="h-8 w-8" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">{vendor.name}</h1>
                {vendor.kyc_status === 'verified' && <Badge tone="green">✓ {c('verified')}</Badge>}
              </div>
              <p className="mt-1 text-cream/70">📍 {vendor.area} · {serviceName}</p>
              {vendor.rating != null && <div className="mt-2"><Stars rating={vendor.rating} /></div>}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button as={Link} href={bookHref} size="lg" className="shine">Book this {serviceName.toLowerCase()}</Button>
            <WhatsAppButton size="lg" message={waMsg} />
          </div>
        </div>
      </section>

      {/* Body */}
      <Section tone="white">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {rates.length > 0 && (
              <Reveal>
                <h2 className="text-2xl font-extrabold">Rates</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {rates.map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between rounded-xl border border-line bg-cream px-4 py-3">
                      <span className="text-sm font-medium capitalize text-ink">{k}</span>
                      <span className="font-display text-lg font-bold text-plum">₹{Number(v).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal>
              <h2 className="text-2xl font-extrabold">{t('whatsIncluded')}</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-ink/80"><span className="mt-0.5 text-teal" aria-hidden>✓</span>{item}</li>
                ))}
              </ul>
            </Reveal>

            {vendor.inventory && vendor.inventory.length > 0 && (
              <Reveal>
                <h2 className="text-2xl font-extrabold">Availability</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {vendor.inventory.slice(0, 8).map((i) => (
                    <div key={i.id} className="rounded-xl border border-line bg-white px-3 py-2 text-center shadow-soft">
                      <div className="text-xs font-semibold text-ink">{new Date(i.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                      <div className="text-xs text-teal">{i.units_available} left</div>
                      <div className="text-sm font-bold text-plum">₹{Number(i.price).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          {/* Booking aside */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-20">
              <p className="eyebrow">{c('from')}</p>
              <p className="mt-1 font-display text-3xl font-bold text-plum">₹{fromPrice.toLocaleString('en-IN')}</p>
              <p className="mt-1 text-sm text-muted">{t(`${type}.priceRange`)}</p>
              <div className="mt-5 flex flex-col gap-2">
                <Button as={Link} href={bookHref}>{c('bookNow')}</Button>
                <WhatsAppButton message={waMsg} />
              </div>
              <p className="mt-4 border-t border-line pt-4 text-xs text-muted">
                Pay a small advance to confirm. Balance on arrival. Free cancellation window applies.
              </p>
            </Card>
          </aside>
        </div>
      </Section>
    </>
  );
}
