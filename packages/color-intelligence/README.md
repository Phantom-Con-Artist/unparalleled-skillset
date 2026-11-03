# Color Intelligence Layer (vendored)

The offline palette engine that the Unparalleled skills call during the **Color** step of Design.md. It turns weighted aesthetic terms into role-based palettes, certifies declared foreground/background pairs against WCAG 2.2 (with APCA as supplementary guidance), analyzes existing palettes, and keeps a local catalog of palettes and human review records.

Vendored from the `Color Engine` workspace at commit `b453653` (version `0.2.0a1`, Apache-2.0). Only the runtime package, its docs and its runtime tests are copied. The research datasets, training scripts and review runs stay in the source workspace.

## Install

```bash
npm run color:setup    # creates packages/color-intelligence/.venv, installs, writes .mcp.json
npm run color:doctor   # prints model, vocabulary and catalog facts
npm run test:color     # 37 runtime tests, including a real MCP stdio round trip
```

Requires Python 3.11 or later (`--python <path>` selects one). Runtime dependencies are `colour-science`, `numpy` and `mcp>=2.2,<3`. No network access is needed at runtime.

`.mcp.json` is machine-specific (absolute paths) and ignored by git. Re-run `npm run color:setup` after cloning.

## Interfaces

| Interface | Command | Use |
| --- | --- | --- |
| MCP server | `.venv/bin/color-intelligence-mcp --db <catalog.sqlite3>` | Preferred. Tools: `capabilities`, `vocabulary`, `generate_palette`, `analyze_palette`, `search_palettes`, `get_palette`, `save_palette`, `record_aesthetic_review`, `export_palette`. |
| CLI | `.venv/bin/color-intelligence generate '<brief>' --theme light` | Fallback when MCP is not connected. JSON on stdout. |
| JSON transport | `.venv/bin/python -m color_engine < request.json` | Scientific API: `analyze_palette`, `generate_ui_design_system`, `generate_tonal_ramp`, `generate_palette`, `mix_palette_by_token`. |

How the skills use it, including what its certificates do and do not prove, is in `.agents/skills/*/references/intelligence/color.md`. Full details: [LOCAL_ALPHA.md](docs/LOCAL_ALPHA.md) and [AGENT_API.md](docs/AGENT_API.md).

## Limits

Certificates cover the declared opaque sRGB role pairs only. Aesthetic similarity scores are uncalibrated and no bundled palette has an independent human aesthetic approval. Rendered pages still need measured pairs from the browser.
