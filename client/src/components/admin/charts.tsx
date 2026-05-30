// Dependency-free SVG charts for the admin overview. Kept intentionally small
// and presentational — all data shaping happens in the parent.
import { useId } from 'react';
import { cn } from '@/lib/cn';

/** Smooth area + line chart for a time series. Scales to its container width. */
export function AreaChart({
  data,
  height = 64,
  className,
  stroke = 'var(--chart-stroke, #E1701A)',
}: {
  data: { date: string; leads: number }[];
  height?: number;
  className?: string;
  stroke?: string;
}) {
  const gradId = useId();
  const W = 100;
  const H = 36;
  const max = Math.max(1, ...data.map((d) => d.leads));
  const n = data.length;
  const x = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * W);
  const y = (v: number) => H - (v / max) * (H - 4) - 2;

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(2)} ${y(d.leads).toFixed(2)}`).join(' ');
  const area = `${line} L ${W} ${H} L 0 ${H} Z`;
  const peak = data.reduce((m, d, i) => (d.leads > data[m].leads ? i : m), 0);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ height }}
      className={cn('w-full overflow-visible', className)}
      role="img"
      aria-label={`Trend over ${n} days, peak ${data[peak]?.leads ?? 0}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      {n > 0 && (
        <circle cx={x(peak)} cy={y(data[peak].leads)} r={2} fill={stroke} vectorEffect="non-scaling-stroke" />
      )}
    </svg>
  );
}

/** Compact sparkline (line only) for KPI cards. */
export function Sparkline({ data, stroke = '#0E7C7B', className }: { data: number[]; stroke?: string; className?: string }) {
  const W = 100;
  const H = 28;
  const max = Math.max(1, ...data);
  const n = data.length;
  const pts = data.map((v, i) => `${(n <= 1 ? 0 : (i / (n - 1)) * W).toFixed(2)} ${(H - (v / max) * (H - 3) - 1.5).toFixed(2)}`).join(' L ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={cn('h-7 w-full', className)} aria-hidden>
      <path d={`M ${pts}`} fill="none" stroke={stroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

const TONE_HEX: Record<string, string> = {
  saffron: '#E1701A',
  teal: '#0E7C7B',
  plum: '#5B2A86',
  gold: '#C99A2E',
  rose: '#D14D57',
};

/** Horizontal labelled bars (revenue by service, etc.). */
export function BarList({
  items,
  format = (v) => String(v),
  tone = 'saffron',
  emptyLabel = 'No data yet',
}: {
  items: { label: string; value: number }[];
  format?: (v: number) => string;
  tone?: keyof typeof TONE_HEX;
  emptyLabel?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.length) return <p className="py-6 text-center text-sm text-muted">{emptyLabel}</p>;
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium capitalize text-ink">{it.label}</span>
            <span className="tabular-nums text-muted">{format(it.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink/5">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${Math.max(2, (it.value / max) * 100)}%`, backgroundColor: TONE_HEX[tone] }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Stacked segment bar with a legend (ticket / KYC breakdowns). */
export function SegmentBar({ segments }: { segments: { label: string; value: number; hex: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-ink/5">
        {total > 0 &&
          segments.map((s) => (
            <div key={s.label} style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.hex }} title={`${s.label}: ${s.value}`} />
          ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-1.5 capitalize text-muted">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.hex }} />
            {s.label.replace('_', ' ')}
            <span className="font-semibold tabular-nums text-ink">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Conversion funnel: lead → quoted → confirmed → fulfilled. */
export function Funnel({ stages }: { stages: { label: string; value: number }[] }) {
  const top = Math.max(1, stages[0]?.value ?? 1);
  return (
    <ul className="space-y-2.5">
      {stages.map((s, i) => {
        const pct = (s.value / top) * 100;
        const conv = i === 0 ? 100 : Math.round((s.value / top) * 100);
        return (
          <li key={s.label} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-xs font-semibold capitalize text-muted">{s.label}</span>
            <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-ink/5">
              <div
                className="flex h-full items-center rounded-lg bg-gradient-to-r from-saffron to-saffron-dark px-2 text-xs font-bold text-white transition-[width] duration-500"
                style={{ width: `${Math.max(6, pct)}%` }}
              >
                {s.value}
              </div>
            </div>
            <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted">{conv}%</span>
          </li>
        );
      })}
    </ul>
  );
}
