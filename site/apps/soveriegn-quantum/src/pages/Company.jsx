import Img from '../components/Img.jsx';
import { MILESTONES, MOTIVE, PEOPLE, PRINCIPLES } from '../data.js';

export default function Company() {
  return (
    <>
      <section className="page-hero" aria-labelledby="h-company">
        <div className="page-hero__text">
          <p className="kicker"><span className="mono">Since 2019</span> Company</p>
          <h1 id="h-company" className="display">{MOTIVE.title}</h1>
          {MOTIVE.body.map((t) => <p key={t} className="lede">{t}</p>)}
        </div>
        <figure className="page-hero__image">
          <Img name="engineer-servicing" alt="An engineer adjusting connectors on the top flange of a cryostat, with rack electronics behind." sizes="(min-width: 960px) 52vw, 100vw" loading="eager" fetchPriority="high" />
        </figure>
      </section>

      <section className="principles" aria-labelledby="h-principles">
        <h2 id="h-principles">Three things we hold to</h2>
        <ol>
          {PRINCIPLES.map((p, i) => (
            <li key={p.title}>
              <span className="principles__n mono">{i + 1}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="history" aria-labelledby="h-history">
        <h2 id="h-history">Seven years, one building</h2>
        <ol className="history__list">
          {MILESTONES.map((m) => (
            <li key={m.year}>
              <span className="history__year mono">{m.year}</span>
              <h3>{m.title}</h3>
              <p>{m.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="leaders" aria-labelledby="h-leaders">
        <h2 id="h-leaders">Leadership</h2>
        {PEOPLE.map((p, i) => (
          <article key={p.slug} className={`leader${i % 2 ? ' leader--flip' : ''}`}>
            <Img name={p.image} alt={`Portrait of ${p.name}.`} sizes="(min-width: 960px) 30vw, 70vw" className="leader__img" />
            <div className="leader__text">
              <h3>{p.name}</h3>
              <p className="mono leader__role">{p.role}</p>
              <p>{p.bio}</p>
            </div>
          </article>
        ))}
      </section>

      <figure className="bleed bleed--people">
        <Img name="employees-group" alt="Eight members of the Soveriegn Quantum team standing together in the atrium at Harlow Fen." sizes="100vw" />
        <figcaption>Part of the team in the atrium at Harlow Fen, October 2026.</figcaption>
      </figure>
    </>
  );
}
