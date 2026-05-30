import { useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Generic drag-and-drop Kanban board. Columns are the distinct values of a
 * status field; dragging a card to another column calls `onMove`. Pure view —
 * it never mutates `items`; the parent reloads after the move persists.
 */
export function KanbanBoard<T>({
  items, columns, columnOf, idOf, onMove, renderCard, columnLabel, emptyLabel,
}: {
  items: T[];
  /** Ordered column keys (the allowed status values). */
  columns: readonly string[];
  /** Current column for an item. */
  columnOf: (item: T) => string;
  /** Stable id for an item. */
  idOf: (item: T) => string;
  /** Called when a card is dropped into a different column. */
  onMove: (item: T, to: string) => void;
  /** Card body renderer. */
  renderCard: (item: T) => React.ReactNode;
  /** Optional pretty label for a column key. */
  columnLabel?: (col: string) => string;
  /** Placeholder shown in an empty column. */
  emptyLabel?: string;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  const byId = new Map(items.map((i) => [idOf(i), i] as const));
  const label = (c: string) => (columnLabel ? columnLabel(c) : c.replace(/_/g, ' '));

  const drop = (col: string) => {
    setOverCol(null);
    const id = dragId;
    setDragId(null);
    if (!id) return;
    const item = byId.get(id);
    if (item && columnOf(item) !== col) onMove(item, col);
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {columns.map((col) => {
        const cards = items.filter((i) => columnOf(i) === col);
        return (
          <div
            key={col}
            onDragOver={(e) => { e.preventDefault(); setOverCol(col); }}
            onDragLeave={(e) => { if (e.currentTarget === e.target) setOverCol(null); }}
            onDrop={() => drop(col)}
            className={cn(
              'flex w-72 shrink-0 flex-col rounded-card border transition-colors',
              overCol === col ? 'border-saffron bg-saffron/5' : 'border-line bg-cream/40',
            )}
          >
            <div className="flex items-center justify-between border-b border-line/70 px-3 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink">{label(col)}</span>
              <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs font-semibold text-muted">{cards.length}</span>
            </div>
            <div className="flex min-h-[120px] flex-1 flex-col gap-2 p-2.5">
              {cards.map((item) => {
                const id = idOf(item);
                return (
                  <div
                    key={id}
                    draggable
                    onDragStart={() => setDragId(id)}
                    onDragEnd={() => { setDragId(null); setOverCol(null); }}
                    className={cn(
                      'cursor-grab rounded-xl border border-line bg-white p-3 text-sm shadow-sm transition-opacity active:cursor-grabbing',
                      dragId === id && 'opacity-50',
                    )}
                  >
                    {renderCard(item)}
                  </div>
                );
              })}
              {!cards.length && (
                <p className="px-1 py-6 text-center text-xs text-muted">{emptyLabel ?? 'Drop here'}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
