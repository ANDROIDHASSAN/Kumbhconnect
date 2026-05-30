import { useMemo, useRef, useState } from 'react';

export type SortDir = 'asc' | 'desc';
export interface SortState {
  key: string;
  dir: SortDir;
}

interface Options<T> {
  /** Row fields concatenated into the free-text search haystack. */
  searchKeys: (keyof T)[];
  /** Field used by the status dropdown filter, if any. */
  statusKey?: keyof T;
}

/**
 * Client-side search + status-filter + sort for a row list. Pure and memoised;
 * the source rows are never mutated. Returns the derived rows plus control state.
 */
export function useTableControls<T extends Record<string, any>>(rows: T[], opts: Options<T>) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState<SortState | null>(null);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const result = useMemo(() => {
    const { searchKeys, statusKey } = optsRef.current;
    let r = rows;

    const q = query.trim().toLowerCase();
    if (q) {
      r = r.filter((row) =>
        searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)),
      );
    }
    if (statusKey && statusFilter !== 'all') {
      r = r.filter((row) => String(row[statusKey]) === statusFilter);
    }
    if (sort) {
      const { key, dir } = sort;
      r = [...r].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        let cmp: number;
        if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
        else cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return dir === 'asc' ? cmp : -cmp;
      });
    }
    return r;
  }, [rows, query, statusFilter, sort]);

  /** Click a header: asc → desc → off. */
  const toggleSort = (key: string) =>
    setSort((s) => (s?.key === key ? (s.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' }));

  return { query, setQuery, statusFilter, setStatusFilter, sort, toggleSort, rows: result };
}
