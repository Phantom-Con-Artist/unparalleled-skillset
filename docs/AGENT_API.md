> The local alpha now provides a full stdio MCP server and semantic palette service. See [LOCAL_ALPHA.md](LOCAL_ALPHA.md). This guide documents the preserved scientific API and its single-request JSON transport.

# Agent API

Color Intelligence Layer provides measurements, theory-based suggestions, and aesthetic heuristics through Python calls or a single-request JSON process. Responses identify the method, assumptions, and limits of each calculation.

## Tool discovery and transport

```bash
python -m color_engine --describe
```

The response contains five provider-neutral tool definitions with JSON Schema arguments. Python integrations can call `color_engine.get_tool_definitions()` and register the functions with their agent runtime.

Send one request on stdin:

```json
{
  "method": "analyze_palette",
  "arguments": {
    "hex_colors": ["#FFFFFF", "#AAAAAA", "#000000"],
    "usages": [
      {
        "role": "caption",
        "foreground": "#AAAAAA",
        "background": "#FFFFFF",
        "kind": "text",
        "font_size_px": 16,
        "font_weight": 400
      }
    ]
  }
}
```

```bash
python -m color_engine < request.json
```

Stdout contains one JSON response: `{"ok": true, "result": ...}` or `{"ok": false, "error": {"code": ..., "message": ...}}`. Diagnostics go to stderr. Exit codes are 0 for success, 2 for invalid requests, and 1 for execution errors. Requests are limited to 1,048,576 characters. Non-finite JSON constants are rejected.

This transport processes one request per invocation. It does not start an HTTP or MCP server. Long-lived integrations can call the Python methods directly.

## Analysis workflow

1. Collect the actual colors and their intended roles. A palette contains 2–16 opaque sRGB colors in `#RGB`, `RGB`, `#RRGGBB`, or `RRGGBB` form.
2. Pass `usages` to evaluate actual foreground/background combinations. Every usage color must occur in the palette. A `kind` of `text` defaults to 16px at weight 400. A `kind` of `non_text` tests a 3:1 contrast target without an APCA typography judgment.
3. Inspect `usage_audit` and `actionable_guidance_for_ai`. A contrast proposal includes the proposed foreground, unchanged backgrounds, measured WCAG ratio, minimum absolute APCA contrast, search method, and verification scope. The color is measured after gamut mapping and hex quantization.
4. Apply a proposal only to its declared role and background. Re-run analysis after applying it, especially when a token is shared by several components. The search can return `null` when no candidate meets the requested targets.
5. Inspect harmony and aesthetic suggestions separately. Preserve intentional accent contrast or brand constraints when appropriate. Rendered typography, focus geometry, transparency, color-vision differences, and user preferences require additional checks.

Without `usages`, the matrix describes candidate combinations. Its pass rate is not an accessibility verdict for a page. Failing candidate pairs are summarized as information rather than treated as errors in a real interface. An explicit empty usage list declares no usages.

### Python example

```python
from color_engine import ScientificColorEngine

engine = ScientificColorEngine()
result = engine.analyze_palette(
    ["#FFFFFF", "#AAAAAA", "#000000"],
    usages=[{
        "role": "caption",
        "foreground": "#AAAAAA",
        "background": "#FFFFFF",
        "font_size_px": 16,
        "font_weight": 400,
    }],
)

for action in result["actionable_guidance_for_ai"]:
    if action["category"] == "contrast" and action.get("proposal"):
        proposal = action["proposal"]
        print(action["role"], proposal["foreground"], proposal["verified"])
```

APCA guidance uses a conservative subset of the published reference-font body-text recommendations. For example, Lc 75 supports 18px/400 or 16px/500, while 16px/400 requires the Lc 90 tier in this subset. Unsupported size/weight combinations produce an unassessed result (`null`), never an inferred pass. APCA results are separate from WCAG 2.2 conformance.

## Generation methods

| Method | Contract |
| :--- | :--- |
| `generate_palette(seed_hex, scheme_type)` | Generates one of eight classical schemes and analyzes its swatches. Inspect declared uses before applying colors. |
| `generate_tonal_ramp(seed_hex, step_count=12)` | Produces the supported 12-step scale. Other counts raise `ValueError`. Contrast is measured against step 1; functional labels are suggestions. |
| `generate_ui_design_system(seed_hex)` | Returns light/dark themes. All three typography roles are audited on all three listed surfaces. Button base and hover states have separate text tokens. Strong/focus borders are checked against the surfaces. Read `usage_constraints` for unverified accents and decorative borders. |
| `mix_palette_by_token(token, seed=42, palette_size=5, variance=0.12, version="v2", theme="auto")` | Supports sizes 3–8, always including canvas, brand, and text. `auto` selects dark for `Cyberpunk_Neon` and light otherwise; override with `light` or `dark`. Text is verified on generated neutral surfaces. |

Unknown or ambiguous tokens, unsupported versions, missing dataset files, invalid sizes, and non-finite variance values raise explicit errors. Exact normalized names and unique leading token names are accepted, such as `Modern_Tech`, `modern tech`, or `Modern`. There is no silent fallback to another aesthetic or dataset version.

Seeded output is repeatable for a fixed code, dataset, dependency version, and input. Area ratios sum to 1 and are layout suggestions based on role weights and chroma. They do not enforce a physical law or control the consuming layout. Returned `oklch` coordinates describe the emitted hex colors.

## Interpretation and compatibility

JSON transport envelopes and analysis, theme, and palette dictionaries use `schema_version: "0.2.0"`. The Python tonal-ramp method retains its list return type. Existing top-level analysis fields and the original theme audit aliases remain available. Changes that affect callers:

- Neutral palettes now return the same template schema as chromatic palettes.
- Ou-Luo scores implement the published equations, so composite scores and grades may change. The 60/40 composite remains an unvalidated project heuristic.
- Aesthetic results expose `score`, `method`, and `calibrated`. `confidence` remains a deprecated alias for the heuristic score; it is not a probability. Runtime analysis does not use the stored ML classifiers.
- No qualifying heuristic token returns `Unclassified`, rather than claiming a balanced neutral aesthetic.
- A four-color mixed palette now includes text. Seven- and eight-color requests return the requested count. `Cyberpunk_Neon` uses a dark canvas by default.
- Use `on_brand_hover_text` for the hover state; it may differ from `on_brand_text`.
- Unsupported ramp counts and previously tolerated invalid inputs now raise errors.
- Python 3.11 or later is required. Curated datasets are included in the installed package.
- CIEDE2000 calculation errors raise an explicit error instead of silently returning CIE76 under a CIEDE2000 field.

The stored V1/V2 models remain research artifacts. Their historical metrics use different labels and test colors, so they do not establish a controlled improvement in aesthetic quality. New V2 training runs isolate duplicate colors by split, fit embedding normalization on training colors only, and save artifacts into a fresh run directory. Promoting a new dataset into package resources is a separate, explicit release step.
