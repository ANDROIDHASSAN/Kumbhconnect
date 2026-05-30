import { useTranslations } from 'next-intl';
import { Section, SectionHeading } from '@/components/ui/Section';
import { BookingForm } from '@/components/booking/BookingForm';
import { Seo } from '@/lib/seo';

export function Book() {
  const t = useTranslations('book');
  return (
    <>
      <Seo title={t('title')} description={t('subtitle')} path="/book" />
      <Section tone="cream">
        <SectionHeading title={t('title')} subtitle={t('subtitle')} center />
        <div className="mt-10"><BookingForm /></div>
      </Section>
    </>
  );
}
