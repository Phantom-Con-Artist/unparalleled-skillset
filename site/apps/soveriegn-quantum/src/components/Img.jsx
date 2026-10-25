import manifest from '../images.json';

const BASE = import.meta.env.BASE_URL;

// Responsive WebP from the optimised renditions in public/assets.
export default function Img({ name, alt, sizes = '100vw', className, loading = 'lazy', fetchPriority }) {
  const entry = manifest[name];
  if (!entry) return null;
  const widths = Object.keys(entry.files).map(Number).sort((a, b) => a - b);
  const srcSet = widths.map((w) => `${BASE}assets/${entry.files[w]} ${w}w`).join(', ');
  const fallback = `${BASE}assets/${entry.files[widths[Math.min(1, widths.length - 1)]]}`;
  return (
    <img
      className={className}
      src={fallback}
      srcSet={srcSet}
      sizes={sizes}
      width={entry.width}
      height={entry.height}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
    />
  );
}
