"""
Deterministic Aesthetic Token Classification Engine
===================================================
Translates colorimetric distributions, harmonic templates, and affective dimensions
into human-comprehensible design tokens (Kobayashi Color Image Scale & modern design tokens)
without subjective human intervention.
"""

import math
from typing import List, Dict, Any


def evaluate_aesthetic_tokens(
    palette_data: List[Dict[str, Any]],
    matsuda_result: Dict[str, Any],
    avg_emotions: Dict[str, float]
) -> Dict[str, Dict[str, Any]]:
    """
    Deterministically map palette colorimetric properties to design tokens
    based on Kobayashi Color Image Scale and perceptual metrics.
    """
    n = len(palette_data)
    ok_lightness = [p["oklch"]["L"] for p in palette_data]
    ok_chromas = [p["oklch"]["C"] for p in palette_data]
    ok_hues = [p["oklch"]["h"] for p in palette_data]

    L_min, L_max = min(ok_lightness), max(ok_lightness)
    L_range = L_max - L_min
    L_mean = sum(ok_lightness) / n

    C_sorted = sorted(ok_chromas)
    C_median = C_sorted[n // 2]
    C_max = max(ok_chromas)
    C_mean = sum(ok_chromas) / n
    C_variance = sum((c - C_mean) ** 2 for c in ok_chromas) / n
    C_std = math.sqrt(C_variance)

    m_star = matsuda_result["best_template"]
    WC = avg_emotions["warm_cool"]
    HL = avg_emotions["heavy_light"]
    AP = avg_emotions["active_passive"]

    tokens: Dict[str, Dict[str, Any]] = {}

    # 1. LUXURY / HIGH-END
    # Criteria: Dark foundation or stark light, high contrast (L_range >= 0.70),
    # restrained base (C_median < 0.04), single refined chromatic accent (C_max >= 0.09),
    # tight harmony template (Type i, I, or L).
    lux_contrast_score = min(1.0, L_range / 0.75)
    lux_base_score = 1.0 if C_median < 0.04 else max(0.0, 1.0 - (C_median - 0.04) / 0.06)
    lux_accent_score = min(1.0, C_max / 0.12) if C_max >= 0.06 else 0.2
    lux_template_score = 1.0 if m_star in ["Type_i_Monochrome", "Type_I_Complementary", "Type_L_Adjacent"] else 0.5
    lux_dark_anchor = 1.0 if (L_min < 0.25 or L_max > 0.95) else 0.4
    lux_conf = (
        0.30 * lux_contrast_score +
        0.25 * lux_base_score +
        0.20 * lux_accent_score +
        0.15 * lux_template_score +
        0.10 * lux_dark_anchor
    )
    tokens["Luxury_HighEnd"] = {
        "confidence": round(lux_conf, 3),
        "qualifies": lux_conf >= 0.70,
        "justification": (
            f"High lightness dynamic range ({L_range:.2f}), subdued base chroma (median {C_median:.3f}) "
            f"paired with selective high-precision accent (max {C_max:.3f}) anchored in {m_star}."
        ),
    }

    # 2. MODERN / TECH
    # Criteria: Cool temperature bias (WC < -0.10), neutral slate/charcoal base,
    # electric saturated accent (C_max >= 0.12 with blue/cyan/indigo hue in 180-280 deg),
    # clean contrast (L_range >= 0.65).
    cool_score = min(1.0, max(0.0, -WC / 0.6))
    tech_accent_present = any(
        p["oklch"]["C"] >= 0.11 and (180.0 <= p["oklch"]["h"] <= 280.0)
        for p in palette_data
    )
    mod_accent_score = 1.0 if tech_accent_present else (min(1.0, C_max / 0.14) * 0.6)
    mod_contrast_score = min(1.0, L_range / 0.70)
    mod_conf = (
        0.35 * cool_score +
        0.35 * mod_accent_score +
        0.30 * mod_contrast_score
    )
    tokens["Modern_Tech"] = {
        "confidence": round(mod_conf, 3),
        "qualifies": mod_conf >= 0.68,
        "justification": (
            f"Cool color temperature bias (WC = {WC:.2f}), crisp contrast range ({L_range:.2f}), "
            f"and structured digital palette with electric accent presence={tech_accent_present}."
        ),
    }

    # 3. MINIMALIST
    # Criteria: Narrow harmonic structure (Type i Monochrome), low mean chroma (C_mean < 0.045),
    # low activity (AP < -0.20), low chroma variance.
    min_template_score = 1.0 if m_star == "Type_i_Monochrome" else (0.6 if m_star == "Type_V_Analogous" else 0.2)
    min_chroma_score = max(0.0, 1.0 - (C_mean / 0.055))
    min_ap_score = min(1.0, max(0.0, (-AP + 0.2) / 0.8))
    min_conf = (
        0.40 * min_chroma_score +
        0.35 * min_template_score +
        0.25 * min_ap_score
    )
    tokens["Minimalist"] = {
        "confidence": round(min_conf, 3),
        "qualifies": min_conf >= 0.70,
        "justification": (
            f"Controlled monochromatic/narrow palette ({m_star}), very low mean chroma ({C_mean:.3f}), "
            f"and quiet perceptual activity score (AP = {AP:.2f})."
        ),
    }

    # 4. PLAYFUL / VIBRANT
    # Criteria: High mean chroma (C_mean >= 0.10), high activity (AP > 0.30),
    # multi-hue distribution (Type V, Y, X), high lightness (L_mean > 0.55).
    play_chroma_score = min(1.0, C_mean / 0.13)
    play_activity_score = min(1.0, max(0.0, (AP + 0.2) / 0.8))
    play_template_score = 1.0 if m_star in ["Type_V_Analogous", "Type_Y_SplitComplementary", "Type_X_Tetradic"] else 0.4
    play_light_score = min(1.0, max(0.0, (L_mean - 0.40) / 0.35))
    play_conf = (
        0.35 * play_chroma_score +
        0.30 * play_activity_score +
        0.20 * play_template_score +
        0.15 * play_light_score
    )
    tokens["Playful_Vibrant"] = {
        "confidence": round(play_conf, 3),
        "qualifies": play_conf >= 0.68,
        "justification": (
            f"Vibrant chromatic presence (mean C = {C_mean:.3f}), high psychological activity (AP = {AP:.2f}), "
            f"and uplifting lightness balance (mean L = {L_mean:.2f})."
        ),
    }

    # 5. EARTHY / ORGANIC
    # Criteria: Warm-to-neutral hues in [30 deg, 150 deg] (terracotta, amber, olive, moss),
    # muted chroma (0.025 <= C_mean <= 0.095), balanced weight (-0.6 <= HL <= 0.8).
    earthy_hue_count = sum(1 for h in ok_hues if 30.0 <= h <= 150.0)
    earthy_hue_ratio = earthy_hue_count / n
    earthy_chroma_score = 1.0 if (0.025 <= C_mean <= 0.095) else max(0.0, 1.0 - abs(C_mean - 0.06) / 0.06)
    earthy_weight_score = 1.0 if (-0.6 <= HL <= 0.8) else 0.5
    earthy_conf = (
        0.45 * earthy_hue_ratio +
        0.35 * earthy_chroma_score +
        0.20 * earthy_weight_score
    )
    tokens["Earthy_Organic"] = {
        "confidence": round(earthy_conf, 3),
        "qualifies": earthy_conf >= 0.68,
        "justification": (
            f"{earthy_hue_ratio*100:.0f}% of hues reside in organic terracotta/olive spectrum (30°-150°), "
            f"natural restrained chroma ({C_mean:.3f}), and organic grounded weight."
        ),
    }

    # 6. CORPORATE / TRUSTWORTHY
    # Criteria: Cool blue/navy dominant (h in 210-260 deg), conservative chroma (0.03 <= C <= 0.12),
    # high contrast structure.
    corp_hue_count = sum(1 for h in ok_hues if 210.0 <= h <= 265.0)
    corp_hue_ratio = corp_hue_count / n
    corp_chroma_score = 1.0 if (0.02 <= C_mean <= 0.11) else 0.5
    corp_contrast_score = min(1.0, L_range / 0.65)
    corp_conf = (
        0.45 * corp_hue_ratio +
        0.30 * corp_chroma_score +
        0.25 * corp_contrast_score
    )
    tokens["Corporate_Trustworthy"] = {
        "confidence": round(corp_conf, 3),
        "qualifies": corp_conf >= 0.65,
        "justification": (
            f"Dominant blue/navy spectrum alignment ({corp_hue_ratio*100:.0f}%), conservative business chroma, "
            f"and dependable reading contrast."
        ),
    }

    # 7. CYBERPUNK / HIGH-VOLTAGE
    # Criteria: Deep black canvas (L_min < 0.20) + neon high-chroma (C_max >= 0.16),
    # high activity (AP > 0.65), stark complementary or tetradic contrast.
    cyber_dark_score = 1.0 if L_min < 0.20 else max(0.0, 1.0 - (L_min - 0.20) / 0.15)
    cyber_neon_score = min(1.0, max(0.0, (C_max - 0.10) / 0.10))
    cyber_activity_score = min(1.0, max(0.0, AP / 0.70))
    cyber_conf = (
        0.35 * cyber_dark_score +
        0.40 * cyber_neon_score +
        0.25 * cyber_activity_score
    )
    tokens["Cyberpunk_Neon"] = {
        "confidence": round(cyber_conf, 3),
        "qualifies": cyber_conf >= 0.70,
        "justification": (
            f"Stark dark canvas (L_min = {L_min:.2f}), hyper-saturated neon chromatic peak (C_max = {C_max:.3f}), "
            f"and high-voltage visual excitement (AP = {AP:.2f})."
        ),
    }

    return tokens
