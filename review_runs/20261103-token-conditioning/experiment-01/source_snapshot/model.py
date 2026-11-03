"""Research-only token/graph/neural palette models; no production defaults change."""
import ast
import math
import re
from pathlib import Path
from typing import Mapping

import numpy as np
import pandas as pd
from scipy import sparse
from scipy.optimize import linear_sum_assignment
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import normalize

from color_engine.spaces import (M1_SRGB_TO_LMS, M2_LMS_TO_OKLAB, oklab_to_oklch,
                                 oklch_to_srgb_hex, hex_to_rgb, hex_to_oklch)
from color_engine.accessibility.guidance import contrast_measurements, propose_foreground
from color_engine.accessibility.wcag import wcag_contrast_ratio


def rgb_to_lab_batch(rgb):
    """Vectorized engine OKLab matrices; accepts arrays ending in three RGB channels."""
    rgb = np.asarray(rgb, dtype=float) / 255
    linear = np.where(rgb <= .04045, rgb / 12.92, ((rgb + .055) / 1.055) ** 2.4)
    return np.cbrt(linear @ np.asarray(M1_SRGB_TO_LMS).T) @ np.asarray(M2_LMS_TO_OKLAB).T


def sort_lab(palettes):
    a = np.asarray(palettes)
    return np.stack([row[np.lexsort((row[:, 2], row[:, 1], row[:, 0]))] for row in a])


def labs_to_rgb(palettes):
    return np.asarray([[hex_to_rgb(oklch_to_srgb_hex(*oklab_to_oklch(*color))) for color in row]
                       for row in np.asarray(palettes)], dtype=np.uint8)


def palette_features(rgb):
    """Fixed permutation-invariant color features; not a Deep Sets reproduction."""
    labs = sort_lab(rgb_to_lab_batch(rgb))
    chroma = np.linalg.norm(labs[:, :, 1:], axis=2)
    pairs = np.stack([np.linalg.norm(labs[:, i] - labs[:, j], axis=1)
                      for i in range(5) for j in range(i)], axis=1)
    return np.concatenate([labs.reshape(len(labs), -1), labs.mean(axis=1), labs.std(axis=1),
                           labs.min(axis=1), labs.max(axis=1),
                           chroma.mean(axis=1)[:, None], chroma.std(axis=1)[:, None],
                           chroma.max(axis=1)[:, None], np.sort(pairs, axis=1)], axis=1)


def matching_distance(first, second):
    """Equal-weight one-to-one OKLab set distance, multiplied by 100."""
    first, second = np.asarray(first), np.asarray(second)
    distances = []
    for a, b in zip(rgb_to_lab_batch(first), rgb_to_lab_batch(second), strict=True):
        costs = np.linalg.norm(a[:, None] - b[None, :], axis=2)
        i, j = linear_sum_assignment(costs)
        distances.append(float(costs[i, j].mean() * 100))
    return np.asarray(distances)


def diversity(rgb):
    labs = rgb_to_lab_batch(rgb)
    return np.mean([np.linalg.norm(labs[:, i] - labs[:, j], axis=1) * 100
                    for i in range(5) for j in range(i)], axis=0)


def load_clean_splits(directory):
    """Keep official splits, with exact palette and full-caption leakage removed."""
    seen_names, seen_palettes = set(), set()
    output, audit = {}, {}
    for split in ('train', 'val', 'test'):
        frame = pd.read_csv(Path(directory) / f'palette_and_text_{split}.csv')
        rows, local_palettes = [], set()
        for index, row in frame.iterrows():
            tokens, palette = ast.literal_eval(row.text_input), ast.literal_eval(row.palette)
            if (not isinstance(tokens, list) or not all(isinstance(x, str) for x in tokens)
                    or not isinstance(palette, list) or len(palette) != 5
                    or not all(len(c) == 3 and all(type(v) is int and 0 <= v <= 255 for v in c) for c in palette)):
                raise ValueError(f'Invalid dataset row {split}:{index}')
            name = ' '.join(re.findall(r'[a-z0-9]+', ' '.join(tokens).lower()))
            signature = tuple(sorted(tuple(c) for c in palette))
            if signature in local_palettes or signature in seen_palettes or (split != 'train' and name in seen_names):
                continue
            local_palettes.add(signature)
            rows.append({'id': f'{split}:{index}', 'text': name, 'palette': palette, 'signature': signature})
        output[split] = rows
        audit[split] = {'original_rows': len(frame), 'retained_rows': len(rows), 'ids': [r['id'] for r in rows]}
        seen_palettes.update(local_palettes)
        seen_names.update(r['text'] for r in rows)
    return output, audit


class TokenSpace:
    def __init__(self, texts, dimensions=64):
        self.vectorizer = TfidfVectorizer(min_df=2, max_features=2000, stop_words='english')
        self.captions = self.vectorizer.fit_transform(texts)
        self.svd = TruncatedSVD(n_components=min(dimensions, self.captions.shape[1] - 1), random_state=20261103)
        self.embeddings = self.svd.fit_transform(self.captions)
        binary = self.captions.copy()
        binary.data[:] = 1
        graph = (binary.T @ binary).tocsr()
        graph.setdiag(0)
        graph.eliminate_zeros()
        isolated = np.asarray(graph.sum(axis=1)).ravel() == 0
        graph = graph + sparse.diags(isolated.astype(float))
        self.graph = normalize(graph, norm='l1', axis=1)

    def transform(self, texts):
        return self.vectorizer.transform(texts)

    def diffuse(self, query, alpha, steps=40):
        if not 0 <= alpha < 1:
            raise ValueError('Diffusion alpha must be in [0, 1).')
        q = normalize(query, norm='l1', axis=1).toarray()
        p = q.copy()
        for _ in range(steps if alpha else 0):
            p = (1 - alpha) * q + alpha * (self.graph.T @ p.T).T
        return normalize(p, norm='l2', axis=1)

    def weighted_request(self, weights: Mapping[str, float]):
        if not isinstance(weights, Mapping) or not weights or len(weights) > 64:
            raise ValueError('Provide 1–64 token weights.')
        analyzer = self.vectorizer.build_analyzer()
        terms, values, unsupported = [], {}, []
        for token, weight in weights.items():
            if (not isinstance(token, str) or not token.strip() or isinstance(weight, bool)
                    or not isinstance(weight, (int, float)) or not math.isfinite(weight) or weight < 0):
                raise ValueError('Token names must be non-empty and weights finite and non-negative.')
            if not weight:
                continue
            words = analyzer(token)
            recognized = [w for w in words if w in self.vectorizer.vocabulary_]
            if not recognized or len(recognized) != len(words):
                unsupported.append(token)
            for word in recognized:
                col = self.vectorizer.vocabulary_[word]
                values[col] = values.get(col, 0) + weight * self.vectorizer.idf_[col]
                terms.append(word)
        if not values:
            return None, {'status': 'unsupported', 'unsupported_tokens': unsupported,
                          'recognized_terms': [], 'calibrated': False}
        query = sparse.csr_matrix(([v for v in values.values()], ([0] * len(values), list(values))),
                                  shape=(1, self.captions.shape[1]))
        return normalize(query), {'status': 'partial' if unsupported else 'covered',
                                  'unsupported_tokens': unsupported, 'recognized_terms': sorted(set(terms)),
                                  'calibrated': False}


def caption_retrieve(space, query, alpha=0, fallback_index=0):
    scores = np.asarray(space.diffuse(query, alpha) @ space.captions.T)
    indices = np.argmax(scores, axis=1)
    coverage = np.asarray(query.sum(axis=1)).ravel() > 0
    indices[~coverage] = fallback_index
    selected_scores = scores[np.arange(len(indices)), indices].astype(float)
    selected_scores[~coverage] = np.nan
    return indices, selected_scores


def assign_roles(rgb, theme):
    if theme not in ('light', 'dark'):
        raise ValueError('theme must be light or dark.')
    colors = ['#%02X%02X%02X' % tuple(int(v) for v in color) for color in rgb]
    labs = rgb_to_lab_batch(np.asarray(rgb))
    order = np.lexsort((labs[:, 2], labs[:, 1], labs[:, 0]))
    canvas, surface, body = (order[-1], order[-2], order[0]) if theme == 'light' else (order[0], order[1], order[-1])
    remaining = [i for i in order if i not in (canvas, surface, body)]
    remaining.sort(key=lambda i: -float(np.linalg.norm(labs[i, 1:])))
    return dict(zip(('canvas', 'surface', 'body', 'brand', 'accent'),
                    (colors[canvas], colors[surface], colors[body], colors[remaining[0]], colors[remaining[1]])))


def audit_roles(roles):
    audits = []
    for name, fg, bg, target, lc_target in [
        ('body_on_canvas', roles['body'], roles['canvas'], 4.5, 90),
        ('body_on_surface', roles['body'], roles['surface'], 4.5, 90),
        ('brand_on_canvas', roles['brand'], roles['canvas'], 3, 0),
        ('accent_on_canvas', roles['accent'], roles['canvas'], 3, 0),
    ]:
        m = contrast_measurements(fg, bg)
        audits.append({'usage': name, **m, 'required_wcag': target, 'required_apca_lc': lc_target,
                       'passes': m['wcag_contrast_ratio'] >= target and abs(m['apca_lc']) >= lc_target})
    label = max(('#000000', '#FFFFFF'), key=lambda c: wcag_contrast_ratio(hex_to_rgb(c), hex_to_rgb(roles['brand'])))
    m = contrast_measurements(label, roles['brand'])
    audits.append({'usage': 'button_label_on_brand', **m, 'required_wcag': 4.5, 'required_apca_lc': 0,
                   'passes': m['wcag_contrast_ratio'] >= 4.5})
    return audits, label


def constrain_palette(rgb, theme):
    before = assign_roles(rgb, theme)
    roles = before.copy()
    for role, bound in [('canvas', .97 if theme == 'light' else .20),
                        ('surface', .92 if theme == 'light' else .30)]:
        L, C, h = hex_to_oklch(roles[role])
        roles[role] = oklch_to_srgb_hex(max(L, bound) if theme == 'light' else min(L, bound), C, h)
    for role, backgrounds, target, apca in [
        ('body', [roles['canvas'], roles['surface']], 4.5, 90),
        ('brand', [roles['canvas']], 3, 0),
        ('accent', [roles['canvas']], 3, 0),
    ]:
        if all(wcag_contrast_ratio(hex_to_rgb(roles[role]), hex_to_rgb(bg)) >= target
               and abs(contrast_measurements(roles[role], bg)['apca_lc']) >= apca for bg in backgrounds):
            continue
        proposal = propose_foreground(roles[role], backgrounds, target, apca)
        if proposal is not None:
            roles[role] = proposal['foreground']
    audits, button_label = audit_roles(roles)
    after_rgb = np.asarray([hex_to_rgb(color) for color in roles.values()], dtype=np.uint8)
    before_rgb = np.asarray([hex_to_rgb(color) for color in before.values()], dtype=np.uint8)
    movement = np.linalg.norm(rgb_to_lab_batch(before_rgb) - rgb_to_lab_batch(after_rgb), axis=1) * 100
    return {'status': 'verified_declared_usages' if all(a['passes'] for a in audits) else 'infeasible',
            'theme': theme, 'roles': roles, 'button_label': button_label, 'audits': audits,
            'changes': [{'role': role, 'before': before[role], 'after': color, 'delta_e_ok_x100': float(delta)}
                        for (role, color), delta in zip(roles.items(), movement) if before[role] != color],
            'mean_role_movement_oklab_x100': float(movement.mean()),
            'palette_rgb': after_rgb.tolist(),
            'scope': 'Five declared solid-sRGB usages; body text 16px/400, APCA Lc90; no full-page conformance claim.'}
