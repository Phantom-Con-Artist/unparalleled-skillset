import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Picture from '../components/Picture.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import StudioCanvas from '../stage/LazyStudio.jsx';
import { PIECES, collectionUrl, findCollection, pieceUrl } from '../data/catalog.js';
import NotFound from './NotFound.jsx';
import { usePageTitle } from '../lib/usePageTitle.js';

function ModelViewer() {
  const progress = useRef(0);
  const [broken, setBroken] = useState(false);
  const toggle = () => {
    const next = !broken;
    setBroken(next);
    progress.current = next ? 0.6 : 0;
  };
  return (
    <div className="piece__model">
      <StudioCanvas progressRef={progress} className="studio--framed" label="The Céleste Vessel on its plinth, in three dimensions." />
      <button className="button button--light piece__break" type="button" aria-pressed={broken} onClick={toggle}>
        {broken ? 'Mend it' : 'Break it apart'}
      </button>
    </div>
  );
}

export default function Piece() {
  const { slug } = useParams();
  const p = PIECES[slug];
  usePageTitle(p?.name);
  if (!p) return <NotFound />;
  const c = p.collection ? findCollection(p.collection) : null;
  const siblings = c ? c.pieces.filter((s) => s !== slug) : [];
  const style = c ? { '--accent': c.glaze.accent } : undefined;

  return (
    <div className="page piece" style={style}>
      <div className="piece__layout">
        <div className={`piece__visual ${p.cutout ? 'piece__visual--cutout' : ''}`}>
          {p.model ? <ModelViewer /> : <Picture name={p.image} alt={p.alt} eager sizes="(min-width: 960px) 55vw, 100vw" />}
        </div>
        <div className="piece__text">
          <p className="piece__crumb">
            {c ? <Link to={collectionUrl(c.slug)}>{c.name}</Link> : <Link to="/collections">The atelier&rsquo;s own form</Link>}
          </p>
          <h1>{p.name}</h1>
          <p className="piece__summary">{p.summary}</p>
          <dl className="specs specs--tight">
            {p.details.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
          <p className="piece__terms">{p.commissioned ? 'Made to commission and already in its home. A piece like it can be commissioned.' : 'Price on request. Offered privately, with delivery arranged by the atelier.'}</p>
          {p.commissioned
            ? <Link className="button" to="/commissions">Commission something like it</Link>
            : <EnquiryForm subject={`Enquiry: ${p.name}`} messageLabel="Your enquiry" messagePlaceholder="Is it still available, and could it reach us in Lisbon before spring?" submitLabel="Enquire about this piece" />}
        </div>
      </div>

      {siblings.length > 0 && (
        <section className="siblings" aria-labelledby="sib-title">
          <h2 id="sib-title">Also from {c.name}</h2>
          <ul>
            {siblings.map((s) => (
              <li key={s}>
                <Link to={pieceUrl(s)}>
                  <Picture name={PIECES[s].image} alt={PIECES[s].alt} sizes="(min-width: 960px) 20vw, 45vw" />
                  <span>{PIECES[s].name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
