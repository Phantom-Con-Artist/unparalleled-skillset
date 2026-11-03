"""
PRNG Seed-Based Token Palette Mixer
===================================
Deterministically synthesizes color palettes from aesthetic tokens (Luxury, Modern,
Minimalist, Cyberpunk, etc.) and suggests visual area mixing ratios
using explicit role weights and chroma damping (a layout heuristic).
"""

import os
import json
import hashlib
import math
import numpy as np
from typing import Dict, Any, List, Union, Optional, Callable
from ..spaces import oklch_to_srgb_hex, hex_to_oklch
from ..accessibility.guidance import propose_foreground

# Cache paths for curated token datasets (V1 baseline and V2 upgraded)
CURATED_DATASET_V1_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../resources/aesthetic_token_dataset.json")
)
CURATED_DATASET_V2_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../resources/aesthetic_token_dataset_v2.json")
)

_CURATED_DATA_CACHE: Dict[str, Dict[str, Any]] = {}


def load_curated_token_dataset(version: str = "v2") -> Dict[str, Any]:
    """
    Load and cache the curated aesthetic token dataset.
    Supports version='v1' (baseline) or version='v2' (upgraded with weak supervision & MMR).
    Missing versions raise an explicit error; versions are never silently substituted.
    """
    global _CURATED_DATA_CACHE
    if not isinstance(version, str) or version.lower().strip() not in ("v1", "v2"):
        raise ValueError("version must be 'v1' or 'v2'.")
    v_norm = version.lower().strip()
    if v_norm in _CURATED_DATA_CACHE:
        return _CURATED_DATA_CACHE[v_norm]
    target_path = CURATED_DATASET_V2_PATH if v_norm == "v2" else CURATED_DATASET_V1_PATH
    if not os.path.exists(target_path):
        raise FileNotFoundError(f"Requested curated dataset {v_norm} is missing: {target_path}")

    with open(target_path, "r", encoding="utf-8") as f:
        _CURATED_DATA_CACHE[v_norm] = json.load(f)
    return _CURATED_DATA_CACHE[v_norm]


def seed_to_int(seed: Union[int, str]) -> int:
    """Deterministically convert an arbitrary integer or string seed into a 64-bit unsigned integer."""
    if isinstance(seed, bool) or not isinstance(seed, (int, np.integer, str)):
        raise ValueError("seed must be an integer or string.")
    if isinstance(seed, (int, np.integer)):
        return int(seed) & 0xFFFFFFFFFFFFFFFF
    hash_bytes = hashlib.sha256(str(seed).encode("utf-8")).digest()
    return int.from_bytes(hash_bytes[:8], byteorder="big", signed=False)


def match_token_name(token_query: str, available_tokens: List[str]) -> str:
    """Resolve exact normalized names or an unambiguous leading token name."""
    if not isinstance(token_query, str) or not token_query.strip():
        raise ValueError("token must be a non-empty string.")
    q = token_query.strip().lower().replace("-", "_").replace(" ", "_")
    for token in available_tokens:
        if q == token.lower():
            return token
    candidates = [token for token in available_tokens if token.lower().startswith(q + "_")]
    if len(candidates) == 1:
        return candidates[0]
    raise ValueError(f"Unknown or ambiguous token {token_query!r}. Available tokens: {', '.join(available_tokens)}")



def mix_palette_by_token(
    token: str,
    seed: Union[int, str] = 42,
    palette_size: int = 5,
    variance: float = 0.12,
    version: str = "v2",
    analyze_func: Optional[Callable[[List[str]], Dict[str, Any]]] = None,
    theme: str = "auto",
) -> Dict[str, Any]:
    """
    Deterministically synthesize an aesthetic color palette and suggest visual
    area mixing ratios for an AI agent given an aesthetic token and a PRNG seed.

    Parameters:
      - token: Aesthetic concept (e.g. 'Luxury_HighEnd', 'Modern_Tech', 'Cyberpunk_Neon')
      - seed: Integer or string seed (e.g. 42, 'fintech-crypto-2026')
      - palette_size: Number of colors to generate (3 to 8, default 5)
      - variance: Sampling spread around the learned empirical distribution (default 0.12)
      - version: Dataset version ('v1' baseline or 'v2' with MMR exemplars)
      - theme: 'auto' selects dark for Cyberpunk_Neon and light otherwise; can be overridden
      - analyze_func: Optional callback (e.g. ScientificColorEngine.analyze_palette)
    """
    if type(palette_size) is not int or not 3 <= palette_size <= 8:
        raise ValueError("palette_size must be an integer from 3 to 8.")
    if isinstance(variance, bool) or not isinstance(variance, (int, float)) or not math.isfinite(variance) or not 0 <= variance <= 1:
        raise ValueError("variance must be finite and between 0 and 1.")
    if theme not in ("auto", "light", "dark"):
        raise ValueError("theme must be 'auto', 'light', or 'dark'.")
    dataset = load_curated_token_dataset(version=version)
    version = version.lower().strip()
    resolved_token = match_token_name(token, list(dataset.keys()))
    resolved_theme = ("dark" if resolved_token == "Cyberpunk_Neon" else "light") if theme == "auto" else theme
    token_profile = dataset[resolved_token]
    stats = token_profile["colorimetric_statistics"]

    seed_int = seed_to_int(seed)
    rng = np.random.default_rng(seed_int)

    # Base statistical parameters from the curated dataset
    L_med = stats["lightness"]["median"]
    L_std = max(0.04, stats["lightness"]["std"] * variance)
    C_med = stats["chroma"]["median"]
    C_p90 = stats["chroma"]["p90"]
    C_std = max(0.02, stats["chroma"]["std"] * variance)
    h_mean = stats["hue"]["circular_mean_deg"]

    # Structural role specifications for functional UI / Web systems
    # Role targets are design heuristics; text is audited after sampling.
    base_roles = [
        {
            "role": "canvas_surface",
            "base_L": 0.980,
            "L_jitter": 0.008,
            "base_C": 0.010,
            "C_jitter": 0.004,
            "hue_offset": 0.0,
            "rationale": "High-lightness low-chroma macro surface providing 60%+ canvas area."
        },
        {
            "role": "surface_container",
            "base_L": 0.930,
            "L_jitter": 0.015,
            "base_C": min(0.035, C_med * 0.25),
            "C_jitter": 0.008,
            "hue_offset": 0.0,
            "rationale": "Secondary card and modal container for visual elevation."
        },
        {
            "role": "brand_primary",
            "base_L": max(0.40, min(0.62, L_med)),
            "L_jitter": L_std,
            "base_C": max(0.10, min(0.24, C_med)),
            "C_jitter": C_std,
            "hue_offset": 0.0,
            "rationale": "Primary brand anchor directly sampled from token distribution."
        },
        {
            "role": "vibrant_accent",
            "base_L": max(0.45, min(0.70, L_med + 0.08)),
            "L_jitter": 0.025,
            "base_C": max(0.14, min(0.30, C_p90)),
            "C_jitter": 0.020,
            "hue_offset": 30.0 if "Analogous" in resolved_token else 180.0,
            "rationale": "High-chroma focal point for conversion actions and alerts."
        },
        {
            "role": "high_contrast_text",
            "base_L": 0.140,
            "L_jitter": 0.015,
            "base_C": 0.020,
            "C_jitter": 0.005,
            "hue_offset": 0.0,
            "rationale": "Text foreground verified against generated neutral surfaces."
        },
    ]

    if resolved_theme == "dark":
        base_roles[0].update(base_L=0.12, L_jitter=0.008)
        base_roles[1].update(base_L=0.17, L_jitter=0.008)
        base_roles[2].update(base_L=0.65)
        base_roles[3].update(base_L=0.72)
        base_roles[4].update(base_L=0.92, L_jitter=0.008)
        base_roles[0]["rationale"] = "Dark low-chroma canvas; suggested area uses role weights."

    extra = {"role": "secondary_accent", "base_L": 0.68 if resolved_theme == "dark" else 0.48,
             "L_jitter": 0.02, "base_C": max(0.08, min(0.20, C_med * 0.8)),
             "C_jitter": 0.015, "hue_offset": 120.0, "rationale": "Secondary category accent; audit intended use."}
    elevated = {"role": "surface_elevated", "base_L": 0.22 if resolved_theme == "dark" else 0.99,
                "L_jitter": 0.004, "base_C": 0.01, "C_jitter": 0.003,
                "hue_offset": 0.0, "rationale": "Additional neutral surface."}
    tertiary = {**extra, "role": "tertiary_accent", "hue_offset": 240.0}
    if palette_size == 3:
        roles_to_use = [base_roles[0], base_roles[2], base_roles[4]]
    elif palette_size == 4:
        roles_to_use = [base_roles[0], base_roles[2], base_roles[3], base_roles[4]]
    else:
        roles_to_use = base_roles + [extra, elevated, tertiary][:palette_size - 5]

    sampled_palette = []
    palette_hex = []
    inv_weights = []

    for r_spec in roles_to_use:
        # Sample L, C, h with PRNG gaussian perturbations
        L_samp = float(np.clip(r_spec["base_L"] + rng.normal(0.0, r_spec["L_jitter"]), 0.05, 0.99))
        C_samp = float(np.clip(r_spec["base_C"] + rng.normal(0.0, r_spec["C_jitter"]), 0.002, 0.32))
        h_samp = float((h_mean + r_spec["hue_offset"] + rng.normal(0.0, 8.0 * variance)) % 360.0)

        hex_code = oklch_to_srgb_hex(L_samp, C_samp, h_samp)
        actual_L, actual_C, actual_h = hex_to_oklch(hex_code)
        palette_hex.append(hex_code)

        sampled_palette.append({
            "role": r_spec["role"],
            "hex": hex_code,
            "oklch": {
                "L": round(actual_L, 6),
                "C": round(actual_C, 6),
                "h": round(actual_h, 4),
            },
            "rationale": r_spec["rationale"],
        })

        # Calculate a suggested area weight from role and emitted chroma.
        # Baseline role allocation (60-20-10-5 rule) modulated dynamically by chroma
        role_baseline_weights = {
            "canvas_surface": 60.0,
            "surface_container": 20.0,
            "brand_primary": 12.0,
            "secondary_accent": 6.0,
            "vibrant_accent": 4.0,
            "high_contrast_text": 4.0,
        }
        base_w = role_baseline_weights.get(r_spec["role"], 10.0)
        # Dynamic chromatic damping: higher chroma reduces surface area proportion
        dynamic_weight = base_w / (1.0 + 2.5 * actual_C)
        inv_weights.append(dynamic_weight)

    surface_colors = [item["hex"] for item in sampled_palette if item["role"].startswith(("canvas", "surface"))]
    text_item = next(item for item in sampled_palette if item["role"] == "high_contrast_text")
    proposal = propose_foreground(text_item["hex"], surface_colors)
    if proposal is None:
        raise RuntimeError("No text foreground meeting WCAG AA was found for generated surfaces.")
    text_item["hex"] = proposal["foreground"]
    L_text, C_text, h_text = hex_to_oklch(text_item["hex"])
    text_item["oklch"] = {"L": round(L_text, 6), "C": round(C_text, 6), "h": round(h_text, 4)}
    palette_hex = [item["hex"] for item in sampled_palette]
    # Recompute the text weight after any accessibility adjustment.
    text_index = sampled_palette.index(text_item)
    inv_weights[text_index] = 4.0 / (1.0 + 2.5 * C_text)

    # Normalize weights into exact visual area percentages summing to 1.0 (100%)
    total_w = sum(inv_weights)
    raw_percentages = [w / total_w for w in inv_weights]
    rounded_pcts = [round(p, 3) for p in raw_percentages]

    # Adjust rounding discrepancy on largest component
    diff = round(1.0 - sum(rounded_pcts), 3)
    rounded_pcts[0] = round(rounded_pcts[0] + diff, 3)

    for i, item in enumerate(sampled_palette):
        item["area_mixing_percentage"] = f"{rounded_pcts[i]*100:.1f}%"
        item["area_ratio"] = rounded_pcts[i]

    result = {
        "schema_version": "0.2.0",
        "theme": resolved_theme,
        "token": resolved_token,
        "seed": seed,
        "seed_hash": seed_int,
        "dataset_version": version,
        "palette_size": len(sampled_palette),
        "palette_hex": palette_hex,
        "palette_mix": sampled_palette,
        "area_balance_law": "Deprecated label: area allocation is a role/chroma heuristic, not enforcement of the Moon-Spencer equation.",
        "area_balance": {"method": "role_chroma_heuristic", "enforces_physical_law": False,
                         "scope": "Suggested proportions only; the consuming layout determines actual area."},
        "text_verification": proposal,
        "limitations": ["Aesthetic profiles are derived from weak labels, not independently verified preference ratings.",
                        "Token intent does not guarantee a matching palette-level classification.",
                        "Only text on generated neutral surfaces is verified; accents need declared usage audits."],
    }

    if analyze_func is not None:
        result["analysis"] = analyze_func(palette_hex)

    return result
