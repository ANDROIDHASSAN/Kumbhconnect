'use client';
import { useState } from 'react';

export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-line rounded-card border border-line bg-white">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span className="text-sm font-semibold text-ink sm:text-base">{item.q}</span>
              <span className="shrink-0 text-saffron-dark" aria-hidden>
                {isOpen ? '−' : '+'}
              </span>
            </button>
            {isOpen && <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
