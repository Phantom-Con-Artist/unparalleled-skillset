"""
Harmonic Palette Generators
===========================
Generates classical and modern harmonic schemes anchored in OKLch perceptual space:
- Monochromatic (Moon & Spencer identity zone, Matsuda Type i)
- Analogous (Moon & Spencer similarity zone ±30°, Matsuda Type V)
- Complementary (180° diametric axis, Matsuda Type I)
- Split-Complementary (+150° and +210°, Matsuda Type Y)
- Triadic (120° equilateral distribution on S^1)
- Tetradic Square (90° quadrangular distribution)
- Tetradic Rectangle (30° / 180° / 210°, Matsuda Type X)
- Compound (combination of analogous and complementary vectors)
"""

from typing import Dict, Any, Callable, Optional
from ..spaces import hex_to_oklch, oklch_to_srgb_hex


def generate_harmonic_palette(
    seed_hex: str,
    scheme_type: str = "monochromatic",
    analyze_func: Optional[Callable[[list], dict]] = None,
) -> Dict[str, Any]:
    """
    Generate a mathematically harmonious, accessibility-tiered color palette
    from a single seed color using classical color theory and OKLch geometry.
    Optionally calls an analysis callback to evaluate the palette scientifically.
    """
    seed_hex = seed_hex.strip().upper()
    L_seed, C_seed, h_seed = hex_to_oklch(seed_hex)
    st = scheme_type.strip().lower()

    if st in ("monochromatic", "mono"):
        roles_specs = [
            {
                "role": "canvas_surface",
                "L": 0.98,
                "C": min(C_seed * 0.08, 0.012),
                "h": h_seed,
                "rationale": "High-lightness low-chroma background surface ensuring maximum visual area stability."
            },
            {
                "role": "subtle_container",
                "L": 0.92,
                "C": min(C_seed * 0.22, 0.035),
                "h": h_seed,
                "rationale": "Secondary card surface and table header background."
            },
            {
                "role": "primary_brand",
                "L": max(0.45, min(0.65, L_seed)),
                "C": C_seed,
                "h": h_seed,
                "rationale": "Dominant action color calibrated for clickable buttons and brand anchors."
            },
            {
                "role": "deep_accent",
                "L": 0.32,
                "C": min(C_seed * 0.85, 0.15),
                "h": h_seed,
                "rationale": "Deep interactive hover state and prominent visual accents."
            },
            {
                "role": "on_surface_text",
                "L": 0.14,
                "C": min(C_seed * 0.25, 0.025),
                "h": h_seed,
                "rationale": "High-contrast body text guaranteeing APCA Lc >= 90 and WCAG CR >= 11:1."
            },
        ]
    elif st in ("analogous",):
        h_warm = (h_seed - 30.0) % 360.0
        h_cool = (h_seed + 30.0) % 360.0
        roles_specs = [
            {
                "role": "canvas_surface",
                "L": 0.98,
                "C": 0.012,
                "h": h_seed,
                "rationale": "Neutral canvas tinted faintly toward seed hue."
            },
            {
                "role": "primary_brand",
                "L": L_seed,
                "C": C_seed,
                "h": h_seed,
                "rationale": "Anchor brand hue in center of Moon & Spencer similarity zone."
            },
            {
                "role": "analogous_warm",
                "L": min(0.80, L_seed + 0.12),
                "C": 0.85 * C_seed,
                "h": h_warm,
                "rationale": "-30° analogous companion providing soft chromatic progression."
            },
            {
                "role": "analogous_cool",
                "L": max(0.35, L_seed - 0.12),
                "C": 0.85 * C_seed,
                "h": h_cool,
                "rationale": "+30° analogous companion for depth and shadow modeling."
            },
            {
                "role": "on_surface_text",
                "L": 0.14,
                "C": 0.025,
                "h": h_seed,
                "rationale": "Deep neutral text guaranteeing accessible legibility."
            },
        ]
    elif st in ("complementary", "comp"):
        h_comp = (h_seed + 180.0) % 360.0
        roles_specs = [
            {
                "role": "canvas_surface",
                "L": 0.98,
                "C": 0.012,
                "h": h_seed,
                "rationale": "Calm canvas background tinted to primary hue."
            },
            {
                "role": "primary_brand",
                "L": max(0.45, min(0.65, L_seed)),
                "C": C_seed,
                "h": h_seed,
                "rationale": "Primary brand anchor."
            },
            {
                "role": "complementary_accent",
                "L": 0.62,
                "C": min(max(C_seed, 0.12) * 1.05, 0.22),
                "h": h_comp,
                "rationale": "180° diametric opponent providing maximum chromatic pop for CTAs."
            },
            {
                "role": "on_surface_text",
                "L": 0.13,
                "C": 0.02,
                "h": h_comp,
                "rationale": "Deep complementary-tinted text grounding the layout."
            },
        ]
    elif st in ("split_complementary", "split"):
        h_s1 = (h_seed + 150.0) % 360.0
        h_s2 = (h_seed + 210.0) % 360.0
        roles_specs = [
            {
                "role": "canvas_surface",
                "L": 0.98,
                "C": 0.012,
                "h": h_seed,
                "rationale": "Primary tinted background canvas."
            },
            {
                "role": "primary_brand",
                "L": max(0.45, min(0.65, L_seed)),
                "C": C_seed,
                "h": h_seed,
                "rationale": "Primary brand anchor (Matsuda Type Y stem)."
            },
            {
                "role": "split_complement_1",
                "L": 0.60,
                "C": 0.80 * C_seed,
                "h": h_s1,
                "rationale": "First split complement (+150°) for vibrant secondary actions."
            },
            {
                "role": "split_complement_2",
                "L": 0.40,
                "C": 0.80 * C_seed,
                "h": h_s2,
                "rationale": "Second split complement (+210°) for tertiary badges and graphs."
            },
        ]
    elif st in ("triadic", "triad"):
        h_t1 = (h_seed + 120.0) % 360.0
        h_t2 = (h_seed + 240.0) % 360.0
        roles_specs = [
            {
                "role": "canvas_surface",
                "L": 0.98,
                "C": 0.012,
                "h": h_seed,
                "rationale": "Subtle neutral canvas."
            },
            {
                "role": "triadic_primary",
                "L": max(0.45, min(0.65, L_seed)),
                "C": C_seed,
                "h": h_seed,
                "rationale": "Primary anchor carrying 60% visual weight."
            },
            {
                "role": "triadic_secondary",
                "L": 0.65,
                "C": 0.85 * C_seed,
                "h": h_t1,
                "rationale": "+120° triadic companion carrying 30% visual weight."
            },
            {
                "role": "triadic_tertiary",
                "L": 0.45,
                "C": 0.85 * C_seed,
                "h": h_t2,
                "rationale": "+240° triadic companion carrying 10% visual weight."
            },
        ]
    elif st in ("tetradic_square", "square"):
        h_sq1 = (h_seed + 90.0) % 360.0
        h_sq2 = (h_seed + 180.0) % 360.0
        h_sq3 = (h_seed + 270.0) % 360.0
        roles_specs = [
            {
                "role": "tetrad_primary",
                "L": 0.52,
                "C": C_seed,
                "h": h_seed,
                "rationale": "Primary anchor hue."
            },
            {
                "role": "tetrad_secondary",
                "L": 0.70,
                "C": 0.75 * C_seed,
                "h": h_sq1,
                "rationale": "+90° square tetrad companion."
            },
            {
                "role": "tetrad_accent",
                "L": 0.42,
                "C": 0.90 * C_seed,
                "h": h_sq2,
                "rationale": "+180° diametric complement."
            },
            {
                "role": "tetrad_tint",
                "L": 0.85,
                "C": 0.40 * C_seed,
                "h": h_sq3,
                "rationale": "+270° pastel tint for soft badges."
            },
        ]
    elif st in ("tetradic_rectangle", "rectangle"):
        h_r1 = (h_seed + 30.0) % 360.0
        h_r2 = (h_seed + 180.0) % 360.0
        h_r3 = (h_seed + 210.0) % 360.0
        roles_specs = [
            {
                "role": "tetrad_primary",
                "L": 0.52,
                "C": C_seed,
                "h": h_seed,
                "rationale": "Primary brand anchor (Matsuda Type X sector 1)."
            },
            {
                "role": "tetrad_adjacent",
                "L": 0.70,
                "C": 0.75 * C_seed,
                "h": h_r1,
                "rationale": "+30° adjacent companion in sector 1."
            },
            {
                "role": "tetrad_complement",
                "L": 0.42,
                "C": 0.90 * C_seed,
                "h": h_r2,
                "rationale": "+180° diametric complement in sector 2."
            },
            {
                "role": "tetrad_adj_comp",
                "L": 0.85,
                "C": 0.40 * C_seed,
                "h": h_r3,
                "rationale": "+210° adjacent complement in sector 2."
            },
        ]
    elif st in ("compound",):
        h_c1 = (h_seed + 30.0) % 360.0
        h_c2 = (h_seed + 180.0) % 360.0
        h_c3 = (h_seed + 210.0) % 360.0
        roles_specs = [
            {
                "role": "compound_primary",
                "L": 0.52,
                "C": C_seed,
                "h": h_seed,
                "rationale": "Primary brand anchor."
            },
            {
                "role": "compound_analogous",
                "L": 0.68,
                "C": 0.80 * C_seed,
                "h": h_c1,
                "rationale": "+30° analogous vector."
            },
            {
                "role": "compound_complement",
                "L": 0.45,
                "C": 0.90 * C_seed,
                "h": h_c2,
                "rationale": "+180° complementary vector."
            },
            {
                "role": "compound_split_accent",
                "L": 0.88,
                "C": 0.35 * C_seed,
                "h": h_c3,
                "rationale": "+210° high-lightness accent tone."
            },
        ]
    else:
        raise ValueError(
            f"Unknown scheme_type '{scheme_type}'. Supported schemes: "
            "'monochromatic', 'analogous', 'complementary', 'split_complementary', "
            "'triadic', 'tetradic_square', 'tetradic_rectangle', 'compound'."
        )

    color_roles = []
    palette_hex = []
    for item in roles_specs:
        hx = oklch_to_srgb_hex(item["L"], item["C"], item["h"])
        palette_hex.append(hx)
        color_roles.append({
            "role": item["role"],
            "hex": hx,
            "target_oklch": {
                "L": round(item["L"], 4),
                "C": round(item["C"], 4),
                "h": round(item["h"], 2),
            },
            "rationale": item["rationale"],
        })

    result = {
        "seed_color": {
            "hex": seed_hex,
            "oklch": {"L": round(L_seed, 4), "C": round(C_seed, 4), "h": round(h_seed, 2)},
        },
        "scheme_type": scheme_type,
        "palette_hex": palette_hex,
        "color_roles": color_roles,
    }

    if analyze_func is not None:
        result["analysis"] = analyze_func(palette_hex)

    return result
