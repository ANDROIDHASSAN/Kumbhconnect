import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField, Input } from '@/components/ui/FormField';
import { adminLogin, setToken, ApiError } from '@/lib/api';

// Optional demo credentials, surfaced on the login card for easy demos.
// Configured via VITE_DEMO_EMAIL / VITE_DEMO_PASSWORD — unset them to hide.
const DEMO = {
  email: (import.meta as any).env?.VITE_DEMO_EMAIL as string | undefined,
  password: (import.meta as any).env?.VITE_DEMO_PASSWORD as string | undefined,
};

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const t = useTranslations('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function doLogin(em: string, pw: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await adminLogin(em.trim(), pw);
      setToken(res.token);
      onSuccess();
    } catch (err) {
      // 429 carries a lockout message from the server; otherwise it's bad credentials.
      setError(err instanceof ApiError && err.status === 429 ? err.message : t('wrongCreds'));
    } finally {
      setBusy(false);
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    doLogin(email, password);
  };

  // Log in with the demo account directly — bypasses the fields so a stale
  // browser-autofilled password can't interfere.
  const useDemo = () => {
    if (!DEMO.email || !DEMO.password) return;
    setEmail(DEMO.email);
    setPassword(DEMO.password);
    doLogin(DEMO.email, DEMO.password);
  };

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <h1 className="text-lg font-bold">{t('login')}</h1>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <FormField label={t('email')} htmlFor="em">
            <Input id="em" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus placeholder="you@example.com" />
          </FormField>
          <FormField label={t('password')} htmlFor="pw" error={error ?? undefined}>
            <Input id="pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormField>
          <Button type="submit" disabled={busy || !email || !password} className="w-full">{busy ? '…' : t('enter')}</Button>
        </form>

        {DEMO.email && DEMO.password && (
          <div className="mt-4 rounded-xl border border-dashed border-line bg-cream/60 p-3 text-xs">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-semibold uppercase tracking-wide text-muted">{t('demoCreds')}</span>
              <button
                type="button"
                onClick={useDemo}
                disabled={busy}
                className="font-semibold text-saffron-dark hover:underline disabled:opacity-50"
              >
                {t('useDemo')}
              </button>
            </div>
            <dl className="space-y-0.5 text-muted">
              <div className="flex gap-2"><dt className="w-16 shrink-0">{t('email')}:</dt><dd className="font-mono text-ink">{DEMO.email}</dd></div>
              <div className="flex gap-2"><dt className="w-16 shrink-0">{t('password')}:</dt><dd className="font-mono text-ink">{DEMO.password}</dd></div>
            </dl>
          </div>
        )}
      </Card>
    </div>
  );
}
