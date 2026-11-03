<div align="center">
  <img src="./assets/icon.png" width="180" height="180" alt="Color Intelligence Layer icon" />
  <h1>Color Intelligence Layer</h1>
  <p><strong>Color analysis and palette generation for AI design agents.</strong></p>

  <p>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License: Apache 2.0" /></a>
    <a href="./DIRECTORY.md"><img src="https://img.shields.io/badge/status-alpha-orange.svg" alt="Status: alpha" /></a>
    <a href="https://bottosson.github.io/posts/oklab/"><img src="https://img.shields.io/badge/color__space-OKLch%20%2F%20OKLab-emerald.svg" alt="Color spaces: OKLch and OKLab" /></a>
    <a href="https://www.w3.org/WAI/WCAG22/quickref/"><img src="https://img.shields.io/badge/contrast-WCAG%202.2%20%26%20APCA-indigo.svg" alt="Contrast metrics: WCAG 2.2 and APCA" /></a>
    <a href="https://www.python.org/downloads/"><img src="https://img.shields.io/badge/python-3.11+-blue.svg" alt="Python 3.11+" /></a>
  </p>
</div>

> [!NOTE]
> **Local alpha.** APIs, schemas and vocabulary may change. Contrast certificates cover declared uses; aesthetic matches remain provisional.

## Local agent-first alpha

Translate weighted aesthetic terms into role-based palettes, analyze palette semantics, and curate examples through a local MCP server built with the official Python SDK. The runtime uses a bundled linear model, 117 aesthetic terms with 185 aliases, and a SQLite catalog seeded with 238 palettes. It requires no cloud service or runtime download.

```bash
python -m pip install .
color-intelligence doctor
color-intelligence generate 'calm cyberpunk, avoid maximalism' --theme dark
color-intelligence-mcp
```

Outputs include explicit word interpretations, actual color roles, usage-scoped WCAG/APCA checks, color changes, unresolved constraints, CSS and an uncalibrated semantic similarity score. Locked colors are preserved; infeasible requests are reported. The catalog distinguishes project presets, adapted source themes and client-attested human reviews. No bundled palette has an independent human aesthetic approval.

See the [local alpha guide](./docs/LOCAL_ALPHA.md) for MCP configuration, tools, review policy and limitations, and the [alpha evaluation report](./review_runs/20261103-local-alpha/REPORT.md) for reproducible evidence. Existing scientific APIs remain available below.

## Overview

Color Intelligence Layer is a Python library for evaluating palettes and generating color tokens for websites, applications, and design systems. It combines perceptual color models, harmony scoring, contrast calculations, and machine learning research to give AI agents structured feedback on color choices.

The engine reports foreground/background contrast, identifies hue outliers, suggests palette adjustments, and generates coordinated light and dark themes. It is intended to support the `unparalleled-ui` and `unparalleled-website` agent skills.

Harmony scores and aesthetic labels reflect the models and datasets used by the project. They support design decisions; they do not establish a universal measure of visual quality.

## Capabilities

| Capability | Description |
| :--- | :--- |
| Palette analysis | Combines Matsuda's eight hue templates, Cohen-Or-style template optimization, and Ou-Luo pairwise harmony calculations into a composite score from 0 to 100. Identifies hue outliers and returns suggested adjustments. |
| Contrast checks | Reports WCAG contrast ratios and APCA-W3 v0.98G lightness contrast, including polarity and readability tiers. |
| Perceptual color calculations | Uses OKLab and OKLch for palette generation and color differences, with CIELAB and Munsell representations for additional analysis. |
| Theme generation | Creates light and dark theme tokens for surfaces, borders, typography, actions, and status colors from a brand seed. Audits every typography role on each listed surface, plus button states and strong/focus borders. |
| Dark theme controls | Sets primary text lightness to 0.92 in OKLch and uses increasing surface lightness values of 0.12, 0.17, and 0.22 to establish depth. |
| Seeded palette generation | Produces repeatable palettes from aesthetic tokens such as `Luxury_HighEnd`, `Modern_Tech`, and `Cyberpunk_Neon`, using an integer or string seed. Returns suggested area proportions, explicit roles, and verified text-on-surface contrast. |
| Tonal ramps | Generates 12-step ramps with monotonic lightness for use as design tokens. |

## Agent interface

Install from the repository with Python 3.11 or later:

```bash
python -m pip install .
```

Discover tool schemas with `python -m color_engine --describe`, or call `get_tool_definitions()` in Python. The JSON interface accepts a method and arguments on stdin and returns a structured success or error response.

Pass intended foreground/background roles to `analyze_palette(..., usages=[...])` for contrast audits and verified foreground proposals. Responses distinguish measured constraints from harmony suggestions and uncalibrated aesthetic scores. See the [agent API guide](./docs/AGENT_API.md) for request examples, output interpretation, and compatibility changes.

## Usage examples

The examples below use the `ScientificColorEngine` interface. Run them from a checkout with the project's dependencies installed.

### Analyze a palette

```python
from color_engine import ScientificColorEngine

engine = ScientificColorEngine()
analysis = engine.analyze_palette(["#0D0D11", "#D4AF37", "#F5F2EB", "#3E3123"])
summary = analysis["summary"]

print(f"Harmony score: {summary['composite_harmony_score']}/100")
print(f"Harmony grade: {summary['harmony_grade']}")
print(f"Best template: {summary['best_matsuda_scheme']['template']}")
print(f"Primary token: {summary['primary_aesthetic_token']}")
print("Suggested adjustments:", analysis["actionable_guidance_for_ai"])
# Supply usages to get role-specific contrast audits and verified proposals.
```

### Generate light and dark themes

```python
ui = engine.generate_ui_design_system(seed_hex="#2563EB")
light = ui["light_theme"]
dark = ui["dark_theme"]

print("Light canvas:", light["surfaces"]["canvas"])
print("Dark canvas:", dark["surfaces"]["canvas"])
print(
    "Light theme body contrast:",
    light["accessibility_verification"]["body_text_on_canvas"]["wcag_cr"],
)
```

### Generate a palette from an aesthetic token

```python
mix = engine.mix_palette_by_token(
    token="Cyberpunk_Neon",
    seed="fintech-neon-2026",
    palette_size=5,
    version="v2",
)

for item in mix["palette_mix"]:
    print(f"{item['role']}: {item['hex']} ({item['area_mixing_percentage']} of visual area)")
```

## Model evaluation

The repository preserves two generations of aesthetic classification research. V1 used the full 100,000-swatch dataset; V2 sampled approximately 20,000 swatches. Their labels, sampling, and held-out colors differ, so these historical results do not establish a controlled improvement.

The table reproduces stored metrics for each experiment. The legacy `ScientificColorEngine` analyzer uses explicit heuristic rules rather than those historical classifiers. The new semantic service uses the separately evaluated linear PAT models described in the local alpha guide.

| Aesthetic Token | V1 PR-AUC | V2 PR-AUC | V1 $F_1$ | V2 $F_1$ | V2 Threshold |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`Cyberpunk_Neon`** | $0.0523$ | **$0.6114$** | $0.0978$ | **$0.5833$** | $0.26$ |
| **`Modern_Tech`** | $0.6113$ | **$0.6947$** | $0.5771$ | **$0.6678$** | $0.29$ |
| **`Bold_Dramatic`** | $0.7302$ | **$0.8474$** | $0.6865$ | **$0.7781$** | $0.36$ |
| **`Calm_Peaceful`** | $0.8120$ | **$0.8818$** | $0.7712$ | **$0.8167$** | $0.27$ |
| **`Earthy_Organic`** | $0.8430$ | **$0.8804$** | $0.7556$ | **$0.7933$** | $0.38$ |
| **`Minimalist_Serene`** | $0.7788$ | **$0.7990$** | $0.7271$ | **$0.7342$** | $0.39$ |
| **`Playful_Vibrant`** | **$0.8221$** | $0.7902$ | **$0.7581$** | $0.7057$ | $0.44$ |
| **`Corporate_Trustworthy`** | **$0.7494$** | $0.7043$ | **$0.7063$** | $0.6667$ | $0.34$ |
| **`Luxury_HighEnd`** | **$0.6803$** | $0.5745$ | **$0.6417$** | $0.5660$ | $0.22$ |
| **`Elegant_Sophisticated`** | $0.6750$ | $0.6391$ | $0.6480$ | **$0.6507$** | $0.38$ |
| **Macro Average** | **$0.6954$** | **$0.7423$** | **$0.6490$** | **$0.6963$** | **$0.33$** |

V2 explores text embeddings, programmatic weak supervision, classifier chains, and diverse exemplar selection. Evaluation against generated labels measures agreement with those labels; independent human assessment of palette aesthetics remains outstanding.

The [V1 report](./research/reports/model_evaluation_v1.md), [V2 report](./research/reports/model_evaluation_v2.md), and stored charts are historical artifacts. Their original improvement claims should be read with the evaluation limitations above. New pipeline runs preserve published artifacts and save their outputs in separate directories.

## Agent integration

The intended workflow connects the engine to the Unparalleled skills:

```text
unparalleled-ui / unparalleled-website
    | Request palette analysis, theme tokens, or area proportions
    v
Color Intelligence Layer
    | Return color tokens, scores, contrast results, and suggested adjustments
    v
Agent-generated website or application
```

For application interfaces, agents can use the output to compare text/background pairs and establish surface hierarchies. For websites, they can use palette scores and area proportions to guide accent placement and visual balance.

## Verification

Run the repository's verification script from the project root:

```bash
python3 test_color_engine.py
```

The script covers palette analysis, harmonic palette generation, tonal ramps, light and dark themes, seeded palette mixing, and artifact presence. Install optional research dependencies before running the complete regression suite:

```bash
python3 -m pip install '.[research]'
python3 -m unittest discover -s tests -v
```

The [agent review report](./review_runs/20261103-agent-first/REPORT.md) includes before-and-after measurements, test logs, and remaining limitations.

## Token-conditioned palette research
The [research study](./review_runs/20261103-token-conditioning/REPORT.md) evaluates weighted-token generation, graph propagation, neural models, similarity scores, and contrast constraints against fixed baselines. The exploratory graph and neural prototypes remain research-only. The alpha promotes the evaluated ridge generator and adds a provisional linear inverse encoder; see the [alpha report](./review_runs/20261103-local-alpha/REPORT.md) for the current evidence.

## Documentation

- [Local MCP alpha and curation workflow](./docs/LOCAL_ALPHA.md)
- [Alpha evaluation evidence](./review_runs/20261103-local-alpha/REPORT.md)
- [Agent API and tool integration](./docs/AGENT_API.md)
- [Repository directory map](./DIRECTORY.md)
- [Foundational research and equations](./research/reports/color_engine_research.md)
- [Color theory and palette generation](./research/reports/color_theory_and_generators.md)
- [Architecture and JSON specification](./research/reports/color_engine_spec.md)
- [V1 model evaluation](./research/reports/model_evaluation_v1.md)
- [V2 model evaluation and ablation benchmarks](./research/reports/model_evaluation_v2.md)

## License

Project code is licensed under Apache 2.0; see [LICENSE](./LICENSE). Bundled PAT-derived model resources and Catppuccin theme adaptations include their source MIT notices in `color_engine/resources/`.
