import type { FC } from 'react';
import type { ServiceType } from '@/lib/types';

type IconProps = { className?: string };

const base = {
  width: 28,
  height: 28,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Rooms({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10.5V20h14v-9.5" />
      <path d="M9 20v-5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 15v5" />
    </svg>
  );
}
function Tents({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M12 4 3.5 20h17L12 4Z" />
      <path d="M12 4v16" />
      <path d="m12 13-4 7m4-7 4 7" />
    </svg>
  );
}
function Cabs({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M5 16.5h14M5.5 16.5v2M18.5 16.5v2" />
      <path d="M4 16.5l1.4-5A2 2 0 0 1 7.3 10h9.4a2 2 0 0 1 1.9 1.5l1.4 5" />
      <path d="M8 10V8.5A1.5 1.5 0 0 1 9.5 7h5A1.5 1.5 0 0 1 16 8.5V10" />
      <circle cx="7.5" cy="16.5" r="1.4" />
      <circle cx="16.5" cy="16.5" r="1.4" />
    </svg>
  );
}
function Food({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M4 11.5h16a8 8 0 0 1-8 7 8 8 0 0 1-8-7Z" />
      <path d="M12 11.5C12 8 9.5 7 9.5 5.2A1.7 1.7 0 0 1 12 4a1.7 1.7 0 0 1 2.5 1.2C14.5 7 12 8 12 11.5" />
      <path d="M3 21h18" />
    </svg>
  );
}
function Routes({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m14.8 9.2-2 4.6-4.6 2 2-4.6 4.6-2Z" />
    </svg>
  );
}
function Emergency({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M12 3.5 5 6v5.5c0 4.3 2.9 7.3 7 8.9 4.1-1.6 7-4.6 7-8.9V6l-7-2.5Z" />
      <path d="M12 9v6M9 12h6" />
    </svg>
  );
}
function Parking({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="3.5" />
      <path d="M9.5 16.5V8h3.2a2.6 2.6 0 0 1 0 5.2H9.5" />
    </svg>
  );
}

export const SERVICE_ICONS: Record<ServiceType, FC<IconProps>> = {
  rooms: Rooms,
  tents: Tents,
  cabs: Cabs,
  food: Food,
  routes: Routes,
  emergency: Emergency,
  parking: Parking,
};

export function ServiceIcon({ slug, className }: { slug: ServiceType; className?: string }) {
  const Cmp = SERVICE_ICONS[slug];
  return <Cmp className={className} />;
}

/** Brand mark — a stylised diya (oil lamp) with flame. */
export function BrandMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="M12 3.2c-1.1 1.6-.4 3 .5 3.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 4c1.3 1.9 2.4 3 2.4 4.6A2.4 2.4 0 0 1 12 11a2.4 2.4 0 0 1-2.4-2.4C9.6 7 10.7 5.9 12 4Z" fill="currentColor" opacity="0.9" />
      <path d="M4 13.5c2.2 2.2 5 3.3 8 3.3s5.8-1.1 8-3.3c-1 3-4.2 5.2-8 5.2s-7-2.2-8-5.2Z" fill="currentColor" />
    </svg>
  );
}
