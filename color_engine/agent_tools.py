"""Provider-neutral tool definitions for agent runtimes (JSON Schema arguments)."""
from copy import deepcopy

HEX = {'type': 'string', 'pattern': '^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$'}
USAGE = {
    'type': 'object', 'additionalProperties': False,
    'required': ['role', 'foreground', 'background'],
    'properties': {
        'role': {'type': 'string', 'minLength': 1}, 'foreground': HEX, 'background': HEX,
        'kind': {'type': 'string', 'enum': ['text', 'non_text'], 'default': 'text'},
        'font_size_px': {'type': 'number', 'exclusiveMinimum': 0, 'maximum': 1000, 'default': 16},
        'font_weight': {'type': 'number', 'minimum': 1, 'maximum': 1000, 'default': 400},
    },
}


def _tool(name, description, properties, required):
    return {'name': name, 'description': description,
            'parameters': {'type': 'object', 'additionalProperties': False,
                           'properties': properties, 'required': required}}


TOOLS = [
    _tool('analyze_palette',
          'Measure candidate colors and audit declared usages. Pass usages for verified contrast proposals. Harmony and aesthetic scores are heuristics, not quality guarantees.',
          {'hex_colors': {'type': 'array', 'items': HEX, 'minItems': 2, 'maxItems': 16},
           'usages': {'type': 'array', 'items': USAGE, 'maxItems': 256}}, ['hex_colors']),
    _tool('generate_palette', 'Generate a classical hue scheme and return its analysis.',
          {'seed_hex': HEX, 'scheme_type': {'type': 'string', 'enum': ['monochromatic', 'analogous', 'complementary',
           'split_complementary', 'triadic', 'tetradic_square', 'tetradic_rectangle', 'compound'], 'default': 'monochromatic'}}, ['seed_hex']),
    _tool('generate_tonal_ramp', 'Generate the supported 12-step functional ramp with measured contrast against step 1.',
          {'seed_hex': HEX, 'step_count': {'type': 'integer', 'const': 12, 'default': 12}}, ['seed_hex']),
    _tool('generate_ui_design_system', 'Generate light/dark tokens with audited text/surface and state pairings. Read usage_constraints before applying semantic accents or decorative borders.',
          {'seed_hex': HEX}, ['seed_hex']),
    _tool('mix_palette_by_token', 'Generate repeatable role-based palettes from weak-label aesthetic profiles. Area proportions are layout suggestions. Unknown tokens raise errors.',
          {'token': {'type': 'string', 'minLength': 1}, 'seed': {'type': ['integer', 'string'], 'default': 42},
           'palette_size': {'type': 'integer', 'minimum': 3, 'maximum': 8, 'default': 5},
           'variance': {'type': 'number', 'minimum': 0, 'maximum': 1, 'default': .12},
           'version': {'type': 'string', 'enum': ['v1', 'v2'], 'default': 'v2'},
           'theme': {'type': 'string', 'enum': ['auto', 'light', 'dark'], 'default': 'auto'}}, ['token']),
]


def get_tool_definitions():
    """Return a fresh provider-neutral schema list; callers can wrap it for their SDK."""
    return deepcopy(TOOLS)
