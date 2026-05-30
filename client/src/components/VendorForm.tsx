'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField, Input, Select } from '@/components/ui/FormField';
import { SERVICES } from '@/lib/services';

export function VendorForm() {
  const t = useTranslations('vendors');
  const svc = useTranslations('services');
  const c = useTranslations('common');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ type: 'rooms', name: '', contact_name: '', phone: '', area: '', capacity: '' });
  const [error, setError] = useState('');

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.contact_name || !/^\d{7,}/.test(form.phone.replace(/\D/g, '')) || !form.area) {
      setError(c('somethingWrong'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          name: form.name,
          contact_name: form.contact_name,
          phone: form.phone,
          area: form.area,
          capacity: form.capacity ? Number(form.capacity) : undefined,
        }),
      });
      if (res.ok) setDone(true);
      else setError(c('somethingWrong'));
    } catch {
      setError(c('somethingWrong'));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <Card className="text-center">
        <div className="text-3xl" aria-hidden>🤝</div>
        <p className="mt-3 font-bold text-teal">{t('submitted')}</p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-bold">{t('formTitle')}</h2>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <FormField label={t('vendorType')} htmlFor="vtype" required>
          <Select id="vtype" value={form.type} onChange={(e) => set('type', e.target.value)}>
            {SERVICES.map((s) => (
              <option key={s.slug} value={s.slug}>{svc(`${s.slug}.name`)}</option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('businessName')} htmlFor="bname" required>
          <Input id="bname" value={form.name} onChange={(e) => set('name', e.target.value)} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t('contactName')} htmlFor="cname" required>
            <Input id="cname" value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} />
          </FormField>
          <FormField label={t('phone')} htmlFor="vphone" required>
            <Input id="vphone" inputMode="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t('areaLabel')} htmlFor="varea" required>
            <Input id="varea" value={form.area} onChange={(e) => set('area', e.target.value)} />
          </FormField>
          <FormField label={t('capacity')} htmlFor="vcap">
            <Input id="vcap" type="number" min={0} value={form.capacity} onChange={(e) => set('capacity', e.target.value)} />
          </FormField>
        </div>
        <p className="text-xs text-muted">{t('kycNote')}</p>
        {error && <p className="text-xs text-rose">{error}</p>}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? c('loading') : c('submit')}
        </Button>
      </form>
    </Card>
  );
}
