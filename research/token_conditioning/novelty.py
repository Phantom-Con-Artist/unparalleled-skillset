"""Posthoc audit of identical unigram representations across isolated captions."""
import argparse
import json
from pathlib import Path
import joblib
import numpy as np
from .experiment import bootstrap, write_json


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    experiment = args.root / 'experiment-01'
    bundle = joblib.load(experiment / 'models/research_bundle.joblib')
    rows = json.loads((experiment / 'datasets/test_references.json').read_text())
    errors = json.loads((experiment / 'per_query.json').read_text())
    space = bundle['space']
    query = space.transform([row['text'] for row in rows]).tocsr()
    train = space.captions.tocsr()
    def signature(matrix, index):
        row = matrix.getrow(index)
        row.sort_indices()
        return tuple(zip(row.indices.tolist(), np.round(row.data, 12).tolist()))
    training = {signature(train, i) for i in range(train.shape[0])}
    covered = np.asarray(query.sum(axis=1)).ravel() > 0
    repeated = np.array([signature(query, i) in training for i in range(query.shape[0])]) & covered
    novel = covered & ~repeated
    names = np.array([row['text'] for row in rows])
    result = {'posthoc': True,
              'note': 'Unseen normalized captions can still map to identical unigram/IDF representations. Exact equality is checked after rounding coefficients to 12 decimal places.',
              'covered_queries': int(covered.sum()), 'training_representation_seen': int(repeated.sum()),
              'training_representation_novel': int(novel.sum()), 'methods': {}}
    for method in errors[0]['errors']:
        values = np.array([row['errors'][method] for row in errors])
        result['methods'][method] = {'novel_representation': bootstrap(values[novel], names[novel]),
                                      'seen_representation': bootstrap(values[repeated], names[repeated])}
    write_json(args.output, result)
    print(json.dumps({k: v for k, v in result.items() if k != 'methods'}))


if __name__ == '__main__':
    main()
