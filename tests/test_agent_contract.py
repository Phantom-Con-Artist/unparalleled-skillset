"""Regression contract for agent-facing color analysis (stdlib unittest)."""
import importlib
import json
import math
import unittest
from pathlib import Path
from unittest.mock import patch

from color_engine import ScientificColorEngine, hex_to_rgb, hex_to_oklch, wcag_contrast_ratio
from color_engine.harmony.matsuda import fit_best_matsuda_template
from color_engine.harmony.ou_luo import ou_luo_two_color_harmony
from color_engine.generators.ui_system import generate_ui_design_system
from color_engine.generators.prng_mixer import mix_palette_by_token
from color_engine.generators.ramp import generate_tonal_ramp


class AgentContractTests(unittest.TestCase):
    def setUp(self):
        # Munsell renotation is unrelated to these contracts; the original suite
        # exercises the complete unmocked analysis separately.
        self.munsell = patch('color_engine.engine.rgb_to_munsell', return_value='N/A')
        self.munsell.start()
        self.addCleanup(self.munsell.stop)
        self.engine = ScientificColorEngine()

    def test_neutral_palette_analysis(self):
        for palette in [['#000000', '#FFFFFF'], ['#777777', '#777777']]:
            with self.subTest(palette=palette):
                result = self.engine.analyze_palette(palette)
                self.assertEqual(result['summary']['best_matsuda_scheme']['template'], 'Type_N_Neutral')
                json.dumps(result, allow_nan=False)

    def test_template_schema_is_stable(self):
        neutral = fit_best_matsuda_template([0, 0], [0, 0])
        chromatic = fit_best_matsuda_template([30, 210], [.1, .1])
        self.assertEqual(set(neutral), set(chromatic))
        self.assertEqual(type(neutral['template_rankings']), type(chromatic['template_rankings']))

    def test_ou_luo_reference_fixtures(self):
        fixtures = json.loads((Path(__file__).parent / 'fixtures/ou_luo_2006.json').read_text())
        for case in fixtures['cases']:
            with self.subTest(name=case['name']):
                actual = ou_luo_two_color_harmony(tuple(case['first']), tuple(case['second']))
                for key, expected in case['expected'].items():
                    self.assertAlmostEqual(actual[key], expected, delta=.00051)
                self.assertEqual(actual, ou_luo_two_color_harmony(tuple(case['second']), tuple(case['first'])))

    def test_mixed_contrast_failure_is_reported(self):
        result = self.engine.analyze_palette(['#000000', '#FFFFFF', '#7777FF'])
        self.assertTrue(any(a.get('category') == 'contrast' for a in result['actionable_guidance_for_ai']))
        self.assertEqual(result['accessibility_summary']['scope'], 'candidate_pairs')

    def test_role_aware_repair_is_verified(self):
        result = self.engine.analyze_palette(
            ['#000000', '#FFFFFF', '#AAAAAA'],
            usages=[{'role': 'caption', 'foreground': '#AAAAAA', 'background': '#FFFFFF',
                     'kind': 'text', 'font_size_px': 16, 'font_weight': 400}])
        self.assertEqual(len(result['usage_audit']), 1)
        self.assertFalse(result['usage_audit'][0]['passes_wcag'])
        fix = next(a for a in result['actionable_guidance_for_ai'] if a.get('role') == 'caption')
        proposal = fix['proposal']
        self.assertTrue(proposal['verified'])
        ratio = wcag_contrast_ratio(hex_to_rgb(proposal['foreground']), hex_to_rgb('#FFFFFF'))
        self.assertGreaterEqual(ratio, 4.5)
        self.assertAlmostEqual(proposal['wcag_contrast_ratio'], ratio, delta=.00001)
        replay = self.engine.analyze_palette([proposal['foreground'], '#FFFFFF'], usages=[{
            'role': 'caption', 'foreground': proposal['foreground'], 'background': '#FFFFFF',
            'kind': 'text', 'font_size_px': 16, 'font_weight': 400}])
        self.assertTrue(replay['usage_audit'][0]['passes_wcag'])
        self.assertTrue(replay['usage_audit'][0]['passes_apca_guidance'])

    def test_unused_candidate_failures_do_not_become_role_errors(self):
        result = self.engine.analyze_palette(['#000000', '#FFFFFF', '#AAAAAA'], usages=[{
            'role': 'body', 'foreground': '#000000', 'background': '#FFFFFF',
            'kind': 'text', 'font_size_px': 16, 'font_weight': 400}])
        self.assertFalse(any(a.get('category') == 'contrast' for a in result['actionable_guidance_for_ai']))
        self.assertEqual(result['accessibility_summary']['scope'], 'declared_usages')

    def test_invalid_usage_is_rejected(self):
        for usage in [
            {'role': 'x', 'foreground': '#123456', 'background': '#FFFFFF'},
            {'role': 'x', 'foreground': '#000000', 'background': '#FFFFFF', 'font_size_px': -1},
            {'role': 'x', 'foreground': '#000000', 'background': '#FFFFFF', 'font_weight': 0},
            {'role': 'x', 'foreground': '#000000', 'background': '#FFFFFF', 'kind': 'unknown'},
        ]:
            with self.subTest(usage=usage), self.assertRaises(ValueError):
                self.engine.analyze_palette(['#000000', '#FFFFFF'], usages=[usage])

    def test_metadata_distinguishes_measurements_and_preferences(self):
        result = self.engine.analyze_palette(['#000000', '#2563EB', '#FFFFFF'])
        self.assertEqual(result['methods']['aesthetic_classification']['method'], 'heuristic_rules')
        self.assertFalse(result['methods']['aesthetic_classification']['calibrated'])
        for token in result['aesthetic_tokens'].values():
            self.assertIn('score', token)
            self.assertEqual(token['score'], token['confidence'])  # deprecated alias
        self.assertIn('schema_version', result)
        self.assertTrue(result['limitations'])

    def test_all_theme_text_pairings_pass_normal_text_contrast(self):
        for seed in ['#2563EB', '#00FF00', '#FF0000', '#000000', '#FFFFFF', '#FFFF00', '#00FFFF']:
            ui = generate_ui_design_system(seed)
            for name in ['light_theme', 'dark_theme']:
                theme = ui[name]
                for role, fg in theme['typography'].items():
                    for surface, bg in theme['surfaces'].items():
                        with self.subTest(seed=seed, theme=name, role=role, surface=surface):
                            self.assertGreaterEqual(wcag_contrast_ratio(hex_to_rgb(fg), hex_to_rgb(bg)), 4.5)
                            self.assertIn(f'{role}_text_on_{surface}', theme['accessibility_verification'])
                self.assertIn('button_text_on_brand_hover', theme['accessibility_verification'])
                for key in ['button_text_on_brand', 'button_text_on_brand_hover']:
                    self.assertTrue(theme['accessibility_verification'][key]['passes_wcag_aa'])

    def test_apca_guidance_contains_weight_and_size(self):
        apca = importlib.import_module('color_engine.accessibility.apca')
        guide = apca.apca_font_guidance(75)
        self.assertIn({'font_size_px': 18, 'font_weight': 400}, guide['body_text_options'])
        self.assertIn({'font_size_px': 16, 'font_weight': 500}, guide['body_text_options'])
        self.assertNotIn({'font_size_px': 16, 'font_weight': 400}, guide['body_text_options'])
        self.assertEqual(apca.apca_font_guidance(-75), guide)
        self.assertEqual(apca.apca_font_guidance(60)['body_text_options'], [])

    def test_palette_size_contract(self):
        for n in range(3, 9):
            with self.subTest(size=n):
                result = mix_palette_by_token('Modern_Tech', seed=42, palette_size=n)
                self.assertEqual(len(result['palette_hex']), n)
                self.assertIn('high_contrast_text', [c['role'] for c in result['palette_mix']])
                self.assertAlmostEqual(sum(c['area_ratio'] for c in result['palette_mix']), 1, places=6)

    def test_invalid_mixer_arguments_are_rejected(self):
        for kwargs in [{'token': 'typo_unrecognized'}, {'token': ''}, {'token': 'Modern_Tech', 'version': 'v3'},
                       {'token': 'Modern_Tech', 'palette_size': 0}, {'token': 'Modern_Tech', 'palette_size': 9},
                       {'token': 'Modern_Tech', 'palette_size': True}, {'token': 'Modern_Tech', 'variance': -1},
                       {'token': 'Modern_Tech', 'variance': float('nan')}]:
            with self.subTest(kwargs=kwargs), self.assertRaises(ValueError):
                mix_palette_by_token(**kwargs)

    def test_mixer_determinism_and_actual_coordinates(self):
        a = mix_palette_by_token('modern tech', seed='agent-test', palette_size=8)
        b = mix_palette_by_token('Modern_Tech', seed='agent-test', palette_size=8)
        self.assertEqual(a, b)
        for color in a['palette_mix']:
            actual = hex_to_oklch(color['hex'])
            self.assertAlmostEqual(actual[0], color['oklch']['L'], delta=.0001)
            self.assertAlmostEqual(actual[1], color['oklch']['C'], delta=.0001)
        self.assertEqual(a['area_balance']['method'], 'role_chroma_heuristic')

    def test_ramp_rejects_unsupported_counts(self):
        for n in [0, 5, 24, True, 12.0]:
            with self.subTest(count=n), self.assertRaises(ValueError):
                generate_tonal_ramp('#2563EB', step_count=n)

    def test_palette_inputs_are_validated_and_canonical(self):
        for palette in [[], ['#FFFFFF'], ['#000000'] * 17, '#ffffff', ['##123456', '#FFFFFF']]:
            with self.subTest(palette=palette), self.assertRaises(ValueError):
                self.engine.analyze_palette(palette)
        result = self.engine.analyze_palette(['fff', '#00f'])
        self.assertEqual([c['hex'] for c in result['colors']], ['#FFFFFF', '#0000FF'])

    def test_wcag_and_apca_reference_extremes(self):
        from color_engine.accessibility.apca import apca_contrast
        self.assertAlmostEqual(wcag_contrast_ratio((0, 0, 0), (255, 255, 255)), 21)
        self.assertAlmostEqual(apca_contrast((0, 0, 0), (255, 255, 255))[0], 106.04, places=2)
        self.assertAlmostEqual(apca_contrast((255, 255, 255), (0, 0, 0))[0], -107.88, places=2)
        self.assertEqual(apca_contrast((128, 128, 128), (128, 128, 128))[0], 0)

    def test_older_python_annotation_resolution(self):
        # Python 3.14 defers annotations; get_type_hints also detects unresolved
        # names that would fail at import on Python 3.11-3.13.
        from typing import get_type_hints
        self.assertIn('seed', get_type_hints(ScientificColorEngine.mix_palette_by_token))


if __name__ == '__main__':
    unittest.main()
