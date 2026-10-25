import { IMAGES } from '../data/catalog.js';

const BASE = import.meta.env.BASE_URL;

function urlFor(name, size) {
  const meta = IMAGES[name];
  if (meta.dir === 'models') return `${BASE}models/${name}${size < meta.w ? `-${size}` : ''}.webp`;
  return `${BASE}assets/${name}-${size}.webp`;
}

export default function Picture({ name, alt, sizes = '100vw', className, eager = false, ...rest }) {
  const meta = IMAGES[name];
  return (
    <img
      className={className}
      src={urlFor(name, meta.sizes[meta.sizes.length - 1])}
      srcSet={meta.sizes.map((s) => `${urlFor(name, s)} ${s}w`).join(', ')}
      sizes={sizes}
      width={meta.w}
      height={meta.h}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : undefined}
      {...rest}
    />
  );
}
