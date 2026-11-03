"""Offline linear semantic inference with explicit, provisional vocabulary mappings."""
from collections import Counter
from importlib.resources import files
import difflib
import json
import math
import re
import numpy as np
from .spaces import (M1_SRGB_TO_LMS, M2_LMS_TO_OKLAB, hex_to_rgb,
                     oklab_to_oklch, oklch_to_srgb_hex)


def normalize(text):
    return ' '.join(re.findall(r'[a-z0-9]+', text.lower()))


class SemanticModel:
    def __init__(self):
        resources = files('color_engine').joinpath('resources')
        self.ontology = json.loads(resources.joinpath('semantic_vocabulary.json').read_text())
        self.manifest = json.loads(resources.joinpath('linear_manifest.json').read_text())
        with resources.joinpath('linear_model.npz').open('rb') as stream:
            with np.load(stream, allow_pickle=False) as arrays:
                self.arrays = {key: arrays[key].copy() for key in arrays.files}
        self.terms = {item['term']: item for item in self.ontology['terms']}
        self.aliases = {normalize(alias): row['term'] for row in self.terms.values()
                        for alias in [row['term'], *row['aliases']]}
        self.vocabulary = self.manifest['vocabulary']
        self.stops = set(self.manifest['stop_words'])
        self.concepts = np.stack([self.vectorize(row['descriptor'])[0] @ self.arrays['components'].T
                                  for row in self.terms.values()])
        self.concepts /= np.maximum(np.linalg.norm(self.concepts, axis=1, keepdims=True), 1e-15)

    def vectorize(self, text):
        counts = Counter(word for word in re.findall(r'(?u)\b\w\w+\b', text.lower()) if word not in self.stops)
        q = np.zeros(len(self.vocabulary))
        unknown = []
        for word, count in counts.items():
            if word in self.vocabulary:
                index = self.vocabulary[word]
                q[index] = count * self.arrays['idf'][index]
            else:
                unknown.append(word)
        norm = np.linalg.norm(q)
        return (q / norm if norm else q), sorted(unknown)

    def resolve(self, tokens=None, brief=None):
        if tokens is not None and (not isinstance(tokens, dict) or not 1 <= len(tokens) <= 64):
            raise ValueError('tokens must contain 1–64 term weights.')
        if brief is not None and (not isinstance(brief, str) or not 1 <= len(brief) <= 4000):
            raise ValueError('brief must contain 1–4000 characters.')
        if not tokens and not brief:
            raise ValueError('Provide tokens or a brief.')
        weights, excluded, unknown = {}, [], []
        if brief:
            text = normalize(brief)
            # Longest spans win; local negation is intentionally conservative.
            occupied = set()
            for alias in sorted(self.aliases, key=lambda a: (-len(a.split()), -len(a), a)):
                for match in re.finditer(r'(?<!\w)' + re.escape(alias) + r'(?!\w)', text):
                    span = set(range(match.start(), match.end()))
                    if span & occupied:
                        continue
                    occupied |= span
                    term = self.aliases[alias]
                    prefix = text[:match.start()].split()[-2:]
                    if any(w in ('no', 'not', 'avoid', 'without') for w in prefix):
                        excluded.append(term)
                    else:
                        weights[term] = weights.get(term, 0) + 1
        for name, value in (tokens or {}).items():
            if (not isinstance(name, str) or not 1 <= len(name) <= 100 or isinstance(value, bool)
                    or not isinstance(value, (int, float)) or not math.isfinite(value) or not 0 <= value <= 100):
                raise ValueError('Weights must be finite numbers in [0,100]; term names must have 1–100 characters.')
            if not value:
                continue
            term = self.aliases.get(normalize(name))
            if term is None:
                unknown.append({'term': name, 'suggestions': difflib.get_close_matches(normalize(name), self.aliases, n=3)})
            else:
                weights[term] = weights.get(term, 0) + value
        for term in excluded:
            weights.pop(term, None)
        if not weights:
            raise ValueError('No supported positive aesthetic terms. Consult the vocabulary; unknown terms are not silently invented.')
        q = np.zeros(len(self.vocabulary))
        mappings = []
        for term, weight in weights.items():
            row = self.terms[term]
            vec, missing = self.vectorize(row['descriptor'])
            q += weight * vec
            mappings.append({'term': term, 'weight': weight, 'descriptor': row['descriptor'],
                             'evidence': row['evidence'], 'missing_training_words': missing,
                             'limitation': row['limitation']})
        q /= max(np.linalg.norm(q), 1e-15)
        return q, {'terms': weights, 'excluded_terms': sorted(set(excluded)), 'unknown_terms': unknown,
                   'mappings': mappings, 'brief_parser': 'longest phrase with local negation; not a language model',
                   'human_validated': False}

    def predict_raw(self, query):
        lab = (query @ self.arrays['generator_weights'] + self.arrays['generator_bias']).reshape(5, 3)
        return [oklch_to_srgb_hex(*oklab_to_oklch(*color)) for color in lab]

    @staticmethod
    def features(colors):
        # Resampling is explicit for inputs other than the five-color training representation.
        rgb = np.array([hex_to_rgb(c) for c in colors], dtype=float) / 255
        linear = np.where(rgb <= .04045, rgb / 12.92, ((rgb + .055) / 1.055) ** 2.4)
        lab = np.cbrt(linear @ np.asarray(M1_SRGB_TO_LMS).T) @ np.asarray(M2_LMS_TO_OKLAB).T
        lab = lab[np.lexsort((lab[:, 2], lab[:, 1], lab[:, 0]))]
        positions = np.linspace(0, len(lab) - 1, 5)
        lab = np.stack([np.interp(positions, np.arange(len(lab)), lab[:, i]) for i in range(3)], axis=1)
        chroma = np.linalg.norm(lab[:, 1:], axis=1)
        pairs = np.sort([np.linalg.norm(lab[i] - lab[j]) for i in range(5) for j in range(i)])
        return np.concatenate([lab.ravel(), lab.mean(0), lab.std(0), lab.min(0), lab.max(0),
                               [chroma.mean(), chroma.std(), chroma.max()], pairs])

    def embedding(self, colors):
        vector = self.features(colors) @ self.arrays['encoder_weights'] + self.arrays['encoder_bias']
        return vector / max(np.linalg.norm(vector), 1e-15)

    def analyze(self, colors, limit=10):
        scores = self.concepts @ self.embedding(colors)
        order = np.argsort(-scores, kind='stable')[:limit]
        names = list(self.terms)
        return {'matches': [{'term': names[i], 'similarity': float(scores[i])} for i in order],
                'score_method': 'cosine(linear palette encoder, descriptor SVD)', 'score_range': [-1, 1],
                'calibrated': False, 'human_aesthetic_verification': False,
                'limitations': ['Experimental inverse ridge; affinity is not aesthetic confidence or quality.',
                                'Palettes with other than five colors are lightness-sorted and interpolated to five.',
                                'Color cannot establish layout, material, culture, lighting or typography.']}
