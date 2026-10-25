import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import StudioCanvas from '../stage/LazyStudio.jsx';
import Picture from '../components/Picture.jsx';
import { COLLECTIONS, JOURNAL, PIECES, collectionUrl, pieceUrl } from '../data/catalog.js';
import { formatDate } from '../lib/format.js';

gsap.registerPlugin(ScrollTrigger);

// Each chapter owns a stretch of a pinned stage; thresholds match explodeAmount() in Studio.
const OPENING = [
  {
    at: 0,
    title: 'Vessels made once.',
    heading: 'h1',
    body: 'Poterie Céleste is the atelier of Christie Wallace. Every pot here is thrown, fired and offered one at a time, then never made again.',
    actions: [['/collections', 'Walk the collections', 'button'], ['/commissions', 'Commission a piece', 'text']],
    label: { title: 'Céleste Vessel', lines: ['Speckled stoneware, matte white', 'About 78 cm, on a plaster plinth'], link: [pieceUrl('celeste-vessel'), 'See the piece'] },
  },
  {
    at: 0.2,
    title: 'No moulds. No editions.',
    body: 'A pot that cracks in the kiln is broken, not sold. Whatever leaves the atelier is the one that came through the fire.',
    aside: { image: 'studio-alexanderia', alt: 'The Alexanderia amphora, black glaze with gold papyrus fans.', caption: 'Alexanderia Amphora', note: 'Fired three times: bisque, glaze, and gold.', link: [pieceUrl('alexanderia-amphora'), 'See the piece'] },
  },
  {
    at: 0.46,
    title: 'Look at the break.',
    body: 'Eleven millimetres of stoneware, pale and matte where the glaze stops. Each wall is thrown to the thickness its height asks for, no thinner.',
    aside: { image: 'studio-ymir', alt: 'The Ymir folded vessel, white glaze breaking blue-grey in its creases.', caption: 'Ymir Folded Vessel', note: 'Built from slabs, where the clay shows at every fold.', link: [pieceUrl('ymir-folded-vessel'), 'See the piece'] },
  },
  {
    at: 0.74,
    title: 'Whole, and only once.',
    body: 'Five collections with a few pieces in each, and commissions that begin with a letter about the room.',
    actions: [['/collections', 'Walk the collections', 'button']],
    aside: { image: 'bespoke-ivory-kintsugi', alt: 'A twisting ivory vase with gold seams.', caption: 'Ivory, with gold seams', note: 'A commission for a hallway where an old vase had broken.', link: [pieceUrl('bespoke-ivory-seams'), 'Read about it'], cutout: true },
  },
];

const REFLECTION = [
  {
    at: 0,
    title: 'Seen from the other side.',
    body: 'Turn a pot over and you meet its foot: trimmed by hand, pressed with the mark, never glazed. It is the part only its owner ever sees.',
    label: { title: 'The foot ring', lines: ['Trimmed at leather-hard', 'Stamped before the first firing'], link: ['/atelier', 'How a piece is made'] },
  },
  {
    at: 0.2,
    title: 'Nothing is wasted.',
    body: 'Broken pieces go back to the reclaim bucket. Soaked, dried and wedged, the same clay comes back to the wheel as something new.',
    aside: { image: 'studio-elegancy', alt: 'An ivory fluted Elegancy bottle.', caption: 'Elegancy Fluted Bottle', note: 'Porcelain, thrown thin and fluted by hand.', link: [pieceUrl('elegancy-fluted-bottle'), 'See the piece'] },
  },
  {
    at: 0.46,
    title: 'Every glaze, a second firing.',
    body: 'Colour only arrives at full heat. Gold waits for a third, gentler firing of its own.',
    aside: { image: 'oxblood-amphora-vase', alt: 'An oxblood amphora with gold scrolls.', caption: 'Oxblood Amphora Vase', note: 'Copper-red under burnished gold.', link: [pieceUrl('oxblood-amphora-vase'), 'See the piece'] },
  },
  {
    at: 0.74,
    title: 'Write to the atelier.',
    body: 'For a piece you have seen here, or one that does not exist yet.',
    actions: [['/commissions', 'Commission a piece', 'button'], ['/visit', 'Ask for a visit', 'text']],
    aside: { image: 'bespoke-teal-wave', alt: 'A teal moon jar carved in deep swells.', caption: 'Teal, carved swell', note: 'For a house above the sea.', link: [pieceUrl('bespoke-teal-swell'), 'Read about it'], cutout: true },
  },
];

const chapterAt = (chapters, p) => chapters.reduce((i, c, idx) => (p >= c.at ? idx : i), 0);

function Chapter({ chapter, index, active = true, firstHeading, onFocusChapter }) {
  const Heading = chapter.heading && firstHeading ? chapter.heading : 'h2';
  return (
    <div className="stage__chapter" data-active={active} onFocusCapture={onFocusChapter ? () => onFocusChapter(index) : undefined}>
      <div className="stage__copy">
        <Heading className="stage__title">{chapter.title}</Heading>
        <p className="stage__body">{chapter.body}</p>
        {chapter.actions && (
          <div className="stage__actions">
            {chapter.actions.map(([to, label, kind]) => (
              <Link key={to + label} to={to} className={kind === 'button' ? 'button button--light' : 'text-link'}>{label}</Link>
            ))}
          </div>
        )}
      </div>
      {chapter.aside ? (
        <figure className={`stage__aside ${chapter.aside.cutout ? 'stage__aside--cutout' : ''}`}>
          <Picture name={chapter.aside.image} alt={chapter.aside.alt} sizes="(min-width: 960px) 22vw, 30vw" eager />
          <figcaption>
            <strong>{chapter.aside.caption}</strong>
            <span>{chapter.aside.note}</span>
            <Link to={chapter.aside.link[0]}>{chapter.aside.link[1]}</Link>
          </figcaption>
        </figure>
      ) : (
        <div className="stage__label">
          <strong>{chapter.label.title}</strong>
          {chapter.label.lines.map((l) => <span key={l}>{l}</span>)}
          <Link to={chapter.label.link[0]}>{chapter.label.link[1]}</Link>
        </div>
      )}
    </div>
  );
}

// A transparent run of scroll that shows the shared studio behind it and narrates over it.
// Every chapter stays in the document in order; only the one for the current stretch is shown.
function Stage({ chapters, id, onProgress, onActive, reflection = false, label }) {
  const wrap = useRef(null);
  const [active, setActive] = useState(0);
  useGSAP(() => {
    ScrollTrigger.create({
      trigger: wrap.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        onProgress(self.progress);
        const next = chapterAt(chapters, self.progress);
        setActive((cur) => (cur === next ? cur : next));
      },
    });
    // Live a little before and after the pinned run, so the studio is drawn as it slides in.
    ScrollTrigger.create({ trigger: wrap.current, start: 'top bottom', end: 'bottom top', onToggle: (self) => onActive(self.isActive) });
  }, { scope: wrap });

  // Tabbing into a hidden chapter scrolls the page to the stretch where it is shown.
  const focusChapter = (i) => {
    if (i === active || !wrap.current) return;
    const el = wrap.current;
    const len = el.offsetHeight - window.innerHeight;
    const next = chapters[i + 1]?.at ?? 1;
    window.scrollTo({ top: el.offsetTop + len * ((chapters[i].at + next) / 2), behavior: 'instant' });
  };

  return (
    <section className={`stage ${reflection ? 'stage--reflection' : ''}`} ref={wrap} id={id} aria-label={label} data-header="light">
      <div className="stage__sticky">
        <div className="stage__layer">
          {chapters.map((c, i) => (
            <Chapter key={c.title} chapter={c} index={i} active={i === active} firstHeading={!reflection} onFocusChapter={focusChapter} />
          ))}
        </div>
        <ol className="stage__rail" aria-hidden="true">
          {chapters.map((c, i) => <li key={c.title} data-current={i === active} />)}
        </ol>
        {!reflection && <p className="stage__cue" aria-hidden="true" data-show={active === 0}>Scroll, and it breaks</p>}
      </div>
    </section>
  );
}

// One studio canvas for the whole page: the opening stage shows it upright, the closing
// stage shows it inverted like a reflection. The flip happens while the sheet covers it.
function useSharedStudio() {
  const progress = useRef(0);
  const [visible, setVisible] = useState({ opening: true, reflection: false });
  const [flipped, setFlipped] = useState(false);
  const show = visible.opening || visible.reflection;
  return {
    canvas: (
      <div className="studio-fixed" data-visible={show} data-flipped={flipped}>
        <StudioCanvas progressRef={progress} active={show}
          label={flipped ? 'The same white vessel, upside down like a reflection, breaking apart and mending as you scroll.' : 'A white speckled stoneware vessel on a stone plinth under a spotlight. As you scroll it breaks into floating pieces, then mends.'} />
      </div>
    ),
    opening: { onProgress: (p) => { progress.current = p; }, onActive: (on) => { setVisible((v) => ({ ...v, opening: on })); if (on) setFlipped(false); } },
    reflection: { onProgress: (p) => { progress.current = p; }, onActive: (on) => { setVisible((v) => ({ ...v, reflection: on })); if (on) setFlipped(true); } },
  };
}

function Collections() {
  const [current, setCurrent] = useState(0);
  const c = COLLECTIONS[current];
  return (
    <section className="rooms" aria-labelledby="rooms-title">
      <div className="rooms__index">
        <h2 id="rooms-title">Five collections, each in its own light</h2>
        <ol>
          {COLLECTIONS.map((col, i) => (
            <li key={col.slug}>
              <Link to={collectionUrl(col.slug)} aria-current={i === current ? 'true' : undefined}
                onMouseEnter={() => setCurrent(i)} onFocus={() => setCurrent(i)}>
                <span className="rooms__name">{col.name}</span>
                <span className="rooms__line">{col.line}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
      <div className="rooms__view">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div className="rooms__frame" key={c.slug}
            initial={{ opacity: 0, clipPath: 'inset(0 0 0 100%)' }} animate={{ opacity: 1, clipPath: 'inset(0 0 0 0%)' }} exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
            <Picture name={c.scene} alt={c.sceneAlt} sizes="(min-width: 960px) 58vw, 100vw" />
          </motion.div>
        </AnimatePresence>
        <p className="rooms__caption">{c.body[0]}</p>
      </div>
    </section>
  );
}

const BASE = import.meta.env.BASE_URL;

// Reduced motion: the same studio, still. Chapter one sits on it; the rest read in order below.
function StaticHome() {
  const progress = useRef(0);
  const [first, ...rest] = OPENING;
  return (
    <section className="stage stage--static" aria-label="The studio">
      <div className="stage__still" data-header="light">
        <StudioCanvas progressRef={progress} label="A white speckled stoneware vessel on a stone plinth under a spotlight, against a cracked plaster wall." />
        <div className="stage__layer"><Chapter chapter={first} index={0} firstHeading /></div>
      </div>
      <div className="stage__static-copy">
        {rest.map((c, i) => <Chapter key={c.title} chapter={c} index={i + 1} />)}
      </div>
    </section>
  );
}

function StaticReflection() {
  return (
    <section className="stage stage--static stage--reflection" aria-label="The studio, reflected">
      <div className="stage__still stage__still--flipped" data-header="light">
        <div className="studio"><img className="studio__poster" src={`${BASE}models/studio-poster.webp`} alt="" /></div>
        <div className="stage__layer"><Chapter chapter={REFLECTION[0]} index={0} /></div>
      </div>
      <div className="stage__static-copy">
        {REFLECTION.slice(1).map((c, i) => <Chapter key={c.title} chapter={c} index={i + 1} />)}
      </div>
    </section>
  );
}

export default function Home() {
  const reduce = useReducedMotion();
  const studio = useSharedStudio();
  const heritage = ['celadon-peony-vase', 'cobalt-crane-lidded-pot', 'oxblood-amphora-vase'];
  return (
    <>
      {reduce ? <StaticHome /> : (
        <>
          {studio.canvas}
          <Stage chapters={OPENING} id="studio" label="The studio" {...studio.opening} />
        </>
      )}

      <div className="home-sheet">
        <Collections />

        <section className="heritage" aria-labelledby="heritage-title">
          <header className="section-head section-head--narrow">
            <h2 id="heritage-title">Three glazes as old as the kiln</h2>
            <p>Celadon, cobalt and oxblood each go on as a dull powder and find their colour in the fire.</p>
          </header>
          <div className="mantel">
            {heritage.map((slug, i) => {
              const p = PIECES[slug];
              return (
                <Link to={pieceUrl(slug)} className={`mantel__piece mantel__piece--${i}`} key={slug}>
                  <Picture name={p.image} alt={p.alt} sizes="(min-width: 960px) 30vw, 80vw" />
                  <span className="mantel__name">{p.name}</span>
                  <span className="mantel__terms">Price on request</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="commission-teaser" aria-labelledby="ct-title">
          <div className="commission-teaser__text">
            <h2 id="ct-title">A piece for one room</h2>
            <p>Choose a form, a glaze and how much gold, turn it in three dimensions, and send the atelier your brief. Christie replies with drawings and fired glaze tests before anything is thrown.</p>
            <Link className="button" to="/commissions">Design a commission</Link>
          </div>
          <div className="commission-teaser__shelf">
            {['bespoke-ivory-seams', 'bespoke-rose-ribbon', 'bespoke-teal-swell'].map((slug) => (
              <Link key={slug} to={pieceUrl(slug)} className="cutout">
                <Picture name={PIECES[slug].image} alt={PIECES[slug].alt} sizes="(min-width: 960px) 16vw, 30vw" />
                <span>{PIECES[slug].name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="journal-strip" aria-labelledby="js-title">
          <header className="section-head section-head--row">
            <h2 id="js-title">From the journal</h2>
            <Link className="text-link" to="/journal">All entries</Link>
          </header>
          <ul className="journal-list">
            {JOURNAL.map((j) => (
              <li key={j.slug}>
                <Link to={`/journal/${j.slug}`}>
                  <time dateTime={j.date}>{formatDate(j.date)}</time>
                  <span className="journal-list__title">{j.title}</span>
                  <span className="journal-list__dek">{j.dek}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {reduce ? <StaticReflection /> : <Stage chapters={REFLECTION} id="reflection" label="The studio, reflected" reflection {...studio.reflection} />}
    </>
  );
}
