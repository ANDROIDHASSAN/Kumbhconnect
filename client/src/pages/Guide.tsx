import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FaqAccordion } from '@/components/FaqAccordion';
import { PageHeader } from '@/components/PageHeader';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Seo, eventSchema, faqSchema, breadcrumbSchema } from '@/lib/seo';
import { SNAN_DATES, GHATS, PACKING, DOS, DONTS, GUIDE_FAQ } from '@/lib/content';

export function Guide() {
  const t = useTranslations('guide');
  const locale = useLocale();
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(locale === 'en' ? 'en-IN' : locale, { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <Seo
        title={t('title')}
        description={t('subtitle')}
        path="/kumbh-guide"
        jsonLd={[eventSchema(), faqSchema(GUIDE_FAQ), breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Kumbh Guide', path: '/kumbh-guide' }])]}
      />
      <PageHeader eyebrow={`${t('lastUpdated')}: ${fmtDate('2026-05-01')}`} title={t('title')} subtitle={t('subtitle')} image="fortWater" />
      <Section tone="white">
        <article className="prose-kumbh mx-auto max-w-3xl">
          <h2>{t('snanTitle')}</h2>
          <div className="not-prose my-4 space-y-3">
            {SNAN_DATES.map((s) => (
              <Card key={s.name} className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-ink">{s.name}</p>
                  <p className="text-sm text-muted">{s.note}</p>
                </div>
                <Badge tone="saffron">{fmtDate(s.date)}</Badge>
              </Card>
            ))}
          </div>
          <p className="text-sm italic text-muted">{t('snanNote')}</p>

          <h2>{t('ghatsTitle')}</h2>
          <ul>{GHATS.map((g) => <li key={g.name}><strong className="text-ink">{g.name}</strong> — {g.desc}</li>)}</ul>

          <h2>{t('packingTitle')}</h2>
          <ul>{PACKING.map((p) => <li key={p}>{p}</li>)}</ul>

          <h2>{t('transportTitle')}</h2>
          <p>Nashik Road railway station is the main rail gateway; Trimbakeshwar is about 28 km from Nashik city by road. On Shahi Snan days, private vehicles are restricted near the ghats — park at designated outer zones and use the e-shuttle services. Book a verified cab in advance for station and airport transfers.</p>
          <div className="not-prose my-4 flex flex-wrap gap-3">
            <Button as={Link} href="/services/cabs">Book a cab</Button>
            <Button as={Link} href="/services/parking" variant="outline">Parking info</Button>
          </div>

          <h2>{t('dosTitle')}</h2>
          <div className="not-prose grid gap-4 sm:grid-cols-2">
            <Card>
              <p className="mb-2 font-bold text-teal">{t('dos')}</p>
              <ul className="space-y-1.5 text-sm text-ink/80">{DOS.map((d) => <li key={d} className="flex gap-2"><span className="text-teal" aria-hidden>✓</span>{d}</li>)}</ul>
            </Card>
            <Card>
              <p className="mb-2 font-bold text-rose">{t('donts')}</p>
              <ul className="space-y-1.5 text-sm text-ink/80">{DONTS.map((d) => <li key={d} className="flex gap-2"><span className="text-rose" aria-hidden>✕</span>{d}</li>)}</ul>
            </Card>
          </div>

          <h2>{t('safetyTitle')}</h2>
          <p>Save the national emergency number 112 and the Kumbh Connect WhatsApp line before you travel. For medical, police or lost-and-found help on the ground, our Emergency page shares your location and connects you to the nearest desk in one tap.</p>
          <div className="not-prose my-4 flex flex-wrap gap-3">
            <Button as={Link} href="/emergency" variant="danger">Emergency help</Button>
            <WhatsAppButton message="Namaste! I have a question from the Kumbh Guide." />
          </div>

          <h2>{t('faqTitle')}</h2>
          <div className="not-prose mt-4"><FaqAccordion items={GUIDE_FAQ} /></div>
        </article>
      </Section>
    </>
  );
}
