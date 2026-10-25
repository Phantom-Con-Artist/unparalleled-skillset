import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Toile from './Toile.jsx';
import { AGENTS, CORRECTIONS, DEMOS, INSTALL, REPO } from './data.js';

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// A grainline: the long double-headed arrow printed on every pattern piece.
function Grainline({ className = '' }) {
  return (
    <svg className={`grainline ${className}`} viewBox="0 0 400 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M6 6H394M6 6l9-5M6 6l9 5M394 6l-9-5M394 6l-9 5" fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Command({ text = INSTALL, label = 'Install both skills' }) {
  const [status, setStatus] = useState('');
  const ref = useRef(null);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copied. Paste it into a terminal in your project.');
    } catch {
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
      setStatus('Copying was blocked, so the command is selected. Press Ctrl+C or Cmd+C.');
    }
  };
  return (
    <div className="command">
      <span className="command__label">{label}</span>
      <div className="command__tape">
        <code ref={ref}>{text}</code>
        <button type="button" onClick={copy}>Copy</button>
      </div>
      <p className="command__status" role="status">{status}</p>
    </div>
  );
}

function Header() {
  return (
    <header className="masthead">
      <a className="masthead__home" href="#top" aria-label="Unparalleled, back to the top">Unparalleled</a>
      <nav aria-label="Main">
        <ul>
          <li><a href="#fitting">The fitting</a></li>
          <li><a href="#cloth">Demos</a></li>
          <li><a href="#views">Two skills</a></li>
          <li><a href="#sizes">Agents</a></li>
          <li><a href="#install">Install</a></li>
          <li><a href={REPO}>GitHub</a></li>
        </ul>
      </nav>
    </header>
  );
}

function Front() {
  return (
    <section className="front" id="top" aria-labelledby="front-title">
      <h1 id="front-title" className="front__wordmark">Unparalleled</h1>
      <div className="front__copy">
        <p className="front__lede">Design skills for AI coding agents. They make your agent study the product, commit to one direction, build it, then look at its own screenshots until the template look is gone.</p>
        <Command />
        <p className="front__more">Works with Claude Code, Codex, Cursor, Copilot, Gemini CLI and seven more. Node 20 or newer. <a href="#cloth">See what it built</a></p>
      </div>
      <figure className="front__toile">
        <div className="pin" aria-hidden="true" /><div className="pin pin--2" aria-hidden="true" />
        <Toile step={0} label="A generic landing page for a pottery shop: an eyebrow label with a live dot, a slogan headline, indigo pill buttons and three feature cards. Six of its template tells are circled in chalk." />
        <figcaption>The muslin: what an agent ships when nobody asks for more. Six chalk marks, each one something the skill catches.</figcaption>
      </figure>
    </section>
  );
}

function Fitting() {
  const wrap = useRef(null);
  const [step, setStep] = useState(0);
  const [reduce] = useState(reducedMotion);
  const manual = useRef(false);

  useGSAP(() => {
    if (reduce) return;
    ScrollTrigger.create({
      trigger: wrap.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (manual.current) return;
        const next = Math.min(6, Math.floor(self.progress * 7.2));
        setStep((cur) => (cur === next ? cur : next));
      },
    });
  }, { scope: wrap });

  // Buttons take over from the scroll until the reader scrolls again.
  useEffect(() => {
    const release = () => { manual.current = false; };
    window.addEventListener('wheel', release, { passive: true });
    window.addEventListener('touchmove', release, { passive: true });
    return () => { window.removeEventListener('wheel', release); window.removeEventListener('touchmove', release); };
  }, []);
  const go = (n) => { manual.current = true; setStep(Math.max(0, Math.min(6, n))); };

  return (
    <section className={`fitting ${reduce ? 'fitting--static' : ''}`} id="fitting" ref={wrap} aria-labelledby="fitting-title">
      <div className="fitting__sticky">
        <div className="fitting__head">
          <h2 id="fitting-title">The fitting</h2>
          <p>Scroll, or step through, and watch the page get re-cut. Every correction is one the skill makes after looking at its own screenshot.</p>
        </div>
        <div className="fitting__bench">
          <div className="fitting__toile">
            <Toile step={step} label={`The pottery landing page after ${step} of 6 corrections.`} />
          </div>
          <ol className="fitting__notes">
            {CORRECTIONS.map((c, i) => (
              <li key={c.title} data-state={step > i ? 'done' : step === i ? 'next' : 'pending'}>
                <button type="button" onClick={() => go(i + 1)} aria-pressed={step > i}>
                  <span className="fitting__num">{i + 1}</span>
                  <span className="fitting__title">{c.title}</span>
                </button>
                <p>{c.note}</p>
                <code>{c.measured ? `flag: ${c.flag}` : c.flag}</code>
              </li>
            ))}
          </ol>
        </div>
        <div className="fitting__controls">
          <button type="button" className="tool" onClick={() => go(step - 1)} disabled={step === 0}>Undo a correction</button>
          <p aria-live="polite">{step === 0 ? 'The muslin, untouched.' : step === 6 ? 'Fitted. Six corrections made.' : `${step} of 6 corrections made.`}</p>
          <button type="button" className="tool tool--strong" onClick={() => go(step === 6 ? 0 : step + 1)}>{step === 6 ? 'Start again' : 'Make the next correction'}</button>
        </div>
      </div>
    </section>
  );
}

function Cloth() {
  return (
    <section className="cloth" id="cloth" aria-labelledby="cloth-title">
      <header className="section-head">
        <h2 id="cloth-title">Cut in cloth</h2>
        <p>Two sites built with these skills, live on this domain. One came from a single sentence. Open them, resize them, look at them on a phone.</p>
      </header>
      {DEMOS.map((d, i) => (
        <article className={`garment garment--${i}`} key={d.name} aria-labelledby={`g-${i}`}>
          <a className="garment__view" href={d.href}>
            <img src={`/demos/${d.images[0][0]}.webp`} alt={d.images[0][1]} width="1440" height="900" loading="lazy" decoding="async" />
            {d.images[1] && <img className="garment__second" src={`/demos/${d.images[1][0]}.webp`} alt={d.images[1][1]} width="1440" height="900" loading="lazy" decoding="async" />}
            <img className="garment__phone" src={`/demos/${d.phone[0]}.webp`} alt={d.phone[1]} width="390" height="844" loading="lazy" decoding="async" />
          </a>
          <div className="garment__label">
            <h3 id={`g-${i}`}>{d.name}</h3>
            {d.prompt && (
              <figure className="slip">
                <figcaption>The whole prompt</figcaption>
                <blockquote><p>{d.prompt}</p></blockquote>
              </figure>
            )}
            <p>{d.note}</p>
            <dl>
              <div><dt>Skill</dt><dd>unparalleled-{d.kind}</dd></div>
              <div><dt>Agent</dt><dd>{d.agent}</dd></div>
              <div><dt>Built with</dt><dd>{d.stack}</dd></div>
            </dl>
            <a className="textlink" href={d.href}>Open {d.name}</a>
          </div>
        </article>
      ))}
    </section>
  );
}

function Views() {
  return (
    <section className="views" id="views" aria-labelledby="views-title">
      <header className="section-head">
        <h2 id="views-title">Two views, one pattern</h2>
        <p>Install one or both. They share the same craft foundation and differ in what success means.</p>
      </header>
      <div className="views__pair">
        <article className="view">
          <span className="view__letter" aria-hidden="true">A</span>
          <h3>unparalleled-website</h3>
          <p className="view__for">For public sites, portfolios, landing pages and product stories.</p>
          <p>The agent reads the product and its real content, writes a direction contract, explores five product-specific hypotheses and picks one, then builds it, with 2D or 3D motion only where it explains something. Type, colour and icons have to trace back to the subject.</p>
          <Command text="npx github:Phantom-Con-Artist/unparalleled-skillset install website" label="View A only" />
        </article>
        <article className="view">
          <span className="view__letter" aria-hidden="true">B</span>
          <h3>unparalleled-ui</h3>
          <p className="view__for">For dashboards, tables, forms, settings and the screens people work in.</p>
          <p>The same care, aimed at task clarity: real data density, every state designed (empty, loading, error, undo), semantic tokens, keyboard paths and tools shaped by the job rather than a marketing tournament.</p>
          <Command text="npx github:Phantom-Con-Artist/unparalleled-skillset install ui" label="View B only" />
        </article>
      </div>
    </section>
  );
}

function Sizes() {
  return (
    <section className="sizes" id="sizes" aria-labelledby="sizes-title">
      <header className="section-head">
        <h2 id="sizes-title">Size chart</h2>
        <p>The installer finds the agents on your machine and copies both skills into each one&rsquo;s own skill folder, then adds a short routing note to its instruction file. Twelve fit today.</p>
      </header>
      <div className="sizes__table" role="region" aria-labelledby="sizes-title" tabIndex={0}>
        <table>
          <thead><tr><th scope="col">Agent</th><th scope="col">In this project</th><th scope="col">For every project (--global)</th></tr></thead>
          <tbody>
            {AGENTS.map(([name, proj, user]) => (
              <tr key={name}><th scope="row">{name}</th><td><code>{proj}</code></td><td><code>{user}</code></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Instructions() {
  const steps = [
    ['Install', 'npx github:Phantom-Con-Artist/unparalleled-skillset install all', 'Copies both skills for every detected agent. It never prompts, backs up anything it changes, and running it twice writes nothing new.'],
    ['Check what it found', 'npx github:Phantom-Con-Artist/unparalleled-skillset agents', 'Lists the agents it detected and why, without changing a file.'],
    ['Pick agents yourself', 'npx github:Phantom-Con-Artist/unparalleled-skillset install ui --agent claude,codex', 'Or add --dry-run to see the plan first, or --global to install once for all your projects.'],
    ['Give it eyes', 'node .agents/skills/unparalleled-website/scripts/capture.mjs --install --url http://localhost:5173 --out ./shots', 'The skills screenshot their own work at five widths. This fetches Playwright into a user cache the first time, leaving your project untouched.'],
  ];
  return (
    <section className="instructions" id="install" aria-labelledby="install-title">
      <header className="section-head">
        <h2 id="install-title">Instructions</h2>
        <p>Node.js 20 or newer. Nothing is compiled; the installer runs straight from GitHub.</p>
      </header>
      <ol className="steps">
        {steps.map(([title, cmd, note], i) => (
          <li key={title}>
            <span className="steps__num" aria-hidden="true">{i + 1}</span>
            <h3>{title}</h3>
            <p>{note}</p>
            <Command text={cmd} label={title} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function Footer() {
  return (
    <footer className="selvedge">
      <Grainline />
      <div className="selvedge__row">
        <p className="selvedge__mark">Unparalleled</p>
        <p>Two agent skills and an installer, by Subhradeep Sarkar. MIT licensed.</p>
        <p><a href={REPO}>Source on GitHub</a></p>
      </div>
      <p className="selvedge__small">Poterie Céleste is a fictional business. The Claude page is an unofficial demo made by Claude Code from one prompt and is not affiliated with Anthropic. This page was built with the same skills and checked with the same screenshot loop.</p>
    </footer>
  );
}

function NotFound() {
  return (
    <section className="lost" aria-labelledby="lost-title">
      <h1 id="lost-title">This piece isn&rsquo;t on the pattern.</h1>
      <p>The page you asked for does not exist. The demos live at their own addresses.</p>
      <ul>
        <li><a href="/">Unparalleled</a></li>
        {DEMOS.map((d) => <li key={d.href}><a href={d.href}>{d.name}</a></li>)}
      </ul>
    </section>
  );
}

export default function App() {
  const known = window.location.pathname === '/' || window.location.pathname === '/index.html';
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        {known ? (
          <>
            <Front />
            <Grainline className="divider" />
            <Fitting />
            <Cloth />
            <Views />
            <Sizes />
            <Instructions />
          </>
        ) : <NotFound />}
      </main>
      <Footer />
    </>
  );
}
