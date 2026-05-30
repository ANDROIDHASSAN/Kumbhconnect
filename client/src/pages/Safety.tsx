import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/PageHeader';
import { DOS, DONTS } from '@/lib/content';
import { useTitle } from '@/lib/useTitle';

export function Safety() {
  const nav = useTranslations('nav');
  const g = useTranslations('guide');
  useTitle(nav('safety'));
  return (
    <>
      <PageHeader title={nav('safety')} subtitle={g('safetyTitle')} image="river" />
      <Section tone="white">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-card border border-rose/30 bg-rose/5 p-5">
            <p className="font-bold text-rose">In an emergency</p>
            <p className="mt-1 text-sm text-ink/80">Call the national helpline 112 immediately for any life-threatening situation. For medical, police or lost-and-found help on the ground, use our one-tap Emergency page.</p>
            <div className="mt-3"><Button as={Link} href="/emergency" variant="danger" size="sm">{nav('emergency')}</Button></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <p className="mb-2 font-bold text-teal">{g('dos')}</p>
              <ul className="space-y-1.5 text-sm text-ink/80">{DOS.map((d) => <li key={d} className="flex gap-2"><span className="text-teal" aria-hidden>✓</span>{d}</li>)}</ul>
            </Card>
            <Card>
              <p className="mb-2 font-bold text-rose">{g('donts')}</p>
              <ul className="space-y-1.5 text-sm text-ink/80">{DONTS.map((d) => <li key={d} className="flex gap-2"><span className="text-rose" aria-hidden>✕</span>{d}</li>)}</ul>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
