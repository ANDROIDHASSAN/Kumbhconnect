import { useEffect } from 'react';

/** Sets the document title for SPA route changes. */
export function useTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · Kumbh Connect` : 'Kumbh Connect — One Trusted Digital Partner for Kumbh Visitors';
  }, [title]);
}
