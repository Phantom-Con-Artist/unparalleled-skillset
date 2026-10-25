import { useEffect } from 'react';

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Poterie Céleste` : 'Poterie Céleste · Vessels made once';
  }, [title]);
}
