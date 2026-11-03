# Local linear alpha evaluation — 2026-11-03

The local Color Intelligence Layer alpha is implemented end to end. It uses the official Python MCP SDK v2 over stdio, portable linear-model inference, explicit semantic descriptors, numerical contrast repair, and an additive SQLite curation workflow. No cloud server, inference API, runtime model download or listening port is required.

## Delivered scope

- 117 canonical aesthetic terms, 185 authored alias entries, and 300 distinct normalized recognized names. All terms carry explicit descriptors, provenance and contextual limitations. Weighted terms blend through the existing linear generator; a deterministic phrase parser also accepts short briefs and simple negation.
- 238 bundled palettes: 234 project-authored light/dark presets plus four adapted Catppuccin themes. Each retains original colors, adaptation changes and provenance. All 238 are independently rechecked against their own numerical certificate. None has an independent human aesthetic approval.
- Two linear models: the established text-to-palette ridge generator and a new provisional palette-to-caption ridge encoder. Both ship as safe numeric NumPy resources, with no runtime pickle, scikit-learn or joblib dependency.
- Nine typed MCP tools: capabilities, vocabulary, generation, analysis, search, retrieval, save, review and export. Read/write annotations, three static resources, one parameterized palette resource and two prompts support agent discovery.
- Local SQLite persistence: idempotent seeding, immutable additive palette saves, content hashes, parameterized queries, append-only review events, retained disagreements and persistence across process restarts. Two distinct client-attested human approvals with no outstanding human rejection qualify a palette/tags combination as reviewed. Agent reviews do not count. Identities are not authenticated.
- CLI entry points, Python application API, preserved legacy scientific APIs, a ready-to-use local client configuration in `examples/mcp.local.json`, and a detailed operating guide in `docs/LOCAL_ALPHA.md`.

## Evidence

| Check | Result |
| --- | --- |
| Complete unittest suite, Python 3.14.8 / MCP 2.2.0 | 51 tests pass |
| Complete unittest suite, Python 3.11.16 / MCP 2.3.0 | 51 tests pass |
| Runtime-only wheel, Python 3.11 / MCP 2.3.0, outside checkout | Seven application tests and one real MCP protocol integration test pass |
| Legacy unmocked engine verification | All checks pass |
| Runtime-only scientific analysis and UI generator smoke | Pass |
| Fresh certification of bundled palettes | 238/238 pass, covering 1,190 declared role pairs |
| Portable TF-IDF vs reference, 820 held-out captions | Maximum absolute error 1.11 × 10⁻¹⁶ |
| Portable generator vs reference, 820 held-out captions | Maximum absolute error 3.33 × 10⁻¹⁶ |
| Portable inverse features vs reference, 820 palettes | Maximum absolute error 0 |
| Offline runtime smoke | Eight successful generation requests; no network attempts |
| Offline MCP integration | Initialization, discovery, generation, save, review, reads, resources, prompts, invalid-input errors and restart persistence pass with socket connect/bind/name resolution blocked |
| Eight-request generation latency on this machine | Median 0.144 seconds; maximum 0.221 seconds; excludes process startup |

Machine-readable values are in [verification.json](verification.json); actual palettes, scores and repairs are in [sample_outputs.json](sample_outputs.json). Timings describe this small local sample, not a throughput guarantee.

The clean wheel environment explicitly lacks `sklearn`, `joblib`, `pandas` and `scipy`. It imports the installed package from site-packages while running outside the repository. See [wheel-environment.log](logs/wheel-environment.log), [wheel-alpha-python311.log](logs/wheel-alpha-python311.log), [wheel-mcp-offline-python311.log](logs/wheel-mcp-offline-python311.log) and [wheel-scientific-smoke.log](logs/wheel-scientific-smoke.log).

## Comparison and interpretation

The prior research found ridge and the multilayer perceptron effectively tied: mean held-out palette matching errors were 17.707 and 17.688 respectively, with a paired interval crossing zero. This alpha promotes the linear baseline. Floating-point equivalence across all 820 held-out examples demonstrates that export preserves its numerical generator predictions. It does not establish an improvement in aesthetic quality.

The new inverse ridge encoder maps 40 permutation-invariant palette features into the 64-dimensional caption SVD space. Regularization was selected from six candidate values using validation caption cosine only; the selected alpha was 10,000, at the upper grid boundary. On the 594 covered held-out descriptions:

| Inverse representation | Mean description-embedding cosine |
| --- | ---: |
| Constant training-mean caption embedding | 0.1309 |
| Initial provisional ridge, alpha 10 | 0.1530 |
| Validation-selected ridge, alpha 10,000 | 0.1628 |

This is modest caption alignment on the existing corpus, not a validated style classifier. We have no independent human style ratings, calibrated aesthetic probabilities, or evidence that these scores predict beauty. Candidate results and the selection rule are retained in [inverse-selection.json](inverse-selection.json). The selected regularization should be reconsidered with more representative labeled data; the grid boundary does not establish a global optimum.

Vocabulary expansion improves explicitly supported request coverage: the old fixed mixer accepted ten aesthetic tokens; the alpha accepts 117 canonical concepts and their aliases. This comparison concerns API coverage, not predictive accuracy. The expanded concepts use project-authored descriptor proxies rather than newly collected human training labels. The original corpus had no “cyberpunk” or “maximalism” examples and only one “minimalism” example; these limitations remain.

Source-designed Catppuccin colors supply genuine designer provenance. Our tags and repairs are separately attributed and provisional. The catalog initially has **zero human-reviewed entries**. Agents can help propose and audit examples, but verified aesthetic curation requires actual human judgments and retained evidence.

## Contrast repair findings

The initial catalog build passed only 27/238 combined-policy certificates. A brand color could pass non-text contrast against canvas while offering no label at the conservative APCA target. Adding brand repair raised this to 236/238. Two remaining cases exposed polarity asymmetry: high brand-on-canvas APCA does not guarantee high label-on-brand APCA in the reverse direction. The final search checks the emitted label direction explicitly, yielding 238/238 verified seed palettes.

All stages and their logs are preserved. The failing initial test is retained, as are the subsequent successful runs. This is evidence of a concrete correctness fix; it is not evidence that repaired palettes look better. Read `adaptation_changes` and the actual colors before choosing a palette.

Certificates cover body/canvas, body/surface, brand/canvas and accent/canvas as non-text, and label/brand. AA/AAA text thresholds use declared typography; default combined checks also require conservative APCA guidance. Locked colors are never changed. Infeasible or unsupported typography requests return explicit failures, and background changes can be disabled. This bounded search does not prove global feasibility or minimal color movement.

## Limitations and next evidence needed

- Color alone cannot identify layout, material, lighting, typography, cultural meaning or accessibility of an entire interface.
- The prior benchmark has limited modern-style vocabulary and repeated unigram vectors across splits despite disjoint full captions and palettes. Its results cannot validate all newly authored style proxies.
- Palette sizes other than five use sorted interpolation for inverse features. Similarity scores are relative, may be negative, and are not probabilities.
- The default Lc90 body/label policy is conservative and can substantially alter color identity. Inspect changes and select actual typography; WCAG-only checks are available explicitly.
- Certificates exclude gradients, alpha compositing, imagery, component states, color-only meaning and other WCAG requirements.
- Human-review identity is client-attested. This alpha provides local provenance and review records, not authenticated reviewer identity or universal aesthetic certification.
- APIs and local schema are alpha-stage. Palette content is additive; future revised presets must use new identities to preserve review meaning.

The next quality study should collect independent, context-specific human style judgments, compare the linear baseline with descriptor-expanded requests under matched constraints, and evaluate aesthetic agreement separately from contrast success. The alpha now provides the tools and records needed to collect that evidence without inventing it.

## Reproduction and retained artifacts

See [PLAN.md](PLAN.md), the build/export scripts in `scripts/`, [LOCAL_ALPHA.md](../../docs/LOCAL_ALPHA.md), and every raw run in [logs/](logs/). Model export and held-out comparisons require the locally retained research bundle and dataset; ordinary installation and MCP use do not. Theme source facts and checksums are retained in [sources/](sources/), and third-party MIT notices are packaged with the runtime. Locally built wheels and smoke SQLite databases remain on disk and are ignored by Git. Earlier research evidence and all existing logs remain intact.
