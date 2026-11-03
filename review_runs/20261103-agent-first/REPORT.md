# Agent-first correctness and integration review

Date: 2026-11-03. Baseline commit: `d74c38310111154d3109a18bfa63d5a3526f886b` on `color-intelligence-layer`.

## Result

The changes improve measurable correctness and agent usability. In the same 41-seed evaluation, all 738 generated normal-text/surface pairings now meet WCAG's 4.5:1 contrast target, compared with 492 before the changes. The minimum measured ratio rises from 2.8602 to 4.5032.

The same 17-method regression contract changes from 16 failing methods to none. Baseline logs contain 32 assertion-failure events and 13 error events, including subtests; these are not 45 separate test methods. Test-source and formula-fixture hashes match between the baseline and final evaluation.

| Check | Baseline | Updated |
| :--- | ---: | ---: |
| Fixed contract methods passing | 1 / 17 | 17 / 17 |
| Generated normal-text/surface pairs meeting 4.5:1 | 492 / 738 | 738 / 738 |
| Minimum ratio across those pairs | 2.8602 | 4.5032 |
| Original verification script | Passed | Passed |
| Expanded regression suite, Python 3.14.8 | Not present | 32 passed |
| Installed-wheel regression suite, Python 3.11.16 | Not present | 29 passed |

This evaluation does **not** establish improved human aesthetic preference, calibrated confidence, faster execution, or better ML classification. No model retraining was performed, and no existing model, chart, dataset, or historical evaluation report was replaced.

## Changes

- **Stable neutral-palette analysis.** Achromatic palettes use the same Matsuda return schema as chromatic palettes. Analysis handles black/white and duplicate gray swatches without a missing-key exception. Palettes are bounded to 2–16 colors and emitted hex values are canonical.
- **Published Ou-Luo equations.** The chroma difference uses the published divisor of 1.46. The hue contribution uses the chroma-dependent, lightness-dependent equations rather than a substituted cosine. Four frozen cases verify component values and pair-order symmetry. The composite normalizes against the paper's reported range; its 60/40 weights and grades remain explicitly unvalidated project heuristics.
- **Declared-usage audits.** `analyze_palette(..., usages=[...])` checks actual roles, backgrounds, font sizes, weights, and text/non-text targets. A passing unrelated palette pair cannot suppress an intended-role failure. Without usages, candidate failures are informational and the pair pass rate is not labeled page conformance.
- **Verified proposals.** Contrast suggestions contain an emitted foreground, unchanged backgrounds, exact measured ratio, APCA contrast, targets, method, and verification scope. A bounded search varies OKLch lightness, then measures the resulting gamut-mapped, quantized hex. It returns no proposal when no sampled candidate meets the targets. The tests independently measure proposals and replay a repaired usage.
- **Audited theme tokens.** All three typography roles are checked against all three supported surfaces. Muted/secondary text is adjusted where necessary. Base and hover buttons have separately selected text colors. Strong and focus borders are checked against supported surfaces. Decorative borders and semantic accent colors have explicit usage constraints.
- **Honest typography guidance.** APCA returns a documented subset of size/weight options for body text, separately from WCAG. Unsupported typography remains unassessed and produces an explicit informational action.
- **Predictable generation.** Mixed palettes return exactly 3–8 colors and always include text. Unknown tokens, versions, invalid counts, seeds, and variance values raise errors. `theme="auto"` chooses dark for `Cyberpunk_Neon`; explicit light/dark overrides remain available. Coordinates describe emitted hex values. Area proportions are labeled as role/chroma heuristics.
- **Explicit classification provenance.** Aesthetic responses expose an uncalibrated `score`, method, and limits. The legacy `confidence` field remains a deprecated alias. Runtime rules are not presented as the evaluated classifiers. No qualifying token returns `Unclassified`.
- **Agent transport.** `python -m color_engine --describe` exposes five provider-neutral tool schemas. A single-request stdin/stdout interface returns versioned JSON success/error envelopes, with diagnostics on stderr. This is a local process interface, not an MCP server.
- **Installed-package support.** Curated datasets are included as package resources. The minimum supported Python is 3.11, and the previously unresolved `Union` annotation is fixed. CIEDE2000 errors no longer silently return a different distance metric.
- **Evaluation protocol.** New V2 training runs separate identical canonical colors by group and fit embedding normalization on training colors only. Helpers have regression tests. New artifacts go to a fresh run directory; historical V1 metrics are labeled non-comparable context rather than an ablation or improvement claim. Full training was not rerun.

See [the agent API guide](../../docs/AGENT_API.md) for integration, defaults, and compatibility changes.

## Evidence and reproduction

- [Machine-readable comparison](./comparison.json)
- [Baseline evaluation and raw theme measurements](./baseline.json)
- [Final evaluation and raw theme measurements](./final.json)
- [Original environment](./environment.json)
- [Baseline regression log](./logs/baseline-contract.log)
- [Final source regression log](./logs/final-python314-tests-02.log)
- [Final original verification log](./logs/final-original-suite-02.log)
- [Final installed-wheel log](./logs/python311-installed-wheel-tests-03.log)
- [Build log for the verified wheel](./logs/wheel-build-03.log)
- [Agent example request](./agent-request.json) and [response](./agent-response.json)
- [Tool definitions](./tool-definitions.json)
- [Standalone formula-fixture derivation](./reference_fixture_derivation.py)
- [Source and artifact hashes](./manifest.json)

Run from the repository root:

```bash
python3 -m unittest discover -s tests -v
python3 test_color_engine.py
python3 scripts/evaluate_agent_contract.py --output review_runs/a-new-comparison.json
```

The evaluator refuses to overwrite an existing JSON result. The fixed comparison uses nine named seed colors and 32 pseudorandom colors with seed `20261103`, both themes, three typography roles, and three surfaces. This gives 41 × 2 × 3 × 3 = 738 pairs. Raw ratios use emitted sRGB colors rather than target OKLch coordinates. No speed claim is made: the evaluation timing also includes tests and import overhead.

The 32 source tests include the fixed contract, transport, repair edge cases, color round trips, CIEDE2000 reference behavior, and ML protocol helpers. Twenty-nine package-focused tests also run on the installed wheel from `/tmp`, verifying that imports and curated datasets resolve outside the checkout. The three ML protocol tests target repository training helpers rather than installed runtime modules.

All generated logs are retained, including intermediate failures. An initial installed-wheel test launch referenced a helper before it existed; that failed launch is preserved in `logs/python311-installed-wheel-tests.log`. Runs `-02` and `-03` contain successful package tests. The baseline, intermediate wheel builds, and final wheel remain in separate directories. The final artifact is `verified-wheel/color_intelligence_layer-0.1.0a0-py3-none-any.whl`.

## Remaining limits

The contrast checks assume opaque sRGB colors. They do not inspect rendered layouts, font glyphs, transparency, focus geometry, color-vision deficiencies, or user-specific display settings. Semantic status colors require intended-use audits and non-color cues. APCA recommendations use a conservative reference-font subset rather than a complete font lookup table.

The palette harmony score combines an OKLch adaptation of hue templates with the mean of a two-color model. It does not measure universal visual quality. Aesthetic rules operate on unweighted swatches, so a dark text color cannot establish that the actual layout has a dark canvas. Weak-label profiles and classifiers still need independent human-reviewed evaluation on a common held-out set before model improvement can be established.

The training protocol changes are tested in isolation; their effect on trained model metrics is unmeasured. Published weights and original reports remain historical artifacts. Promoting new training outputs into package resources requires an explicit release step.

## References

- [Ou and Luo, 2006: A colour harmony model for two-colour combinations](https://doi.org/10.1002/col.20208), equations 3–11; [author-uploaded full text](https://www.researchgate.net/publication/229906278_A_colour_harmony_model_for_two-colour_combinations).
- [Myndex APCA general use-case and size guidance](https://github.com/Myndex/SAPC-APCA/blob/master/documentation/APCA_in_a_Nutshell.md).
- [Sharma et al., CIEDE2000 supplementary test pairs](https://hajim.rochester.edu/ece/sites/gsharma/ciede2000/dataNprograms/ciede2000testdata.txt).
