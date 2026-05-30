'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { WhatsAppIcon } from '@/components/WhatsAppButton';
import { HELP_DESKS, type HelpDesk } from '@/lib/mock-data';
import { waLink, emergencyMessage } from '@/lib/whatsapp';
import { cn } from '@/lib/cn';

type Category = 'medical' | 'police' | 'lost';
const CATS: { key: Category; icon: string }[] = [
  { key: 'medical', icon: '🚑' },
  { key: 'police', icon: '👮' },
  { key: 'lost', icon: '🧳' },
];

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function EmergencyClient() {
  const t = useTranslations('emergency');
  const c = useTranslations('common');
  const [category, setCategory] = useState<Category | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState(false);

  function shareLocation() {
    if (!navigator.geolocation) {
      setLocError(true);
      return;
    }
    setLocating(true);
    setLocError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocError(true);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const desksOfCat = category ? HELP_DESKS.filter((d) => d.category === category) : [];
  const nearest: HelpDesk | null = category
    ? coords
      ? [...desksOfCat].sort((a, b) => haversine(coords, a) - haversine(coords, b))[0] ?? null
      : desksOfCat[0] ?? null
    : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Disclaimer */}
      <div className="rounded-xl border border-rose/30 bg-rose/5 p-4 text-sm font-medium text-rose">
        ⚠️ {t('disclaimer')}
      </div>

      {/* Category picker */}
      <div className="grid gap-3 sm:grid-cols-3">
        {CATS.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={cn(
              'rounded-card border p-5 text-center transition-colors',
              category === cat.key ? 'border-rose bg-rose/5' : 'border-line hover:bg-cream',
            )}
          >
            <div className="text-3xl" aria-hidden>{cat.icon}</div>
            <p className="mt-2 font-bold text-ink">{t(`categories.${cat.key}`)}</p>
            <p className="mt-0.5 text-xs text-muted">{t(`categories.${cat.key}Desc`)}</p>
          </button>
        ))}
      </div>

      {/* Location */}
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-ink">📍 {t('shareLocation')}</p>
            {coords && <p className="text-xs text-teal">{t('located')}: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</p>}
            {locating && <p className="text-xs text-muted">{t('locating')}</p>}
            {locError && <p className="text-xs text-rose">{t('locationError')}</p>}
          </div>
          <Button variant="outline" size="sm" onClick={shareLocation} disabled={locating}>
            {coords ? '✓' : t('shareLocation')}
          </Button>
        </div>
      </Card>

      {/* Nearest desk + actions */}
      {category && nearest && (
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">{t('nearest')}</p>
              <p className="mt-1 text-lg font-bold text-ink">{nearest.name}</p>
              <p className="text-sm text-muted">{nearest.area}</p>
            </div>
            <Badge tone="rose">{t(`categories.${category}`)}</Badge>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <a href={`tel:${nearest.phone}`}>
              <Button variant="danger" className="w-full">📞 {t('callDesk')}</Button>
            </a>
            <a href="tel:112">
              <Button variant="secondary" className="w-full">{t('callHelpline')}</Button>
            </a>
          </div>

          <a
            href={waLink(emergencyMessage(t(`categories.${category}`), coords ?? undefined))}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="whatsapp" className="w-full"><WhatsAppIcon />{t('whatsappAgent')}</Button>
          </a>

          {coords && (
            <a
              href={`https://maps.google.com/?q=${nearest.lat},${nearest.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm text-saffron-dark underline"
            >
              {c('viewOptions')} →
            </a>
          )}
        </Card>
      )}

      {!category && (
        <p className="text-center text-sm text-muted">{t('subtitle')}</p>
      )}
    </div>
  );
}
