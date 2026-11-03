"""
12-Step Perceptually Uniform Tonal Ramp Generator
=================================================
Synthesizes a 12-step monotonic functional ramp anchored in OKLch Lightness (L).
Directly models modern design system scales (Radix Colors, Tailwind CSS)
and reports contrast against the step 1 canvas background.
"""

from typing import List, Dict, Any
from ..spaces import hex_to_rgb, hex_to_oklch, oklch_to_srgb_hex
from ..accessibility.wcag import wcag_contrast_ratio
from ..accessibility.guidance import canonical_hex
from ..accessibility.apca import apca_contrast, apca_readability_tier


def generate_tonal_ramp(
    seed_hex: str,
    step_count: int = 12
) -> List[Dict[str, Any]]:
    """
    Generate a standardized 12-step monotonic functional tonal ramp
    anchored in OKLch perceptual space (following Radix Colors & Tailwind CSS).
    Reports measured contrast for each emitted color against step 1.
    """
    if type(step_count) is not int or step_count != 12:
        raise ValueError("Only the 12-step functional ramp is supported; step_count must be 12.")
    seed_hex = canonical_hex(seed_hex)
    L_seed, C_seed, h_seed = hex_to_oklch(seed_hex)

    # Standard 12-step functional specifications: (step, target_L, chroma_factor, max_chroma, role)
    ramp_specs = [
        (1, 0.99, 0.05, 0.010, "App Canvas / Background"),
        (2, 0.96, 0.10, 0.020, "Subtle / Secondary Card Surface"),
        (3, 0.91, 0.20, 0.040, "Hovered Card / Active Container"),
        (4, 0.83, 0.35, 0.070, "Subtle Border / Table Divider"),
        (5, 0.73, 0.55, 0.100, "Border candidate; check measured contrast for intended use"),
        (6, 0.62, 0.75, 0.140, "Focus Ring / High-Visibility Border"),
        (7, 0.52, 0.90, 0.180, "Interactive Surface / Default Button Fill"),
        (8, 0.42, 1.00, 0.220, "Active Button / Pressed State"),
        (9, 0.35, 1.00, 0.250, "Solid Brand Accent / Primary Graphic"),
        (10, 0.25, 0.75, 0.120, "Secondary Text / Caption (APCA Lc >= 60)"),
        (11, 0.15, 0.40, 0.060, "Primary Body Copy (APCA Lc >= 90, WCAG >= 7:1)"),
        (12, 0.08, 0.15, 0.025, "High-Contrast Heading / Display Text"),
    ]

    # Calculate step 1 first to use as canvas background reference
    step1_target_L, step1_factor, step1_max_c, _ = ramp_specs[0][1:]
    step1_c = min(C_seed * step1_factor, step1_max_c)
    canvas_hex = oklch_to_srgb_hex(step1_target_L, step1_c, h_seed)
    canvas_rgb = hex_to_rgb(canvas_hex)

    ramp = []
    for step_idx, target_L, factor, max_c, role in ramp_specs:
        target_C = min(C_seed * factor, max_c)
        step_hex = oklch_to_srgb_hex(target_L, target_C, h_seed)
        step_rgb = hex_to_rgb(step_hex)

        cr_vs_canvas = wcag_contrast_ratio(step_rgb, canvas_rgb)
        lc_vs_canvas, polarity = apca_contrast(step_rgb, canvas_rgb)

        ramp.append({
            "step": step_idx,
            "hex": step_hex,
            "target_oklch": {
                "L": round(target_L, 4),
                "C": round(target_C, 4),
                "h": round(h_seed, 2),
            },
            "functional_role": role,
            "contrast_vs_step1_canvas": {
                "wcag_ratio": round(cr_vs_canvas, 2),
                "passes_wcag_aa_text": cr_vs_canvas >= 4.5,
                "apca_lc": lc_vs_canvas,
                "apca_polarity": polarity,
                "apca_tier": apca_readability_tier(abs(lc_vs_canvas)),
            },
        })

    return ramp
