import { useState } from 'react';
import { Link } from 'react-router-dom';
import Descent from '../stage/Descent.jsx';
import Img from '../components/Img.jsx';
import { COMPANY, FACILITIES, PEOPLE } from '../data.js';

export default function Home() {
  const [who, setWho] = useState(0);
  return (
    <>
      <Descent />

      <section className="warmup" data-surface="dark" aria-labelledby="h-warmup">
        <p className="kicker"><span className="mono">10 mK to 296 K</span> Warm-up</p>
        <h2 id="h-warmup" className="display display--sub">Back at room temperature.</h2>
        <p className="lede">Opening a real cryostat takes two days of warming. The people who do it, and the building they do it in, are below.</p>
      </section>

      <section className="people" aria-labelledby="h-people">
        <div className="people__head">
          <h2 id="h-people">The people who open it</h2>
          <p>Four of the engineers and scientists who lead the work at Harlow Fen.</p>
        </div>
        <div className="people__body">
          <ol className="people__index">
            {PEOPLE.map((p, i) => (
              <li key={p.slug}>
                <button type="button" aria-pressed={who === i} onMouseEnter={() => setWho(i)} onFocus={() => setWho(i)} onClick={() => setWho(i)}>
                  <span className="people__name">{p.name}</span>
                  <span className="people__role mono">{p.role}</span>
                </button>
              </li>
            ))}
          </ol>
          <figure className="people__portrait">
            {PEOPLE.map((p, i) => (
              <Img key={p.slug} name={p.image} alt={`${p.name}, ${p.role}`} sizes="(min-width: 960px) 34vw, 90vw" className={who === i ? 'is-on' : ''} />
            ))}
            <figcaption>{PEOPLE[who].bio}</figcaption>
          </figure>
        </div>
        <p className="people__more"><Link to="/company">The company, its principles and its history</Link></p>
      </section>

      <section className="campus" aria-labelledby="h-campus">
        <figure className="campus__hero">
          <Img name="headquarters-revised" alt="Building 4 at Harlow Fen: a pale stone and glass research building with Soveriegn Quantum lettering by the entrance." sizes="100vw" />
        </figure>
        <div className="campus__text">
          <h2 id="h-campus">One building, every layer</h2>
          <p>The cleanroom, the measurement lab and both dilution refrigerators are a corridor apart at {COMPANY.campus}. A die can be evaporated, diced, bonded, packaged and cooled without leaving the building.</p>
          <ul className="campus__list">
            {FACILITIES.slice(1, 7).map((f) => <li key={f.title}>{f.title}</li>)}
          </ul>
          <Link className="button" to="/facilities">Walk through the facilities</Link>
        </div>
      </section>

      <section className="partner" data-surface="dark" aria-labelledby="h-partner">
        <h2 id="h-partner">Work with us</h2>
        <p>Universities, national laboratories and companies with a hard problem and the patience to measure it properly.</p>
        <a className="partner__mail" href={`mailto:${COMPANY.emails.partnerships}`}>{COMPANY.emails.partnerships}</a>
      </section>
    </>
  );
}
