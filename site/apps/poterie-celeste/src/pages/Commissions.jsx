import { lazy, Suspense, useId, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import Picture from '../components/Picture.jsx';
import { mailto } from '../components/EnquiryForm.jsx';
import { ATELIER_EMAIL, PIECES } from '../data/catalog.js';
import { FORMS, GLAZES, GOLD, HEIGHTS } from '../stage/vessels.js';
import { usePageTitle } from '../lib/usePageTitle.js';

const Configurator = lazy(() => import('../stage/Configurator.jsx'));

function Choice({ legend, name, options, value, onChange, swatches }) {
  return (
    <fieldset className={`choice ${swatches ? 'choice--swatches' : ''}`}>
      <legend>{legend}</legend>
      <div className="choice__options">
        {Object.entries(options).map(([key, opt]) => {
          const label = typeof opt === 'string' ? opt : Array.isArray(opt) ? opt[0] : opt.label;
          return (
            <label key={key} style={swatches ? { '--swatch': opt.color } : undefined}>
              <input type="radio" name={name} value={key} checked={value === key} onChange={() => onChange(key)} />
              <span>{label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function Commissions() {
  usePageTitle('Commissions');
  const id = useId();
  const reduce = useReducedMotion();
  const [form, setForm] = useState('amphora');
  const [glaze, setGlaze] = useState('oxblood');
  const [gold, setGold] = useState('lip');
  const [height, setHeight] = useState('console');
  const [room, setRoom] = useState('');
  const [name, setName] = useState('');
  const [fireAt, setFireAt] = useState(null);
  const [status, setStatus] = useState('');
  const turn = useRef(null);

  const reset = (fn) => (v) => { fn(v); setFireAt(null); };

  const summary = useMemo(() => {
    const goldText = gold === 'none' ? 'no gold' : gold === 'lip' ? 'a gold lip' : 'gilt bands';
    return `${FORMS[form].label} in ${GLAZES[glaze].label.toLowerCase()}, with ${goldText}. ${HEIGHTS[height][0]}.`;
  }, [form, glaze, gold, height]);

  const body = () => [
    `Form, glaze and gold: ${summary}`,
    room.trim() && `Where it will live: ${room.trim()}`,
    name.trim() && `\n${name.trim()}`,
  ].filter(Boolean).join('\n\n');

  const send = (e) => {
    e.preventDefault();
    window.location.href = mailto(`Commission brief: ${FORMS[form].label} in ${GLAZES[glaze].label}`, body());
    setStatus(`Your email app should open with the brief written out to ${ATELIER_EMAIL}.`);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`To: ${ATELIER_EMAIL}\nSubject: Commission brief\n\n${body()}`);
      setStatus('Brief copied. Paste it into a new email to the atelier.');
    } catch {
      setStatus(`Copying was blocked by the browser. The address is ${ATELIER_EMAIL}.`);
    }
  };
  const fire = () => {
    setFireAt(reduce ? performance.now() - 5000 : performance.now());
    setStatus('');
  };

  return (
    <div className="page commissions">
      <header className="page-head page-head--wide">
        <h1>Commission a piece</h1>
        <p>A commission starts with the room it is going to live in. Shape it here, fire the preview, and send the brief. Christie replies with drawings and fired glaze tests before anything goes on the wheel, and nothing is made until you have held the colour in your hand.</p>
      </header>

      <form className="desk" onSubmit={send} noValidate>
        <div className="desk__stage">
          <div className="desk__canvas" role="img" aria-label={`Preview: ${summary} ${fireAt ? 'Fired.' : 'Unfired, the glaze still powder.'}`}>
            <Suspense fallback={<p className="desk__loading">Setting up the wheel</p>}>
              <Configurator form={form} glaze={glaze} gold={gold} height={height} fireAt={fireAt} turnRef={turn} />
            </Suspense>
          </div>
          <div className="desk__stage-controls">
            <button type="button" className="text-button" onClick={() => turn.current?.(-1)}>Turn left</button>
            <p className="desk__state" aria-live="polite">{fireAt ? 'Fired. This is roughly the colour that comes out of the kiln.' : 'Unfired. The glaze is still a dull powder.'}</p>
            <button type="button" className="text-button" onClick={() => turn.current?.(1)}>Turn right</button>
          </div>
          <button type="button" className="button button--fire" onClick={fire}>{fireAt ? 'Fire it again' : 'Fire the preview'}</button>
        </div>

        <div className="desk__choices">
          <Choice legend="Form" name="form" options={FORMS} value={form} onChange={reset(setForm)} />
          <Choice legend="Glaze" name="glaze" options={GLAZES} value={glaze} onChange={reset(setGlaze)} swatches />
          <Choice legend="Gold" name="gold" options={GOLD} value={gold} onChange={reset(setGold)} />
          <Choice legend="Height" name="height" options={HEIGHTS} value={height} onChange={setHeight} />
          <div className="enquiry__field">
            <label htmlFor={`${id}-room`}>Where will it live?</label>
            <textarea id={`${id}-room`} rows={3} maxLength={600} value={room} onChange={(e) => setRoom(e.target.value)}
              placeholder="A north-facing hall with limed oak panelling, on a console between two windows." />
          </div>
          <div className="enquiry__field">
            <label htmlFor={`${id}-name`}>Your name</label>
            <input id={`${id}-name`} type="text" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="brief">
            <h2>Your brief</h2>
            <p className="brief__summary">{summary}</p>
            <div className="enquiry__actions">
              <button className="button" type="submit">Write to the atelier</button>
              <button className="text-button" type="button" onClick={copy}>Copy the brief</button>
            </div>
            <p className="enquiry__status" role="status">{status || `This opens your email app with the brief addressed to ${ATELIER_EMAIL}.`}</p>
          </div>
        </div>
      </form>

      <section className="past" aria-labelledby="past-title">
        <h2 id="past-title">Recent commissions</h2>
        <ul>
          {['bespoke-ivory-seams', 'bespoke-rose-ribbon', 'bespoke-teal-swell'].map((slug) => (
            <li key={slug}>
              <Picture name={PIECES[slug].image} alt={PIECES[slug].alt} sizes="(min-width: 960px) 22vw, 60vw" />
              <h3>{PIECES[slug].name}</h3>
              <p>{PIECES[slug].summary}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
