"""
Ou-Luo (2006) Empirical Color Harmony Model
===========================================
Quantitative formulation of human psychophysical color harmony from
Li-Chen Ou and M. Ronnier Luo (2006):
CH = H_C (chromatic effect) + H_L (lightness effect) + H_H (hue preference effect).
"""

import math
from typing import List, Tuple, Dict


def ou_luo_two_color_harmony(
    c1_cielab: Tuple[float, float, float, float, float],
    c2_cielab: Tuple[float, float, float, float, float]
) -> Dict[str, float]:
    """
    Calculate empirical two-color harmony using Li-Chen Ou and M. Ronnier Luo (2006) model:
    CH = H_C + H_L + H_H
    """
    L1, a1, b1, C1, h1 = c1_cielab
    L2, a2, b2, C2, h2 = c2_cielab

    # 1. Lightness Effect H_L = H_Lsum + H_deltaL
    L_sum = L1 + L2
    delta_L = abs(L1 - L2)
    H_Lsum = 0.28 + 0.54 * math.tanh(-3.88 + 0.029 * L_sum)
    H_deltaL = 0.14 + 0.15 * math.tanh(-2.00 + 0.200 * delta_L)
    H_L = H_Lsum + H_deltaL

    # 2. Chromatic Effect H_C
    delta_H_sq = max(0.0, (a1 - a2) ** 2 + (b1 - b2) ** 2 - (C1 - C2) ** 2)
    delta_H = math.sqrt(delta_H_sq)
    delta_C_star = abs(C1 - C2)
    delta_C = math.sqrt(delta_H ** 2 + (delta_C_star / 1.46) ** 2)
    H_C = 0.04 + 0.53 * math.tanh(0.80 - 0.045 * delta_C)

    # 3. Hue effect, equations 7-10 of doi:10.1002/col.20208.
    # The chroma factor suppresses hue preference near the neutral axis.
    def hue_effect(h: float, L: float, C: float) -> float:
        h = h % 360.0
        E_C = 0.5 + 0.5 * math.tanh(-2.0 + 0.5 * C)
        H_S = -0.08 - 0.14 * math.sin(math.radians(h + 50.0)) - 0.07 * math.sin(math.radians(2.0 * h + 90.0))
        z = (90.0 - h) / 10.0
        E_Y = ((0.22 * L - 12.8) / 10.0) * math.exp(z - math.exp(z))
        return E_C * (H_S + E_Y)

    H_H = hue_effect(h1, L1, C1) + hue_effect(h2, L2, C2)

    CH = H_C + H_L + H_H
    return {
        "CH": round(CH, 3),
        "H_L": round(H_L, 3),
        "H_C": round(H_C, 3),
        "H_H": round(H_H, 3),
    }


def compute_palette_ou_luo_harmony(cielab_colors: List[Tuple[float, float, float, float, float]]) -> float:
    """Compute mean Ou-Luo harmony across all pairwise combinations."""
    n = len(cielab_colors)
    if n < 2:
        return 1.0
    total_ch = 0.0
    pair_count = 0
    for i in range(n):
        for j in range(i + 1, n):
            score = ou_luo_two_color_harmony(cielab_colors[i], cielab_colors[j])
            total_ch += score["CH"]
            pair_count += 1
    return round(total_ch / pair_count, 3)
