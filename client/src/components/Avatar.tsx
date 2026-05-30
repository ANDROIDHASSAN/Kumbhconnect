import { cn } from '@/lib/cn';

const GRADIENTS = [
  'from-saffron to-gold',
  'from-plum to-plum-light',
  'from-teal to-[#0e8a44]',
  'from-rose to-saffron',
];

/** Deterministic monogram avatar — no external image needed. */
export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const idx = name.charCodeAt(0) % GRADIENTS.length;
  return (
    <span
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-soft',
        GRADIENTS[idx],
        className,
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}
