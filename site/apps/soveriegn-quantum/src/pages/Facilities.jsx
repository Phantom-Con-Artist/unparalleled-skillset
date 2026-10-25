import Img from '../components/Img.jsx';
import { COMPANY, FACILITIES } from '../data.js';

export default function Facilities() {
  return (
    <>
      <section className="page-hero" aria-labelledby="h-fac">
        <div className="page-hero__text">
          <p className="kicker"><span className="mono">Harlow Fen</span> Facilities</p>
          <h1 id="h-fac" className="display">A corridor apart</h1>
          <p className="lede">Evaporation, dicing, bonding, packaging and cooldown happen in one building, so the people who make a part can watch it be measured.</p>
        </div>
      </section>
      <div className="rooms">
        {FACILITIES.map((f, i) => (
          <section key={f.title} className={`room${i % 3 === 1 ? ' room--right' : i % 3 === 2 ? ' room--wide' : ''}`} aria-labelledby={`room-${i}`}>
            <figure className="room__img">
              <Img name={f.image} alt={`${f.title} at Soveriegn Quantum.`} sizes="(min-width: 960px) 62vw, 100vw" loading={i < 2 ? 'eager' : 'lazy'} />
            </figure>
            <div className="room__text">
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              <h2 id={`room-${i}`}>{f.title}</h2>
              <p>{f.body}</p>
            </div>
          </section>
        ))}
      </div>
      <section className="visit" aria-labelledby="h-visit">
        <h2 id="h-visit">Visiting</h2>
        <address>{COMPANY.address.map((l) => <span key={l}>{l}</span>)}</address>
        <p>Visits to the cleanroom and the measurement lab are arranged in advance and escorted. Write to <a href={`mailto:${COMPANY.emails.partnerships}?subject=Visit`}>{COMPANY.emails.partnerships}</a>.</p>
      </section>
    </>
  );
}
