import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/PageHeader';
import { useTitle } from '@/lib/useTitle';

export function About() {
  const nav = useTranslations('nav');
  useTitle(nav('about'));
  return (
    <>
      <PageHeader title={nav('about')} subtitle="One trusted digital partner for Kumbh visitors." image="templeDusk" />
      <Section tone="white">
        <article className="prose-kumbh mx-auto max-w-3xl">
          <p>Kumbh Connect is built by a small team that served pilgrims at the 2015 Simhastha Kumbh. We saw how hard it can be for out-of-town families and elderly travellers to find a trustworthy place to stay, a fair ride, and a real person to ask for help when the crowds swell.</p>
          <h2>What we do</h2>
          <p>We bring stays, tents, cabs, food, route guidance, parking information and emergency help into one mobile-first experience — with verified vendors, transparent pricing, and live WhatsApp support in English, Hindi and Marathi. Every flow can reach a human in one tap.</p>
          <h2>How we keep it trustworthy</h2>
          <ul>
            <li>Every vendor is KYC-verified before they appear in our options.</li>
            <li>Pricing is all-inclusive and shown before you pay.</li>
            <li>You pay only a small advance to confirm; the balance is paid on arrival.</li>
            <li>We store minimal personal information and ask consent before any analytics.</li>
          </ul>
          <h2>Our promise</h2>
          <p>A peaceful, well-supported pilgrimage. If anything goes wrong, one trusted number is there for you — from the moment you plan to the moment you reach home.</p>
        </article>
      </Section>
    </>
  );
}
