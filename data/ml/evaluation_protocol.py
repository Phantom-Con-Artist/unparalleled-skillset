"""Evaluation helpers without training side effects.

Weak-label agreement is separate from independent assessment of design quality.
"""
import numpy as np
from sklearn.model_selection import GroupShuffleSplit


def split_color_groups(hex_codes, random_state=42):
    """Keep identical sRGB colors in one split (approximately 70/15/15 by group)."""
    from color_engine.accessibility.guidance import canonical_hex
    groups = np.array([canonical_hex(code) for code in hex_codes])
    if len(set(groups)) < 10:
        raise ValueError('At least 10 distinct colors are required for grouped evaluation.')
    indices = np.arange(len(groups))
    split = GroupShuffleSplit(n_splits=1, test_size=.15, random_state=random_state)
    train_val, test = next(split.split(indices, groups=groups))
    split_val = GroupShuffleSplit(n_splits=1, test_size=.15 / .85, random_state=random_state)
    train_local, val_local = next(split_val.split(train_val, groups=groups[train_val]))
    return train_val[train_local], train_val[val_local], test


def normalize_embeddings(raw_similarities, train_indices):
    """Fit percentile bounds only on training colors, then transform all splits."""
    raw = np.asarray(raw_similarities)
    if raw.ndim != 2 or not np.isfinite(raw).all() or len(train_indices) == 0:
        raise ValueError('Expected a finite 2D matrix and non-empty training indices.')
    low = np.percentile(raw[train_indices], 5, axis=0)
    high = np.percentile(raw[train_indices], 95, axis=0)
    normalized = np.clip((raw - low) / (high - low + 1e-6), 0, 1)
    return normalized, {'fit_split': 'train', 'percentile_5': low.tolist(), 'percentile_95': high.tolist()}


def protocol_metadata(normalization):
    return {'label_source': 'programmatic_weak_supervision',
            'independent_human_evaluation': False,
            'split_unit': 'canonical_srgb_hex', 'normalization': normalization,
            'probabilities_calibrated': False,
            'historical_v1_comparable': False,
            'historical_comparison_reason': 'V1 used different labels, sample selection, and test colors.',
            'metric_scope': 'Agreement with generated labels, not human aesthetic quality.'}
