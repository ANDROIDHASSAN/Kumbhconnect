import * as React from 'react';
import { cn } from '@/lib/cn';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  tone?: 'white' | 'cream' | 'devotional';
}

export function Section({ tone = 'white', className, children, ...props }: SectionProps) {
  const toneClass =
    tone === 'cream' ? 'bg-cream' : tone === 'devotional' ? 'bg-devotional' : 'bg-white';
  return (
    <section className={cn('section', toneClass, className)} {...props}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center')}>
      {eyebrow && <p className={cn('eyebrow', center && 'justify-center')}>{eyebrow}</p>}
      <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-lg text-muted">{subtitle}</p>}
    </div>
  );
}
