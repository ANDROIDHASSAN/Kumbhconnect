import type { CSSProperties } from 'react';

// Shim for `next/image` → plain <img>. Supports the `fill` + `priority`
// props used in the ported components.
export default function Image({
  src, alt = '', fill, priority, sizes, className, width, height, style, ...rest
}: any) {
  // A subtle brand tint behind fill images so they never flash stark grey
  // while loading. fill images are layout-critical section/hero backgrounds.
  const merged: CSSProperties = fill
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%', backgroundColor: 'rgb(36 27 46 / 0.06)', ...style }
    : style;
  const url = typeof src === 'string' ? src : src?.src ?? '';
  // `fill` images (backgrounds/heroes) load eagerly — native lazy-loading is
  // unreliable under Lenis smooth-scroll and can leave them blank. Thumbnails
  // (non-fill) stay lazy for performance.
  const loading = priority || fill ? 'eager' : 'lazy';
  return (
    <img
      src={url}
      alt={alt}
      className={className}
      style={merged}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={loading}
      decoding="async"
      {...rest}
    />
  );
}
