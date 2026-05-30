import * as React from 'react';
import { cn } from '@/lib/cn';

type Tone = 'saffron' | 'teal' | 'plum' | 'gold' | 'rose' | 'neutral' | 'green';

const tones: Record<Tone, string> = {
  saffron: 'bg-saffron/10 text-saffron-dark',
  teal: 'bg-teal/10 text-teal',
  plum: 'bg-plum/10 text-plum',
  gold: 'bg-gold/15 text-[#8a6510]',
  rose: 'bg-rose/10 text-rose',
  neutral: 'bg-ink/5 text-muted',
  green: 'bg-whatsapp/15 text-[#0e8a44]',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
