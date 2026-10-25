// Smooth, inertial wheel scrolling (Lenis) driven by the GSAP ticker so the descent timeline,
// ScrollTrigger and the page all advance on the same frame. Off when reduced motion is requested;
// native scroll position, keyboard and scrollbar behaviour are kept.
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
export let lenis = null;

export function startSmoothScroll() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return lenis;
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.4, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function scrollToY(y, { immediate = false } = {}) {
  if (lenis) lenis.scrollTo(y, { immediate, duration: immediate ? 0 : 1.6 });
  else window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
}
