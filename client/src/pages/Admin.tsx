import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Section, SectionHeading } from '@/components/ui/Section';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { adminData, adminMetrics, adminMe, getToken, setToken, ApiError } from '@/lib/api';
import { useTitle } from '@/lib/useTitle';
import type { Booking, Vendor, SupportTicket, AdminMetrics, AdminIdentity } from '@/lib/types';

interface Data {
  bookings: Booking[];
  vendors: Vendor[];
  tickets: SupportTicket[];
  usingPg: boolean;
}

export function Admin() {
  const t = useTranslations('admin');
  useTitle(t('title'));
  const [authed, setAuthed] = useState(() => Boolean(getToken()));
  const [data, setData] = useState<Data | null>(null);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [me, setMe] = useState<AdminIdentity | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const [d, m, who] = await Promise.all([adminData(), adminMetrics(), adminMe()]);
      setData(d);
      setMetrics(m);
      setMe(who);
      setError(false);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setToken(null);
        setAuthed(false);
      } else {
        setError(true);
      }
    }
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  function logout() {
    setToken(null);
    setAuthed(false);
    setData(null);
    setMetrics(null);
    setMe(null);
  }

  return (
    <Section tone="cream">
      <SectionHeading title={t('title')} subtitle={authed ? t('subtitle') : undefined} />
      <div className="mt-8">
        {!authed ? (
          <AdminLogin onSuccess={() => setAuthed(true)} />
        ) : !data ? (
          <p className="text-center text-muted">{error ? t('loadError') : '…'}</p>
        ) : (
          <AdminDashboard
            bookings={data.bookings}
            vendors={data.vendors}
            tickets={data.tickets}
            metrics={metrics}
            me={me}
            usingPg={data.usingPg}
            reload={load}
            onLogout={logout}
          />
        )}
      </div>
    </Section>
  );
}
