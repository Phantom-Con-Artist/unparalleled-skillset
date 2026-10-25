import { useState } from 'react';
import Picture from '../components/Picture.jsx';
import EnquiryForm, { mailto } from '../components/EnquiryForm.jsx';
import { ATELIER_EMAIL } from '../data/catalog.js';
import { usePageTitle } from '../lib/usePageTitle.js';

function Letters() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('That does not look like an email address yet.');
      return;
    }
    setError('');
    window.location.href = mailto('Letters from the kiln', `Please add ${email} to the letters from the kiln.`);
    setStatus('Your email app should open with the request written out. Send it and you are on the list.');
  };
  return (
    <form className="letters" onSubmit={submit} noValidate>
      <h2>Letters from the kiln</h2>
      <p>A short letter when a firing is opened, with the pieces that came through. A few times a year, never more.</p>
      <label htmlFor="letters-email">Email address</label>
      <div className="letters__row">
        <input id="letters-email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(error)} aria-describedby="letters-msg" />
        <button className="button" type="submit">Ask to be added</button>
      </div>
      <p className={error ? 'letters__error' : 'letters__status'} id="letters-msg" role="status">{error || status}</p>
    </form>
  );
}

export default function Visit() {
  usePageTitle('Visit');
  return (
    <div className="page visit">
      <header className="page-head">
        <h1>Visit the atelier</h1>
        <p>The atelier is open by appointment. Write with a day that suits you and the pieces you would like to see, and the address comes back with the confirmation.</p>
      </header>
      <div className="visit__layout">
        <figure className="visit__figure">
          <Picture name="elegancy-collection" alt="Elegancy pieces on a travertine table by sheer curtains." sizes="(min-width: 960px) 45vw, 100vw" />
        </figure>
        <EnquiryForm subject="Appointment request" fields={['message', 'date']} messageLabel="What you would like to see" messagePlaceholder="The Alexanderia amphora and anything from Ymir. Two of us." submitLabel="Ask for an appointment" />
      </div>
      <section className="visit__contact">
        <p>Or write directly</p>
        <a className="visit__address" href={`mailto:${ATELIER_EMAIL}?subject=Hello`}>{ATELIER_EMAIL}</a>
      </section>
      <Letters />
    </div>
  );
}
