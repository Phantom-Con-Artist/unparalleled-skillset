import { Link, useParams } from 'react-router-dom';
import Picture from '../components/Picture.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import { COLLECTIONS, PIECES, collectionUrl, findCollection, pieceUrl } from '../data/catalog.js';
import NotFound from './NotFound.jsx';
import { usePageTitle } from '../lib/usePageTitle.js';

export function CollectionsIndex() {
  usePageTitle('Collections');
  return (
    <div className="page page--collections">
      <header className="page-head">
        <h1>Collections</h1>
        <p>Five bodies of work, each with its own clay, glaze and kind of light. A few pieces in each, never repeated.</p>
      </header>
      <ol className="index-list">
        {COLLECTIONS.map((c) => (
          <li key={c.slug} style={{ '--field': c.glaze.field, '--field-ink': c.glaze.ink, '--accent': c.glaze.accent }}>
            <Link to={collectionUrl(c.slug)} className="index-list__link">
              <span className="index-list__name">{c.name}</span>
              <span className="index-list__line">{c.line}</span>
              <span className="index-list__count">{c.pieces.length === 1 ? 'One piece shown' : `${c.pieces.length} pieces shown`}</span>
              <span className="index-list__thumb"><Picture name={c.scene} alt="" sizes="(min-width: 960px) 26vw, 90vw" /></span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Collection() {
  const { slug } = useParams();
  const c = findCollection(slug);
  usePageTitle(c?.name);
  if (!c) return <NotFound />;
  const index = COLLECTIONS.indexOf(c);
  const next = COLLECTIONS[(index + 1) % COLLECTIONS.length];
  return (
    <div className="page collection" style={{ '--field': c.glaze.field, '--field-ink': c.glaze.ink, '--accent': c.glaze.accent }}>
      <header className="collection__hero">
        <Picture name={c.scene} alt={c.sceneAlt} eager className="collection__scene" />
        <div className="collection__title">
          <p className="collection__crumb"><Link to="/collections">Collections</Link></p>
          <h1>{c.name}</h1>
          <p className="collection__line">{c.line}</p>
        </div>
      </header>

      <section className="collection__body">
        <div className="collection__prose">
          {c.body.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
        </div>
        <dl className="specs">
          {c.specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </section>

      <section className="collection__pieces" aria-labelledby="pieces-title">
        <h2 id="pieces-title">{c.slug === 'bespoke' ? 'Recent commissions' : 'In the atelier now'}</h2>
        <ul className={`piece-row piece-row--${c.pieces.length}`}>
          {c.pieces.map((slug, i) => {
            const p = PIECES[slug];
            return (
              <li key={slug} className={`piece-row__item piece-row__item--${i % 3}`}>
                <Link to={pieceUrl(slug)}>
                  <span className={`piece-row__plate ${p.cutout ? 'piece-row__plate--cutout' : ''}`}>
                    <Picture name={p.image} alt={p.alt} sizes="(min-width: 960px) 30vw, 85vw" />
                  </span>
                  <span className="piece-row__name">{p.name}</span>
                  <span className="piece-row__terms">{p.commissioned ? 'Commissioned' : 'Price on request'}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="collection__enquire" aria-labelledby="enq-title">
        <div>
          <h2 id="enq-title">Ask about {c.name}</h2>
          <p>Pieces are offered privately. Tell the atelier what you are looking for and where it would stand.</p>
        </div>
        <EnquiryForm subject={`Enquiry: ${c.name}`} messagePlaceholder="A pair for either end of a long console, or the amphora on its own." />
      </section>

      <nav className="next-room" aria-label="Next collection">
        <Link to={collectionUrl(next.slug)} style={{ '--field': next.glaze.field, '--field-ink': next.glaze.ink }}>
          <span>Next room</span>
          <strong>{next.name}</strong>
        </Link>
      </nav>
    </div>
  );
}
