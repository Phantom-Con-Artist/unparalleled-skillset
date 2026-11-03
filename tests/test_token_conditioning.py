"""Research prototype invariants; no training on external data in unit tests."""
import unittest
import numpy as np

from color_engine.spaces import rgb_to_oklab, hex_to_rgb
from color_engine.accessibility.wcag import wcag_contrast_ratio
from research.token_conditioning.model import (TokenSpace, palette_features, matching_distance,
                                               rgb_to_lab_batch, caption_retrieve, constrain_palette)


class TokenConditioningTests(unittest.TestCase):
    def setUp(self):
        self.texts = ['calm blue', 'calm soft blue', 'bold neon pink', 'bold neon green', 'soft pastel blue', 'soft pastel pink']
        self.space = TokenSpace(self.texts, dimensions=3)

    def test_zero_propagation_matches_direct_retrieval(self):
        q = self.space.transform(['calm blue', 'bold neon'])
        indices, scores = caption_retrieve(self.space, q, alpha=0)
        direct = (q @ self.space.captions.T).toarray()
        np.testing.assert_array_equal(indices, direct.argmax(axis=1))
        np.testing.assert_allclose(scores, direct.max(axis=1))

    def test_graph_propagation_is_bounded_and_finite(self):
        q = self.space.transform(['calm', 'unseenword'])
        diffused = self.space.diffuse(q, .6)
        self.assertTrue(np.isfinite(diffused).all())
        self.assertTrue(np.all(diffused >= 0))
        self.assertEqual(np.count_nonzero(diffused[1]), 0)
        np.testing.assert_allclose(self.space.graph.sum(axis=1), 1)

    def test_unknown_tokens_are_not_invented(self):
        q, coverage = self.space.weighted_request({'cyberpunk': .8, 'maximalism': .2})
        self.assertIsNone(q)
        self.assertEqual(coverage['status'], 'unsupported')
        q, coverage = self.space.weighted_request({'neon': .8, 'cyberpunk': .2})
        self.assertEqual(coverage['status'], 'partial')
        self.assertEqual(q.shape[0], 1)

    def test_invalid_weights_are_rejected(self):
        for weights in [{}, {'calm': -1}, {'calm': float('nan')}, {'calm': True}, {42: .5}]:
            with self.subTest(weights=weights), self.assertRaises(ValueError):
                self.space.weighted_request(weights)

    def test_palette_features_ignore_storage_order(self):
        palette = np.array([[[0, 0, 0], [255, 255, 255], [0, 0, 255], [255, 0, 0], [0, 255, 0]]])
        shuffled = palette[:, [4, 2, 0, 3, 1]]
        np.testing.assert_allclose(palette_features(palette), palette_features(shuffled))
        np.testing.assert_allclose(matching_distance(palette, shuffled), 0, atol=1e-12)

    def test_vectorized_coordinates_match_engine(self):
        rng = np.random.default_rng(53)
        rgb = rng.integers(0, 256, size=(5, 5, 3))
        expected = np.array([[rgb_to_oklab(tuple(c)) for c in row] for row in rgb])
        np.testing.assert_allclose(rgb_to_lab_batch(rgb), expected, atol=1e-12)

    def test_constraints_use_actual_emitted_colors(self):
        palette = np.array([[190, 190, 200], [210, 200, 210], [220, 210, 230], [130, 140, 150], [140, 120, 130]])
        for theme in ('light', 'dark'):
            result = constrain_palette(palette, theme)
            self.assertEqual(result['status'], 'verified_declared_usages')
            for audit in result['audits']:
                ratio = wcag_contrast_ratio(hex_to_rgb(audit['foreground']), hex_to_rgb(audit['background']))
                self.assertGreaterEqual(ratio, audit['required_wcag'])
                self.assertEqual(ratio, audit['wcag_contrast_ratio'])
            self.assertTrue(result['changes'])


class PrototypeContractTests(unittest.TestCase):
    def test_background_changes_are_explicit_and_failures_are_retained(self):
        from research.token_conditioning.constraints import constrain_with_background_fallback
        palette = [[255, 0, 255], [255, 150, 255], [240, 200, 245], [150, 50, 200], [0, 0, 0]]
        fixed = constrain_with_background_fallback(palette, 'light', False)
        self.assertEqual(fixed['status'], 'infeasible')
        self.assertFalse(fixed['background_fallback_used'])
        self.assertTrue(any(not a['passes'] for a in fixed['audits']))
        adjusted = constrain_with_background_fallback(palette, 'light', True)
        self.assertEqual(adjusted['status'], 'verified_declared_usages')
        self.assertTrue(adjusted['background_fallback_used'])
        self.assertTrue(all(a['passes'] for a in adjusted['audits']))
        self.assertEqual(adjusted['audits'][0]['required_apca_lc'], 90)

    def test_unsupported_blend_does_not_call_a_model(self):
        from research.token_conditioning.prototype import generate_from_tokens
        space = TokenSpace(['calm blue', 'calm soft blue', 'bold neon', 'bold neon green'], dimensions=2)
        result = generate_from_tokens({'space': space}, {'neon': .7, 'cyberpunk': .3})
        self.assertEqual(result['status'], 'unsupported_tokens')
        self.assertEqual(result['candidates'], [])
        self.assertIsNone(result['aesthetic_confidence'])

    def test_all_zero_blends_are_rejected(self):
        from research.token_conditioning.prototype import generate_from_tokens
        space = TokenSpace(['calm blue', 'calm soft blue', 'bold neon', 'bold neon green'], dimensions=2)
        with self.assertRaises(ValueError):
            generate_from_tokens({'space': space}, {'neon': 0})

    def test_generated_candidates_carry_independent_audits(self):
        from research.token_conditioning.prototype import generate_from_tokens
        class Constant:
            def __init__(self, value): self.value = np.asarray(value)
            def predict(self, X): return np.repeat(self.value[None], len(X), axis=0)
        space = TokenSpace(['calm blue', 'calm soft blue', 'bold neon', 'bold neon green'], dimensions=2)
        palette = np.array([[[255, 0, 255], [255, 150, 255], [240, 200, 245], [150, 50, 200], [0, 0, 0]]])
        target = rgb_to_lab_batch(palette).reshape(-1)
        latent = space.svd.transform(space.transform(['bold neon']))[0]
        bundle = {'space': space, 'selection': {'validation_selected_conditional_method': 'mlp_generation'},
                  'generators': [Constant(target)], 'encoders': [Constant(latent)]}
        result = generate_from_tokens(bundle, {'bold': .5, 'neon': .5}, theme='light', allow_background_changes=True)
        self.assertEqual(result['status'], 'verified_candidates')
        for candidate in result['candidates']:
            self.assertTrue(all(a['passes'] for a in candidate['audits']))
            self.assertFalse(candidate['experimental_similarity']['calibrated_probability'])
            for audit in candidate['audits']:
                ratio = wcag_contrast_ratio(hex_to_rgb(audit['foreground']), hex_to_rgb(audit['background']))
                self.assertGreaterEqual(ratio, audit['required_wcag'])
