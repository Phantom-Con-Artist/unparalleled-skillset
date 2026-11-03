<div align="center">
  <img src="./assets/icon.png" width="180" height="180" alt="Color Intelligence Layer Icon" />
  <h1>Color Intelligence Layer</h1>
  <p><strong>Objective Color Intelligence Layer for AI Agents to be applied with Unparalleled Skillset</strong></p>

  <p>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License: Apache 2.0" /></a>
    <a href="./DIRECTORY.md"><img src="https://img.shields.io/badge/status-under%20active%20development%20(not%20ready%20for%20use)-orange.svg" alt="Development Status" /></a>
    <a href="https://bottosson.github.io/posts/oklab/"><img src="https://img.shields.io/badge/color__space-OKLch%20%2F%20OKLab-emerald.svg" alt="Perceptual Color Space" /></a>
    <a href="https://www.w3.org/WAI/WCAG22/quickref/"><img src="https://img.shields.io/badge/contrast-WCAG%202.2%20%26%20APCA-indigo.svg" alt="Contrast Standards" /></a>
    <a href="https://www.python.org/downloads/"><img src="https://img.shields.io/badge/python-3.9+-blue.svg" alt="Python 3.9+" /></a>
  </p>
</div>

> [!CAUTION]
> **DEVELOPMENT STATUS**: This project is **currently under active research and development (Pre-Alpha / Experimental)**. It is **NOT READY FOR USE**. Public interfaces, database schemas, and trained weights are subject to change without notice.

---

## What is this? (Direct, No Fluff)

AI models have no eyes, retinas, or visual taste. When an AI agent is asked to create a website, dashboard, or design system, it simply predicts hex codes like `#2563EB` or `#F3F4F6`.

Because it cannot perceive contrast or color discordance, the agent routinely generates:
- Low-contrast text that fails basic accessibility.
- Clashing accent combinations that look jarring to humans.
- Washed-out or muddy dark modes with severe eye-fatigue halation.
- Unequal visual weight where neon accents overpower entire screens.

The **Color Intelligence Layer** replaces subjective "vibes" with **deterministic mathematics, psychophysics, and machine learning**. It gives agents an objective calculator to verify harmony, diagnose contrast errors with prescriptive fixes, and generate production-grade UI design systems.

---

## Core Capabilities

1. **Scientific Color Harmony Scoring (0–100)**:
   * Maps color sets against **Matsuda’s 8 Aesthetic Hue Templates** ($\text{Types } i, V, L, I, T, Y, X, \text{and } O$).
   * Uses **Cohen-Or (2006)** circular energy optimization to find the optimal template rotation and isolate dissonant outlier colors.
   * Calculates **Ou-Luo (2006)** empirical 2-color harmony values.

2. **Dual Accessibility Contrast Checking**:
   * **WCAG 2.2**: Relative luminance contrast ratio ($4.5:1$ AA normal text, $3.0:1$ AA large/components, $7.0:1$ AAA).
   * **APCA-W3 (v0.98G)**: Spatial-frequency lightness contrast ($L^c$), text polarity, and font-size minimums.

3. **OKLch Perceptual Uniformity**:
   * All color mathematics run in **OKLch** ($L \in [0, 1]$, $C \ge 0$, $h \in [0^\circ, 360^\circ)$), eliminating the severe Abney hue shifts and brightness skew present in sRGB, HSL, and CIELAB.

4. **Production UI Design System Synthesis**:
   * Generates paired **Light and Dark mode** design systems from a single seed color.
   * **Anti-Halation Damping**: Automatically caps dark-mode body typography at $L \le 0.92$ to prevent optical irradiation and eye fatigue.
   * **Depth Elevation**: Automatically creates monotonic surface steps ($L = 0.12 \to 0.17 \to 0.22$).

5. **PRNG Seed-Based Token Palette Mixer**:
   * Deterministically synthesizes color palettes from aesthetic tokens (*Luxury_HighEnd*, *Modern_Tech*, *Minimalist_Serene*, *Cyberpunk_Neon*, etc.) using an integer or string seed.
   * Computes optimal surface area mixing percentages (e.g., Canvas 63%, Surface 20%, Brand 10%, Accent 3%, Text 4%) enforcing the **Moon & Spencer Area Balance Law** ($A_1 \cdot C_1 \cdot L_1 = A_2 \cdot C_2 \cdot L_2$).

6. **12-Step Functional Tonal Ramps**:
   * Creates 12-step monotonic lightness ramps for design tokens (Radix Colors & Tailwind CSS compatible).

---

## Machine Learning & Benchmark Results

We trained two generations of machine learning systems on **100,000 empirically grounded color swatches** to map physical color coordinates directly to high-level aesthetic concepts:

### Benchmark: V1 Baseline vs V2 Upgraded

![V1 Baseline vs V2 Upgraded Comparison Chart](./model/eval_v2/v1_vs_v2_comparison_chart.png)

| Aesthetic Token | V1 PR-AUC | V2 PR-AUC | $\Delta$ PR-AUC | V1 $F_1$ | V2 $F_1$ | $\Delta$ $F_1$ | Optimal Threshold |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`Cyberpunk_Neon`** | $0.0523$ | **$0.6114$** | **+1,069.0%** | $0.0978$ | **$0.5833$** | **+496.4%** | $0.26$ |
| **`Modern_Tech`** | $0.6113$ | **$0.6947$** | **+13.6%** | $0.5771$ | **$0.6678$** | **+15.7%** | $0.29$ |
| **`Bold_Dramatic`** | $0.7302$ | **$0.8474$** | **+16.1%** | $0.6865$ | **$0.7781$** | **+13.3%** | $0.36$ |
| **`Calm_Peaceful`** | $0.8120$ | **$0.8818$** | **+8.6%** | $0.7712$ | **$0.8167$** | **+5.9%** | $0.27$ |
| **`Earthy_Organic`** | $0.8430$ | **$0.8804$** | **+4.4%** | $0.7556$ | **$0.7933$** | **+5.0%** | $0.38$ |
| **`Minimalist_Serene`** | $0.7788$ | **$0.7990$** | **+2.6%** | $0.7271$ | **$0.7342$** | **+1.0%** | $0.39$ |
| **`Playful_Vibrant`** | **$0.8221$** | $0.7902$ | -3.9% | **$0.7581$** | $0.7057$ | -6.9% | $0.44$ |
| **`Corporate_Trustworthy`** | **$0.7494$** | $0.7043$ | -6.0% | **$0.7063$** | $0.6667$ | -5.6% | $0.34$ |
| **`Luxury_HighEnd`** | **$0.6803$** | $0.5745$ | -15.5% | **$0.6417$** | $0.5660$ | -11.8% | $0.22$ |
| **`Elegant_Sophisticated`** | $0.6750$ | $0.6391$ | -5.3% | $0.6480$ | **$0.6507$** | **+0.4%** | $0.38$ |
| **Macro Average** | **$0.6954$** | **$0.7423$** | **+6.7%** | **$0.6490$** | **$0.6963$** | **+7.3%** | **$0.33$** |

### Key Improvements in V2:
1. **Eliminated Precision Collapse on Rare Concepts**: V1 regex keyword matching produced severe precision collapse on rare tokens like `Cyberpunk_Neon` ($F_1 = 0.098$). V2 programmatic weak supervision fused zero-shot dense text embeddings (`all-MiniLM-L6-v2`) with physical color priors, lifting $F_1$ to **$0.5833$ (+496%)**.
2. **Multi-Label Dependency Modeling**: Replaced independent random forests with an **Ensemble of Classifier Chains (ECC)** to capture mutual exclusivities (`Cyberpunk` $\perp$ `Earthy`) and strong co-occurrences (`Calm` $\leftrightarrow$ `Minimalist`).
3. **Diverse Swatch Curation (MMR)**: Replaced raw Euclidean distance with **Mahalanobis Distance** and **Greedy Maximal Marginal Relevance (MMR)**, ensuring exemplar swatches span distinct hue angles instead of collapsing into near-identical color clusters.

---

## Code Examples for Agents

### 1. Analyze an Arbitrary Palette & Get Prescriptive Fixes
```python
from color_engine import ScientificColorEngine

engine = ScientificColorEngine()

# Analyze a palette
analysis = engine.analyze_palette(["#0D0D11", "#D4AF37", "#F5F2EB", "#3E3123"])

print(f"Harmony Score : {analysis['composite_harmony_score']}/100 ({analysis['harmony_grade']})")
print(f"Best Template : {analysis['matsuda_harmony']['best_template']}")
print(f"Primary Token : {analysis['aesthetic_classification']['primary_aesthetic_token']}")
print(f"Guidance      : {analysis['prescriptive_agent_guidance']}")
```

### 2. Synthesize a Production UI Design System (Light + Dark Mode)
```python
# Generate complete design system from a brand seed
ui = engine.generate_ui_design_system(seed_hex="#2563EB")

print("Light Canvas :", ui["themes"]["light"]["surfaces"]["canvas"])
print("Dark Canvas  :", ui["themes"]["dark"]["surfaces"]["canvas"])
print("Body Contrast:", ui["accessibility_audit"]["light"]["body_on_canvas"]["wcag_contrast_ratio"])
```

### 3. Synthesize a Token-Based Palette with Moon & Spencer Area Percentages
```python
# Generate a Cyberpunk palette over a PRNG seed
mix = engine.mix_palette_by_token(
    token="Cyberpunk_Neon",
    seed="fintech-neon-2026",
    palette_size=5,
    version="v2"
)

for item in mix["palette_mix"]:
    print(f"{item['role']:<20}: {item['hex']} -> Visual Area: {item['area_mixing_percentage']}")
```

---

## Synergy with Unparalleled Skillset

This engine is built to serve as the **Objective Color Intelligence Layer** for the `unparalleled-ui` and `unparalleled-website` agent skills:

```
[Agent Workflow]
       │
       ▼
[unparalleled-ui / unparalleled-website Skills]
       │  (Requests color tokens, theme pairs, and area ratios)
       ▼
[Color Intelligence Layer]
   ├── OKLch Perceptual Physics
   ├── Matsuda 8 Harmony Templates & Cohen-Or Optimization
   ├── WCAG 2.2 & APCA-W3 Contrast Auditing
   ├── Moon & Spencer Area Balancing (60-20-10-5 Rule)
   └── V2 Ensemble of Classifier Chains (ECC)
       │  (Returns deterministic palettes, area ratios, and verified contrast)
       ▼
[Production Web / App Code]
```

When an agent writes UI code:
- **`unparalleled-ui`** uses the engine to verify contrast tables, generate monotonic dark-mode surfaces, and prevent halation on complex analytics dashboards.
- **`unparalleled-website`** uses the engine to calculate Matsuda chord angles, verify emotional resonance coordinates, and calculate Moon & Spencer visual weight proportions for bold hero sections.

---

## Verification Test Suite (100% Passing)

Run the test suite:
```bash
python3 test_color_engine.py
```

- **Test 1**: Multi-color palette scientific analysis and prescriptive outlier diagnosis: **PASSED**
- **Test 2**: 7 classical harmonic scheme generators in OKLch: **PASSED**
- **Test 3**: 12-step monotonic functional tonal ramp: **PASSED**
- **Test 4**: Complete dual-theme UI design system with anti-halation damping: **PASSED**
- **Test 5**: PRNG seed-based token mixer with Moon & Spencer area balance: **PASSED**
- **Test 6**: Machine learning model weights and evaluation artifact integrity: **PASSED**

---

## Documentation Index

- Detailed repository directory map: [`DIRECTORY.md`](./DIRECTORY.md)
- Foundational research & equations: [`research/reports/color_engine_research.md`](./research/reports/color_engine_research.md)
- Color theory & generator math: [`research/reports/color_theory_and_generators.md`](./research/reports/color_theory_and_generators.md)
- System architecture & JSON specification: [`research/reports/color_engine_spec.md`](./research/reports/color_engine_spec.md)
- V1 machine learning ensemble evaluation: [`research/reports/model_evaluation_v1.md`](./research/reports/model_evaluation_v1.md)
- V2 scientific evaluation & ablation benchmark: [`research/reports/model_evaluation_v2.md`](./research/reports/model_evaluation_v2.md)

---

## License

Licensed under the **Apache License, Version 2.0**. See [`LICENSE`](./LICENSE) for terms.
