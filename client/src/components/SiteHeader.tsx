'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { BrandMark } from '@/components/icons/ServiceIcons';
import { cn } from '@/lib/cn';

const NAV = [
  { href: '/services', key: 'services' },
  { href: '/kumbh-guide', key: 'guide' },
  { href: '/how-it-works', key: 'howItWorks' },
  { href: '/vendors', key: 'vendors' },
] as const;

export function SiteHeader() {
  const t = useTranslations('nav');
  const brand = useTranslations('brand');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/95">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-2 focus:z-50 focus:rounded-full focus:bg-saffron focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link href="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-saffron to-saffron-dark text-white shadow-soft transition-transform group-hover:scale-105" aria-hidden>
            <BrandMark className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-bold leading-none text-ink">{brand('name')}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-full px-3.5 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-white hover:text-ink',
                pathname.startsWith(item.href) && 'bg-white text-ink',
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          <Button as={Link} href="/emergency" variant="outline" size="sm" className="border-rose/40 text-rose">
            {t('emergency')}
          </Button>
          <Button as={Link} href="/book" size="sm">
            {t('book')}
          </Button>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line lg:hidden"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden className="text-xl">{open ? '✕' : '☰'}</span>
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-cream lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-3" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-white"
              >
                {t(item.key)}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between gap-2">
              <LanguageSwitcher />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button as={Link} href="/emergency" variant="outline" size="sm" className="border-rose/40 text-rose" onClick={() => setOpen(false)}>
                {t('emergency')}
              </Button>
              <Button as={Link} href="/book" size="sm" onClick={() => setOpen(false)}>
                {t('book')}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
