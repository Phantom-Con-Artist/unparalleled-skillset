"""
Comprehensive Verification Test Suite for Scientific Color Engine
================================================================
Verifies:
1. Multi-color palette scientific analysis (Matsuda, Ou-Luo, Emotions, APCA/WCAG, Tokens)
2. Deterministic Harmonic Generators (Mono, Analogous, Comp, Split-Comp, Triad, Tetrad, Compound)
3. 12-Step Perceptually Uniform Tonal Ramp (OKLch Lightness Anchoring)
4. Complete Production UI Design System (Dual Light/Dark Themes, Halation Mitigation, Accessibility Verification)
"""

import os
import json
from color_engine import (
    ScientificColorEngine,
    hex_to_oklch,
    oklch_to_srgb_hex,
    wcag_contrast_ratio,
    apca_contrast,
)


def test_palette_analysis(engine: ScientificColorEngine):
    print("======================================================================")
    print("TEST 1: MULTI-COLOR PALETTE SCIENTIFIC ANALYSIS")
    print("======================================================================\n")

    palettes = {
        "Luxury_HighEnd": [
            "#0D0D11",  # Deep Obsidian Black
            "#D4AF37",  # Champagne Metallic Gold
            "#F5F2EB",  # Warm Alabaster White
            "#3E3123",  # Deep Bronze Umber
        ],
        "Modern_Tech": [
            "#0F172A",  # Deep Slate Navy
            "#00F0FF",  # Electric Cyan Accent
            "#FFFFFF",  # Clean Pure White
            "#64748B",  # Cool Steel Slate
        ],
        "Cyberpunk_Neon": [
            "#05050A",  # Pure Void Black
            "#FF007F",  # Neon Electric Magenta
            "#00F0FF",  # Neon Electric Cyan
            "#39FF14",  # Acid High-Voltage Lime
        ],
        "Earthy_Organic": [
            "#2C3E2D",  # Deep Forest Moss
            "#C27D38",  # Terracotta Ochre
            "#F4EAD4",  # Warm Linen
            "#7D8C6C",  # Muted Sage Green
        ],
        "Dissonant_Clash": [
            "#7E6B23",  # Muddy Olive Khaki
            "#7B3F61",  # Muddy Mauve
            "#4D735B",  # Muddy Slate Green
            "#755B49",  # Muddy Brown
        ],
    }

    for name, colors in palettes.items():
        print(f"--> Analyzing Palette: {name} ({', '.join(colors)})")
        result = engine.analyze_palette(colors)
        summary = result["summary"]

        print(f"    Composite Harmony Score: {summary['composite_harmony_score']}/100 (Grade: {summary['harmony_grade']})")
        print(f"    Best Matsuda Template  : {summary['best_matsuda_scheme']['template']} (Adherence: {summary['best_matsuda_scheme']['adherence_score']}%)")
        print(f"    Primary Aesthetic Token: {summary['primary_aesthetic_token']}")
        print(f"    Qualifying Tokens      : {', '.join(summary['qualifying_tokens'])}")
        print(f"    WCAG AA Pass Rate      : {result['accessibility_summary']['wcag_aa_pass_rate_pct']}%")
        print(f"    Emotion Coordinates    : Warm/Cool={summary['color_emotion_vector']['warm_cool']}, Heavy/Light={summary['color_emotion_vector']['heavy_light']}, Active/Passive={summary['color_emotion_vector']['active_passive']}")

        if result["actionable_guidance_for_ai"]:
            print(f"    Actionable Guidance    : {result['actionable_guidance_for_ai'][0]['action']}")
        else:
            print("    Actionable Guidance    : No suggestions returned; inspect intended usages and limitations.")
        print()


def test_harmonic_generators(engine: ScientificColorEngine):
    print("======================================================================")
    print("TEST 2: DETERMINISTIC HARMONIC PALETTE GENERATORS")
    print("======================================================================\n")

    seed_hex = "#2563EB"  # Primary Blue
    schemes = [
        ("monochromatic", 5),
        ("analogous", 5),
        ("complementary", 4),
        ("split_complementary", 4),
        ("triadic", 4),
        ("tetradic_square", 4),
        ("tetradic_rectangle", 4),
        ("compound", 4),
    ]

    for scheme_type, expected_len in schemes:
        gen_res = engine.generate_palette(seed_hex, scheme_type=scheme_type)
        palette = gen_res["palette_hex"]
        summary = gen_res["analysis"]["summary"]

        assert len(palette) == expected_len, f"Expected {expected_len} colors, got {len(palette)}"
        assert summary["composite_harmony_score"] >= 60.0, f"Score below threshold: {summary['composite_harmony_score']}"

        print(f"--> Scheme: {scheme_type.upper()}")
        print(f"    Generated Hex: {palette}")
        print(f"    Composite Harmony: {summary['composite_harmony_score']}/100 (Grade: {summary['harmony_grade']})")
        print(f"    Fitted Matsuda Template: {summary['best_matsuda_scheme']['template']} ({summary['best_matsuda_scheme']['adherence_score']}%)")
        print(f"    Roles: {', '.join(r['role'] for r in gen_res['color_roles'])}")
        print()


def test_tonal_ramp(engine: ScientificColorEngine):
    print("======================================================================")
    print("TEST 3: 12-STEP PERCEPTUALLY UNIFORM TONAL RAMP")
    print("======================================================================\n")

    seed_hex = "#2563EB"
    ramp = engine.generate_tonal_ramp(seed_hex, step_count=12)

    assert len(ramp) == 12, "Tonal ramp must have 12 steps"

    # Verify monotonic lightness descent (Step 1 is lightest, Step 12 is darkest)
    for i in range(len(ramp) - 1):
        l_curr = ramp[i]["target_oklch"]["L"]
        l_next = ramp[i + 1]["target_oklch"]["L"]
        assert l_curr > l_next, f"Non-monotonic lightness descent between step {i+1} and {i+2}: {l_curr} <= {l_next}"

    # Verify that Step 11 on Step 1 Canvas exceeds WCAG AA & AAA
    step11_contrast = ramp[10]["contrast_vs_step1_canvas"]
    assert step11_contrast["passes_wcag_aa_text"], "Step 11 must pass WCAG AA against Step 1"
    assert step11_contrast["wcag_ratio"] >= 7.0, f"Step 11 should pass WCAG AAA (>= 7.0), got {step11_contrast['wcag_ratio']}"
    assert abs(step11_contrast["apca_lc"]) >= 75.0, f"Step 11 should meet APCA Body text standard (>= 75 Lc), got {step11_contrast['apca_lc']}"

    print(f"Seed Color: {seed_hex}")
    print(f"{'Step':<6} {'Hex':<10} {'Lightness':<11} {'Chroma':<8} {'CR vs Canvas':<14} {'APCA Lc':<10} {'Role'}")
    print("-" * 88)
    for s in ramp:
        print(
            f"{s['step']:<6} {s['hex']:<10} {s['target_oklch']['L']:<11.2f} "
            f"{s['target_oklch']['C']:<8.3f} {s['contrast_vs_step1_canvas']['wcag_ratio']:<14.2f} "
            f"{s['contrast_vs_step1_canvas']['apca_lc']:<10.1f} {s['functional_role']}"
        )
    print()


def test_ui_design_system(engine: ScientificColorEngine):
    print("======================================================================")
    print("TEST 4: COMPLETE PRODUCTION UI DESIGN SYSTEM (DUAL LIGHT / DARK THEME)")
    print("======================================================================\n")

    seed_hex = "#2563EB"
    design_system = engine.generate_ui_design_system(seed_hex)

    light = design_system["light_theme"]
    dark = design_system["dark_theme"]

    # Light Mode Verifications
    lt_audit = light["accessibility_verification"]
    assert lt_audit["body_text_on_canvas"]["passes_wcag_aa"], "Light mode body text must pass WCAG AA"
    assert lt_audit["body_text_on_canvas"]["passes_apca_body"], "Light mode body text must pass APCA Body"
    assert lt_audit["secondary_text_on_surface"]["passes_wcag_aa"], "Light mode secondary text must pass WCAG AA"
    assert lt_audit["button_text_on_brand"]["passes_wcag_aa"], "Light mode button text must pass WCAG AA"

    # Dark Mode Verifications
    dk_audit = dark["accessibility_verification"]
    assert dk_audit["body_text_on_canvas"]["passes_wcag_aa"], "Dark mode body text must pass WCAG AA"
    assert dk_audit["body_text_on_canvas"]["passes_apca_body"], "Dark mode body text must pass APCA Body"
    assert dk_audit["secondary_text_on_surface"]["passes_wcag_aa"], "Dark mode secondary text must pass WCAG AA"
    assert dk_audit["button_text_on_brand"]["passes_wcag_aa"], "Dark mode button text must pass WCAG AA"

    # Anti-halation check: Dark mode primary text must NOT be pure white #FFFFFF
    assert dark["typography"]["primary"] != "#FFFFFF", "Dark mode primary text must not be pure white #FFFFFF (halation risk)"

    print("--> LIGHT THEME TOKENS:")
    print(f"    Surfaces   : Canvas={light['surfaces']['canvas']}, Surface={light['surfaces']['surface']}, Elevated={light['surfaces']['elevated']}")
    print(f"    Borders    : Subtle={light['borders']['subtle']}, Strong={light['borders']['strong']}, Focus={light['borders']['focus']}")
    print(f"    Typography : Primary={light['typography']['primary']}, Secondary={light['typography']['secondary']}, Muted={light['typography']['muted']}")
    print(f"    Actions    : Brand={light['actions']['brand_base']}, Hover={light['actions']['brand_hover']}, Text={light['actions']['on_brand_text']}")
    print(f"    Status     : Success={light['semantic_status']['success']}, Warning={light['semantic_status']['warning']}, Error={light['semantic_status']['error']}, Info={light['semantic_status']['info']}")
    print(f"    Audit      : Body on Canvas WCAG CR={lt_audit['body_text_on_canvas']['wcag_cr']}:1 (APCA Lc={lt_audit['body_text_on_canvas']['apca_lc']})")
    print(f"                 Button text on Brand WCAG CR={lt_audit['button_text_on_brand']['wcag_cr']}:1")
    print()

    print("--> DARK THEME TOKENS:")
    print(f"    Surfaces   : Canvas={dark['surfaces']['canvas']}, Surface={dark['surfaces']['surface']}, Elevated={dark['surfaces']['elevated']}")
    print(f"    Borders    : Subtle={dark['borders']['subtle']}, Strong={dark['borders']['strong']}, Focus={dark['borders']['focus']}")
    print(f"    Typography : Primary={dark['typography']['primary']} (Anti-Halation), Secondary={dark['typography']['secondary']}, Muted={dark['typography']['muted']}")
    print(f"    Actions    : Brand={dark['actions']['brand_base']}, Hover={dark['actions']['brand_hover']}, Text={dark['actions']['on_brand_text']}")
    print(f"    Status     : Success={dark['semantic_status']['success']}, Warning={dark['semantic_status']['warning']}, Error={dark['semantic_status']['error']}, Info={dark['semantic_status']['info']}")
    print(f"    Audit      : Body on Canvas WCAG CR={dk_audit['body_text_on_canvas']['wcag_cr']}:1 (APCA Lc={dk_audit['body_text_on_canvas']['apca_lc']})")
    print(f"                 Button text on Brand WCAG CR={dk_audit['button_text_on_brand']['wcag_cr']}:1")
    print()

    print("--> ERGONOMIC PRINCIPLES APPLIED:")
    for note in design_system["ergonomic_principles_applied"]:
        print(f"    • {note}")
    print()


def test_prng_mixer(engine: ScientificColorEngine):
    print("======================================================================")
    print("TEST 5: PRNG SEED-BASED TOKEN MIXER & MOON & SPENCER AREA BALANCE")
    print("======================================================================\n")

    test_tokens = ["Luxury_HighEnd", "Modern_Tech", "Cyberpunk_Neon", "Earthy_Organic"]
    seeds = [42, "luxury-fintech-2026", 999]

    for tok in test_tokens:
        res = engine.mix_palette_by_token(tok, seed=seeds[0])
        assert len(res["palette_hex"]) == 5, f"Expected 5 colors, got {len(res['palette_hex'])}"

        # Verify area ratios sum to 1.0 (100%)
        total_pct = sum(m["area_ratio"] for m in res["palette_mix"])
        assert abs(total_pct - 1.0) < 0.005, f"Area ratios do not sum to 1.0: {total_pct}"

        # Verify macro surface dominance (canvas surface >= 50%)
        assert res["palette_mix"][0]["area_ratio"] >= 0.50, "Canvas surface must dominate layout (>50%)"

        print(f"--> Token: {res['token']} (Seed={seeds[0]})")
        print(f"    Palette: {res['palette_hex']}")
        for m in res["palette_mix"]:
            print(f"      • {m['role']:<20}: {m['hex']} ({m['area_mixing_percentage']})")
        print(f"    Composite Harmony: {res['analysis']['summary']['composite_harmony_score']}/100")
        print()

    # Determinism Verification
    mix1 = engine.mix_palette_by_token("Luxury_HighEnd", seed="seed-alpha-1")
    mix2 = engine.mix_palette_by_token("Luxury_HighEnd", seed="seed-alpha-1")
    assert mix1["palette_hex"] == mix2["palette_hex"], "PRNG mixer must be 100% deterministic given the same seed"
    print("--> Identical PRNG output for the repeated seed.\n")


def test_visual_eval_artifacts():
    print("======================================================================")
    print("TEST 6: VISUAL EVALUATION CHARTS & ML MODEL ARTIFACT PRESENCE")
    print("======================================================================\n")

    eval_files = [
        "model/eval/roc_curves.png",
        "model/eval/precision_recall_curves.png",
        "model/eval/feature_importance.png",
        "model/eval/token_correlation_matrix.png",
        "model/eval/confusion_matrices_grid.png",
        "model/eval/model_performance_dashboard.png",
        "model/eval/evaluation_report.json",
        "data/ml/ensemble_model.joblib",
        "data/curated/aesthetic_token_dataset.json",
    ]

    for f_path in eval_files:
        assert os.path.exists(f_path), f"Missing artifact: {f_path}"
        size_kb = os.path.getsize(f_path) / 1024
        print(f"    • Verified: {f_path:<44} ({size_kb:.1f} KB)")
    print()


def main():
    engine = ScientificColorEngine()
    test_palette_analysis(engine)
    test_harmonic_generators(engine)
    test_tonal_ramp(engine)
    test_ui_design_system(engine)
    test_prng_mixer(engine)
    test_visual_eval_artifacts()
    print("======================================================================")
    print("All verification checks passed.")
    print("======================================================================")


if __name__ == "__main__":
    main()
