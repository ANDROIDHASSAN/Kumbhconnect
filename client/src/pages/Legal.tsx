import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/PageHeader';
import { useTitle } from '@/lib/useTitle';

export function Legal({ kind }: { kind: 'privacy' | 'refunds' | 'terms' }) {
  const f = useTranslations('footer');
  const title = f(kind === 'privacy' ? 'privacy' : kind === 'refunds' ? 'refunds' : 'terms');
  useTitle(title);
  return (
    <>
      <PageHeader title={title} subtitle={SUBTITLE[kind]} />
      <Section tone="white">
        <article className="prose-kumbh mx-auto max-w-3xl">{CONTENT[kind]}</article>
      </Section>
    </>
  );
}

const SUBTITLE = {
  privacy: 'How we handle your data — written to be DPDP-Act aware.',
  refunds: 'Clear, fair terms — shown before you pay.',
  terms: 'The basics of using Kumbh Connect.',
};

const CONTENT = {
  privacy: (
    <>
      <p>We collect the minimum information needed to help you book and travel: your name, phone number, preferred language, travel dates, party size and area. We use this only to fulfil your request and to contact you about your booking.</p>
      <h2>Consent for analytics</h2>
      <p>Analytics and marketing cookies load only after you accept them in the consent banner. You can decline and still use the entire site.</p>
      <h2>What we store</h2>
      <ul><li>Booking and lead details you submit through the website or WhatsApp.</li><li>Support conversations needed to help you.</li><li>We do not sell your personal data.</li></ul>
      <h2>Your rights</h2>
      <p>You may ask us to access, correct or delete your personal data. Contact us on WhatsApp or at hello@kumbhconnect.in.</p>
      <h2>Payments</h2>
      <p>Payments are processed by our payment partner (Razorpay). We do not store your card or UPI credentials on our servers.</p>
    </>
  ),
  refunds: (
    <>
      <h2>Advance and balance</h2>
      <p>You pay a small advance (about 20%) to confirm a booking. The balance is paid on arrival to the vendor.</p>
      <h2>Cancellation window</h2>
      <ul><li>Free cancellation within the window shown on your booking (typically up to 72 hours before check-in for stays).</li><li>Cancellations after the free window may forfeit part or all of the advance.</li><li>No-shows are non-refundable.</li></ul>
      <h2>Refund timeline</h2>
      <p>Approved refunds are returned to your original payment method, usually within 5–7 business days.</p>
      <h2>Service disruptions</h2>
      <p>If a confirmed service cannot be delivered due to administration restrictions or vendor failure, we help you rebook or arrange a full refund of the advance.</p>
    </>
  ),
  terms: (
    <>
      <h2>About the service</h2>
      <p>Kumbh Connect connects pilgrims with verified vendors for stays, tents, cabs, food, parking and route guidance, plus emergency assistance. We facilitate bookings; the underlying service is delivered by the listed vendor.</p>
      <h2>Your responsibilities</h2>
      <ul><li>Provide accurate booking details and a reachable phone number.</li><li>Follow administration, police and venue instructions during the Mela.</li><li>Pay the balance to the vendor as agreed.</li></ul>
      <h2>Pricing and payments</h2>
      <p>Prices shown are indicative until confirmed. Advances are collected through our payment partner. Taxes and fees, if any, are shown before payment.</p>
      <h2>Liability</h2>
      <p>We work only with KYC-verified vendors and provide live support, but we are not liable for circumstances outside our reasonable control, including administration restrictions, weather and crowd conditions.</p>
    </>
  ),
};
