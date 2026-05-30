import type { CSSProperties } from 'react';

// Shim for `next/image` → plain <img>. Supports the `fill` + `priority`
// props used in the ported components.
export default function Image({
  src, alt = '', fill, priority, sizes, className, width, height, style, ...rest
}: any) {
  const merged: CSSProperties = fill
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }
    : style;
  const url = typeof src === 'string' ? src : src?.src ?? '';
  return (
    <img
      src={url}
      alt={alt}
      className={className}
      style={merged}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...rest}
    />
  );
}
