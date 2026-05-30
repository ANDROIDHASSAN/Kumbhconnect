import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Badge } from '@/components/ui/Badge';
import { ServiceIcon } from '@/components/icons/ServiceIcons';
import { cn } from '@/lib/cn';
import type { ServiceMeta } from '@/lib/services';

const accentRing: Record<ServiceMeta['accent'], string> = {
  saffron: 'hover:border-saffron/60',
  plum: 'hover:border-plum/60',
  teal: 'hover:border-teal/60',
  gold: 'hover:border-gold/70',
  rose: 'hover:border-rose/60',
};

const accentIcon: Record<ServiceMeta['accent'], string> = {
  saffron: 'bg-saffron/12 text-saffron-dark',
  plum: 'bg-plum/12 text-plum',
  teal: 'bg-teal/12 text-teal',
  gold: 'bg-gold/18 text-[#8a6510]',
  rose: 'bg-rose/12 text-rose',
};

const accentGlow: Record<ServiceMeta['accent'], string> = {
  saffron: 'from-saffron/15',
  plum: 'from-plum/15',
  teal: 'from-teal/15',
  gold: 'from-gold/20',
  rose: 'from-rose/15',
};

export function ServiceTile({ service }: { service: ServiceMeta }) {
  const t = useTranslations('services');
  const c = useTranslations('common');
  return (
    <Link
      href={`/services/${service.slug}`}
      className={cn(
        'ring-aura group relative flex flex-col overflow-hidden rounded-card border border-line bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift',
        accentRing[service.accent],
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br to-transparent opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100',
          accentGlow[service.accent],
        )}
      />
      <div className="flex items-start justify-between">
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110', accentIcon[service.accent])}>
          <ServiceIcon slug={service.slug} />
        </div>
        {service.phase3 && <Badge tone="neutral">{c('comingSoon')}</Badge>}
      </div>
      <h3 className="mt-4 text-base font-bold text-ink">{t(`${service.slug}.name`)}</h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{t(`${service.slug}.short`)}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-saffron-dark">
        {c('learnMore')}
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}
