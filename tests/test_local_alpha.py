"""Behavioral checks for the offline linear alpha and additive curation workflow."""
import json
from importlib.resources import files
import sqlite3
import tempfile
import unittest
from pathlib import Path
import numpy as np
from color_engine.semantic import SemanticModel
from color_engine.service import ColorIntelligenceLayer
from color_engine.constraints import certify, constrain


class LocalAlphaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model = SemanticModel()

    def test_vocabulary_coverage_and_provenance(self):
        self.assertGreaterEqual(len(self.model.terms), 100)
        self.assertGreaterEqual(len(self.model.aliases), 280)
        for row in self.model.terms.values():
            q, info = self.model.resolve({row['term']: 1})
            self.assertAlmostEqual(float(np.linalg.norm(q)), 1)
            self.assertFalse(info['human_validated'])
            self.assertTrue(row['limitation'])

    def test_alias_blend_negation_and_unknowns(self):
        q, info = self.model.resolve({'cyber punk': 2, 'calm': 1, 'invented-aesthetic': 1})
        self.assertEqual(info['terms'], {'cyberpunk': 2, 'calm': 1})
        self.assertEqual(len(info['unknown_terms']), 1)
        _, parsed = self.model.resolve(brief='Quiet luxury and neon, avoid cyberpunk')
        self.assertIn('quiet luxury', parsed['terms'])
        self.assertNotIn('cyberpunk', parsed['terms'])
        self.assertIn('cyberpunk', parsed['excluded_terms'])
        for token in ({'calm': float('nan')}, {'calm': -1}, {'calm': True}, {'fake': 1}):
            with self.assertRaises(ValueError):
                self.model.resolve(token)

    def test_portable_model_determinism_and_affinity_scope(self):
        q, _ = self.model.resolve({'neon': 1, 'calm': .5})
        a = self.model.predict_raw(q)
        self.assertEqual(a, self.model.predict_raw(q))
        scores = self.model.analyze(a)
        self.assertFalse(scores['calibrated'])
        self.assertTrue(all(-1.000001 <= row['similarity'] <= 1.000001 for row in scores['matches']))
        self.assertLess(self.model.manifest['export_max_abs_error'], 1e-12)

    def test_all_seed_certificates_are_independently_reproducible(self):
        entries = json.loads(files('color_engine').joinpath('resources/seed_catalog.json').read_text())['palettes']
        self.assertGreaterEqual(len(entries), 230)
        for entry in entries:
            audit = certify(entry['roles'], **entry['context'])
            self.assertEqual(audit, entry['certificate'], entry['id'])
            self.assertEqual(audit['status'], 'verified_declared_usages', entry['id'])
            self.assertIn('kind', entry['provenance'])

    def test_generations_context_and_locked_failures(self):
        for theme in ('light', 'dark'):
            for level in ('AA', 'AAA'):
                result = constrain(['#404040', '#777777', '#AAAAAA'], theme=theme, level=level)
                self.assertEqual(result['certificate']['status'], 'verified_declared_usages')
                self.assertFalse(result['unresolved'])
        locked = {'canvas': '#777777', 'surface': '#777777', 'body': '#777777'}
        failed = constrain(['#777777', '#888888'], locked_roles=locked)
        self.assertEqual(failed['certificate']['status'], 'infeasible')
        self.assertEqual({k: failed['roles'][k] for k in locked}, locked)
        unsupported = constrain(['#000000', '#FFFFFF'], font_size_px=8)
        self.assertEqual(unsupported['certificate']['status'], 'infeasible')
        with self.assertRaises(ValueError):
            constrain(['#000000', '#FFFFFF'], font_size_px=float('nan'))

    def test_database_append_only_reviews_persistence_and_sql_inputs(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'catalog.sqlite3'
            app = ColorIntelligenceLayer(path)
            count = app.catalog.stats()['palettes']
            self.assertEqual(app.catalog.search(human_reviewed=True), [])
            self.assertEqual(app.catalog.search("' OR 1=1 --"), [])
            seed = app.catalog.search('calm', limit=1)[0]
            entry = app.catalog.save('Personal calm', seed['roles'], ['calm'], {'kind': 'test_fixture'})
            pid = entry['id']
            app.catalog.review(pid, 'agent', 'agent', 'approve', 'Automated assessment, not human evidence.')
            app.catalog.review(pid, 'ALICE', 'human', 'approve', 'Fixture: first independent person.')
            app.catalog.review(pid, 'alice', 'human', 'approve', 'Fixture: duplicate person must not increase count.')
            one = app.catalog.get(pid)
            self.assertEqual(one['aesthetic_verification']['distinct_human_approvals'], 1)
            app.catalog.review(pid, 'Bob', 'human', 'approve', 'Fixture: second independent person.')
            self.assertEqual(len(app.catalog.search(human_reviewed=True)), 1)
            rejected = app.catalog.review(pid, 'Alice', 'human', 'reject', 'Fixture: revise earlier assessment.')
            self.assertEqual(rejected['aesthetic_verification']['status'], 'provisional')
            self.assertEqual(len(rejected['reviews']), 5)
            with self.assertRaises(sqlite3.IntegrityError):
                app.catalog.db.execute('DELETE FROM reviews')
            app.close()
            reopened = ColorIntelligenceLayer(path)
            self.assertEqual(reopened.catalog.stats()['palettes'], count + 1)
            self.assertEqual(len(reopened.catalog.get(pid)['reviews']), 5)
            reopened.close()

    def test_service_round_trip_and_declared_usage(self):
        app = ColorIntelligenceLayer(':memory:')
        try:
            generated = app.generate({'calm': 2, 'neon': 1}, theme='light')
            self.assertEqual(generated['status'], 'verified_declared_usages')
            self.assertFalse(generated['semantic_match']['calibrated'])
            analyzed = app.analyze(list(generated['roles'].values()))
            self.assertEqual(analyzed['accessibility_status'], 'no_usages_declared')
            entry = app.catalog.save('Blend', generated['roles'], ['calm', 'neon'], generated['provenance'])
            css = app.export(entry['id'], 'css')
            self.assertIn('--color-on-brand:', css['css'])
        finally:
            app.close()


if __name__ == '__main__':
    unittest.main()
