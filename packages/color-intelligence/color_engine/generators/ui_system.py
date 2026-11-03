"""
Complete Dual-Theme (Light + Dark Mode) UI Design System Generator
==================================================================
Generates theme tokens and audits documented foreground/background pairings.
"""

from typing import Dict, Any
from ..spaces import hex_to_rgb, hex_to_oklch, oklch_to_srgb_hex
from ..accessibility.wcag import wcag_contrast_ratio
from ..accessibility.apca import apca_contrast, apca_font_guidance
from ..accessibility.guidance import canonical_hex, propose_foreground, contrast_measurements


def generate_ui_design_system(seed_hex: str) -> Dict[str, Any]:
    """Generate paired themes with verified normal-text and component pairings.

    Semantic accents and decorative borders carry explicit usage constraints.
    APCA results report contrast and reference-font guidance, not certification.
    """
    seed_hex = canonical_hex(seed_hex)
    L_seed, C_seed, h_seed = hex_to_oklch(seed_hex)

    def build_theme(is_dark: bool) -> Dict[str, Any]:
        if not is_dark:
            # LIGHT THEME
            c_canvas = oklch_to_srgb_hex(0.985, min(C_seed * 0.06, 0.008), h_seed)
            c_surface = oklch_to_srgb_hex(0.950, min(C_seed * 0.10, 0.012), h_seed)
            c_elevated = "#FFFFFF"

            b_subtle = oklch_to_srgb_hex(0.890, min(C_seed * 0.15, 0.015), h_seed)
            b_strong = oklch_to_srgb_hex(0.650, min(C_seed * 0.25, 0.030), h_seed)

            t_primary = oklch_to_srgb_hex(0.140, min(C_seed * 0.20, 0.020), h_seed)
            t_secondary = oklch_to_srgb_hex(0.380, min(C_seed * 0.30, 0.030), h_seed)
            t_muted = oklch_to_srgb_hex(0.580, min(C_seed * 0.25, 0.030), h_seed)

            act_brand = oklch_to_srgb_hex(max(0.48, min(0.62, L_seed)), max(C_seed, 0.12), h_seed)
            act_hover = oklch_to_srgb_hex(max(0.40, min(0.54, L_seed - 0.08)), max(C_seed, 0.12), h_seed)

            # Semantic status tokens (Light mode)
            status_success = oklch_to_srgb_hex(0.550, 0.150, 142.0)
            status_warning = oklch_to_srgb_hex(0.650, 0.150, 75.0)
            status_error = oklch_to_srgb_hex(0.520, 0.180, 25.0)
            status_info = oklch_to_srgb_hex(0.580, 0.150, 240.0)
        else:
            # DARK THEME
            # Lightness elevation hierarchy for depth
            c_canvas = oklch_to_srgb_hex(0.120, min(C_seed * 0.10, 0.015), h_seed)
            c_surface = oklch_to_srgb_hex(0.170, min(C_seed * 0.12, 0.020), h_seed)
            c_elevated = oklch_to_srgb_hex(0.220, min(C_seed * 0.15, 0.025), h_seed)

            b_subtle = oklch_to_srgb_hex(0.280, min(C_seed * 0.18, 0.025), h_seed)
            b_strong = oklch_to_srgb_hex(0.480, min(C_seed * 0.22, 0.035), h_seed)

            # Anti-halation: cap primary text at L=0.92, never pure white
            t_primary = oklch_to_srgb_hex(0.920, min(C_seed * 0.10, 0.015), h_seed)
            t_secondary = oklch_to_srgb_hex(0.680, min(C_seed * 0.15, 0.025), h_seed)
            t_muted = oklch_to_srgb_hex(0.500, min(C_seed * 0.15, 0.025), h_seed)

            # Desaturate and elevate brand accent for dark mode
            act_brand = oklch_to_srgb_hex(max(0.60, min(0.72, L_seed + 0.10)), 0.82 * C_seed, h_seed)
            act_hover = oklch_to_srgb_hex(max(0.66, min(0.78, L_seed + 0.16)), 0.82 * C_seed, h_seed)

            # Semantic status tokens (Dark mode - higher lightness, slightly desaturated)
            status_success = oklch_to_srgb_hex(0.680, 0.140, 142.0)
            status_warning = oklch_to_srgb_hex(0.750, 0.140, 75.0)
            status_error = oklch_to_srgb_hex(0.650, 0.160, 25.0)
            status_info = oklch_to_srgb_hex(0.700, 0.140, 240.0)

        surfaces = {"canvas": c_canvas, "surface": c_surface, "elevated": c_elevated}
        typography = {"primary": t_primary, "secondary": t_secondary, "muted": t_muted}
        # Verify emitted hex values on every supported surface. A fixed L target
        # alone does not guarantee contrast after gamut mapping/quantization.
        for role, foreground in typography.items():
            if any(wcag_contrast_ratio(hex_to_rgb(foreground), hex_to_rgb(bg)) < 4.5 for bg in surfaces.values()):
                proposal = propose_foreground(foreground, list(surfaces.values()))
                if proposal is None:
                    raise RuntimeError(f"Could not produce accessible {role} text on theme surfaces.")
                typography[role] = proposal["foreground"]

        def button_text(background: str) -> str:
            return max(("#000000", "#FFFFFF"), key=lambda color:
                       wcag_contrast_ratio(hex_to_rgb(color), hex_to_rgb(background)))

        on_brand_text = button_text(act_brand)
        on_brand_hover_text = button_text(act_hover)
        borders = {"subtle": b_subtle, "strong": b_strong, "focus": act_brand}
        for role in ("strong", "focus"):
            if any(wcag_contrast_ratio(hex_to_rgb(borders[role]), hex_to_rgb(bg)) < 3 for bg in surfaces.values()):
                proposal = propose_foreground(borders[role], list(surfaces.values()), min_wcag=3)
                if proposal is None:
                    raise RuntimeError(f"Could not produce accessible {role} border.")
                borders[role] = proposal["foreground"]

        def audit(fg: str, bg: str, target: float = 4.5) -> Dict[str, Any]:
            metrics = contrast_measurements(fg, bg)
            return {**metrics, "wcag_cr": metrics["wcag_contrast_ratio"],
                    "required_wcag_ratio": target,
                    "passes_wcag_aa": metrics["wcag_contrast_ratio"] >= target,
                    "passes_wcag_aaa": metrics["wcag_contrast_ratio"] >= 7,
                    "passes_apca_body": abs(metrics["apca_lc"]) >= 75,
                    "passes_apca_content": abs(metrics["apca_lc"]) >= 60}

        verification = {
            f"{role}_text_on_{surface}": audit(fg, bg)
            for role, fg in typography.items() for surface, bg in surfaces.items()
        }
        # Retain existing names as aliases for integrations.
        verification["body_text_on_canvas"] = verification["primary_text_on_canvas"]
        verification["button_text_on_brand"] = audit(on_brand_text, act_brand)
        verification["button_text_on_brand_hover"] = audit(on_brand_hover_text, act_hover)
        for role in ("strong", "focus"):
            for surface, bg in surfaces.items():
                verification[f"{role}_border_on_{surface}"] = audit(borders[role], bg, target=3)

        return {
            "surfaces": surfaces,
            "borders": borders,
            "typography": typography,
            "actions": {"brand_base": act_brand, "brand_hover": act_hover,
                        "on_brand_text": on_brand_text, "on_brand_hover_text": on_brand_hover_text},
            "semantic_status": {"success": status_success, "warning": status_warning,
                                "error": status_error, "info": status_info},
            "accessibility_verification": verification,
            "usage_constraints": {
                "typography": "Normal-text WCAG AA verified on all listed surfaces. APCA guidance includes size and weight separately.",
                "borders.subtle": "Decorative separation only; do not use as the sole component boundary or focus indicator.",
                "borders.strong": "3:1 against listed surfaces; re-audit against other adjacent colors.",
                "borders.focus": "3:1 against listed surfaces; indicator geometry and contrast against controls require rendering review.",
                "actions": "Use the separate on_brand_text and on_brand_hover_text tokens for each state.",
                "semantic_status": "Accent colors, not approved text colors. Audit declared usage and include a non-color status cue.",
            },
        }

    return {
        "seed_color": {
            "hex": seed_hex,
            "oklch": {"L": round(L_seed, 4), "C": round(C_seed, 4), "h": round(h_seed, 2)},
        },
        "light_theme": build_theme(is_dark=False),
        "dark_theme": build_theme(is_dark=True),
        "schema_version": "0.2.0",
        "methods": {"generation": "OKLch role heuristics", "contrast": "WCAG 2.2 and APCA-W3 0.0.98G-4g"},
        "limitations": ["No rendered layout, font, transparency, or color-vision-deficiency simulation.",
                        "APCA body flags are contrast thresholds; font size and weight must also match the supplied guidance."],
        "ergonomic_principles_applied": [
            "Dark primary text starts at OKLch L=0.92 as a design preference, not a medical guarantee.",
            "Dark surfaces use increasing lightness for elevation.",
            "All three typography roles are checked on all three supported surfaces using emitted hex values.",
            "Area proportions depend on the consuming layout and are not enforced by token generation.",
        ],
    }
