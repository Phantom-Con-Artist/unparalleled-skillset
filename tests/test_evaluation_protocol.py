import unittest
import numpy as np
from data.ml.evaluation_protocol import split_color_groups, normalize_embeddings, protocol_metadata


class EvaluationProtocolTests(unittest.TestCase):
    def test_duplicate_colors_do_not_cross_splits(self):
        colors = [f'#{value:06X}' for value in range(100)] * 3
        train, val, test = split_color_groups(colors)
        groups = [{colors[i] for i in part} for part in (train, val, test)]
        self.assertFalse(groups[0] & groups[1] or groups[0] & groups[2] or groups[1] & groups[2])
        self.assertEqual(set(train) | set(val) | set(test), set(range(len(colors))))
        again = split_color_groups(colors)
        self.assertTrue(all(np.array_equal(a, b) for a, b in zip((train, val, test), again)))

    def test_test_set_cannot_change_normalization(self):
        similarities = np.arange(200, dtype=float).reshape(100, 2)
        train = np.arange(70)
        _, before = normalize_embeddings(similarities, train)
        similarities[70:] = 1e9
        transformed, after = normalize_embeddings(similarities, train)
        self.assertEqual(before, after)
        self.assertTrue(np.isfinite(transformed).all())
        self.assertTrue(np.all(transformed <= 1))

    def test_metrics_do_not_claim_independent_validation(self):
        meta = protocol_metadata({'fit_split': 'train'})
        self.assertFalse(meta['independent_human_evaluation'])
        self.assertFalse(meta['historical_v1_comparable'])
        self.assertFalse(meta['probabilities_calibrated'])
