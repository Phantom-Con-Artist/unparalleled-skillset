import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { COMPANY } from '../data.js';

const BASE = import.meta.env.BASE_URL;
const NAV = [['/basilisk-2', 'Basilisk 2'], ['/company', 'Company'], ['/facilities', 'Facilities'], ['/contact', 'Contact']];

// The header reads the surface beneath it: inside the descent it follows the thermometer's tone,
// elsewhere it takes the colour of the section under it ([data-surface="dark"] or light), and
// once the page has scrolled it gets a solid backing so it stays legible over photographs.
export function Header() {
  const [state, setState] = useState({ tone: 'light', solid: false });
  const { pathname } = useLocation();
  const frame = useRef(0);
  useEffect(() => {
    const read = () => {
      frame.current = 0;
      const el = document.elementsFromPoint(window.innerWidth / 2, 30).find((e) => !e.closest('.header'));
      const inStage = !!el?.closest('.descent');
      const tone = inStage ? 'stage' : el?.closest('[data-surface]')?.dataset.surface || 'light';
      const solid = !inStage && window.scrollY > 40;
      setState((s) => (s.tone === tone && s.solid === solid ? s : { tone, solid }));
    };
    let last = 0;
    const onScroll = () => {
      const now = performance.now();
      if (frame.current || now - last < 120) { if (!frame.current) frame.current = setTimeout(() => { frame.current = 0; read(); }, 130); return; }
      last = now; frame.current = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame.current); clearTimeout(frame.current); };
  }, [pathname]);
  return (
    <header className="header" data-tone={state.tone} data-solid={state.solid}>
      <a className="skip" href="#main">Skip to content</a>
      <Link to="/" className="header__brand" aria-label="Soveriegn Quantum, home">
        <span className="header__mark" aria-hidden="true" style={{ '--logo': `url(${BASE}assets/logo-640.webp)` }} />
        <span className="header__word">Soveriegn Quantum</span>
      </Link>
      <nav aria-label="Main">
        <ul className="header__nav">
          {NAV.map(([to, label]) => (
            <li key={to}><NavLink to={to}>{label}</NavLink></li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div>
          <p className="footer__brand">Soveriegn Quantum</p>
          <address>{COMPANY.address.slice(1).map((l) => <span key={l}>{l}</span>)}</address>
        </div>
        <ul className="footer__list" aria-label="Write to us">
          <li><span className="mono">Partnerships</span> <a href={`mailto:${COMPANY.emails.partnerships}`}>{COMPANY.emails.partnerships}</a></li>
          <li><span className="mono">Careers</span> <a href={`mailto:${COMPANY.emails.careers}`}>{COMPANY.emails.careers}</a></li>
          <li><span className="mono">Press</span> <a href={`mailto:${COMPANY.emails.press}`}>{COMPANY.emails.press}</a></li>
        </ul>
        <ul className="footer__list" aria-label="Pages">
          <li><Link to="/basilisk-2">Basilisk 2</Link></li>
          <li><Link to="/company">Company</Link></li>
          <li><Link to="/facilities">Facilities</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </div>
      <p className="footer__note">
        Soveriegn Quantum is a fictional company, and its people, dates and addresses are invented for this demonstration. The machine on the home page was modelled in Blender for this site; its die circuit is drawn at true lateral scale with heights exaggerated. A demo of the <a href="/">Unparalleled</a> design skills.
      </p>
    </footer>
  );
}
