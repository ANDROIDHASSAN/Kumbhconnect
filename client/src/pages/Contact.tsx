import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/PageHeader';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { whatsappNumber } from '@/lib/whatsapp';
import { useTitle } from '@/lib/useTitle';

export function Contact() {
  const nav = useTranslations('nav');
  const number = whatsappNumber();
  useTitle(nav('contact'));
  return (
    <>
      <PageHeader title={nav('contact')} subtitle="The fastest way to reach us is WhatsApp — real people, quick replies." image="palaceDusk" />
      <Section tone="white">
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          <Card>
            <p className="text-2xl" aria-hidden>💬</p>
            <h2 className="mt-2 font-bold text-ink">WhatsApp</h2>
            <p className="mt-1 text-sm text-muted">+{number} · English, हिंदी, मराठी</p>
            <div className="mt-3"><WhatsAppButton size="sm" message="Namaste! I'd like to get in touch with Kumbh Connect." /></div>
          </Card>
          <Card>
            <p className="text-2xl" aria-hidden>📞</p>
            <h2 className="mt-2 font-bold text-ink">Phone</h2>
            <p className="mt-1 text-sm text-muted">Call us for help with a booking or a question.</p>
            <a href={`tel:+${number}`} className="mt-3 inline-block text-sm font-semibold text-saffron-dark underline">+{number}</a>
          </Card>
          <Card>
            <p className="text-2xl" aria-hidden>📧</p>
            <h2 className="mt-2 font-bold text-ink">Email</h2>
            <a href="mailto:hello@kumbhconnect.in" className="mt-1 inline-block text-sm text-saffron-dark underline">hello@kumbhconnect.in</a>
          </Card>
          <Card>
            <p className="text-2xl" aria-hidden>📍</p>
            <h2 className="mt-2 font-bold text-ink">Where we work</h2>
            <p className="mt-1 text-sm text-muted">Nashik and Trimbakeshwar, Maharashtra, India.</p>
          </Card>
        </div>
      </Section>
    </>
  );
}
