"""
Production Scientific Color Engine
==================================
Unified engine orchestrating perceptual color spaces, Matsuda harmonic templates,
Cohen-Or optimization, Ou-Luo psychophysics, APCA/WCAG accessibility,
deterministic token classification, and design system generators for AI agents.
"""

from typing import List, Dict, Any, Optional, Tuple, Union

from .spaces import (
    hex_to_rgb,
    rgb_to_oklab,
    oklab_to_oklch,
    rgb_to_cielab,
    delta_e_ok,
    delta_e_ciede2000,
    rgb_to_munsell,
)
from .harmony.matsuda import (
    fit_best_matsuda_template,
    distance_to_template_sectors,
    circular_dist_deg,
)
from .harmony.ou_luo import compute_palette_ou_luo_harmony
from .psychology.emotions import ou_color_emotions
from .psychology.tokens import evaluate_aesthetic_tokens
from .accessibility.wcag import wcag_contrast_ratio
from .accessibility.apca import apca_contrast, apca_readability_tier, apca_font_guidance
from .accessibility.guidance import canonical_hex, audit_usages, propose_foreground
from .generators.harmonic import generate_harmonic_palette
from .generators.ramp import generate_tonal_ramp
from .generators.ui_system import generate_ui_design_system
from .generators.prng_mixer import mix_palette_by_token


class ScientificColorEngine:
    """Structured color measurements and explicitly labeled design heuristics for agents."""

    def __init__(self):
        pass

    def analyze_palette(self, hex_colors: List[str], usages: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Analyze an arbitrary multi-color palette (2 to 16 colors) and generate
        an exhaustive, deterministic scientific assessment in standard JSON format.
        """
        if not isinstance(hex_colors, (list, tuple)) or not 2 <= len(hex_colors) <= 16:
            raise ValueError("Palette must be a list of 2 to 16 hex colors.")
        hex_colors = [canonical_hex(color) for color in hex_colors]
        usage_audit = audit_usages(hex_colors, usages) if usages is not None else []

        # 1. Parse all colors into OKLab, OKLch, CIELAB, and Munsell
        parsed_colors: List[Dict[str, Any]] = []
        cielab_colors: List[Tuple[float, float, float, float, float]] = []
        ok_hues: List[float] = []
        ok_chromas: List[float] = []
        emotions_list: List[Dict[str, float]] = []

        for hex_code in hex_colors:
            rgb = hex_to_rgb(hex_code)
            L_ok, a_ok, b_ok = rgb_to_oklab(rgb)
            L_oklch, C_oklch, h_oklch = oklab_to_oklch(L_ok, a_ok, b_ok)

            cielab = rgb_to_cielab(rgb)
            cielab_colors.append(cielab)
            emo = ou_color_emotions(cielab)
            emotions_list.append(emo)

            ok_hues.append(h_oklch)
            ok_chromas.append(C_oklch)

            parsed_colors.append({
                "hex": hex_code.upper(),
                "rgb": list(rgb),
                "munsell_notation": rgb_to_munsell(rgb),
                "oklab": {"L": round(L_ok, 4), "a": round(a_ok, 4), "b": round(b_ok, 4)},
                "oklch": {"L": round(L_oklch, 4), "C": round(C_oklch, 4), "h": round(h_oklch, 2)},
                "cielab": {
                    "L_star": round(cielab[0], 2),
                    "a_star": round(cielab[1], 2),
                    "b_star": round(cielab[2], 2),
                    "C_star": round(cielab[3], 2),
                    "h_star": round(cielab[4], 2),
                },
                "psychological_affect": emo,
            })

        # 2. Matsuda & Cohen-Or Harmonic Optimization
        matsuda_result = fit_best_matsuda_template(ok_hues, ok_chromas)

        # 3. Empirical Ou-Luo Harmony Calculation
        ou_luo_score = compute_palette_ou_luo_harmony(cielab_colors)

        # 4. Average Palette Emotion Coordinates
        n = len(hex_colors)
        avg_emotions = {
            "warm_cool": round(sum(e["warm_cool"] for e in emotions_list) / n, 3),
            "heavy_light": round(sum(e["heavy_light"] for e in emotions_list) / n, 3),
            "active_passive": round(sum(e["active_passive"] for e in emotions_list) / n, 3),
        }

        # 5. Composite Normalized Harmony Score (0 - 100)
        norm_ou_luo = max(0.0, min(100.0, (ou_luo_score + 1.24) * (100.0 / 2.63)))
        composite_harmony_score = round(0.60 * matsuda_result["matsuda_harmony_score"] + 0.40 * norm_ou_luo, 1)

        # 6. Directed Accessibility Matrix (WCAG 2.2 & APCA 0.98G)
        accessibility_matrix = []
        wcag_aa_pairs = 0
        total_directed_pairs = n * (n - 1)

        for i in range(n):
            for j in range(n):
                if i == j:
                    continue
                fg = parsed_colors[i]
                bg = parsed_colors[j]

                cr = wcag_contrast_ratio(tuple(fg["rgb"]), tuple(bg["rgb"]))
                lc, polarity = apca_contrast(tuple(fg["rgb"]), tuple(bg["rgb"]))
                abs_lc = abs(lc)

                aa_normal = cr >= 4.5
                if aa_normal:
                    wcag_aa_pairs += 1

                accessibility_matrix.append({
                    "foreground_index": i,
                    "background_index": j,
                    "foreground_hex": fg["hex"],
                    "background_hex": bg["hex"],
                    "wcag_contrast_ratio": round(cr, 2),
                    "wcag_conformance": {
                        "AA_normal_text": aa_normal,
                        "AA_large_text": cr >= 3.0,
                        "AAA_normal_text": cr >= 7.0,
                        "non_text_ui_component": cr >= 3.0,
                    },
                    "apca_lightness_contrast_lc": lc,
                    "apca_polarity": polarity,
                    "apca_tier": apca_readability_tier(abs_lc),
                    "apca_font_guidance": apca_font_guidance(lc),
                    "delta_e_ok": round(delta_e_ok(
                        fg["oklab"]["L"], fg["oklab"]["a"], fg["oklab"]["b"],
                        bg["oklab"]["L"], bg["oklab"]["a"], bg["oklab"]["b"]
                    ), 4),
                    "delta_e_ciede2000": delta_e_ciede2000(
                        (fg["cielab"]["L_star"], fg["cielab"]["a_star"], fg["cielab"]["b_star"]),
                        (bg["cielab"]["L_star"], bg["cielab"]["a_star"], bg["cielab"]["b_star"]),
                    ),
                })

        # 7. Deterministic Aesthetic Token Classification
        aesthetic_tokens = evaluate_aesthetic_tokens(parsed_colors, matsuda_result, avg_emotions)
        qualifying_tokens = [k for k, v in aesthetic_tokens.items() if v["qualifies"]]
        qualifying_tokens.sort(key=lambda k: aesthetic_tokens[k]["score"], reverse=True)

        primary_token = qualifying_tokens[0] if qualifying_tokens else "Unclassified"

        # 8. Prescriptive Actionable Guidance for AI Agent
        agent_actions = []
        outlier_idx = matsuda_result["outlier_index"]

        if outlier_idx is not None:
            outlier_color = parsed_colors[outlier_idx]["hex"]
            outlier_hue = parsed_colors[outlier_idx]["oklch"]["h"]
            best_t = matsuda_result["best_template"]
            alpha = matsuda_result["best_orientation_deg"]
            _, target_boundary = distance_to_template_sectors(outlier_hue, best_t, alpha)
            shift_deg = round(circular_dist_deg(outlier_hue, target_boundary), 1)

            agent_actions.append({
                "issue": "Hue outside fitted template",
                "category": "harmony",
                "evidence_type": "theory_based_suggestion",
                "severity": "suggestion",
                "assumption": "The fitted OKLch hue template is an intended design constraint.",
                "target_color": outlier_color,
                "current_hue_deg": outlier_hue,
                "action": (
                    f"Color {outlier_color} is the primary dissonance outlier ({shift_deg}° away from "
                    f"nearest harmonic sector of {best_t}). Shift hue to {round(target_boundary, 1)}° "
                    f"or explore lower chroma. Re-analyze the result; template fit does not establish aesthetic quality."
                ),
            })

        if usages is None:
            failing_pairs = [pair for pair in accessibility_matrix if not pair["wcag_conformance"]["AA_normal_text"]]
            if failing_pairs:
                agent_actions.append({
                    "issue": "Candidate pair contrast limitations",
                    "category": "contrast", "evidence_type": "measured_constraint",
                    "severity": "info", "failing_pair_count": len(failing_pairs),
                    "action": "Some candidate pairs fail normal-text WCAG AA. Supply usages to audit intended pairings and receive verified foreground proposals.",
                    "examples": [{"foreground": pair["foreground_hex"], "background": pair["background_hex"],
                                  "wcag_contrast_ratio": pair["wcag_contrast_ratio"]} for pair in failing_pairs[:8]],
                })
        else:
            for audit in usage_audit:
                if audit["kind"] == "text" and audit["passes_apca_guidance"] is None:
                    agent_actions.append({
                        "issue": "Typography outside supported APCA guidance",
                        "category": "typography", "evidence_type": "assessment_limit",
                        "severity": "info", "role": audit["role"],
                        "action": "Use a supported reference-font size/weight combination or consult the full APCA lookup; no typography pass is inferred.",
                    })
                if audit["passes_wcag"] and audit["passes_apca_guidance"] is not False:
                    continue
                proposal = propose_foreground(audit["foreground"], [audit["background"]],
                                              audit["required_wcag_ratio"], audit["required_abs_apca_lc"] or 0)
                agent_actions.append({
                    "issue": "Declared usage contrast failure", "category": "contrast",
                    "evidence_type": "measured_constraint", "severity": "error" if not audit["passes_wcag"] else "recommendation",
                    "role": audit["role"], "target_color": audit["foreground"], "background": audit["background"],
                    "before": audit, "proposal": proposal,
                    "action": "Use the proposed foreground for this usage and re-audit the full theme." if proposal else
                              "No foreground meeting both requested targets was found. Change the background or typography and re-audit.",
                })

        # Assemble Final JSON Payload
        return {
            "schema_version": "0.2.0",
            "methods": {
                "contrast": {"wcag": "WCAG 2.2 relative luminance", "apca": "APCA-W3 0.0.98G-4g",
                             "apca_is_wcag_conformance": False},
                "harmony": {"method": "OKLch template fit and Ou-Luo 2006 pairwise mean",
                            "composite_weights": {"template_fit": 0.6, "ou_luo_normalized": 0.4},
                            "composite_is_validated_aesthetic_measure": False,
                            "source": "https://doi.org/10.1002/col.20208"},
                "aesthetic_classification": {"method": "heuristic_rules", "calibrated": False,
                                             "trained_model_used": False,
                                             "confidence_field": "Deprecated alias for score; not a probability."},
            },
            "limitations": [
                "Hue templates are adapted to OKLch; fit is not a universal measure of visual quality.",
                "The 60/40 composite and letter grades are project heuristics, not human preference probabilities.",
                "Ou-Luo models two-color harmony; averaging across a palette is a project adaptation.",
                "Aesthetic scores describe unweighted swatches and cannot infer canvas or accent roles.",
                "APCA font suggestions use a conservative subset of reference-font body guidance.",
                "Layout, transparency, color-vision deficiencies, and rendered typography are not evaluated.",
            ],
            "usage_audit": usage_audit,
            "summary": {
                "palette_size": n,
                "composite_harmony_score": composite_harmony_score,
                "harmony_grade": "A+" if composite_harmony_score >= 90 else (
                    "A" if composite_harmony_score >= 80 else (
                        "B" if composite_harmony_score >= 70 else (
                            "C" if composite_harmony_score >= 55 else "D"
                        )
                    )
                ),
                "primary_aesthetic_token": primary_token,
                "qualifying_tokens": qualifying_tokens,
                "best_matsuda_scheme": {
                    "template": matsuda_result["best_template"],
                    "optimal_rotation_deg": matsuda_result["best_orientation_deg"],
                    "adherence_score": matsuda_result["matsuda_harmony_score"],
                },
                "ou_luo_empirical_score": ou_luo_score,
                "color_emotion_vector": avg_emotions,
            },
            "aesthetic_tokens": aesthetic_tokens,
            "colors": parsed_colors,
            "accessibility_summary": {
                "scope": "candidate_pairs" if usages is None else "declared_usages",
                "declared_usages": len(usage_audit),
                "wcag_failing_usages": sum(not audit["passes_wcag"] for audit in usage_audit),
                "apca_failing_usages": sum(audit["passes_apca_guidance"] is False for audit in usage_audit),
                "apca_unassessed_text_usages": sum(audit["kind"] == "text" and audit["passes_apca_guidance"] is None for audit in usage_audit),
                "pair_pass_rate_is_usage_conformance": False,
                "total_directed_pairs": total_directed_pairs,
                "wcag_aa_passing_pairs": wcag_aa_pairs,
                "wcag_aa_pass_rate_pct": round((wcag_aa_pairs / total_directed_pairs) * 100.0, 1),
            },
            "accessibility_matrix": accessibility_matrix,
            "actionable_guidance_for_ai": agent_actions,
        }

    def generate_palette(
        self,
        seed_hex: str,
        scheme_type: str = "monochromatic"
    ) -> Dict[str, Any]:
        """
        Generate a mathematically harmonious, accessibility-tiered color palette
        from a single seed color using classical color theory and OKLch geometry.
        Automatically executes full scientific analysis on the generated palette.
        """
        return generate_harmonic_palette(
            seed_hex=seed_hex,
            scheme_type=scheme_type,
            analyze_func=self.analyze_palette,
        )

    def generate_tonal_ramp(
        self,
        seed_hex: str,
        step_count: int = 12
    ) -> List[Dict[str, Any]]:
        """
        Generate a standardized 12-step monotonic functional tonal ramp
        anchored in OKLch perceptual space (following Radix Colors & Tailwind CSS).
        Reports contrast against step 1 for each generated color.
        """
        return generate_tonal_ramp(seed_hex=seed_hex, step_count=step_count)

    def generate_ui_design_system(self, seed_hex: str) -> Dict[str, Any]:
        """
        Generate paired light and dark color tokens with audited intended pairings
        synthesized from a single brand seed color.
        
        Includes surfaces, borders, typography tiers, interactive actions, and semantic status tokens.
        Reports WCAG and APCA measurements for documented text and surface pairings.
        """
        return generate_ui_design_system(seed_hex=seed_hex)

    def mix_palette_by_token(
        self,
        token: str,
        seed: Union[int, str] = 42,
        palette_size: int = 5,
        variance: float = 0.12,
        version: str = "v2",
        theme: str = "auto",
    ) -> Dict[str, Any]:
        """
        Deterministically synthesize a palette from an aesthetic token (Luxury, Modern,
        Cyberpunk, Earthy, Corporate, etc.) over an arbitrary PRNG seed.
        
        Suggests area proportions from role weights and chroma; these are layout
        heuristics, not enforcement of a physical area-balance law.
        Supports version='v1' (baseline) or version='v2' (weak supervision + MMR diverse exemplars).
        Directly executes full scientific analysis on the generated palette.
        """
        return mix_palette_by_token(
            token=token,
            seed=seed,
            palette_size=palette_size,
            variance=variance,
            version=version,
            analyze_func=self.analyze_palette,
            theme=theme,
        )
