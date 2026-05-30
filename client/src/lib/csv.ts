// Minimal, dependency-free CSV export. Values are escaped per RFC 4180.

type Col<T> = { key: string; header: string; get: (row: T) => unknown };

function escape(value: unknown): string {
  const s = value == null ? '' : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv<T>(rows: T[], cols: Col<T>[]): string {
  const head = cols.map((c) => escape(c.header)).join(',');
  const body = rows.map((r) => cols.map((c) => escape(c.get(r))).join(',')).join('\n');
  return `${head}\n${body}`;
}

/** Trigger a client-side download of `csv` as `filename`. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
