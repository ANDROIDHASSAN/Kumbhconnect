'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FormField, Input, Textarea, Select } from '@/components/ui/FormField';
import { WhatsAppIcon } from '@/components/WhatsAppButton';
import { ServiceIcon } from '@/components/icons/ServiceIcons';
import { SERVICES, getService } from '@/lib/services';
import { waLink, leadMessage } from '@/lib/whatsapp';
import type { ServiceType, Booking } from '@/lib/types';
import { cn } from '@/lib/cn';

interface FormState {
  services: ServiceType[];
  name: string;
  phone: string;
  party_size: string;
  start_date: string;
  end_date: string;
  area: string;
  notes: string;
}

const STEPS = ['step1', 'step2', 'step3'] as const;

export function BookingForm() {
  const t = useTranslations('book');
  const c = useTranslations('common');
  const svc = useTranslations('services');
  const locale = useLocale();
  const search = useSearchParams();
  const preset = search.get('service');
  const presetVendorId = search.get('vendor');
  const presetVendorName = search.get('vendorName');

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    services: preset && getService(preset) ? [preset as ServiceType] : [],
    name: '', phone: '', party_size: '2', start_date: '', end_date: '', area: '', notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [payment, setPayment] = useState<{ stubbed: boolean; amount: number; upiLink?: string } | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function toggleService(slug: ServiceType) {
    setForm((f) => ({
      ...f,
      services: f.services.includes(slug)
        ? f.services.filter((s) => s !== slug)
        : [...f.services, slug],
    }));
  }

  // The first chosen service is the primary one — it drives the lead's
  // service_type, pricing and advance. Any others ride along in the notes.
  const primary = form.services[0];
  const serviceNames = form.services.map((s) => svc(`${s}.name`)).join(', ');
  const bookable = primary ? getService(primary)?.bookable : false;

  function validateStep2(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.services.length) e.services = t('errors.service');
    if (!form.name.trim()) e.name = t('errors.name');
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, '').slice(-10))) e.phone = t('errors.phone');
    if (!form.start_date) e.start_date = t('errors.date');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Compose the lead notes: preferred vendor (if booking a specific one) +
  // the full service list (when multiple) + the visitor's own notes.
  const vendorNote = presetVendorName ? `Preferred vendor: ${presetVendorName}.` : '';
  const multiNote = form.services.length > 1 ? `Services requested: ${serviceNames}.` : '';
  const notesForLead = [vendorNote, multiNote, form.notes].filter(Boolean).join('\n') || undefined;

  async function submitLead() {
    if (!validateStep2()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_type: primary,
          name: form.name,
          phone: form.phone,
          language: locale,
          party_size: Number(form.party_size) || 1,
          start_date: form.start_date,
          end_date: form.end_date || undefined,
          area: form.area || undefined,
          notes: notesForLead,
          channel: 'web',
          vendor_id: presetVendorId || undefined,
          vendor_name: presetVendorName || undefined,
        }),
      });
      const data = await res.json();
      if (data?.booking) setBooking(data.booking);
      setStep(2);
    } catch {
      // Even if the API fails, let the user continue on WhatsApp (fallback).
      setStep(2);
    } finally {
      setSubmitting(false);
    }
  }

  async function payAdvance() {
    if (!booking) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.id, amount: booking.amount ?? 0 }),
      });
      const data = await res.json();
      setPayment({ stubbed: data.stubbed, amount: data.amount, upiLink: data.upiLink });
    } finally {
      setSubmitting(false);
    }
  }

  const waMessage = leadMessage(
    {
      service_type: (primary || 'rooms') as ServiceType,
      name: form.name,
      party_size: Number(form.party_size) || undefined,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
      area: form.area || undefined,
      notes: form.notes || undefined,
    },
    form.services.length
      ? `Namaste! I'd like to book ${presetVendorName ? `${presetVendorName} for ` : ''}${serviceNames} for the Nashik Kumbh 2027.`
      : undefined,
  );

  return (
    <div className="mx-auto max-w-2xl">
      {/* Booking-with-a-specific-vendor banner */}
      {presetVendorName && (
        <div className="mb-6 flex items-center gap-3 rounded-card border border-saffron/30 bg-saffron/5 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron/15 text-lg" aria-hidden>🏠</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-ink">Booking with {presetVendorName}</p>
            <p className="text-xs text-muted">We'll match you with this verified partner. Just add your details.</p>
          </div>
        </div>
      )}

      {/* Stepper */}
      <ol className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                i <= step ? 'bg-saffron text-white' : 'bg-ink/5 text-muted',
              )}
            >
              {i + 1}
            </span>
            <span className={cn('hidden text-sm font-medium sm:block', i === step ? 'text-ink' : 'text-muted')}>
              {t(s)}
            </span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-line" />}
          </li>
        ))}
      </ol>

      {/* Step 1 — pick service */}
      {step === 0 && (
        <Card>
          <h2 className="text-lg font-bold">{t('pickService')}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SERVICES.map((s) => {
              const selected = form.services.includes(s.slug);
              return (
                <button
                  key={s.slug}
                  type="button"
                  role="checkbox"
                  aria-checked={selected}
                  onClick={() => toggleService(s.slug)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-3.5 text-left transition-colors',
                    selected ? 'border-saffron bg-saffron/5' : 'border-line hover:bg-cream',
                  )}
                >
                  <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', selected ? 'bg-saffron/15 text-saffron-dark' : 'bg-cream text-plum')}>
                    <ServiceIcon slug={s.slug} className="h-5 w-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-ink">{svc(`${s.slug}.name`)}</span>
                    <span className="block text-xs text-muted">{svc(`${s.slug}.short`)}</span>
                  </span>
                  {s.phase3 && <Badge tone="neutral">{c('comingSoon')}</Badge>}
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-white transition-colors',
                      selected ? 'border-saffron bg-saffron' : 'border-line bg-transparent',
                    )}
                    aria-hidden
                  >
                    {selected && (
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.services && <p className="mt-2 text-xs text-rose">{errors.services}</p>}
          <div className="mt-6 flex justify-end">
            <Button onClick={() => form.services.length && setStep(1)} disabled={!form.services.length}>
              {c('next')}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2 — details */}
      {step === 1 && (
        <Card className="space-y-4">
          <h2 className="text-lg font-bold">{t('step2')}</h2>
          <FormField label={t('name')} htmlFor="name" required error={errors.name}>
            <Input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
          </FormField>
          <FormField label={t('phone')} htmlFor="phone" required error={errors.phone} hint="10-digit mobile">
            <Input id="phone" inputMode="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="9876543210" />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t('checkIn')} htmlFor="start" required error={errors.start_date}>
              <Input id="start" type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} />
            </FormField>
            <FormField label={t('checkOut')} htmlFor="end">
              <Input id="end" type="date" value={form.end_date} onChange={(e) => set('end_date', e.target.value)} />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t('partySize')} htmlFor="party">
              <Input id="party" type="number" min={1} max={50} value={form.party_size} onChange={(e) => set('party_size', e.target.value)} />
            </FormField>
            <FormField label={t('area')} htmlFor="area">
              <Input id="area" value={form.area} onChange={(e) => set('area', e.target.value)} placeholder={t('areaPlaceholder')} />
            </FormField>
          </div>
          <FormField label={t('notes')} htmlFor="notes">
            <Textarea id="notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder={t('notesPlaceholder')} />
          </FormField>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>{c('back')}</Button>
            <Button onClick={submitLead} disabled={submitting}>{submitting ? c('loading') : c('next')}</Button>
          </div>
        </Card>
      )}

      {/* Step 3 — confirm & connect */}
      {step === 2 && (
        <Card className="space-y-5">
          <div className="rounded-xl bg-teal/10 p-4">
            <p className="font-bold text-teal">{t('leadSaved')}</p>
            <p className="mt-1 text-sm text-ink/80">{t('leadSavedDesc')}</p>
          </div>

          <div className="rounded-xl border border-line p-4 text-sm">
            <p className="mb-2 font-semibold text-ink">{t('review')}</p>
            <dl className="grid grid-cols-2 gap-y-1.5 text-muted">
              {presetVendorName && (<><dt>Vendor</dt><dd className="text-right font-semibold text-ink">{presetVendorName}</dd></>)}
              <dt>{svc('title')}</dt><dd className="text-right text-ink">{serviceNames}</dd>
              <dt>{t('name')}</dt><dd className="text-right text-ink">{form.name}</dd>
              <dt>{t('phone')}</dt><dd className="text-right text-ink">{form.phone}</dd>
              <dt>{t('checkIn')}</dt><dd className="text-right text-ink">{form.start_date}{form.end_date ? ` → ${form.end_date}` : ''}</dd>
              <dt>{t('partySize')}</dt><dd className="text-right text-ink">{form.party_size}</dd>
              {form.area && (<><dt>{t('area')}</dt><dd className="text-right text-ink">{form.area}</dd></>)}
            </dl>
          </div>

          <a href={waLink(waMessage)} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="whatsapp" size="lg" className="w-full"><WhatsAppIcon />{t('sendWhatsapp')}</Button>
          </a>

          {bookable && booking?.amount ? (
            <div className="rounded-xl border border-line p-4">
              <p className="text-sm text-muted">{t('advanceNote')}</p>
              {!payment ? (
                <Button className="mt-3 w-full" onClick={payAdvance} disabled={submitting}>
                  {submitting ? c('loading') : t('payAdvance')}
                </Button>
              ) : (
                <div className="mt-3 space-y-2 text-sm">
                  <p className="font-semibold text-ink">
                    {c('from')} ₹{payment.amount.toLocaleString('en-IN')} advance
                  </p>
                  {payment.stubbed && <p className="text-muted">{t('paymentStubbed')}</p>}
                  {payment.upiLink && (
                    <a href={payment.upiLink} className="inline-block">
                      <Button variant="secondary" size="sm">Pay via UPI</Button>
                    </a>
                  )}
                </div>
              )}
            </div>
          ) : null}

          <button onClick={() => { setStep(0); setBooking(null); setPayment(null); }} className="text-sm text-muted underline">
            {c('back')}
          </button>
        </Card>
      )}
    </div>
  );
}
