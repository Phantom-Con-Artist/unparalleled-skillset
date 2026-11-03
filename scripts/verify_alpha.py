"""Reproduce export fidelity and offline runtime checks, keeping machine-readable evidence."""
import json
from pathlib import Path
import sys
import time
import numpy as np

root = Path(__file__).resolve().parents[1]
report = root / 'review_runs/20261103-local-alpha'
sys.path.insert(0, str(root))
import joblib
from research.token_conditioning.model import load_clean_splits, palette_features
from color_engine.semantic import SemanticModel
from color_engine.service import ColorIntelligenceLayer
from color_engine.constraints import certify
bundle = joblib.load(root / 'review_runs/20261103-token-conditioning/experiment-01/models/research_bundle.joblib')
splits, _ = load_clean_splits(root / 'review_runs/20261103-token-conditioning/datasets')
model = SemanticModel()
texts = [r['text'] for r in splits['test']]
original_q = bundle['space'].transform(texts).toarray()
portable_q = np.stack([model.vectorize(text)[0] for text in texts])
original = bundle['ridge'].predict(bundle['space'].svd.transform(original_q))
portable = portable_q @ model.arrays['generator_weights'] + model.arrays['generator_bias']
max_error = float(np.max(np.abs(original - portable)))
assert max_error < 1e-12
colors = [r['palette'] for r in splits['test']]
features = palette_features(colors)
from color_engine.spaces import rgb_to_hex
portable_features = np.stack([model.features([rgb_to_hex(*c) for c in row]) for row in colors])
feature_error = float(np.max(np.abs(features - portable_features)))
assert feature_error < 1e-12
caption = bundle['space'].svd.transform(original_q)
caption /= np.maximum(np.linalg.norm(caption, axis=1, keepdims=True), 1e-15)
encoded = features @ model.arrays['encoder_weights'] + model.arrays['encoder_bias']
encoded /= np.maximum(np.linalg.norm(encoded, axis=1, keepdims=True), 1e-15)
covered = np.linalg.norm(original_q, axis=1) > 0
cosine = np.einsum('ij,ij->i', caption, encoded)
constant = bundle['space'].embeddings.mean(axis=0)
constant /= np.linalg.norm(constant)
constant_cosine = caption @ constant
# Runtime smoke after blocking outbound sockets, with no downloads or model fetches.
network_events = []
def block_network(event, args):
    if event in ('socket.connect', 'socket.bind', 'socket.getaddrinfo'):
        network_events.append(event)
        raise RuntimeError('Network prohibited in offline verification: ' + event)
sys.addaudithook(block_network)
app = ColorIntelligenceLayer(':memory:')
latencies, requests = [], []
for tokens in ({'cyberpunk': 2, 'calm': 1}, {'quiet luxury': 1, 'minimalism': 2},
               {'maximalism': 1, 'neon': 1}, {'organic': 1, 'warm': 1}):
    for theme in ('light', 'dark'):
        started = time.perf_counter()
        result = app.generate(tokens, theme=theme)
        latencies.append(time.perf_counter() - started)
        assert result['status'] == 'verified_declared_usages'
        requests.append({'tokens': tokens, 'theme': theme, 'roles': result['roles'], 'status': result['status'],
                         'similarity': result['semantic_match'], 'changes': result['changes']})
app.analyze(['#000000', '#FFFFFF', '#00FFFF', '#FF00FF', '#121212'])
entries = app.catalog.search(limit=100)
app.catalog.save('Offline verification fixture', requests[0]['roles'], ['cyberpunk'], {'kind': 'verification_fixture'})
assert network_events == []
app.close()
seeds = json.loads((root / 'color_engine/resources/seed_catalog.json').read_text())['palettes']
summary = {'held_out_rows': len(texts), 'covered_held_out_rows': int(covered.sum()),
    'tfidf_max_abs_error': float(np.max(np.abs(original_q-portable_q))),
    'generator_max_abs_error': max_error, 'inverse_feature_max_abs_error': feature_error,
    'inverse_test_cosine_mean_covered': float(cosine[covered].mean()),
    'inverse_test_cosine_median_covered': float(np.median(cosine[covered])),
    'inverse_constant_caption_cosine_mean_covered': float(constant_cosine[covered].mean()),
    'inverse_caveat': 'Description embedding alignment, not human aesthetic agreement; alpha selected on validation only.',
    'inverse_alpha': model.manifest['inverse_alpha'],
    'canonical_terms': len(model.terms), 'recognized_names': len(model.aliases),
    'catalog_palettes': len(seeds), 'verified_seed_role_pairs': sum(len(e['certificate']['audits']) for e in seeds if e['certificate']['status']=='verified_declared_usages'),
    'verified_seed_palettes': sum(certify(e['roles'], **e['context'])['status']=='verified_declared_usages' for e in seeds),
    'offline_requests': len(requests), 'network_attempts': network_events,
    'generation_latency_seconds': {'median': float(np.median(latencies)), 'max': max(latencies)},
    'claims': {'linear_generator_equivalent_to_benchmark': True, 'improved_aesthetic_quality_proven': False,
               'human_validated_presets': 0, 'runtime_requires_sklearn_or_joblib': False}}
(report / 'verification.json').write_text(json.dumps(summary, indent=2) + '\n')
(report / 'sample_outputs.json').write_text(json.dumps(requests, indent=2) + '\n')
print(json.dumps(summary, indent=2))
