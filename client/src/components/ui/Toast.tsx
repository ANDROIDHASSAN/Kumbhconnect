'use client';
import * as React from 'react';
import { cn } from '@/lib/cn';

export type ToastTone = 'success' | 'error' | 'info';

export function Toast({
  open,
  tone = 'info',
  message,
  onClose,
}: {
  open: boolean;
  tone?: ToastTone;
  message: string;
  onClose?: () => void;
}) {
  React.useEffect(() => {
    if (open && onClose) {
      const t = setTimeout(onClose, 4000);
      return () => clearTimeout(t);
    }
  }, [open, onClose]);

  if (!open) return null;

  const toneClass =
    tone === 'success'
      ? 'bg-teal text-white'
      : tone === 'error'
        ? 'bg-rose text-white'
        : 'bg-plum text-white';

  return (
    <div
      className={cn(
        'fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lift',
        toneClass,
      )}
      role="status"
    >
      {message}
    </div>
  );
}
