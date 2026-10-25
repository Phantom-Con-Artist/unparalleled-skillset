import { useId, useState } from 'react';
import { ATELIER_EMAIL } from '../data/catalog.js';

// No mailbox exists behind the specimen address, so the form composes an email in the
// visitor's own mail app and offers a copy of the text for webmail users.
export function mailto(subject, body) {
  return `mailto:${ATELIER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function EnquiryForm({ subject, intro, fields = ['message'], messageLabel = 'Your message', messagePlaceholder, submitLabel = 'Write to the atelier' }) {
  const id = useId();
  const [values, setValues] = useState({ name: '', date: '', message: '' });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const body = () => [
    values.message.trim(),
    values.date && `Preferred day: ${values.date}`,
    values.name && `\n${values.name}`,
  ].filter(Boolean).join('\n\n');

  const submit = (event) => {
    event.preventDefault();
    if (!values.message.trim()) {
      setError('Write a line or two first, so the atelier knows what you have in mind.');
      return;
    }
    setError('');
    window.location.href = mailto(subject, body());
    setStatus(`Your email app should open with this written out to ${ATELIER_EMAIL}. If nothing opened, copy it instead.`);
  };

  const copy = async () => {
    const text = `To: ${ATELIER_EMAIL}\nSubject: ${subject}\n\n${body()}`;
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copied. Paste it into a new email to the atelier.');
    } catch {
      setStatus(`Copying was blocked by the browser. The address is ${ATELIER_EMAIL}.`);
    }
  };

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <form className="enquiry" onSubmit={submit} noValidate>
      {intro && <p className="enquiry__intro">{intro}</p>}
      <div className="enquiry__field">
        <label htmlFor={`${id}-msg`}>{messageLabel}</label>
        <textarea id={`${id}-msg`} rows={4} maxLength={1200} value={values.message} onChange={set('message')} placeholder={messagePlaceholder}
          aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-err` : undefined} />
        {error && <p className="enquiry__error" id={`${id}-err`}>{error}</p>}
      </div>
      {fields.includes('date') && (
        <div className="enquiry__field">
          <label htmlFor={`${id}-date`}>A day that suits you</label>
          <input id={`${id}-date`} type="date" value={values.date} onChange={set('date')} />
        </div>
      )}
      <div className="enquiry__field">
        <label htmlFor={`${id}-name`}>Your name</label>
        <input id={`${id}-name`} type="text" autoComplete="name" maxLength={80} value={values.name} onChange={set('name')} />
      </div>
      <div className="enquiry__actions">
        <button className="button" type="submit">{submitLabel}</button>
        <button className="text-button" type="button" onClick={copy}>Copy instead</button>
      </div>
      <p className="enquiry__status" role="status">{status}</p>
    </form>
  );
}
