# Local alpha: agent semantics and palette curation

Color Intelligence Layer 0.2.0a1 translates human aesthetic terms into structured palette proposals using an offline linear model. The official Python MCP SDK v2 exposes the service over stdio. No cloud service, API key, listening port or runtime download is needed. Installation requires dependency downloads unless a wheelhouse is available.

## Install and run

Use Python 3.11 or later in a dedicated environment:

```bash
python -m venv .venv
.venv/bin/python -m pip install .
.venv/bin/color-intelligence doctor
.venv/bin/color-intelligence generate 'calm cyberpunk, avoid maximalism' --theme dark
.venv/bin/color-intelligence analyze '#101020' '#EEEEFF' '#CC00FF' '#00FFFF' '#202030'
.venv/bin/color-intelligence search calm
.venv/bin/color-intelligence-mcp
```

On Windows, use `.venv\Scripts\python.exe` and the corresponding entry points. The server reads MCP messages on stdin and writes protocol messages on stdout; diagnostics go to stderr. EOF stops the process. The legacy `python -m color_engine` single-request JSON transport remains available separately.

A ready-to-use configuration for this checkout is in [`examples/mcp.local.json`](../examples/mcp.local.json). A portable template is:

```json
{
  "mcpServers": {
    "color-intelligence": {
      "command": "/absolute/path/to/.venv/bin/color-intelligence-mcp",
      "args": ["--db", "/absolute/path/to/color-catalog.sqlite3"]
    }
  }
}
```

Use an absolute executable path. A working directory is unnecessary after installation. Each client starts a local process; SQLite supports persistent shared catalog data. Without `--db`, `COLOR_INTELLIGENCE_DB` takes precedence; otherwise the database lives at `$XDG_DATA_HOME/color-intelligence/catalog.sqlite3`, or `~/.local/share/color-intelligence/catalog.sqlite3`. Keep backups of that database using SQLite's backup API or while the process is stopped. Filesystem access controls protect the local data; MCP is not an authenticated multi-user service.

## Agent workflow

1. Read `color://vocabulary` or search with `vocabulary`. Inspect descriptor proxies and limitations, especially for terms that imply materials, layout or cultural context.
2. Call `generate_palette` with a brief or weighted `tokens`, an explicit theme and actual typography. For example, `{"tokens":{"cyberpunk":2,"calm":1},"theme":"dark","font_size_px":16,"font_weight":400}`. Weights are non-negative, finite and at most 100. Unknown explicit terms are returned with suggestions; an entirely unsupported request fails. Brief parsing recognizes longest phrases and simple local negation, not full natural-language syntax.
3. Inspect `status`, `certificate`, `changes`, `locked_roles` and `unresolved`. Treat any `infeasible` result as unusable under the requested policy. A bounded repair search can fail even when a different palette might work. Background adjustments are enabled by default and can be disabled; locked roles are preserved exactly.
4. Use returned CSS roles only in the certified pairs. Body text is checked on canvas and surface, brand/accent as non-text on canvas, and a label on brand. Other contexts require `analyze_palette` with explicit usages. `level="AAA"` applies stricter text ratios; `apca=false` requests WCAG-only numerical checks. Unsupported APCA typography fails the combined policy.
5. Search or save palettes to the local catalog. Saving recomputes numerical checks; it does not grant aesthetic approval. Use `export_palette` for JSON or CSS.
6. Append actual review evidence with `record_aesthetic_review`. Automated judgments use `actor="agent"`. Agents must never impersonate human reviewers.

All nine MCP tools expose structured output schemas and local/read/write annotations. Three static resources, one palette resource template, and two prompts support discovery. `color://methods` reports the model and training source. `save_palette` and `record_aesthetic_review` write only to the configured local database; exports return data without writing files.

## What is verified

Numerical certification and aesthetic review are independent:

- Certificates use full-precision measurements of the actual emitted opaque sRGB hex colors. AA text requires 4.5:1, or 3:1 for qualifying large text. AAA text requires 7:1, or 4.5:1 for qualifying large text. Declared non-text pairs require 3:1. The default combined policy also applies the existing conservative APCA body guidance, typically Lc90 at 16px/400.
- A certificate covers five declared pairs. It does not certify a whole interface or all WCAG requirements. APCA is supplemental guidance, not a WCAG 2.2 criterion. Gradients, transparency, imagery, component states and conveying information through color need further checks.
- The bundled catalog contains 234 project-authored presets and four adapted designer themes. None has an independent human aesthetic approval. Theme source authorship does not validate our added tags or modifications.
- A palette/tags combination becomes `client_attested_human_reviewed` after two distinct client-attested human approvals with no outstanding human rejection. The most recent decision per case-folded reviewer identifier counts. Reviews are append-only, retained across restarts, and tied to immutable content hashes. Identities are self-reported, not authenticated; this is a local curation workflow, not a certification authority. Numerical certificates must still be inspected separately.

An agent cannot prove that a palette is cyberpunk, beautiful or appropriate by assigning its own score. `human_reviewed=true` initially returns no entries. Grow the reviewed collection with actual design examples, defined use contexts, independent reviewers and written evidence; preserve both approvals and disagreements.

## Model and vocabulary

The production generator is the previously evaluated PAT ridge model: TF-IDF → 64-dimensional SVD → standardized ridge regression → five OKLab colors. The affine stages are folded into portable NumPy arrays. Runtime inference uses neither pickle nor scikit-learn. The manifest includes training revision and export error.

The 117 canonical terms and 185 aliases are project-authored interpretations. Each maps to explicit descriptive words available to the training representation. This expands request coverage; it does not add newly labeled training examples. “Cyberpunk,” for example, uses a dark/neon/purple/blue/electric/city proxy. Definitions disclose contextual limits. Weighted descriptors combine linearly before palette generation; gamut mapping and contrast repair are subsequent nonlinear numerical operations.

Palette analysis uses a separate provisional ridge encoder from permutation-invariant five-color features into caption SVD space. Other palette sizes are sorted by lightness and interpolated to five colors. Cosine similarities range from −1 to 1 and are **uncalibrated relative affinities**, not percentages, aesthetic probabilities or quality scores. Correlated terms can all score highly; output is not a probability distribution. The inverse encoder has not been validated against human style judgments.

The earlier held-out study found no reliable neural-model advantage over ridge. Its dataset, uncertainty intervals and coverage limitations remain in [the research report](../review_runs/20261103-token-conditioning/REPORT.md). Exact export equivalence preserves the generator's measured behavior; it does not prove better design outcomes from the expanded vocabulary.

## Sources and reproducibility

- Official MCP implementation and [v2 migration guide](https://github.com/modelcontextprotocol/python-sdk/blob/main/docs/migration.md). Runtime supports `mcp>=2.2,<3`; protocol tests cover SDK 2.2.0 and 2.3.0 in separate Python environments.
- [PAT source repository](https://github.com/CyberAgentAILab/text2palette), revision `45948e2f3baddb9bab61921b5d5fbc9b0a8b6809`; source MIT notice is bundled as `PAT_LICENSE.txt`.
- [Catppuccin palette](https://github.com/catppuccin/palette): original palette facts, source version and source SHA-256 are retained; MIT notice is bundled as `CATPPUCCIN_LICENSE.txt`. Contrast-adapted variants are our work and retain their original colors and change records.
- [WCAG 2.2 contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [enhanced contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html), and [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

Run the tests from the repository. The research-specific tests require the optional dependencies:

```bash
python -m pip install '.[research]'
python -m unittest discover -s tests -v
python test_color_engine.py
```

For a runtime-only install, run `test_local_alpha.py` and `test_mcp_stdio.py` using unittest discovery. The latter uses a real stdio subprocess with socket connection/binding/name-resolution calls blocked. Export and comparison scripts require the locally retained research bundle and source dataset; these are not runtime dependencies. `scripts/build_vocabulary.py`, `scripts/tune_inverse.py`, `scripts/export_linear.py`, `scripts/build_catalog.py` and `scripts/verify_alpha.py` document the build path. Catalog rebuilding fetches source material; normal service use never does.

All alpha evaluation logs, reports and sample outputs are kept under [review_runs/20261103-local-alpha](../review_runs/20261103-local-alpha/). Earlier evidence is retained in its original directories.
