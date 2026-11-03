"""Export our trusted research fit to portable NumPy arrays; never load pickle at runtime."""
import json
from pathlib import Path
import joblib
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler

root = Path(__file__).resolve().parents[1]
bundle = joblib.load(root / 'review_runs/20261103-token-conditioning/experiment-01/models/research_bundle.joblib')
space = bundle['space']
model = bundle['ridge']
print('bundle', list(bundle), 'model', model)
reg = model.regressor_
x = reg[0]
r = reg[1]
y = model.transformer_
w = (space.svd.components_.T @ (r.coef_.T / x.scale_[:, None])) * y.scale_[None, :]
b = ((-x.mean_ / x.scale_) @ r.coef_.T + r.intercept_) * y.scale_ + y.mean_
features = bundle['train_features']
scaler = StandardScaler().fit(features)
selection = json.loads((root / 'review_runs/20261103-local-alpha/inverse-selection.json').read_text())
encoder = Ridge(alpha=selection['selected_alpha']).fit(scaler.transform(features), space.embeddings)
inv_w = encoder.coef_.T / scaler.scale_[:, None]
inv_b = encoder.intercept_ - scaler.mean_ @ inv_w
query = space.captions[:100].toarray()
expected = model.predict(space.svd.transform(space.captions[:100]))
error = float(np.max(np.abs(query @ w + b - expected)))
assert error < 1e-12, error
out = root / 'color_engine/resources'
np.savez_compressed(out / 'linear_model.npz', generator_weights=w, generator_bias=b,
                    encoder_weights=inv_w, encoder_bias=inv_b,
                    idf=space.vectorizer.idf_, components=space.svd.components_)
manifest = {'version': 'pat-ridge-1', 'vocabulary': {k: int(v) for k, v in space.vectorizer.vocabulary_.items()},
            'stop_words': sorted(space.vectorizer.get_stop_words()), 'export_max_abs_error': error,
            'training_rows': len(bundle['train_rows']), 'source': 'CyberAgentAILab/text2palette PAT',
            'source_revision': '45948e2f3baddb9bab61921b5d5fbc9b0a8b6809',
            'generator': 'TF-IDF → SVD → standardized ridge (affine folded)',
            'inverse': f"standardized palette features → ridge(alpha={selection['selected_alpha']}) → caption SVD; uncalibrated",
            'inverse_validation': 'Alpha selected on validation caption-SVD cosine; not a human-validated aesthetic classifier.',
            'inverse_alpha': selection['selected_alpha'],
            'evaluation_report': 'review_runs/20261103-token-conditioning/REPORT.md'}
(out / 'linear_manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps({'export_max_abs_error': error, 'terms': len(manifest['vocabulary']), 'weights': list(w.shape), 'inverse': list(inv_w.shape)}))
