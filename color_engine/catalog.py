"""Local, additive SQLite catalog. Review attestations are not authenticated identities."""
from datetime import datetime, timezone
from importlib.resources import files
from pathlib import Path
import hashlib
import json
import os
import sqlite3
import threading
import uuid
from .constraints import ROLE_NAMES, certify


def default_db_path():
    configured = os.environ.get('COLOR_INTELLIGENCE_DB')
    if configured:
        return Path(configured).expanduser()
    root = Path(os.environ.get('XDG_DATA_HOME', Path.home() / '.local/share'))
    return root / 'color-intelligence/catalog.sqlite3'


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


class Catalog:
    def __init__(self, path=None):
        self.path = str(path if path is not None else default_db_path())
        if self.path != ':memory:':
            Path(self.path).parent.mkdir(parents=True, exist_ok=True)
        self.lock = threading.RLock()
        self.db = sqlite3.connect(self.path, check_same_thread=False, timeout=10)
        self.db.row_factory = sqlite3.Row
        self.db.execute('PRAGMA foreign_keys=ON')
        self.db.execute('PRAGMA journal_mode=WAL')
        self.db.executescript('''
            CREATE TABLE IF NOT EXISTS palettes(id TEXT PRIMARY KEY, content TEXT NOT NULL, hash TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS reviews(
                sequence INTEGER PRIMARY KEY AUTOINCREMENT, palette_id TEXT NOT NULL REFERENCES palettes(id),
                reviewer TEXT NOT NULL, actor TEXT NOT NULL, decision TEXT NOT NULL, notes TEXT NOT NULL,
                created_at TEXT NOT NULL, palette_hash TEXT NOT NULL);
            CREATE TRIGGER IF NOT EXISTS reviews_no_update BEFORE UPDATE ON reviews
                BEGIN SELECT RAISE(ABORT, 'reviews are append-only'); END;
            CREATE TRIGGER IF NOT EXISTS reviews_no_delete BEFORE DELETE ON reviews
                BEGIN SELECT RAISE(ABORT, 'reviews are append-only'); END;
            PRAGMA user_version=1;
        ''')
        resource = files('color_engine').joinpath('resources/seed_catalog.json')
        seeds = json.loads(resource.read_text())['palettes']
        with self.db:
            for entry in seeds:
                self.db.execute('INSERT OR IGNORE INTO palettes VALUES(?,?,?)',
                    (entry['id'], json.dumps(entry, allow_nan=False), digest(entry)))

    def close(self):
        with self.lock:
            self.db.close()

    def get(self, palette_id):
        with self.lock:
            row = self.db.execute('SELECT * FROM palettes WHERE id=?', (palette_id,)).fetchone()
            if row is None:
                raise ValueError('Unknown palette ID.')
            entry = json.loads(row['content'])
            if digest(entry) != row['hash']:
                raise ValueError('Palette integrity check failed.')
            reviews = [dict(r) for r in self.db.execute('SELECT * FROM reviews WHERE palette_id=? ORDER BY sequence', (palette_id,))]
        latest = {}
        for review in reviews:
            if review['actor'] == 'human' and review['palette_hash'] == row['hash']:
                latest[review['reviewer']] = review['decision']
        approvals = sum(v == 'approve' for v in latest.values())
        rejections = sum(v == 'reject' for v in latest.values())
        entry['reviews'] = reviews
        entry['aesthetic_verification'] = {
            'status': 'client_attested_human_reviewed' if approvals >= 2 and not rejections else 'provisional',
            'distinct_human_approvals': approvals, 'distinct_human_rejections': rejections,
            'policy': 'At least two distinct client-attested human reviewers, no outstanding human rejection, same immutable palette and tags.',
            'identity_authenticated': False, 'scope': 'This palette and its supplied tags; not universal aesthetic validity.'}
        return entry

    def search(self, query='', tags=None, human_reviewed=False, limit=20):
        if not isinstance(query, str) or len(query) > 200 or not 1 <= limit <= 100:
            raise ValueError('query is limited to 200 characters; limit must be 1–100.')
        tags = tags or []
        if len(tags) > 64 or any(not isinstance(t, str) or len(t) > 100 for t in tags):
            raise ValueError('Provide up to 64 tags of at most 100 characters.')
        with self.lock:
            rows = self.db.execute('SELECT id,content FROM palettes ORDER BY id').fetchall()
        found = []
        for row in rows:
            raw = json.loads(row['content'])
            haystack = ' '.join([raw['name'], *raw['tags']]).casefold()
            if query.casefold() not in haystack or not set(tags) <= set(raw['tags']):
                continue
            entry = self.get(row['id'])
            if human_reviewed and entry['aesthetic_verification']['status'] != 'client_attested_human_reviewed':
                continue
            found.append({key: entry[key] for key in ('id', 'name', 'tags', 'roles', 'provenance', 'aesthetic_verification')}
                         | {'numerical_status': entry['certificate']['status']})
            if len(found) >= limit:
                break
        return found

    def save(self, name, roles, tags, provenance, context=None):
        if not isinstance(name, str) or not 1 <= len(name.strip()) <= 200:
            raise ValueError('Palette name must contain 1–200 characters.')
        if not isinstance(tags, list) or len(tags) > 64 or any(not isinstance(t, str) or not 1 <= len(t) <= 100 for t in tags):
            raise ValueError('Provide up to 64 non-empty tags of at most 100 characters.')
        if set(roles) != set(ROLE_NAMES):
            raise ValueError('Supply all six named roles.')
        context = context or {}
        if set(context) - {'font_size_px', 'font_weight', 'level', 'apca'}:
            raise ValueError('Unknown certificate context field.')
        certificate = certify(roles, **context)
        from .accessibility.guidance import canonical_hex
        entry = {'id': 'user-' + uuid.uuid4().hex, 'name': name.strip(),
                 'roles': {k: canonical_hex(v) for k, v in roles.items()}, 'tags': tags,
                 'provenance': provenance, 'context': context,
                 'certificate': certificate, 'created_at': datetime.now(timezone.utc).isoformat()}
        with self.lock, self.db:
            self.db.execute('INSERT INTO palettes VALUES(?,?,?)', (entry['id'], json.dumps(entry, allow_nan=False), digest(entry)))
        return self.get(entry['id'])

    def review(self, palette_id, reviewer, actor, decision, notes):
        if actor not in ('human', 'agent') or decision not in ('approve', 'reject'):
            raise ValueError('actor must be human/agent; decision must be approve/reject.')
        if not isinstance(reviewer, str) or not 1 <= len(reviewer.strip()) <= 200 or not isinstance(notes, str) or not 1 <= len(notes.strip()) <= 4000:
            raise ValueError('Reviewer identity and evidence notes are required, bounded to 200/4000 characters.')
        self.get(palette_id)
        with self.lock, self.db:
            content_hash = self.db.execute('SELECT hash FROM palettes WHERE id=?', (palette_id,)).fetchone()[0]
            self.db.execute('INSERT INTO reviews(palette_id,reviewer,actor,decision,notes,created_at,palette_hash) VALUES(?,?,?,?,?,?,?)',
                (palette_id, reviewer.strip().casefold(), actor, decision, notes.strip(), datetime.now(timezone.utc).isoformat(), content_hash))
        return self.get(palette_id)

    def stats(self):
        with self.lock:
            count = self.db.execute('SELECT count(*) FROM palettes').fetchone()[0]
            reviews = self.db.execute('SELECT count(*) FROM reviews').fetchone()[0]
        return {'palettes': count, 'review_events': reviews, 'storage': 'local SQLite', 'schema_version': 1,
                'review_identity': 'client attestation; not authenticated', 'network_required': False}
