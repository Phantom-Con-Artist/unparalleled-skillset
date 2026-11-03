"""Agent-facing local application service, independent of MCP transport."""
import math
from .semantic import SemanticModel
from .catalog import Catalog
from .constraints import constrain
from .accessibility.guidance import canonical_hex, audit_usages


class ColorIntelligenceLayer:
    def __init__(self, db_path=None):
        self.model = SemanticModel()
        self.catalog = Catalog(db_path)

    def close(self):
        self.catalog.close()

    def capabilities(self):
        return {'version': '0.2.0a1', 'transport': 'local stdio', 'model': {k: v for k, v in self.model.manifest.items() if k not in ('vocabulary', 'stop_words')},
                'vocabulary': {'canonical_terms': len(self.model.terms), 'alias_entries': sum(len(t['aliases']) for t in self.model.terms.values()), 'recognized_names': len(self.model.aliases)},
                'catalog': self.catalog.stats(), 'network_required': False,
                'verification': 'Opaque sRGB role-pair contrast only; aesthetic scores are uncalibrated.'}

    def vocabulary(self, query=''):
        if len(query) > 200:
            raise ValueError('Vocabulary query is limited to 200 characters.')
        return {'version': self.model.ontology['version'], 'terms': [row for row in self.model.terms.values()
                if query.casefold() in ' '.join([row['term'], *row['aliases']]).casefold()]}

    def generate(self, tokens=None, brief=None, theme='dark', font_size_px=16, font_weight=400,
                 level='AA', apca=True, locked_roles=None, allow_background_adjustments=True):
        query, interpretation = self.model.resolve(tokens, brief)
        raw = self.model.predict_raw(query)
        result = constrain(raw, theme, font_size_px, font_weight, level, apca, locked_roles, allow_background_adjustments)
        embedding = query @ self.model.arrays['components'].T
        norm = math.sqrt(float(embedding @ embedding))
        palette_embedding = self.model.embedding(list(result['roles'].values())[:5])
        score = float(embedding @ palette_embedding / max(norm, 1e-15))
        return {'schema_version': '1.0-alpha', 'status': result['certificate']['status'], **result,
                'interpretation': interpretation, 'raw_model_palette': raw, 'theme': theme,
                'semantic_match': {'similarity': score, 'range': [-1, 1], 'calibrated': False,
                    'method': 'cosine(linear inverse palette embedding, weighted descriptor SVD)',
                    'meaning': 'Experimental relative affinity; not probability, beauty or human agreement.'},
                'provenance': {'model': self.model.manifest['version'], 'vocabulary': self.model.ontology['version'],
                    'aesthetic_status': 'provisional_project_authored_mapping'},
                'css': self.css(result['roles'])}

    def analyze(self, colors, usages=None, detailed=False):
        if not isinstance(colors, list) or not 2 <= len(colors) <= 16:
            raise ValueError('Provide 2–16 colors.')
        colors = [canonical_hex(c) for c in colors]
        result = {'schema_version': '1.0-alpha', 'colors': colors, 'semantics': self.model.analyze(colors),
                  'usage_audits': audit_usages(colors, usages or []),
                  'accessibility_status': 'declared_usages_only' if usages else 'no_usages_declared'}
        if detailed:
            from .engine import ScientificColorEngine
            result['scientific_analysis'] = ScientificColorEngine().analyze_palette(colors, usages=usages)
        return result

    @staticmethod
    def css(roles):
        return ':root {\n' + '\n'.join(f'  --color-{name.replace("_", "-")}: {value};' for name, value in roles.items()) + '\n}'

    def export(self, palette_id, format='json'):
        entry = self.catalog.get(palette_id)
        if format == 'json':
            return entry
        if format == 'css':
            return {'palette_id': palette_id, 'css': self.css(entry['roles']), 'certificate': entry['certificate']}
        raise ValueError('format must be json or css.')
