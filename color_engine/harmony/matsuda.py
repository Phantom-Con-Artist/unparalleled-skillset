"""
Matsuda Harmonic Templates & Cohen-Or (2006) Energy Minimization
================================================================
Mathematical implementation of Yutaka Matsuda's 8 color harmony distributions
and Cohen-Or et al. (2006) optimization over radial sweeps on S^1.
"""

from typing import List, Dict, Tuple, Any
import math

# Template Sector Specifications from Cohen-Or et al. (2006) Appendix:
# Angles in degrees relative to template center 0 deg.
# Format: list of sectors, where each sector is (center_offset_deg, half_width_deg)
MATSUDA_SECTORS: Dict[str, List[Tuple[float, float]]] = {
    # Type i: single narrow sector w = 18 deg (half-width = 9 deg)
    "Type_i_Monochrome": [(0.0, 9.0)],

    # Type V: single wide sector w = 93.6 deg (half-width = 46.8 deg)
    "Type_V_Analogous": [(0.0, 46.8)],

    # Type L: two sectors: wide w=79.2 deg (half=39.6) and narrow w=18 deg (half=9), centers 90 deg apart
    "Type_L_Adjacent": [(0.0, 39.6), (90.0, 9.0)],

    # Type I: two narrow opposing sectors: w=18 deg each (half=9), centers 180 deg apart
    "Type_I_Complementary": [(0.0, 9.0), (180.0, 9.0)],

    # Type T: single broad sector spanning 180 deg (half-width = 90 deg)
    "Type_T_TriadDominant": [(0.0, 90.0)],

    # Type Y: wide sector w=93.6 deg (half=46.8) + narrow opposing w=18 deg (half=9), centers 180 deg apart
    "Type_Y_SplitComplementary": [(0.0, 46.8), (180.0, 9.0)],

    # Type X: two wide opposing sectors: w=93.6 deg each (half=46.8), centers 180 deg apart
    "Type_X_Tetradic": [(0.0, 46.8), (180.0, 46.8)],
}


def circular_dist_deg(deg1: float, deg2: float) -> float:
    """Shortest angular distance between two angles on the circle in degrees [0, 180]."""
    diff = abs((deg1 - deg2) % 360.0)
    return diff if diff <= 180.0 else 360.0 - diff


def distance_to_template_sectors(hue_deg: float, template_type: str, alpha_deg: float) -> Tuple[float, float]:
    """
    Compute the arc distance in degrees from hue_deg to the active sectors of
    template_type rotated by orientation alpha_deg.
    Returns: (distance_deg, closest_boundary_deg)
    If hue falls inside any sector, distance is 0.0.
    """
    sectors = MATSUDA_SECTORS[template_type]
    min_dist = 180.0
    best_boundary = hue_deg

    for center_offset, half_w in sectors:
        sector_center = (alpha_deg + center_offset) % 360.0
        center_dist = circular_dist_deg(hue_deg, sector_center)

        if center_dist <= half_w:
            # Inside the sector! Zero distance.
            return 0.0, hue_deg

        # Outside sector: distance is distance from sector boundary
        dist_to_boundary = center_dist - half_w
        if dist_to_boundary < min_dist:
            min_dist = dist_to_boundary
            # Determine which boundary was closer: clockwise or counterclockwise
            b1 = (sector_center - half_w) % 360.0
            b2 = (sector_center + half_w) % 360.0
            best_boundary = b1 if circular_dist_deg(hue_deg, b1) <= circular_dist_deg(hue_deg, b2) else b2

    return min_dist, best_boundary


def cohen_or_disharmony_energy(
    hues: List[float],
    chromas: List[float],
    template_type: str,
    alpha_deg: float
) -> float:
    """
    Compute Cohen-Or energy function F(X, (m, alpha)) = sum ||H(p) - E(p)|| * S(p).
    Measured in degree-chroma units.
    """
    total_energy = 0.0
    for h, c in zip(hues, chromas):
        # Disregard near-achromatic colors from hue penalties (Matsuda Type N)
        if c < 0.015:
            continue
        dist_deg, _ = distance_to_template_sectors(h, template_type, alpha_deg)
        total_energy += dist_deg * c
    return total_energy


def fit_best_matsuda_template(hues: List[float], chromas: List[float]) -> Dict[str, Any]:
    """
    Find globally optimal Matsuda template m* and orientation alpha* that minimizes
    the Cohen-Or disharmony cost. Evaluates all 7 chromatic templates across 360 degrees.
    """
    if not hues or len(hues) != len(chromas):
        raise ValueError("hues and chromas must be non-empty and have equal lengths.")
    if any(not math.isfinite(h) for h in hues) or any(not math.isfinite(c) or c < 0 for c in chromas):
        raise ValueError("Hues must be finite and chromas must be finite and non-negative.")
    active_chroma_sum = sum(c for c in chromas if c >= 0.015)
    if active_chroma_sum <= 1e-4:
        # All colors are achromatic (Grayscale palette -> Type N)
        return {
            "best_template": "Type_N_Neutral",
            "best_orientation_deg": 0.0,
            "disharmony_cost": 0.0,
            "matsuda_harmony_score": 100.0,
            "per_color_penalties": [0.0] * len(hues),
            "outlier_index": None,
            "template_rankings": {t: {"optimal_alpha_deg": 0.0, "disharmony_cost": 0.0,
                                      "harmony_score": 100.0} for t in MATSUDA_SECTORS},
        }

    best_global_template = "Type_i_Monochrome"
    best_global_alpha = 0.0
    best_global_cost = float('inf')
    template_rankings: Dict[str, Dict[str, float]] = {}

    for t_name in MATSUDA_SECTORS:
        best_t_alpha = 0.0
        best_t_cost = float('inf')

        # Radial sweep with 1-degree resolution
        for a_deg in range(360):
            cost = cohen_or_disharmony_energy(hues, chromas, t_name, float(a_deg))
            if cost < best_t_cost:
                best_t_cost = cost
                best_t_alpha = float(a_deg)

        # Normalize score for this template [0, 100]
        # Maximum possible disharmony is 180 deg * active_chroma_sum
        norm_t_score = max(0.0, 100.0 * (1.0 - (best_t_cost / (180.0 * active_chroma_sum))))
        template_rankings[t_name] = {
            "optimal_alpha_deg": best_t_alpha,
            "disharmony_cost": round(best_t_cost, 3),
            "harmony_score": round(norm_t_score, 1),
        }

        if best_t_cost < best_global_cost:
            best_global_cost = best_t_cost
            best_global_template = t_name
            best_global_alpha = best_t_alpha

    # Compute individual per-color penalties and isolate outlier
    per_color_penalties = []
    max_penalty = -1.0
    outlier_idx = None

    for idx, (h, c) in enumerate(zip(hues, chromas)):
        if c < 0.015:
            penalty = 0.0
        else:
            dist_deg, _ = distance_to_template_sectors(h, best_global_template, best_global_alpha)
            penalty = dist_deg * c
        per_color_penalties.append(round(penalty, 3))
        if penalty > max_penalty and penalty > 0.5:
            max_penalty = penalty
            outlier_idx = idx

    global_harmony_score = max(0.0, 100.0 * (1.0 - (best_global_cost / (180.0 * active_chroma_sum))))

    return {
        "best_template": best_global_template,
        "best_orientation_deg": round(best_global_alpha, 1),
        "disharmony_cost": round(best_global_cost, 3),
        "matsuda_harmony_score": round(global_harmony_score, 1),
        "per_color_penalties": per_color_penalties,
        "outlier_index": outlier_idx,
        "template_rankings": template_rankings,
    }
