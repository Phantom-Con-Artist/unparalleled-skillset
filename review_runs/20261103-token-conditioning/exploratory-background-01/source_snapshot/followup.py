"""Evaluate the explicitly exploratory background fallback on frozen predictions."""
import argparse
import json
from pathlib import Path
import numpy as np
from .model import matching_distance
from .constraints import constrain_with_background_fallback
from .experiment import write_json, bootstrap


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--experiment', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    rows = json.loads((args.experiment / 'datasets/test_references.json').read_text())
    lookup = {row['id']: (i, row) for i, row in enumerate(rows)}
    sample = json.loads((args.experiment / 'accessibility_sample.json').read_text())
    predictions = np.load(args.experiment / 'datasets/predictions.npz')
    summary, cases = {}, []
    for method in ('random', 'mean', 'tfidf', 'graph', 'ridge', 'mlp_generation', 'neural_retrieval'):
        final, references, names, movements = [], [], [], []
        passes = feasible = fallbacks = 0
        for item in sample:
            i, row = lookup[item['id']]
            result = constrain_with_background_fallback(predictions[method + '_0'][i], item['theme'], True)
            final.append(result['palette_rgb'])
            references.append(row['palette'])
            names.append(row['text'])
            passes += sum(a['passes'] for a in result['audits'])
            feasible += result['status'] == 'verified_declared_usages'
            fallbacks += result['background_fallback_used']
            movements.append(result['mean_role_movement_oklab_x100'])
            cases.append({'method': method, 'id': item['id'], 'result': result})
        errors = matching_distance(np.asarray(final), np.asarray(references))
        summary[method] = {'requests': len(sample), 'pairs': len(sample) * 5, 'passing_pairs': passes,
                           'feasible_requests': feasible, 'background_fallback_requests': fallbacks,
                           'mean_role_movement': float(np.mean(movements)),
                           'reference_distance': bootstrap(errors, np.asarray(names))}
        print(json.dumps({'method': method, **summary[method]}), flush=True)
    write_json(args.output / 'summary.json', summary)
    write_json(args.output / 'cases.json', cases)


if __name__ == '__main__':
    main()
