import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import * as api from '@/lib/api';

/**
 * Image field with two ways in: upload a file (signed direct-to-Cloudinary) or
 * paste a hosted URL. The URL path always works; the upload path needs the
 * server's CLOUDINARY_* keys and surfaces a friendly message when they're absent.
 */
export function ImageUpload({
  value, onChange, label = 'Image',
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErr(null);
    setBusy(true);
    try {
      onChange(await api.adminUploadImage(file));
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-cream">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <span className="text-xl text-muted" aria-hidden>🏞️</span>}
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={busy}>
              {busy ? 'Uploading…' : value ? 'Replace' : 'Upload image'}
            </Button>
            {value && <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)} disabled={busy}>Remove</Button>}
          </div>
          <input
            type="url"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value || null)}
            placeholder="…or paste an image URL"
            className={cn('w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/30')}
          />
        </div>
      </div>
      {err && <p className="mt-1 text-xs text-rose">{err}</p>}
      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
    </div>
  );
}
