"""Cross-check emitted colors, repair limits, and honest metric failures."""
import json
import random
import unittest
from unittest.mock import patch

from color_engine import ScientificColorEngine
from color_engine.spaces import (hex_to_rgb, hex_to_oklch, oklch_to_srgb_hex, delta_e_ciede2000)
from color_engine.accessibility.guidance import propose_foreground, audit_usages
from color_engine.accessibility.wcag import wcag_contrast_ratio
from color_engine.accessibility.apca import apca_contrast
from color_engine.generators import prng_mixer
from color_engine.generators.ui_system import generate_ui_design_system


class AgentEdgeCaseTests(unittest.TestCase):
    def test_srgb_round_trip(self):
        rng = random.Random(7461)
        for _ in range(256):
            color = f'#{rng.randrange(1 << 24):06X}'
            restored = oklch_to_srgb_hex(*hex_to_oklch(color))
            self.assertTrue(all(abs(a-b) <= 1 for a, b in zip(hex_to_rgb(color), hex_to_rgb(restored))), (color, restored))

    def test_impossible_shared_foreground_returns_no_proposal(self):
        self.assertIsNone(propose_foreground('#777777', ['#000000', '#FFFFFF'], min_wcag=7))

    def test_every_proposal_is_measured_on_emitted_hex(self):
        rng = random.Random(9751)
        proposals = 0
        for _ in range(32):
            fg, bg = (f'#{rng.randrange(1 << 24):06X}' for _ in range(2))
            proposal = propose_foreground(fg, [bg], min_wcag=4.5, min_apca_lc=75)
            if proposal is not None:
                proposals += 1
                rgb = hex_to_rgb(proposal['foreground'])
                ratio = wcag_contrast_ratio(rgb, hex_to_rgb(bg))
                self.assertGreaterEqual(ratio, 4.5)
                self.assertGreaterEqual(abs(apca_contrast(rgb, hex_to_rgb(bg))[0]), 75)
                self.assertEqual(ratio, proposal['wcag_contrast_ratio'])
                json.dumps(proposal, allow_nan=False)
        self.assertGreater(proposals, 0)

    def test_unassessed_typography_is_explicit(self):
        with patch('color_engine.engine.rgb_to_munsell', return_value='N/A'):
            result = ScientificColorEngine().analyze_palette(['#000000', '#FFFFFF'], usages=[{
                'role': 'small', 'foreground': '#000000', 'background': '#FFFFFF',
                'font_size_px': 10, 'font_weight': 200}])
        self.assertIsNone(result['usage_audit'][0]['passes_apca_guidance'])
        self.assertEqual(result['accessibility_summary']['apca_unassessed_text_usages'], 1)
        self.assertTrue(any(a['category'] == 'typography' for a in result['actionable_guidance_for_ai']))

    def test_large_text_and_non_text_use_correct_wcag_targets(self):
        usages = [
            {'role': 'large', 'foreground': '#777777', 'background': '#FFFFFF', 'font_size_px': 24},
            {'role': 'normal', 'foreground': '#777777', 'background': '#FFFFFF', 'font_size_px': 16},
            {'role': 'border', 'foreground': '#777777', 'background': '#FFFFFF', 'kind': 'non_text'},
        ]
        large, normal, border = audit_usages(['#777777', '#FFFFFF'], usages)
        self.assertTrue(large['passes_wcag'])
        self.assertFalse(normal['passes_wcag'])
        self.assertTrue(border['passes_wcag'])
        self.assertIsNone(border['passes_apca_guidance'])

    def test_sharma_ciede2000_reference_pair(self):
        # Sharma et al., CIEDE2000 supplementary test data, pair 1.
        self.assertAlmostEqual(delta_e_ciede2000((50, 2.6772, -79.7751), (50, 0, -82.7485)), 2.0425, places=4)

    def test_ciede2000_never_silently_becomes_cie76(self):
        with patch.dict('sys.modules', {'colour': None}):
            with self.assertRaises(RuntimeError):
                delta_e_ciede2000((50, 2.6772, -79.7751), (50, 0, -82.7485))

    def test_dataset_version_is_never_silently_substituted(self):
        with patch.dict(prng_mixer._CURATED_DATA_CACHE, {}, clear=True), patch.object(prng_mixer, 'CURATED_DATASET_V2_PATH', '/missing-color-engine-v2.json'):
            with self.assertRaises(FileNotFoundError):
                prng_mixer.mix_palette_by_token('Modern_Tech', version='v2')

    def test_theme_usage_constraints_and_border_audits(self):
        for mode in ('light_theme', 'dark_theme'):
            theme = generate_ui_design_system('#00FF00')[mode]
            for role in ('focus', 'strong'):
                for surface in theme['surfaces']:
                    audit = theme['accessibility_verification'][f'{role}_border_on_{surface}']
                    self.assertTrue(audit['passes_wcag_aa'])
                    self.assertEqual(audit['required_wcag_ratio'], 3)
            self.assertIn('Decorative', theme['usage_constraints']['borders.subtle'])
