"""Run the preregistered PAT comparison; artifacts always go to a new directory."""
import argparse
import hashlib
import json
import platform
import time
import warnings
from pathlib import Path

import joblib
import numpy as np
from scipy.stats import spearmanr
from sklearn.compose import TransformedTargetRegressor
from sklearn.linear_model import Ridge
from sklearn.neural_network import MLPRegressor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler, normalize

from .model import (TokenSpace, load_clean_splits, rgb_to_lab_batch, sort_lab, labs_to_rgb,
                    palette_features, matching_distance, diversity, caption_retrieve,
                    constrain_palette, assign_roles, audit_roles)


def write_json(path, data):
    with Path(path).open('x') as stream:
        json.dump(data, stream, indent=2, allow_nan=False)
        stream.write('\n')


def regression(model):
    return TransformedTargetRegressor(regressor=make_pipeline(StandardScaler(), model), transformer=StandardScaler())


def neural(hidden, seed):
    return regression(MLPRegressor(hidden_layer_sizes=hidden, alpha=.01, random_state=seed,
                                  batch_size=128, max_iter=150, early_stopping=True,
                                  n_iter_no_change=12, validation_fraction=.15))


def neural_diagnostics(model):
    nn = model.regressor_.steps[-1][1]
    return {'iterations': nn.n_iter_, 'loss': float(nn.loss_),
            'loss_curve': [float(x) for x in nn.loss_curve_],
            'best_internal_validation_r2': float(nn.best_validation_score_)}


def encoder_retrieve(models, features, query_embeddings, fallback_index, coverage):
    palettes, scores = [], []
    q = normalize(query_embeddings)
    for model in models:
        encoded = normalize(model.predict(features))
        similarities = q @ encoded.T
        indices = np.argmax(similarities, axis=1)
        indices[~coverage] = fallback_index
        score = similarities[np.arange(len(indices)), indices]
        score[~coverage] = np.nan
        palettes.append(indices)
        scores.append(score)
    return palettes, scores


def make_predictions(bundle, texts):
    space, train_rgb = bundle['space'], bundle['train_rgb']
    q = space.transform(texts)
    covered = np.asarray(q.sum(axis=1)).ravel() > 0
    latent = space.svd.transform(q)
    rng = np.random.default_rng(20261103)
    pred = {'random': [train_rgb[rng.integers(len(train_rgb), size=len(texts))]],
            'mean': [np.repeat(bundle['mean_rgb'][None], len(texts), axis=0)]}
    scores = {}
    for name, alpha in [('tfidf', 0), ('graph', bundle['graph_alpha'])]:
        indices, raw = caption_retrieve(space, q, alpha, bundle['fallback_index'])
        pred[name], scores[name] = [train_rgb[indices]], [raw]
    pred['ridge'] = [labs_to_rgb(bundle['ridge'].predict(latent).reshape(-1, 5, 3))]
    pred['mlp_generation'] = [labs_to_rgb(model.predict(latent).reshape(-1, 5, 3)) for model in bundle['generators']]
    indices, raw = encoder_retrieve(bundle['encoders'], bundle['train_features'], latent,
                                   bundle['fallback_index'], covered)
    pred['neural_retrieval'], scores['neural_retrieval'] = [train_rgb[i] for i in indices], raw
    return pred, scores, covered


def bootstrap(values, names, seed=20261103):
    """Cluster resampling preserves all rows of each repeated test description."""
    _, groups = np.unique(names, return_inverse=True)
    totals = np.bincount(groups, weights=values)
    counts = np.bincount(groups)
    rng = np.random.default_rng(seed)
    samples = rng.integers(len(totals), size=(2000, len(totals)))
    means = totals[samples].sum(axis=1) / counts[samples].sum(axis=1)
    return {'mean': float(np.mean(values)), 'ci95': np.quantile(means, [.025, .975]).tolist(),
            'resampling_unit': 'normalized_description', 'draws': 2000}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    out = args.output
    started = time.perf_counter()
    splits, split_audit = load_clean_splits(args.data)
    write_json(out / 'split_manifest.json', split_audit)
    train, val, test = (splits[key] for key in ('train', 'val', 'test'))
    train_rgb, val_rgb, test_rgb = (np.asarray([r['palette'] for r in rows], dtype=np.uint8) for rows in (train, val, test))
    train_text, val_text, test_text = ([r['text'] for r in rows] for rows in (train, val, test))
    print(json.dumps({'stage': 'splits_frozen', 'counts': {k: len(v) for k, v in splits.items()}}), flush=True)
    space = TokenSpace(train_text)
    query_val = space.transform(val_text)
    latent_train, latent_val = space.embeddings, space.svd.transform(query_val)
    features = palette_features(train_rgb)
    val_features = palette_features(val_rgb)
    targets = sort_lab(rgb_to_lab_batch(train_rgb)).reshape(len(train_rgb), -1)
    mean_lab = targets.mean(axis=0).reshape(1, 5, 3)
    mean_rgb = labs_to_rgb(mean_lab)[0]
    fallback = int(np.argmin(np.linalg.norm(targets - mean_lab.reshape(1, -1), axis=1)))
    validation = []
    val_method = {}
    for method, palettes in [('random', train_rgb[np.random.default_rng(20261103).integers(len(train_rgb), size=len(val))]),
                             ('mean', np.repeat(mean_rgb[None], len(val), axis=0))]:
        value = float(matching_distance(palettes, val_rgb).mean())
        val_method[method] = value
        validation.append({'method': method, 'mean_distance': value})
    for name, alpha in [('tfidf', 0), ('graph', .15), ('graph', .35), ('graph', .60)]:
        indices, _ = caption_retrieve(space, query_val, alpha, fallback)
        value = float(matching_distance(train_rgb[indices], val_rgb).mean())
        validation.append({'method': name, 'alpha': alpha, 'mean_distance': value})
        print(json.dumps(validation[-1]), flush=True)
        if name == 'tfidf':
            val_method[name] = value
    graph_best = min((r for r in validation if r['method'] == 'graph'), key=lambda r: r['mean_distance'])
    val_method['graph'] = graph_best['mean_distance']
    ridge_models = {}
    for alpha in (1, 10, 100):
        model = regression(Ridge(alpha=alpha)).fit(latent_train, targets)
        predicted = labs_to_rgb(model.predict(latent_val).reshape(-1, 5, 3))
        value = float(matching_distance(predicted, val_rgb).mean())
        validation.append({'method': 'ridge', 'alpha': alpha, 'mean_distance': value})
        ridge_models[alpha] = model
        print(json.dumps(validation[-1]), flush=True)
    ridge_best = min((r for r in validation if r['method'] == 'ridge'), key=lambda r: r['mean_distance'])
    val_method['ridge'] = ridge_best['mean_distance']
    all_generators, all_encoders = {}, {}
    seeds = (11, 29, 47)
    for hidden in ((64,), (128, 64)):
        key = ','.join(map(str, hidden))
        generators, encoders = [], []
        generator_errors, encoder_errors = [], []
        for seed in seeds:
            t = time.perf_counter()
            with warnings.catch_warnings(record=True) as caught:
                warnings.simplefilter('always')
                generator = neural(hidden, seed).fit(latent_train, targets)
                encoder = neural(hidden, seed).fit(features, latent_train)
            generators.append(generator)
            encoders.append(encoder)
            gp = labs_to_rgb(generator.predict(latent_val).reshape(-1, 5, 3))
            generator_errors.append(matching_distance(gp, val_rgb))
            indices, _ = encoder_retrieve([encoder], features, latent_val, fallback,
                                         np.asarray(query_val.sum(axis=1)).ravel() > 0)
            encoder_errors.append(matching_distance(train_rgb[indices[0]], val_rgb))
            row = {'method': 'neural_fit', 'hidden': list(hidden), 'seed': seed,
                   'generator': neural_diagnostics(generator), 'encoder': neural_diagnostics(encoder),
                   'warnings': [str(w.message) for w in caught], 'seconds': time.perf_counter() - t}
            validation.append(row)
            print(json.dumps({k: v for k, v in row.items() if k not in ('generator', 'encoder')}), flush=True)
        for method, errors in [('mlp_generation', generator_errors), ('neural_retrieval', encoder_errors)]:
            row = {'method': method, 'hidden': list(hidden), 'mean_distance': float(np.mean(errors))}
            validation.append(row)
            print(json.dumps(row), flush=True)
        all_generators[key], all_encoders[key] = generators, encoders
    selected_nn = {method: min((r for r in validation if r['method'] == method), key=lambda r: r['mean_distance'])
                   for method in ('mlp_generation', 'neural_retrieval')}
    val_method.update({k: v['mean_distance'] for k, v in selected_nn.items()})
    selected = {'graph_alpha': graph_best['alpha'], 'ridge_alpha': ridge_best['alpha'],
                'neural_hidden': {k: v['hidden'] for k, v in selected_nn.items()},
                'validation_scores': val_method,
                'validation_selected_method': min(val_method, key=val_method.get),
                'validation_selected_conditional_method': min((k for k in val_method if k not in ('random', 'mean')), key=val_method.get),
                'seeds': seeds, 'primary_metric': 'optimal_matching_oklab_distance_x100',
                'test_scores_used_for_selection': False}
    write_json(out / 'validation.json', validation)
    write_json(out / 'selection_frozen_before_test.json', selected)
    print(json.dumps({'stage': 'selection_frozen_before_test', **selected}), flush=True)
    bundle = {'space': space, 'train_rgb': train_rgb, 'train_rows': train,
              'mean_rgb': mean_rgb, 'fallback_index': fallback, 'train_features': features,
              'graph_alpha': selected['graph_alpha'], 'ridge': ridge_models[selected['ridge_alpha']],
              'generators': all_generators[','.join(map(str, selected_nn['mlp_generation']['hidden']))],
              'encoders': all_encoders[','.join(map(str, selected_nn['neural_retrieval']['hidden']))],
              'selection': selected}
    (out / 'models').mkdir()
    joblib.dump(bundle, out / 'models/research_bundle.joblib')
    predictions, internal_scores, coverage = make_predictions(bundle, test_text)
    rng = np.random.default_rng(20261103)
    shuffled_order = rng.permutation(len(test))
    shuffled, _, _ = make_predictions(bundle, [test_text[i] for i in shuffled_order])
    (out / 'datasets').mkdir()
    np.savez_compressed(out / 'datasets/predictions.npz', **{f'{name}_{i}': rgb for name, arrays in predictions.items() for i, rgb in enumerate(arrays)})
    write_json(out / 'datasets/test_references.json', test)
    names = np.asarray(test_text)
    errors, result = {}, {}
    for method, arrays in predictions.items():
        e = np.asarray([matching_distance(rgb, test_rgb) for rgb in arrays])
        errors[method] = e.mean(axis=0)
        ctrl = np.mean([matching_distance(rgb, test_rgb) for rgb in shuffled[method]], axis=0)
        result[method] = {**bootstrap(errors[method], names),
                          'median': float(np.median(errors[method])),
                          'mean_diversity': float(np.mean([diversity(rgb).mean() for rgb in arrays])),
                          'mean_unique_colors': float(np.mean([np.mean([len(np.unique(row, axis=0)) for row in rgb]) for rgb in arrays])),
                          'seed_mean_distances': e.mean(axis=1).tolist(),
                          'shuffled_request_distance': float(ctrl.mean()),
                          'conditioning_gain_vs_shuffled': bootstrap(ctrl - errors[method], names)}
        if method in internal_scores:
            score = np.nanmean(internal_scores[method], axis=0)
            mask = np.isfinite(score)
            correlation = spearmanr(score[mask], errors[method][mask])
            result[method]['internal_score_vs_error_spearman'] = {
                'rho': float(correlation.statistic) if np.isfinite(correlation.statistic) else None,
                'p_value': float(correlation.pvalue) if np.isfinite(correlation.pvalue) else None,
                'queries': int(mask.sum()), 'calibrated_probability': False,
                'note': 'Negative rho means larger internal similarity tends to accompany smaller reference error.'}
        print(json.dumps({'stage': 'test', 'method': method, **result[method]}), flush=True)
    write_json(out / 'paired_differences.json', {
        f'{a}_minus_{b}': bootstrap(errors[a] - errors[b], names)
        for a, b in [('tfidf', 'random'), ('graph', 'tfidf'), ('mlp_generation', 'ridge'),
                     ('neural_retrieval', 'tfidf'), ('mlp_generation', 'mean')]})
    write_json(out / 'per_query.json', [{'id': r['id'], 'covered': bool(coverage[i]),
                                       'errors': {m: float(v[i]) for m, v in errors.items()}} for i, r in enumerate(test)])
    write_json(out / 'semantic_results.json', {'scope': 'Held-out reference color fidelity, not human aesthetic quality.',
                                              'test_queries': len(test), 'covered_queries': int(coverage.sum()),
                                              'selection': selected, 'methods': result})
    sample = rng.choice(len(test), size=min(200, len(test)), replace=False)
    write_json(out / 'accessibility_sample.json', [{'id': test[i]['id'], 'theme': 'light' if j % 2 == 0 else 'dark'} for j, i in enumerate(sample)])
    accessibility, raw_rows = {}, []
    for method, arrays in predictions.items():
        # All methods use the first predeclared seed here, keeping the same 200
        # requests/themes. Neural variability is measured separately above.
        rgb = arrays[0]
        projected, movements, before_passes, after_passes, feasible = [], [], 0, 0, 0
        for j, i in enumerate(sample):
            theme = 'light' if j % 2 == 0 else 'dark'
            before, _ = audit_roles(assign_roles(rgb[i], theme))
            output = constrain_palette(rgb[i], theme)
            projected.append(output['palette_rgb'])
            movements.append(output['mean_role_movement_oklab_x100'])
            before_passes += sum(a['passes'] for a in before)
            after_passes += sum(a['passes'] for a in output['audits'])
            feasible += output['status'] == 'verified_declared_usages'
            raw_rows.append({'method': method, 'id': test[i]['id'], 'before_audits': before, 'result': output})
        projected = np.asarray(projected, dtype=np.uint8)
        raw_error = matching_distance(rgb[sample], test_rgb[sample])
        final_error = matching_distance(projected, test_rgb[sample])
        accessibility[method] = {'requests': len(sample), 'pairings': len(sample) * 5,
                                 'before_passes': int(before_passes), 'after_passes': int(after_passes),
                                 'feasible_requests': int(feasible), 'mean_role_movement': float(np.mean(movements)),
                                 'raw_reference_distance': float(raw_error.mean()),
                                 'projected_reference_distance': float(final_error.mean()),
                                 'projection_distance_change': bootstrap(final_error - raw_error, names[sample])}
        print(json.dumps({'stage': 'accessibility', 'method': method, **accessibility[method]}), flush=True)
    write_json(out / 'accessibility_results.json', accessibility)
    write_json(out / 'accessibility_cases.json', raw_rows)
    config = {'python': platform.python_version(), 'numpy': np.__version__, 'seconds': time.perf_counter() - started,
              'vocabulary_size': len(space.vectorizer.vocabulary_), 'graph_edges': int(space.graph.nnz),
              'svd_dimensions': space.svd.n_components,
              'data_sha256': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(args.data.glob('*.csv'))},
              'source_sha256': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in Path(__file__).parent.glob('*.py')}}
    write_json(out / 'environment.json', config)
    print(json.dumps({'stage': 'complete', **config}), flush=True)


if __name__ == '__main__':
    main()
