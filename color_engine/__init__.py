"""
Scientific Color Engine for AI Agents
====================================
Perceptually uniform color metrics, Matsuda harmonic templates, Cohen-Or optimization,
Ou-Luo empirical harmony, Ou emotion models, WCAG 2.2 / APCA accessibility matrices,
deterministic aesthetic token classification, and modern UI design system generators.

Empowered by Colour-Science and OKLch perceptual space.
"""

from .engine import ScientificColorEngine

from .spaces import (
    M1_SRGB_TO_LMS,
    M2_LMS_TO_OKLAB,
    M2_INV,
    M1_INV,
    hex_to_rgb,
    rgb_to_hex,
    srgb_to_linear,
    linear_to_srgb,
    rgb_to_oklab,
    oklab_to_oklch,
    hex_to_oklch,
    oklch_to_oklab,
    oklab_to_linear_srgb,
    is_in_srgb_gamut,
    oklch_to_srgb_hex,
    delta_e_ok,
    delta_e_ciede2000,
    rgb_to_cielab,
    rgb_to_munsell,
)

from .harmony.matsuda import (
    MATSUDA_SECTORS,
    circular_dist_deg,
    distance_to_template_sectors,
    cohen_or_disharmony_energy,
    fit_best_matsuda_template,
)

from .harmony.ou_luo import (
    ou_luo_two_color_harmony,
    compute_palette_ou_luo_harmony,
)

from .psychology.emotions import (
    ou_color_emotions,
)

from .psychology.tokens import (
    evaluate_aesthetic_tokens,
)

from .accessibility.wcag import (
    wcag_relative_luminance,
    wcag_contrast_ratio,
)

from .accessibility.apca import (
    apca_srgb_y,
    apca_contrast,
    apca_readability_tier,
)

from .generators.harmonic import (
    generate_harmonic_palette,
)

from .generators.ramp import (
    generate_tonal_ramp,
)

from .generators.ui_system import (
    generate_ui_design_system,
)

from .generators.prng_mixer import (
    mix_palette_by_token,
    seed_to_int,
)

__all__ = [
    # Main Engine
    "ScientificColorEngine",
    # Spaces & Gamut
    "M1_SRGB_TO_LMS",
    "M2_LMS_TO_OKLAB",
    "M2_INV",
    "M1_INV",
    "hex_to_rgb",
    "rgb_to_hex",
    "srgb_to_linear",
    "linear_to_srgb",
    "rgb_to_oklab",
    "oklab_to_oklch",
    "hex_to_oklch",
    "oklch_to_oklab",
    "oklab_to_linear_srgb",
    "is_in_srgb_gamut",
    "oklch_to_srgb_hex",
    "delta_e_ok",
    "delta_e_ciede2000",
    "rgb_to_cielab",
    "rgb_to_munsell",
    # Harmony
    "MATSUDA_SECTORS",
    "circular_dist_deg",
    "distance_to_template_sectors",
    "cohen_or_disharmony_energy",
    "fit_best_matsuda_template",
    "ou_luo_two_color_harmony",
    "compute_palette_ou_luo_harmony",
    # Psychology & Tokens
    "ou_color_emotions",
    "evaluate_aesthetic_tokens",
    # Accessibility
    "wcag_relative_luminance",
    "wcag_contrast_ratio",
    "apca_srgb_y",
    "apca_contrast",
    "apca_readability_tier",
    # Generators
    "generate_harmonic_palette",
    "generate_tonal_ramp",
    "generate_ui_design_system",
]
