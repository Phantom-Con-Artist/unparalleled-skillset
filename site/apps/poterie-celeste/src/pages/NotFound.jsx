import { Link } from 'react-router-dom';
import { usePageTitle } from '../lib/usePageTitle.js';

export default function NotFound() {
  usePageTitle('Not found');
  return (
    <div className="page not-found">
      <h1>This room is empty.</h1>
      <p>The page you were looking for is not here. It may have moved, or the piece may have gone to its home.</p>
      <Link className="button" to="/collections">Walk the collections</Link>
    </div>
  );
}
