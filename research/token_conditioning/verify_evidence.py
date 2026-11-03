"""Check split isolation, frozen source/data hashes, and exact prediction replay."""
import argparse
import gzip
import hashlib
import json
from pathlib import Path

import joblib
import numpy as np

from .model import load_clean_splits
from .experiment import make_predictions, write_json


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    root = args.root
    experiment = root / 'experiment-01'
    env = json.loads((experiment / 'environment.json').read_text())
    for name, sha in env['source_sha256'].items():
        assert hashlib.sha256((Path(__file__).parent / name).read_bytes()).hexdigest() == sha
        assert hashlib.sha256((experiment / 'source_snapshot' / name).read_bytes()).hexdigest() == sha
    for name, sha in env['data_sha256'].items():
        assert hashlib.sha256((root / 'datasets' / name).read_bytes()).hexdigest() == sha
    splits, ids = load_clean_splits(root / 'datasets')
    assert ids == json.loads((experiment / 'split_manifest.json').read_text())
    for first, second in [('train', 'val'), ('train', 'test'), ('val', 'test')]:
        assert not {r['text'] for r in splits[first]} & {r['text'] for r in splits[second]}
        assert not {r['signature'] for r in splits[first]} & {r['signature'] for r in splits[second]}
    bundle = joblib.load(experiment / 'models/research_bundle.joblib')
    predicted, _, covered = make_predictions(bundle, [r['text'] for r in splits['test']])
    saved = np.load(experiment / 'datasets/predictions.npz')
    replayed = 0
    for method, arrays in predicted.items():
        for index, array in enumerate(arrays):
            np.testing.assert_array_equal(array, saved[f'{method}_{index}'])
            replayed += len(array)
    for relative in ['experiment-01/accessibility_cases.json', 'exploratory-background-01/cases.json']:
        path = root / relative
        assert gzip.decompress(Path(str(path) + '.gz').read_bytes()) == path.read_bytes()
    audit = json.loads((root / 'measurement_audit.json').read_text())
    assert hashlib.sha256(gzip.decompress((root / 'contrast_measurements.csv.gz').read_bytes())).hexdigest() == audit['csv_sha256']
    output = {'split_counts': {k: len(v) for k, v in splits.items()}, 'split_overlap': False,
              'data_hashes_match': True, 'fitting_source_hashes_match': True,
              'exact_replayed_palette_arrays': replayed, 'covered_queries': int(covered.sum()),
              'lossless_evidence_compression': True, 'contrast_csv_hash_matches': True,
              'note': 'Replayed saved models; no refitting or model selection was performed.'}
    write_json(args.output, output)
    print(json.dumps(output, indent=2))


if __name__ == '__main__':
    main()
