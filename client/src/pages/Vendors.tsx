import { useTranslations } from 'next-intl';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/PageHeader';
import { VendorForm } from '@/components/VendorForm';
import { Seo } from '@/lib/seo';

const VALUE_KEYS = ['demand', 'payments', 'support'] as const;
const VALUE_ICONS = { demand: '📈', payments: '💳', support: '🤝' };
const COMMISSION_KEYS = ['rooms', 'cabs', 'food', 'promos'] as const;

export function Vendors() {
  const t = useTranslations('vendors');
  return (
    <>
      <Seo title={t('title')} description={t('subtitle')} path="/vendors" />
      <PageHeader title={t('title')} subtitle={t('subtitle')} image="palaceDusk" />
      <Section tone="white">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-8">
            <div>
              <SectionHeading title={t('valueTitle')} />
              <div className="mt-5 space-y-3">
                {VALUE_KEYS.map((k) => (
                  <Card key={k} className="flex gap-3">
                    <span className="text-2xl" aria-hidden>{VALUE_ICONS[k]}</span>
                    <div>
                      <p className="font-bold text-ink">{t(`value.${k}`)}</p>
                      <p className="text-sm text-muted">{t(`value.${k}Desc`)}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <SectionHeading title={t('commissionTitle')} />
              <ul className="mt-5 space-y-2">
                {COMMISSION_KEYS.map((k) => (
                  <li key={k} className="flex items-center gap-2 rounded-xl border border-line bg-cream px-4 py-3 text-sm font-medium text-ink">
                    <span className="text-saffron-dark" aria-hidden>•</span>{t(`commission.${k}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div><VendorForm /></div>
        </div>
      </Section>
    </>
  );
}
