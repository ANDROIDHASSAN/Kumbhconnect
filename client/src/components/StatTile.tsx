export function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-tile border border-line/70 bg-white/70 p-4 text-center backdrop-blur">
      <div className="font-display text-2xl font-bold text-plum sm:text-3xl">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}
