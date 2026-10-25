import { Link, useParams } from 'react-router-dom';
import Picture from '../components/Picture.jsx';
import { JOURNAL } from '../data/catalog.js';
import { formatDate } from '../lib/format.js';
import NotFound from './NotFound.jsx';
import { usePageTitle } from '../lib/usePageTitle.js';

export function JournalIndex() {
  usePageTitle('Journal');
  const [lead, ...rest] = [...JOURNAL].reverse();
  return (
    <div className="page journal">
      <header className="page-head">
        <h1>Journal</h1>
        <p>Notes from the wheel and the kiln door: what came through a firing, and why a piece looks the way it does.</p>
      </header>
      <article className="journal__lead">
        <Link to={`/journal/${lead.slug}`}>
          <Picture name={lead.image} alt={lead.alt} sizes="(min-width: 960px) 55vw, 100vw" />
          <div>
            <time dateTime={lead.date}>{formatDate(lead.date)}</time>
            <h2>{lead.title}</h2>
            <p>{lead.dek}</p>
          </div>
        </Link>
      </article>
      <ul className="journal-list journal-list--page">
        {rest.map((j) => (
          <li key={j.slug}>
            <Link to={`/journal/${j.slug}`}>
              <time dateTime={j.date}>{formatDate(j.date)}</time>
              <span className="journal-list__title">{j.title}</span>
              <span className="journal-list__dek">{j.dek}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function JournalPost() {
  const { slug } = useParams();
  const post = JOURNAL.find((j) => j.slug === slug);
  usePageTitle(post?.title);
  if (!post) return <NotFound />;
  const i = JOURNAL.indexOf(post);
  const other = JOURNAL[(i + 1) % JOURNAL.length];
  return (
    <article className="page post">
      <header className="post__head">
        <p className="post__crumb"><Link to="/journal">Journal</Link> · <time dateTime={post.date}>{formatDate(post.date)}</time></p>
        <h1>{post.title}</h1>
        <p className="post__dek">{post.dek}</p>
      </header>
      <figure className="post__figure">
        <Picture name={post.image} alt={post.alt} eager sizes="(min-width: 960px) 70vw, 100vw" />
      </figure>
      <div className="post__body">
        {post.body.map((p) => <p key={p.slice(0, 30)}>{p}</p>)}
        <p className="post__sign">Christie Wallace</p>
      </div>
      <nav className="post__next" aria-label="Next entry">
        <Link to={`/journal/${other.slug}`}><span>Next entry</span><strong>{other.title}</strong></Link>
      </nav>
    </article>
  );
}
