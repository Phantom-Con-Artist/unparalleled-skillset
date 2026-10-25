import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '@react-three/drei';
import { invalidate } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { progress } from './progress.js';
import {
  CHAPTERS, chapterAt, chapterRest, coldness, fieldWidth, formatLength, formatTemp, pageColors, temperatureAt,
  LOG_HOT, LOG_COLD,
} from './timeline.js';
import { MOTIVE, PRINCIPLES, STAGES, MILESTONES, SCALES } from '../data.js';
import Img from '../components/Img.jsx';
import { scrollToY } from '../smooth.js';

gsap.registerPlugin(ScrollTrigger);
const Scene = lazy(() => import('./Scene.jsx'));

const hasWebGL = () => {
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
};

const TICKS = [
  { T: 300, label: '300 K', chapter: 'room' },
  { T: 50, label: '50 K', chapter: 'principle-0' },
  { T: 4, label: '4 K', chapter: 'stage-4K' },
  { T: 0.8, label: '800 mK', chapter: 'stage-Still' },
  { T: 0.1, label: '100 mK', chapter: 'stage-Cold' },
  { T: 0.01, label: '10 mK', chapter: 'stage-MXC' },
];
const railPos = (T) => (LOG_HOT - Math.log10(T)) / (LOG_HOT - LOG_COLD);

// Stills shown when WebGL is unavailable, one per part of the story.
const STILL = (id) => {
  if (id === 'room' || id === 'motive' || id.startsWith('principle')) return ['computer-studio', 'The closed machine in its white frame.'];
  if (id.startsWith('stage')) return ['cryostat-detail', 'The gold cooling stages of a dilution refrigerator with the shields removed.'];
  if (id === 'package') return ['basilisk-2-processor-hero', 'Basilisk 2 in its gold-plated copper package with the lid removed.'];
  return ['basilisk-2-die-macro', 'The Basilisk 2 die: aluminium circuit on dark silicon, wire-bonded into the package.'];
};

function Chapter({ c, active, children }) {
  return (
    <article id={`descent-${c.id}`} className={`chapter chapter--${c.id.split('-')[0]}${active ? ' is-active' : ''}`} aria-labelledby={`h-${c.id}`}>
      {children}
    </article>
  );
}

function stageMilestones(i) { return MILESTONES.slice(i * 2, i * 2 + 2); }

export default function Descent() {
  const section = useRef();
  const reading = useRef();
  const marker = useRef();
  const scaleText = useRef();
  const [chapter, setChapter] = useState(0);
  const [loadChip, setLoadChip] = useState(false);
  const [webgl] = useState(hasWebGL);
  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const { progress: loaded, active } = useProgress();
  // The loading line is for the first arrival only; the processor model loads quietly later.
  const [arrived, setArrived] = useState(false);
  useEffect(() => { if (loaded >= 100 && !active) setArrived(true); }, [loaded, active]);
  const last = useRef({ bg: '', dark: null });

  // Scroll drives progress: scrubbed and smoothed in motion mode, chapter by chapter when reduced.
  useEffect(() => {
    const el = section.current;
    // Development captures: window.__descent(p) jumps straight to a point of the story.
    if (import.meta.env.DEV) {
      window.__descent = (p) => { progress.value = p; invalidate(); setChapter(Math.max(0, chapterAt(p))); if (p > 0.28) setLoadChip(true); return p; };
      if (new URLSearchParams(location.search).has('frozen')) return undefined;
    }
    if (reduced) {
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = CHAPTERS.findIndex((c) => `descent-${c.id}` === e.target.id);
          progress.value = chapterRest(CHAPTERS[i]);
          invalidate();
          setChapter(i);
          paint(progress.value);
        }
      }, { rootMargin: '-45% 0px -45% 0px' });
      el.querySelectorAll('.chapter').forEach((a) => io.observe(a));
      return () => io.disconnect();
    }
    const proxy = { v: 0 };
    const tween = gsap.to(proxy, {
      v: 1, ease: 'none',
      // Lenis already eases the wheel, so the timeline follows scroll directly (one smoothing stage, no lag).
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: true },
      onUpdate: () => {
        progress.value = proxy.v;
        invalidate();
        const i = Math.max(0, chapterAt(proxy.v));
        setChapter((prev) => (prev === i ? prev : i));
        if (proxy.v > 0.28) setLoadChip(true);
        if (!webgl) paint(proxy.v);
      },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, [reduced, webgl]);

  // Fetch the processor model once the machine is in and the page is idle.
  useEffect(() => {
    if (loaded < 100 || active) return;
    const id = setTimeout(() => setLoadChip(true), 2500);
    return () => clearTimeout(id);
  }, [loaded, active]);

  useEffect(() => () => { document.documentElement.setAttribute('data-tone', 'light'); }, []);

  // Instruments and page colour follow the same numbers as the scene.
  function paint(p, cam) {
    const T = temperatureAt(p);
    if (reading.current) reading.current.textContent = formatTemp(T);
    if (marker.current) marker.current.style.transform = `translateY(${(railPos(T) * 100).toFixed(2)}cqh)`;
    if (scaleText.current && cam) {
      scaleText.current.textContent = formatLength(fieldWidth(cam.r, 34, Math.min(window.innerWidth / window.innerHeight, 2)) / 4);
    }
    const c = pageColors(coldness(T));
    if (c.bg !== last.current.bg && section.current) {
      section.current.style.setProperty('--stage-bg', c.bg);
      last.current.bg = c.bg;
    }
    if (c.dark !== last.current.dark) {
      document.documentElement.setAttribute('data-tone', c.dark ? 'dark' : 'light');
      last.current.dark = c.dark;
    }
  }

  const goTo = (id) => {
    const i = CHAPTERS.findIndex((c) => c.id === id);
    const el = section.current;
    if (reduced) { document.getElementById(`descent-${id}`)?.scrollIntoView({ block: 'center' }); return; }
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    scrollToY(top + range * chapterRest(CHAPTERS[i]));
  };

  const current = CHAPTERS[chapter]?.id ?? 'room';
  const inChip = ['package', 'die', 'city', 'qubit', 'squid', 'junction'].includes(current);
  const [still, stillAlt] = STILL(current);

  return (
    <section ref={section} className={`descent${reduced ? ' descent--still' : ''}${webgl ? '' : ' descent--photo'}`} aria-label="Inside the machine">
      <div className="descent__stage">
        {webgl ? (
          <Suspense fallback={null}>
            <Scene chapter={current} loadChip={loadChip} onFrame={paint} />
          </Suspense>
        ) : (
          <Img name={still} alt={stillAlt} className="descent__still" loading="eager" />
        )}
        {webgl && !arrived && (
          <p className="loader" role="status">Bringing the machine in <span className="mono">{Math.round(loaded)}%</span></p>
        )}

        <nav className="rail" aria-label="Temperature stages">
          <p className="rail__title">Operating temperature of the layer in view</p>
          <div className="rail__track">
            <ol className="rail__ticks">
              {TICKS.map((t) => (
                <li key={t.label} style={{ top: `${railPos(t.T) * 100}%` }}>
                  <button type="button" onClick={() => goTo(t.chapter)}>{t.label}</button>
                </li>
              ))}
            </ol>
            <div className="rail__marker" ref={marker} aria-hidden="true"><span ref={reading} className="rail__reading">296 K</span></div>
          </div>
        </nav>

        <div className={`scalebar${inChip ? ' is-on' : ''}`} aria-hidden={!inChip}>
          <span className="scalebar__bar" />
          <span ref={scaleText} className="scalebar__text">15 mm</span>
        </div>
      </div>

      <div className="descent__chapters">
        <Chapter c={CHAPTERS[0]} active={current === 'room'}>
          <h1 id="h-room" className="display">A machine you can open.</h1>
          <p className="lede">Soveriegn Quantum builds superconducting quantum computers in Cambridgeshire, from the junctions on the chip to the wiring in the cryostat. Keep scrolling and we will open one, all the way down.</p>
        </Chapter>

        <Chapter c={CHAPTERS[1]} active={current === 'motive'}>
          <p className="kicker"><span className="mono">300 K</span> The vacuum can comes off</p>
          <h2 id="h-motive">{MOTIVE.title}</h2>
          {MOTIVE.body.map((t) => <p key={t}>{t}</p>)}
        </Chapter>

        {PRINCIPLES.map((pr, i) => (
          <Chapter key={pr.title} c={CHAPTERS[2 + i]} active={current === `principle-${i}`}>
            <p className="kicker"><span className="mono">{i + 1} of 3</span> {i === 0 ? 'The 50 K shield comes off' : i === 1 ? 'The 4 K shield comes off' : 'What we hold to'}</p>
            <h2 id={`h-principle-${i}`}>{pr.title}</h2>
            <p>{pr.body}</p>
          </Chapter>
        ))}

        {STAGES.map((s, i) => (
          <Chapter key={s.key} c={CHAPTERS[5 + i]} active={current === `stage-${s.key}`}>
            <p className="kicker"><span className="mono">{s.temp}</span> {s.name}</p>
            <h2 id={`h-stage-${s.key}`} className="visually-hidden">{s.name}, {s.temp}</h2>
            <p className="stage-note">{s.note}</p>
            <ol className="milestones">
              {stageMilestones(i).map((m) => (
                <li key={m.year}>
                  <span className="milestones__year mono">{m.year}</span>
                  <span className="milestones__title">{m.title}</span>
                  <span className="milestones__body">{m.body}</span>
                </li>
              ))}
            </ol>
          </Chapter>
        ))}

        {SCALES.map((s, i) => (
          <Chapter key={s.key} c={CHAPTERS[9 + i]} active={current === s.key}>
            <p className="kicker"><span className="mono">{s.scale}</span> {i === 0 ? 'Below the mixing chamber' : 'Field of view'}</p>
            <h2 id={`h-${s.key}`}>{s.title}</h2>
            <p>{s.body}</p>
            {s.key === 'junction' && (
              <p className="chapter__links">
                <Link to="/basilisk-2">What we will publish about Basilisk 2</Link>
                <Link to="/company">The people who build it</Link>
              </p>
            )}
          </Chapter>
        ))}
      </div>
    </section>
  );
}
