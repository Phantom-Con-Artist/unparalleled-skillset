import { useState } from 'react';
import { COMPANY } from '../data.js';

const TOPICS = [
  ['partnerships', 'A research partnership'],
  ['partnerships', 'Reproducing Basilisk 2 measurements'],
  ['careers', 'Working here'],
  ['press', 'Press'],
];

export default function Contact() {
  const [sent, setSent] = useState(false);
  function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const [inbox, topic] = TOPICS[Number(f.get('topic'))];
    const body = `${f.get('message')}\n\n${f.get('name')}${f.get('org') ? `, ${f.get('org')}` : ''}`;
    window.location.href = `mailto:${COMPANY.emails[inbox]}?subject=${encodeURIComponent(topic)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }
  return (
    <section className="contact" aria-labelledby="h-contact">
      <div className="contact__text">
        <p className="kicker"><span className="mono">Harlow Fen</span> Contact</p>
        <h1 id="h-contact" className="display">Write to the people who build it</h1>
        <dl className="contact__inboxes">
          <div><dt className="mono">Partnerships</dt><dd><a href={`mailto:${COMPANY.emails.partnerships}`}>{COMPANY.emails.partnerships}</a></dd></div>
          <div><dt className="mono">Careers</dt><dd><a href={`mailto:${COMPANY.emails.careers}`}>{COMPANY.emails.careers}</a></dd></div>
          <div><dt className="mono">Press</dt><dd><a href={`mailto:${COMPANY.emails.press}`}>{COMPANY.emails.press}</a></dd></div>
        </dl>
        <address>{COMPANY.address.map((l) => <span key={l}>{l}</span>)}</address>
      </div>
      <form className="form" onSubmit={submit}>
        <label>Your name<input name="name" required autoComplete="name" /></label>
        <label>Organisation <span className="form__opt">optional</span><input name="org" autoComplete="organization" /></label>
        <label>About
          <select name="topic" defaultValue="0">
            {TOPICS.map(([, t], i) => <option key={t} value={i}>{t}</option>)}
          </select>
        </label>
        <label>Message<textarea name="message" rows={6} required /></label>
        <button className="button" type="submit">Open in your email</button>
        <p className="form__note" role="status">{sent ? 'Your email program should have opened with the message filled in. If it did not, write to the address above.' : 'This opens your own email program with the message filled in; nothing is sent from this page.'}</p>
      </form>
    </section>
  );
}
