import type { ServiceType } from './types';

export interface ServiceMeta {
  slug: ServiceType;
  /** Lucide-free inline emoji/icon glyph used in tiles. */
  icon: string;
  /** Accent token used for the tile/page. */
  accent: 'saffron' | 'plum' | 'teal' | 'gold' | 'rose';
  /** Whether this service is bookable now (Phase 0/1) or later (Phase 3). */
  bookable: boolean;
  /** Marks Phase-3 modules so the UI can show a "coming soon" badge. */
  phase3?: boolean;
}

/**
 * Canonical service catalogue. Display strings live in the locale files
 * under `services.<slug>` — this only holds non-translatable metadata.
 */
export const SERVICES: ServiceMeta[] = [
  { slug: 'rooms', icon: '🏨', accent: 'saffron', bookable: true },
  { slug: 'tents', icon: '⛺', accent: 'plum', bookable: true },
  { slug: 'cabs', icon: '🚕', accent: 'gold', bookable: true },
  { slug: 'food', icon: '🍲', accent: 'teal', bookable: true, phase3: true },
  { slug: 'routes', icon: '🧭', accent: 'teal', bookable: false },
  { slug: 'emergency', icon: '🆘', accent: 'rose', bookable: false },
  { slug: 'parking', icon: '🅿️', accent: 'plum', bookable: true, phase3: true },
];

export const SERVICE_SLUGS = SERVICES.map((s) => s.slug);

export function getService(slug: string): ServiceMeta | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

/** Advance percentage charged to confirm a booking. */
export const ADVANCE_PERCENT = 20;

/** Indicative "from" price (₹) per service, used for cards before DB data. */
export const INDICATIVE_FROM: Record<ServiceType, number> = {
  rooms: 1200,
  tents: 900,
  cabs: 150,
  food: 80,
  routes: 0,
  emergency: 0,
  parking: 50,
};
