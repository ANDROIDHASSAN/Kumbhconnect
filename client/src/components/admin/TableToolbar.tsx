import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { SortState } from './useTableControls';

export type AdminView = 'table' | 'board';

/** Search box + optional status filter + view toggle + result count + CSV export. */
export function TableToolbar({
  query, onQuery, statuses, statusFilter, onStatus, count, total, onExport, placeholder, view, onView,
}: {
  query: string;
  onQuery: (v: string) => void;
  statuses?: string[];
  statusFilter?: string;
  onStatus?: (v: string) => void;
  count: number;
  total: number;
  onExport: () => void;
  placeholder?: string;
  view?: AdminView;
  onView?: (v: AdminView) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[180px] flex-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden>⌕</span>
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={placeholder ?? 'Search…'}
          className="w-full rounded-full border border-line bg-white py-2 pl-8 pr-3 text-sm focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/30"
          aria-label="Search"
        />
      </div>
      {statuses && onStatus && (
        <select
          value={statusFilter}
          onChange={(e) => onStatus(e.target.value)}
          className="rounded-full border border-line bg-white px-3 py-2 text-sm font-medium capitalize focus:border-saffron focus:outline-none"
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      )}
      {view && onView && (
        <div className="flex rounded-full border border-line bg-white p-0.5" role="group" aria-label="View mode">
          {(['table', 'board'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onView(v)}
              aria-pressed={view === v}
              className={cn('rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors', view === v ? 'bg-saffron text-white' : 'text-muted hover:text-ink')}
            >
              {v}
            </button>
          ))}
        </div>
      )}
      <span className="text-xs text-muted">
        {count === total ? `${total}` : `${count} / ${total}`}
      </span>
      <Button variant="outline" size="sm" onClick={onExport} disabled={!count}>⤓ CSV</Button>
    </div>
  );
}

/** Clickable, sortable column header cell. */
export function SortHeader({
  label, sortKey, sort, onSort, className,
}: {
  label: string;
  sortKey: string;
  sort: SortState | null;
  onSort: (key: string) => void;
  className?: string;
}) {
  const active = sort?.key === sortKey;
  return (
    <th className={cn('px-4 py-3', className)}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn('inline-flex items-center gap-1 font-semibold uppercase tracking-wide transition-colors hover:text-ink', active ? 'text-ink' : 'text-muted')}
      >
        {label}
        <span className="text-[10px]" aria-hidden>{active ? (sort!.dir === 'asc' ? '▲' : '▼') : '↕'}</span>
      </button>
    </th>
  );
}
