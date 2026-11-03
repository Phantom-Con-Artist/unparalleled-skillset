"""Explicitly exploratory coverage, concept-subset, and prototype-score checks."""
import argparse
import json
from pathlib import Path
import warnings

import joblib
import numpy as np
from scipy.stats import spearmanr
from sklearn.preprocessing import normalize

from .model import palette_features, matching_distance
from .experiment import bootstrap, write_json


STYLE = {'cyberpunk', 'neon', 'calm', 'bold', 'minimal', 'minimalism', 'maximalism', 'peaceful',
         'luxury', 'modern', 'vibrant', 'serene', 'pastel', 'dark', 'soft', 'warm', 'cool'}
BASIC = {'black', 'white', 'grey', 'gray', 'red', 'blue', 'green', 'yellow', 'orange',
         'brown', 'pink', 'purple', 'violet', 'cyan', 'magenta'}


def correlation(score, error, mask):
    mask = mask & np.isfinite(score)
    if mask.sum() < 3:
        return {'queries': int(mask.sum()), 'rho': None}
    with warnings.catch_warnings():
        warnings.simplefilter('ignore')
        rho = spearmanr(score[mask], error[mask]).statistic
    return {'queries': int(mask.sum()), 'rho': float(rho) if np.isfinite(rho) else None,
            'interpretation': 'Negative rho associates larger internal score with smaller reference error; not aesthetic probability.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, required=True)
    args = parser.parse_args()
    root = args.root
    experiment = root / 'experiment-01'
    bundle = joblib.load(experiment / 'models/research_bundle.joblib')
    refs = json.loads((experiment / 'datasets/test_references.json').read_text())
    measured = json.loads((experiment / 'per_query.json').read_text())
    names = np.array([r['text'] for r in refs])
    covered = np.array([r['covered'] for r in measured])
    aesthetic = np.array([bool(set(name.split()) & STYLE) and not bool(set(name.split()) & BASIC) for name in names])
    subset_results = {'posthoc': True, 'aesthetic_subset_definition': {'include_any': sorted(STYLE), 'exclude_any': sorted(BASIC)},
                      'covered_queries': int(covered.sum()), 'aesthetic_queries': int(aesthetic.sum()), 'methods': {}}
    for method in measured[0]['errors']:
        errors = np.array([r['errors'][method] for r in measured])
        subset_results['methods'][method] = {
            'covered': bootstrap(errors[covered], names[covered]),
            'represented_aesthetic_words': bootstrap(errors[aesthetic], names[aesthetic]) if aesthetic.sum() else None}
    write_json(root / 'subset_diagnostics.json', subset_results)
    data = np.load(experiment / 'datasets/predictions.npz')
    q = bundle['space'].transform(names.tolist())
    latent = normalize(bundle['space'].svd.transform(q))
    target_rgb = np.asarray([r['palette'] for r in refs])
    scores, records = {}, []
    for method in measured[0]['errors']:
        rgb = data[method + '_0']
        encoded = normalize(np.mean([m.predict(palette_features(rgb)) for m in bundle['encoders']], axis=0))
        score = np.sum(encoded * latent, axis=1)
        errors = matching_distance(rgb, target_rgb)
        scores[method] = {'raw_first_seed': correlation(score, errors, covered)}
        records.extend({'method': method, 'id': refs[i]['id'], 'score': float(score[i]) if covered[i] else None,
                        'raw_reference_error': float(errors[i])} for i in range(len(refs)))
    lookup = {r['id']: i for i, r in enumerate(refs)}
    followup = json.loads((root / 'exploratory-background-01/cases.json').read_text())
    for method in scores:
        selected = [r for r in followup if r['method'] == method]
        indices = np.array([lookup[r['id']] for r in selected])
        rgb = np.asarray([r['result']['palette_rgb'] for r in selected])
        encoded = normalize(np.mean([m.predict(palette_features(rgb)) for m in bundle['encoders']], axis=0))
        score = np.sum(encoded * latent[indices], axis=1)
        errors = matching_distance(rgb, target_rgb[indices])
        scores[method]['constrained_first_seed'] = correlation(score, errors, covered[indices])
    write_json(root / 'prototype_score_diagnostics.json', {'posthoc': True, 'fit_or_selection_performed': False,
                                                          'methods': scores})
    write_json(root / 'prototype_score_rows.json', records)
    print(json.dumps({'aesthetic_queries': int(aesthetic.sum()), 'covered_queries': int(covered.sum()), 'score_diagnostics': scores}, indent=2))


if __name__ == '__main__':
    main()
