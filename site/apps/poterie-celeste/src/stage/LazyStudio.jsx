import { lazy, Suspense } from 'react';

const StudioCanvas = lazy(() => import('./StudioCanvas.jsx'));
const BASE = import.meta.env.BASE_URL;

// The poster is the same frame the 3D studio opens on, so the swap is invisible.
function Poster({ label, className = '' }) {
  return (
    <div className={`studio ${className}`} role="img" aria-label={label}>
      <img className="studio__poster" src={`${BASE}models/studio-poster.webp`} srcSet={`${BASE}models/studio-poster-960.webp 960w, ${BASE}models/studio-poster.webp 1920w`} sizes="100vw" alt="" aria-hidden="true" fetchPriority="high" />
    </div>
  );
}

export default function LazyStudio(props) {
  return (
    <Suspense fallback={<Poster label={props.label} className={props.className} />}>
      <StudioCanvas {...props} />
    </Suspense>
  );
}
