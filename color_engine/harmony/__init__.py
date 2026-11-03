"""
Harmony Evaluation Package
==========================
Matsuda (1995) geometric templates, Cohen-Or (2006) optimization,
and Ou-Luo (2006) empirical psychophysical harmony models.
"""

from .matsuda import (
    MATSUDA_SECTORS,
    circular_dist_deg,
    distance_to_template_sectors,
    cohen_or_disharmony_energy,
    fit_best_matsuda_template,
)
from .ou_luo import (
    ou_luo_two_color_harmony,
    compute_palette_ou_luo_harmony,
)

__all__ = [
    "MATSUDA_SECTORS",
    "circular_dist_deg",
    "distance_to_template_sectors",
    "cohen_or_disharmony_energy",
    "fit_best_matsuda_template",
    "ou_luo_two_color_harmony",
    "compute_palette_ou_luo_harmony",
]
