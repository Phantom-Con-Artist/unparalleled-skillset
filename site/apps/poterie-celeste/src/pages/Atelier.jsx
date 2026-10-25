import { Link } from 'react-router-dom';
import Picture from '../components/Picture.jsx';
import { Mark } from '../components/Chrome.jsx';
import { usePageTitle } from '../lib/usePageTitle.js';

const STEPS = [
  ['Clay', 'Porcelain for Elegancy, speckled or grogged stoneware for everything else, wedged by hand the day before.'],
  ['Throwing', 'Each form is thrown in one sitting and left to stiffen slowly under cloth.'],
  ['Trimming and carving', 'At leather-hard the foot is trimmed, the fluting cut, the relief carved, and the mark pressed into the foot.'],
  ['Bisque firing', 'A first, gentler firing turns clay into ceramic that can still drink up glaze.'],
  ['Glaze firing', 'The glaze goes on as a powder and the kiln takes it to full heat. This is where colour arrives, and where most losses happen.'],
  ['Gold', 'Gold cannot survive the glaze firing, so it is painted on last and fired a third time, low.'],
];

export default function Atelier() {
  usePageTitle('Atelier');
  return (
    <div className="page atelier">
      <header className="atelier__head">
        <div>
          <h1>The atelier</h1>
          <p className="atelier__lede">Poterie Céleste is the atelier of Christie Wallace. Every piece passes through her hands three times: at the wheel, at the carving table and at the kiln door.</p>
        </div>
        <figure className="atelier__portrait">
          <Picture name="christie-wallace-owner" alt="Christie Wallace, smiling, in red-framed glasses and a linen shirt." eager sizes="(min-width: 960px) 32vw, 80vw" />
          <figcaption>Christie Wallace</figcaption>
        </figure>
      </header>

      <section className="atelier__prose">
        <p>The work moves between very different rooms, from Alexanderia&rsquo;s gold in a southern light to Ymir&rsquo;s folded white by a winter window, and that is deliberate. A glaze is chosen for the place a piece will stand, not for a season or a catalogue.</p>
        <p>Collections stay small and pieces are not repeated. The kiln is opened only when a load is ready, and anything that cracks goes back to the reclaim bucket rather than to a second-quality shelf.</p>
      </section>

      <section className="process" aria-labelledby="process-title">
        <h2 id="process-title">How a piece is made</h2>
        <ol>
          {STEPS.map(([t, d]) => (
            <li key={t}><strong>{t}</strong><p>{d}</p></li>
          ))}
        </ol>
      </section>

      <section className="the-mark" aria-labelledby="mark-title">
        <Mark className="mark--hero" />
        <div>
          <h2 id="mark-title">The mark</h2>
          <p>An amphora holding a crescent moon under a single star. <i lang="fr">Céleste</i> means of the sky. It is pressed into the foot of every piece before the first firing, so it is the one thing every pot from the atelier shares.</p>
          <Link className="text-link" to="/collections">See the collections</Link>
        </div>
      </section>
    </div>
  );
}
