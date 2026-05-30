import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { AdminMetrics, BookingStatus } from '@/lib/types';
import { AreaChart, Sparkline, BarList, SegmentBar, Funnel } from './charts';

const inr = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const compactInr = (n: number) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(2)}Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)}L` : inr(n);

const FUNNEL_STAGES: BookingStatus[] = ['lead', 'quoted', 'confirmed', 'fulfilled'];

function StatCard({
  label, value, sub, tone = 'plum', children,
}: { label: string; value: string; sub?: string; tone?: 'saffron' | 'teal' | 'plum' | 'gold' | 'rose'; children?: ReactNode }) {
  const ring: Record<string, string> = {
    saffron: 'before:bg-saffron', teal: 'before:bg-teal', plum: 'before:bg-plum', gold: 'before:bg-gold', rose: 'before:bg-rose',
  };
  return (
    <div className={cn(
      'relative overflow-hidden rounded-card border border-line bg-white p-4 shadow-soft',
      'before:absolute before:inset-y-0 before:left-0 before:w-1', ring[tone],
    )}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-bold text-ink">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

function Panel({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-card border border-line bg-white p-5 shadow-soft', className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-ink">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Overview({ m }: { m: AdminMetrics }) {
  const spark = m.series.map((s) => s.leads);
  const funnel = FUNNEL_STAGES.map((s) => ({ label: s, value: m.bookings.byStatus[s] ?? 0 }));
  const revenue = Object.entries(m.revenueByService)
    .map(([label, value]) => ({ label, value: value ?? 0 }))
    .sort((a, b) => b.value - a.value);

  const tickets = [
    { label: 'open', value: m.tickets.byStatus.open ?? 0, hex: '#D14D57' },
    { label: 'in_progress', value: m.tickets.byStatus.in_progress ?? 0, hex: '#C99A2E' },
    { label: 'resolved', value: m.tickets.byStatus.resolved ?? 0, hex: '#0E7C7B' },
  ];
  const kyc = [
    { label: 'verified', value: m.vendors.byKyc.verified ?? 0, hex: '#0E7C7B' },
    { label: 'pending', value: m.vendors.byKyc.pending ?? 0, hex: '#C99A2E' },
    { label: 'rejected', value: m.vendors.byKyc.rejected ?? 0, hex: '#D14D57' },
  ];

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total leads" value={String(m.bookings.total)} sub={`${m.bookings.won} won`} tone="saffron">
          <Sparkline data={spark.length ? spark : [0, 0]} />
        </StatCard>
        <StatCard label="Conversion" value={`${m.bookings.conversionRate}%`} sub="lead → won" tone="teal" />
        <StatCard label="GMV (won)" value={compactInr(m.bookings.gmv)} sub={`AOV ${inr(m.bookings.avgOrderValue)}`} tone="plum" />
        <StatCard label="Commission" value={compactInr(m.bookings.commission)} sub="est. earned" tone="gold" />
        <StatCard label="Active vendors" value={String(m.vendors.active)} sub={`of ${m.vendors.total} total`} tone="teal" />
        <StatCard label="Open tickets" value={String(m.tickets.open)} sub={`${m.tickets.total} all-time`} tone="rose" />
        <StatCard label="Pending KYC" value={String(m.vendors.byKyc.pending ?? 0)} sub="awaiting review" tone="gold" />
        <StatCard label="Confirmed" value={String(m.bookings.byStatus.confirmed ?? 0)} sub="ready to fulfil" tone="saffron" />
      </div>

      {/* Trend + funnel */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Leads — last 30 days" className="lg:col-span-2">
          <AreaChart data={m.series} height={160} />
          <div className="mt-2 flex justify-between text-[11px] text-muted">
            <span>{m.series[0]?.date}</span>
            <span>{m.series[m.series.length - 1]?.date}</span>
          </div>
        </Panel>
        <Panel title="Conversion funnel">
          <Funnel stages={funnel} />
        </Panel>
      </div>

      {/* Revenue + breakdowns */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Revenue by service">
          <BarList items={revenue} tone="saffron" format={inr} emptyLabel="No won bookings yet" />
        </Panel>
        <Panel title="Support tickets">
          <SegmentBar segments={tickets} />
        </Panel>
        <Panel title="Vendor KYC">
          <SegmentBar segments={kyc} />
        </Panel>
      </div>
    </div>
  );
}
