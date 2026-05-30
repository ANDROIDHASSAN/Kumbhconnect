import { useTranslations } from 'next-intl';
import { Section, SectionHeading } from '@/components/ui/Section';
import { EmergencyClient } from '@/components/emergency/EmergencyClient';
import { Seo } from '@/lib/seo';

export function Emergency() {
  const t = useTranslations('emergency');
  return (
    <>
      <Seo title={t('title')} description={t('subtitle')} path="/emergency" noindex />
      <Section tone="cream">
        <SectionHeading title={t('title')} subtitle={t('subtitle')} center />
        <div className="mt-10"><EmergencyClient /></div>
      </Section>
    </>
  );
}
