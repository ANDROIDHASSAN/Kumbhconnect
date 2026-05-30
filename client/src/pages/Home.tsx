import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { ServiceTile } from '@/components/ServiceTile';
import { Stars } from '@/components/Stars';
import { Avatar } from '@/components/Avatar';
import { FaqAccordion } from '@/components/FaqAccordion';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Reveal, Parallax, Magnetic, TiltCard, SplitHeading, AnimatedNumber, Marquee } from '@/components/motion';
import { Seo, localBusinessSchema, eventSchema, faqSchema, orgSchema } from '@/lib/seo';
import { SERVICES } from '@/lib/services';
import { HOME_FAQ, TESTIMONIALS } from '@/lib/content';
import { IMAGES, img } from '@/lib/images';

const TRUST_KEYS = ['verified', 'secure', 'live', 'experience', 'ratings'] as const;
const TRUST_ICONS: Record<(typeof TRUST_KEYS)[number], string> = { verified: '✅', secure: '🔒', live: '💬', experience: '🛕', ratings: '⭐' };
const TICKER = ['Verified vendors', 'Secure UPI advance', 'Live WhatsApp help', 'EN · हिंदी · मराठी', 'Snan-day routing', 'One-tap emergency', 'Sattvic food', 'Outer parking + shuttle'];

export function Home() {
  const t = useTranslations('home');
  const c = useTranslations('common');
  const b = useTranslations('brand');

  return (
    <>
      <Seo
        title="Kumbh Connect — One Trusted Digital Partner for Kumbh Visitors"
        description="Book verified stays, tents, cabs and sattvic food, navigate the ghats and get one-tap emergency help for the Nashik Trimbakeshwar Simhastha Kumbh Mela 2027. Live WhatsApp support in English, हिंदी and मराठी."
        path="/"
        jsonLd={[orgSchema(), localBusinessSchema(), eventSchema(), faqSchema(HOME_FAQ)]}
      />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="grain relative overflow-hidden bg-ink text-white">
        <Parallax speed={18} className="absolute inset-0">
          <Image src={IMAGES.templeDusk} alt="Hindu temple gopuram at dusk near the Kumbh" fill priority sizes="100vw" className="animate-kenburns scale-110 object-cover object-center opacity-[0.55]" />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/40 to-transparent" />

        <div className="container-page relative grid min-h-[92vh] items-center gap-10 py-24 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal y={14}>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-gold backdrop-blur">
                <span className="h-1.5 w-1.5 animate-float rounded-full bg-gold" /> {t('heroBadge')}
              </p>
            </Reveal>
            <SplitHeading as="h1" trigger="load" delay={0.15} text={t('heroTitle')} className="mt-5 font-display text-5xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl" />
            <Reveal y={20} delay={0.5}>
              <p className="mt-6 max-w-xl text-lg text-cream/85">{t('heroSubtitle')}</p>
            </Reveal>
            <Reveal y={20} delay={0.65}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Magnetic><Button as={Link} href="/book" size="lg" className="shine shadow-lift">{t('heroCta')}</Button></Magnetic>
                <Magnetic><WhatsAppButton size="lg" className="shine" label={t('heroWhatsapp')} message="Namaste! I'd like help planning my trip for the Nashik Kumbh 2027." /></Magnetic>
              </div>
            </Reveal>
            <Reveal y={20} delay={0.8} stagger={0.08} className="mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              {([['visitors', 'visitorsLabel'], ['vendors', 'vendorsLabel'], ['languages', 'languagesLabel'], ['support', 'supportLabel']] as const).map(([v, l]) => (
                <div key={v} className="border-l-2 border-gold/50 pl-3">
                  <div className="font-display text-xl font-bold text-white sm:text-2xl">{t(`stats.${v}`)}</div>
                  <div className="mt-0.5 text-[11px] uppercase tracking-wide text-cream/60">{t(`stats.${l}`)}</div>
                </div>
              ))}
            </Reveal>
          </div>

          <div className="hidden lg:col-span-5 lg:block">
            <Reveal y={30} delay={0.4}>
              <div className="ml-auto max-w-sm rounded-card border border-white/15 bg-ink/40 p-5 shadow-lift">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-cream/70">{t('servicesSubtitle')}</p>
                <div className="grid grid-cols-2 gap-3">
                  {SERVICES.slice(0, 4).map((s) => <ServiceTile key={s.slug} service={s} />)}
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <svg className="absolute bottom-0 left-0 h-10 w-full text-white" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden>
          <path d="M0 40 Q360 0 720 18 T1440 12 L1440 40 Z" fill="currentColor" />
        </svg>
      </section>

      {/* ── Ticker ───────────────────────────────────────── */}
      <div className="border-y border-line bg-ink py-3.5 text-white">
        <Marquee speed={32}>
          {TICKER.map((w, i) => (
            <span key={i} className="flex items-center gap-10 whitespace-nowrap text-sm font-semibold uppercase tracking-wide text-cream/80">
              {w} <span className="text-gold" aria-hidden>✦</span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* ── Services ─────────────────────────────────────── */}
      <Section tone="white">
        <div className="text-center">
          <p className="eyebrow justify-center">{b('tagline')}</p>
          <SplitHeading as="h2" text={t('servicesTitle')} className="mx-auto mt-3 max-w-2xl font-display text-3xl font-bold sm:text-4xl" />
          <Reveal y={14} delay={0.1}><p className="mx-auto mt-3 max-w-xl text-lg text-muted">{t('servicesSubtitle')}</p></Reveal>
        </div>
        <Reveal stagger={0.08} y={30} className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => <ServiceTile key={s.slug} service={s} />)}
        </Reveal>
      </Section>

      {/* ── Counters ─────────────────────────────────────── */}
      <section className="bg-ink py-16 text-white">
        <div className="container-page grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
          {[
            { to: 12, suffix: ' cr+', label: 'Expected visitors' },
            { to: 7, suffix: '', label: 'Services in one app' },
            { to: 3, suffix: '', label: 'Languages supported' },
            { to: 100, suffix: '%', label: 'KYC-verified vendors' },
          ].map((s) => (
            <Reveal key={s.label} y={24}>
              <div className="font-display text-5xl font-bold text-gradient-gold sm:text-6xl">
                <AnimatedNumber to={s.to} suffix={s.suffix} />
              </div>
              <p className="mt-2 text-sm uppercase tracking-wide text-cream/60">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Trust band ───────────────────────────────────── */}
      <section className="bg-motif section">
        <div className="container-page">
          <div className="text-center"><SplitHeading as="h2" text={t('trustTitle')} className="mx-auto max-w-2xl font-display text-3xl font-bold sm:text-4xl" /></div>
          <Reveal stagger={0.07} y={26} className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {TRUST_KEYS.map((key) => (
              <div key={key} className="group rounded-card border border-line bg-white p-5 text-center shadow-soft transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-lift">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cream text-2xl shadow-soft transition-transform group-hover:scale-110" aria-hidden>{TRUST_ICONS[key]}</div>
                <h3 className="mt-3 text-sm font-bold text-ink">{t(`trust.${key}`)}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{t(`trust.${key}Desc`)}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <Section tone="white">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal y={30} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-card shadow-lift">
              <Image src={img('fortWater', 900)} alt="Heritage ghats and steps by the water" fill sizes="(max-width:1024px) 100vw, 45vw" className="object-cover transition-transform duration-700 hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
            </div>
            <div className="animate-float absolute -bottom-5 -right-3 flex items-center gap-3 rounded-card border border-line bg-white p-4 shadow-lift sm:right-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-whatsapp/15 text-xl">💬</span>
              <div>
                <p className="text-sm font-bold text-ink">{t('stats.support')}</p>
                <p className="text-xs text-muted">{t('stats.supportLabel')}</p>
              </div>
            </div>
          </Reveal>
          <div>
            <SplitHeading as="h2" text={t('howTitle')} className="font-display text-3xl font-bold sm:text-4xl" />
            <Reveal stagger={0.12} y={24} className="mt-8 space-y-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-saffron font-display text-lg font-bold text-white shadow-soft">{n}</span>
                  <div>
                    <h3 className="text-lg font-bold text-ink">{t(`how.step${n}`)}</h3>
                    <p className="mt-1 text-muted">{t(`how.step${n}Desc`)}</p>
                  </div>
                </div>
              ))}
            </Reveal>
            <Reveal y={16} delay={0.1}><div className="mt-8"><Magnetic><Button as={Link} href="/how-it-works" variant="outline">{c('learnMore')}</Button></Magnetic></div></Reveal>
          </div>
        </div>
      </Section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="bg-motif section">
        <div className="container-page">
          <div className="text-center"><SplitHeading as="h2" text={t('testimonialsTitle')} className="mx-auto max-w-2xl font-display text-3xl font-bold sm:text-4xl" /></div>
          <Reveal stagger={0.1} y={30} className="mt-12 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((tm) => (
              <TiltCard key={tm.name} className="flex h-full flex-col rounded-card border border-line bg-white p-6 shadow-soft">
                <Stars rating={tm.rating} />
                <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-ink/80">“{tm.quote}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                  <Avatar name={tm.name} />
                  <span>
                    <span className="block text-sm font-bold text-ink">{tm.name}</span>
                    <span className="block text-xs text-muted">{tm.place}</span>
                  </span>
                </figcaption>
              </TiltCard>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <Section tone="white">
        <div className="text-center"><SplitHeading as="h2" text={t('faqTitle')} className="mx-auto max-w-2xl font-display text-3xl font-bold sm:text-4xl" /></div>
        <Reveal y={24} className="mx-auto mt-10 max-w-2xl"><FaqAccordion items={HOME_FAQ} /></Reveal>
      </Section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink text-white">
        <Image src={img('palaceDusk', 1600)} alt="Illuminated heritage architecture at dusk" fill sizes="100vw" className="object-cover object-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/50" />
        <div className="container-page relative py-24 text-center">
          <SplitHeading as="h2" text={t('ctaTitle')} className="mx-auto max-w-2xl font-display text-4xl font-bold text-white sm:text-5xl" />
          <Reveal y={16} delay={0.1}><p className="mx-auto mt-4 max-w-xl text-lg text-cream/80">{t('ctaSubtitle')}</p></Reveal>
          <Reveal y={16} delay={0.2}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Magnetic><Button as={Link} href="/book" size="lg" className="shine">{c('bookNow')}</Button></Magnetic>
              <Magnetic><WhatsAppButton size="lg" className="shine" message="Namaste! I'd like to plan my Kumbh trip." /></Magnetic>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
