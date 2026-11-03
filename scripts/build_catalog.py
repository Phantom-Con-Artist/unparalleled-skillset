"""Build versioned project presets and preserve externally designed theme provenance."""
import hashlib
import json
from pathlib import Path
import urllib.request
from color_engine.semantic import SemanticModel
from color_engine.constraints import constrain

root = Path(__file__).resolve().parents[1]
resources = root / 'color_engine/resources'
evidence = root / 'review_runs/20261103-local-alpha/sources'
evidence.mkdir(parents=True, exist_ok=True)
model = SemanticModel()
entries = []
for term in model.terms:
    query, interpretation = model.resolve({term: 1})
    raw = model.predict_raw(query)
    for theme in ('light', 'dark'):
        result = constrain(raw, theme=theme)
        entry = {'id': 'preset-' + term.replace(' ', '-') + '-' + theme,
                 'name': term.title() + ' / ' + theme, 'tags': [term, theme],
                 'roles': result['roles'], 'context': {}, 'certificate': result['certificate'],
                 'provenance': {'kind': 'project_authored_preset', 'model': 'pat-ridge-1',
                      'descriptor': model.terms[term]['descriptor'], 'human_validated': False},
                 'original_colors': raw, 'adaptation_changes': result['changes']}
        entries.append(entry)
    print(term, len(entries), flush=True)
# Original designer theme facts, with source and license retained. Their adaptation is ours.
url = 'https://raw.githubusercontent.com/catppuccin/palette/main/palette.json'
try:
    data = urllib.request.urlopen(url, timeout=30).read()
    license_data = urllib.request.urlopen('https://raw.githubusercontent.com/catppuccin/palette/main/LICENSE', timeout=30).read()
    (evidence / 'catppuccin-palette.json').write_bytes(data)
    (resources / 'CATPPUCCIN_LICENSE.txt').write_bytes(license_data)
    palette = json.loads(data)
    for flavor in ('latte', 'frappe', 'macchiato', 'mocha'):
        source = palette[flavor]
        colors = source['colors']
        raw = [colors[name]['hex'] for name in ('base', 'surface0', 'text', 'mauve', 'teal')]
        theme = 'dark' if source['dark'] else 'light'
        result = constrain(raw, theme)
        entries.append({'id': 'source-catppuccin-' + flavor, 'name': 'Catppuccin ' + flavor,
            'tags': ['pastel', 'soft', theme], 'roles': result['roles'], 'context': {},
            'certificate': result['certificate'], 'original_colors': raw, 'adaptation_changes': result['changes'],
            'provenance': {'kind': 'source_designed_theme_adapted', 'source': url,
                'source_sha256': hashlib.sha256(data).hexdigest(), 'source_version': palette.get('version'),
                'license': 'MIT; CATPPUCCIN_LICENSE.txt', 'human_validated_tags': False,
                'note': 'Original theme designed by Catppuccin; tags and contrast adaptations authored by this project.'}})
except Exception as exc:
    raise RuntimeError('Source fetch failed; do not silently claim external provenance.') from exc
(resources / 'seed_catalog.json').write_text(json.dumps({'version': '1.0-alpha', 'palettes': entries}, indent=2) + '\n')
print(json.dumps({'palettes': len(entries), 'numerically_verified': sum(e['certificate']['status'] == 'verified_declared_usages' for e in entries), 'human_reviews': 0}))
