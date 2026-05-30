'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

const KEY = 'kc-consent';

/**
 * DPDP-Act-aware consent gate. Analytics (GA4/Pixel) load ONLY after the
 * visitor accepts. The choice is stored locally; nothing fires before consent.
 */
export function ConsentBanner() {
  const t = useTranslations('consent');
  const [choice, setChoice] = useState<string | null>('pending');

  useEffect(() => {
    setChoice(localStorage.getItem(KEY));
  }, []);

  function decide(value: 'accept' | 'decline') {
    localStorage.setItem(KEY, value);
    setChoice(value);
    if (value === 'accept') {
      // Phase 3: load GA4 / Meta Pixel here, gated on this consent.
      window.dispatchEvent(new CustomEvent('kc-consent-granted'));
    }
  }

  if (choice !== null) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-card border border-line bg-white p-4 shadow-lift sm:bottom-5">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink/80">{t('message')}</p>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="sm" onClick={() => decide('decline')}>
            {t('decline')}
          </Button>
          <Button size="sm" onClick={() => decide('accept')}>
            {t('accept')}
          </Button>
        </div>
      </div>
    </div>
  );
}
