import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ATELIER_EMAIL } from '../data/catalog.js';
import Picture from './Picture.jsx';

const NAV = [
  ['/collections', 'Collections'],
  ['/commissions', 'Commissions'],
  ['/atelier', 'Atelier'],
  ['/journal', 'Journal'],
  ['/visit', 'Visit'],
];

export function Wordmark({ className = '' }) {
  return <span className={`wordmark ${className}`} aria-hidden="true" />;
}

export function Mark({ className = '' }) {
  return <span className={`mark ${className}`} aria-hidden="true" />;
}

// Over the dark studio the header turns to light ink and drops its backing.
function useHeaderTone() {
  const { pathname } = useLocation();
  const [tone, setTone] = useState('page');
  useEffect(() => {
    const check = () => {
      const overStage = [...document.querySelectorAll('[data-header="light"]')].some((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= 40 && r.bottom >= 40;
      });
      const scrolled = window.scrollY > 12;
      setTone(overStage ? 'studio' : scrolled ? 'solid' : 'page');
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    const t = setTimeout(check, 400);
    return () => { window.removeEventListener('scroll', check); window.removeEventListener('resize', check); clearTimeout(t); };
  }, [pathname]);
  return tone;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const tone = useHeaderTone();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="masthead" data-tone={open ? 'solid' : tone}>
      <Link className="masthead__home" to="/" aria-label="Poterie Céleste, home">
        <Mark />
        <Wordmark />
      </Link>
      <button className="masthead__menu" type="button" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen((o) => !o)}>
        {open ? 'Close' : 'Menu'}
      </button>
      <nav className="masthead__nav" id="site-nav" data-open={open} aria-label="Main">
        <ul>
          {NAV.map(([to, label]) => (
            <li key={to}><NavLink to={to}>{label}</NavLink></li>
          ))}
        </ul>
        <Link className="button button--small masthead__cta" to="/commissions">Commission a piece</Link>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="colophon">
      <figure className="owner">
        <div className="owner__portrait">
          <Picture name="christie-wallace-owner" alt="Christie Wallace, smiling, in red-framed glasses and a linen shirt." sizes="(min-width: 960px) 46vw, 100vw" />
        </div>
        <blockquote className="owner__quote">
          <p>A pot is finished when it comes out of the kiln whole. Everything else goes back to the clay, and I would rather start again than sell the one that nearly worked.</p>
          <footer>
            <cite>Christie Wallace</cite>
            <span>Founder, Poterie Céleste</span>
          </footer>
        </blockquote>
      </figure>

      <div className="colophon__top">
        <div className="colophon__brand">
          <Mark className="mark--large" />
          <Wordmark className="wordmark--footer" />
          <p>Vessels thrown, fired and offered one at a time.</p>
        </div>
        <nav aria-label="Footer">
          <ul>
            {NAV.map(([to, label]) => <li key={to}><Link to={to}>{label}</Link></li>)}
          </ul>
        </nav>
        <div className="colophon__contact">
          <a href={`mailto:${ATELIER_EMAIL}`}>{ATELIER_EMAIL}</a>
          <p>Visits by appointment</p>
          <Link className="text-link" to="/visit">Ask for a visit</Link>
        </div>
      </div>
      <p className="colophon__specimen">
        A specimen website made with <a href="/">Unparalleled</a>. Poterie Céleste, its pieces, its people, its words and its photography are fictional, and the email address is a placeholder.
      </p>
    </footer>
  );
}
