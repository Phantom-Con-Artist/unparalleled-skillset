"""Experimental weighted-token requests with explicit score and coverage limits.

Only load locally generated research bundles. Published engine tools are unchanged.
"""
import argparse
import json
import math
from pathlib import Path

import joblib
import numpy as np
from sklearn.preprocessing import normalize

from .model import labs_to_rgb, palette_features
from .constraints import constrain_with_background_fallback


def _compatibility(bundle, palette_rgb, latent):
    """Exploratory cosine, not a calibrated confidence or aesthetic probability."""
    predicted = [model.predict(palette_features(np.asarray(palette_rgb)[None])) for model in bundle['encoders']]
    encoded = normalize(np.mean(predicted, axis=0))
    query = normalize(latent)
    if np.linalg.norm(encoded) < 1e-12 or np.linalg.norm(query) < 1e-12:
        return None
    return float(np.clip((encoded @ query.T)[0, 0], -1, 1))


def generate_from_tokens(bundle, targets, theme='dark', limit=3,
                         allow_background_changes=False, method='selected'):
    if type(limit) is not int or not 1 <= limit <= 16:
        raise ValueError('limit must be an integer from 1 to 16.')
    if theme not in ('light', 'dark') or type(allow_background_changes) is not bool:
        raise ValueError('Supply a light/dark theme and a boolean background-change setting.')
    space = bundle['space']
    q, coverage = space.weighted_request(targets)
    if not any(float(weight) > 0 for weight in targets.values()):
        raise ValueError('At least one token weight must be positive.')
    output = {
        'schema_version': 'research-0.1', 'experimental': True,
        'requested_targets': dict(targets), 'coverage': coverage,
        'aesthetic_confidence': None,
        'score_warning': 'Internal cosine is uncalibrated. Held-out tests did not validate a reliable aesthetic confidence score.',
        'constraints': {'body_font_size_px': 16, 'body_font_weight': 400,
                        'body_wcag_ratio': 4.5, 'body_min_abs_apca_lc': 90,
                        'meaningful_graphic_wcag_ratio': 3, 'button_label_wcag_ratio': 4.5,
                        'allow_additional_background_changes': allow_background_changes},
        'limitations': ['Vocabulary is learned from PAT captions, not independently rated aesthetic-token blends.',
                        'Layout area, transparency, rendered typography, and full-page WCAG conformance are not evaluated.',
                        'The palette-to-text scorer was trained on unordered swatches; UI role projection can be out of domain.',
                        'Different neural initializations are candidate variants, not a learned conditional distribution.'],
        'candidates': [], 'rejected_candidates': [],
    }
    if coverage['status'] != 'covered':
        return {**output, 'status': 'unsupported_tokens',
                'next_action': 'Provide represented terms or obtain annotated examples for the missing concepts. No concept substitution was performed.'}
    if method == 'selected':
        method = bundle['selection']['validation_selected_conditional_method']
    if method not in ('mlp_generation', 'ridge', 'tfidf', 'graph', 'neural_retrieval'):
        raise ValueError('Unsupported experimental method.')
    output['method'] = method
    output['model_selection'] = 'Frozen validation results; no test-set selection.'
    latent = space.svd.transform(q)
    if np.linalg.norm(latent) < 1e-12:
        return {**output, 'status': 'unrepresented_latent_request'}
    pool = []
    if method in ('ridge', 'mlp_generation'):
        models = [bundle['ridge']] if method == 'ridge' else bundle['generators']
        for i, model in enumerate(models):
            rgb = labs_to_rgb(model.predict(latent).reshape(1, 5, 3))[0]
            pool.append((rgb, {'kind': 'regression', 'model_initialization_index': i}))
    elif method in ('tfidf', 'graph'):
        query = space.diffuse(q, 0 if method == 'tfidf' else bundle['graph_alpha'])
        scores = np.asarray(query @ space.captions.T)[0]
        indices = np.argsort(-scores, kind='stable')[:limit]
        for index in indices:
            pool.append((bundle['train_rgb'][index], {'kind': 'training_palette_retrieval',
                        'source_record': bundle['train_rows'][index]['id'],
                        'caption_relevance': float(scores[index]), 'caption_relevance_is_confidence': False}))
    else:
        latent = normalize(latent)
        encoded = normalize(np.mean([m.predict(bundle['train_features']) for m in bundle['encoders']], axis=0))
        scores = (latent @ encoded.T)[0]
        for index in np.argsort(-scores, kind='stable')[:limit]:
            pool.append((bundle['train_rgb'][index], {'kind': 'training_palette_retrieval',
                        'source_record': bundle['train_rows'][index]['id']}))
    seen = set()
    for rgb, provenance in pool:
        signature = tuple(sorted(tuple(int(v) for v in color) for color in rgb))
        if signature in seen:
            continue
        seen.add(signature)
        result = constrain_with_background_fallback(rgb, theme, allow_background_changes)
        after_rgb = result.pop('palette_rgb')
        candidate = {**result, 'provenance': provenance,
                     'raw_palette': ['#%02X%02X%02X' % tuple(int(v) for v in color) for color in rgb],
                     'experimental_similarity': {
                         'raw_palette_cosine': _compatibility(bundle, rgb, latent),
                         'final_palette_cosine': _compatibility(bundle, after_rgb, latent),
                         'range': [-1, 1], 'method': 'cosine_in_learned_palette_text_space',
                         'calibrated_probability': False, 'interpretation': 'Internal learned compatibility only; not human approval or conformance.'}}
        if result['status'] == 'verified_declared_usages':
            output['candidates'].append(candidate)
        else:
            output['rejected_candidates'].append(candidate)
    output['candidates'].sort(key=lambda c: c['experimental_similarity']['final_palette_cosine']
                              if c['experimental_similarity']['final_palette_cosine'] is not None else -2, reverse=True)
    output['candidates'] = output['candidates'][:limit]
    output['status'] = 'verified_candidates' if output['candidates'] else 'no_feasible_candidate'
    output['candidate_ordering'] = 'Exploratory internal cosine after constraint projection.'
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--bundle', type=Path, required=True, help='Locally generated bundle from this experiment.')
    parser.add_argument('--targets', required=True, help='JSON object of token weights.')
    parser.add_argument('--theme', choices=('light', 'dark'), default='dark')
    parser.add_argument('--allow-background-changes', action='store_true')
    parser.add_argument('--method', default='selected', choices=('selected', 'ridge', 'mlp_generation', 'tfidf', 'graph', 'neural_retrieval'))
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    if args.output.exists():
        raise SystemExit('Refusing to overwrite an existing output.')
    bundle = joblib.load(args.bundle)
    result = generate_from_tokens(bundle, json.loads(args.targets), theme=args.theme,
                                  allow_background_changes=args.allow_background_changes, method=args.method)
    with args.output.open('x') as f:
        json.dump(result, f, indent=2, allow_nan=False)
        f.write('\n')
    print(json.dumps({'status': result['status'], 'candidates': len(result['candidates']), 'coverage': result['coverage']}))


if __name__ == '__main__':
    main()
