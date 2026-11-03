# Color intelligence

Color sets mood, hierarchy, meaning and legibility at the same time. A professional picks colors from evidence (the product, its materials, an existing identity, the personality traits) and then proves every foreground/background pair readable. This step runs through the **Color Intelligence Layer**, an offline engine that turns aesthetic terms into role-based palettes and certifies declared pairs against WCAG 2.2.

## What the discipline decides

- **Source pigments**: where each major color comes from (product photo, material, existing brand, a personality trait with a stated reason).
- **Semantic roles**: canvas, surface(s), text primary/secondary, brand, accent, on-brand text, focus ring, selection, borders (decorative and meaningful), status (success, warning, error, info), disabled.
- **Proportion**: roughly how much visible area each role gets in a representative view.
- **Themes**: light, dark, or both, and how each role maps across them.
- **Behavior over media**: text on photos, video frames, gradients and 3D scenes.
- **Color-vision resilience**: no meaning carried by hue alone.

## Run the Color Intelligence Layer

Install once per machine from the repository root: `npm run color:setup` (creates the runtime and registers the `color-intelligence` MCP server). Use the first route that works and record which one in the contract (`design.color_intelligence.mode`).

| Route | How |
| --- | --- |
| `mcp` | Tools `vocabulary`, `generate_palette`, `analyze_palette`, `search_palettes`, `export_palette`. |
| `cli` | `packages/color-intelligence/.venv/bin/color-intelligence generate '<brief>' --theme light --tokens '{"calm":2,"archival":1}'` (JSON on stdout). Installed elsewhere: `color-intelligence` on PATH. |
| `fallback` | Neither is available. Derive roles by hand in OKLCH, measure every pair with `node scripts/check-contrast.mjs --pairs <file>`, and use `node scripts/score-palette.mjs --input <file>` for local diagnostics (luminance range, saturation, hue spread; not a harmony formula). Emit CSS with `node scripts/generate-tokens.mjs`. Record `fallback_reason`. |

Procedure:

1. **Translate personality into terms.** Read `vocabulary` (or `color://vocabulary`) for each trait from brand-personality. Keep only supported terms; note each term's `limitation`. Weight them (`{"calm": 2, "precise": 1}`). Words with no color meaning ("premium", "modern") are not terms; ground them in other disciplines.
2. **Lock what is not negotiable.** Existing brand colors and explicit user colors go in `locked_roles` (for example `{"brand": "#0B5D3B"}`). Locked roles are never changed.
3. **Generate with real typography.** Call `generate_palette` with `tokens` (or `brief`), the chosen `theme`, the body `font_size_px` and `font_weight` from typography (re-run after typography is set), `level` `AA` (or `AAA` when the audience needs it) and `apca: true`.
4. **Read the result, not just the swatches.** `status` must not be `infeasible`. Read `changes` (what repair altered), `unresolved` and `certificate.audits`. The certificate covers only its declared pairs: body on canvas and surface, brand and accent as non-text on canvas, on-brand text on brand.
5. **Compare against the catalog.** `search_palettes` with the same terms shows curated presets for the vocabulary. Use them as comparisons, not as answers. None has an independent human aesthetic approval.
6. **Extend to the full role set.** Add status, focus, selection, secondary text and border roles in OKLCH, then call `analyze_palette` with every real pairing as `usages` (`{"role","foreground","background","kind":"text"|"non_text","font_size_px","font_weight"}`). Apply a proposed foreground only to its declared role and background, then re-run.
7. **Save evidence.** Write the raw JSON responses to a file (for example `color/generate.json`, `color/analyze.json`) and cite it as `design.color_intelligence.evidence`. Never call `record_aesthetic_review` with `actor: "human"` unless an identified person gave that judgment.

Similarity scores from the engine are **uncalibrated affinities**. Do not report them as confidence, quality or a percentage match.

## Standards and data

| Standard | What it settles |
| --- | --- |
| WCAG 2.2 SC 1.4.3 Contrast (Minimum), AA | Text 4.5:1; large text (≥24px regular, ≥18.66px bold) 3:1. |
| WCAG 2.2 SC 1.4.6 Contrast (Enhanced), AAA | Text 7:1; large text 4.5:1. |
| WCAG 2.2 SC 1.4.11 Non-text Contrast, AA | Meaningful UI boundaries, focus indicators, icons and chart marks 3:1 against adjacent colors. |
| WCAG 2.2 SC 1.4.1 Use of Color, A | Color is never the only signal; pair it with text, shape or position. |
| APCA (WCAG 3 draft research) | Supplementary perceptual readability guidance (Lc values by size and weight). Not a WCAG 2.2 conformance measure. |
| CSS Color 4, OKLab/OKLCH | Perceptually uniform lightness and chroma for tuning ramps; check gamut. |
| Material 3 color roles, IBM Carbon color, Apple HIG color | Professional role systems (tonal palettes, layering, semantic tokens). Learn the method; do not copy their palettes. |
| W3C Design Tokens Community Group format | Interchange format for exporting color tokens. |

Links: [sources.md](sources.md#color).

## Allowed practice

- Pigments traced to a named source in product.md or brand personality, written as **source → role → reason**.
- OKLCH for authoring ramps and adjusting lightness/chroma at constant hue; hex or `rgb()` emitted for measured pairs.
- Three token levels: source pigments, semantic roles, component aliases.
- A restrained count of chromatic roles when content needs few signals, or a broader palette when the product genuinely has many categories (data, wayfinding). Count follows information needs.
- Neutrals tinted toward the brand hue so surfaces belong to the palette.
- Pure white or black when a material, print reference or contrast need justifies it.
- Status colors that keep recognizable meanings (red/error, amber/warning, green/success) adjusted in lightness and chroma to fit the palette, always paired with words or icons.
- Gradients that represent light, material or a data transition, with stops, direction and purpose recorded and contrast measured along the transition.
- A dark theme designed as its own composition: raised surfaces lighter, saturated colors reduced in chroma, text not pure white on pure black for long reading.
- 60-30-10 as an optional starting split of dominant, secondary and accent area, adjusted from real screenshots.

## Banned practice

- A palette chosen without a recorded source, or justified only by an adjective ("premium gold", "trustworthy blue").
- Stock generator output used as identity: Tailwind default scales, `indigo-500`/`violet-600` primary buttons, framework theme defaults.
- The generic AI/SaaS families: purple-to-blue gradients, lavender washes, cyan or emerald "live" accents on slate, dark slate with a neon accent.
- Neon aesthetics (glowing text, outer-glow shadows, synthwave grids, HUD overlays) unless the user asks or the product is literally light.
- Reflexive genre kits: beige/sage/terracotta "craft", black/gold "luxury", cream plus serif "editorial", Swiss red on white.
- Gradient headlines, aurora or mesh backgrounds, glowing CTA halos, a gradient behind every section.
- Meaning carried by color alone (red/green status with no label, links distinguished only by hue in body text).
- Lowering a threshold to pass: calling a caption "large text", rounding 4.47:1 up to 4.5:1, measuring before opacity or overlays are composited.
- Accent color on every element. When everything is emphasized, nothing is.
- Reporting the engine's similarity score as a quality or confidence measure, or recording an agent judgment as a human review.

## Record in design.md (Color section)

Route used and evidence path; input terms and weights; locked roles; the role table (role, value in OKLCH and hex, source, reason, approximate area); certificate status and any `changes` or `unresolved`; full measured pair table including states (hover, focus, disabled, selected) and worst media frames; color-only meanings and their non-color partner; project-specific exclusions.

## Verify

1. The certificate or `analyze_palette` usage audit covers every role pair the design actually uses.
2. In the rendered page, measure computed colors after compositing (opacity, overlays, images) and run `node scripts/check-contrast.mjs --pairs <pairs.json>`.
3. Capture the key view in grayscale (or a protanopia/deuteranopia simulation in the browser's rendering tools) and confirm status and links remain distinguishable.
4. `node scripts/capture.mjs` reports `textColors`; each distinct color should map to a named role.
