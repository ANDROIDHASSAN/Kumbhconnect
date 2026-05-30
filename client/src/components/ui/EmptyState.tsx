import * as React from 'react';

export function EmptyState({
  icon = '🪔',
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-dashed border-line bg-cream/50 p-10 text-center">
      <div className="mx-auto mb-3 text-3xl" aria-hidden>
        {icon}
      </div>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      {description && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
