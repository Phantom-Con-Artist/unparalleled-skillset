# Fixed experimental protocol

Written after source review and data-format/coverage inspection, before fitting experimental models. Baseline engine commit: `b21aa904896cb897ec5ad8e16b7b8debbcc93be5`.

## Hypotheses

H1: Represented input tokens contain enough information to improve reference-palette matching over no-text baselines.
H2: Propagating signals through a training-derived token graph improves matching over direct token retrieval.
H3: A small neural model improves matching over linear and retrieval baselines.
H4: Numerical contrast constraints can be enforced while quantifying, rather than hiding, color changes and matching degradation.
H5: A candidate's internal similarity score correlates with external held-out palette distance; this is not assumed.

## Data and leakage controls

Use the PAT RGB/text CSVs from CyberAgentAILab/text2palette, revision `45948e2f3baddb9bab61921b5d5fbc9b0a8b6809`. Parse textual literals with `ast.literal_eval`; do not execute downloaded code or deserialize remote pickle/model files. Compute our own color coordinates from RGB instead of trusting serialized Lab representations.

Preserve the published train/validation/test assignments. Deduplicate palettes within each split. Remove validation rows whose normalized full description or unordered exact RGB palette occurs in training. Remove test rows whose description or palette occurs in retained training or validation. Fit vocabulary, IDF, graph, feature transforms, scaling, regressors, and optional dimensionality reduction on training only. Select hyperparameters on validation only. Freeze choices before test scoring. Save row IDs and hashes. Report out-of-vocabulary coverage and missing concepts.

## Methods

1. Fixed-seed random training palette, without text.
2. A constant mean training palette, sorting each input by OKLab lightness before averaging.
3. Direct TF-IDF token/caption cosine retrieval from training palettes.
4. Token-graph propagation: training caption co-occurrence, row-normalized edges, personalized restart diffusion from the requested token weights, then palette retrieval. Test propagation strengths 0.15, 0.35, and 0.60; alpha=0 must reproduce direct retrieval.
5. Linear generation: ridge regression from a training-fitted 64-dimensional text representation to a lightness-sorted five-color OKLab representation. Tune alpha in 1, 10, 100.
6. Neural generation: MLP regressor with one 64-unit or two (128,64)-unit hidden layers, L2 alpha 0.01, early stopping based only on an internal training split, at most 150 iterations. Evaluate seeds 11, 29, 47. Select architecture by average validation distance.
7. Neural palette retrieval: regress from permutation-invariant color features into the same text representation, then retrieve training palettes by cosine to the request. Use the same two architectures, seeds, and validation selection rule.

Use TF-IDF unigrams with min_df=2, max_features=2000, and English stop words; preserve normal lexical tokens. Use up to 64 SVD dimensions, with a fixed seed, fitted on training. These are lightweight baselines inspired by the literature, not reproductions of the published GANs, transformers, or IBM graph.

## Independent measurements

Primary: mean optimal one-to-one matching distance between the five predicted and five held-out reference colors, using the Hungarian assignment and Euclidean OKLab distance multiplied by 100. The measure is permutation-invariant and independent of training-caption retrieval scores. It is a reference-color fidelity proxy, not a beauty rating; its units differ from the papers' DCCW measures.

Also report median distance, within-palette color diversity, unique color counts, and deterministic run metadata. Compare methods on identical test rows. For stochastic models, average per-query distances across the three seeds before paired uncertainty calculations. Use 2,000 bootstrap draws clustered by normalized test description for 95% intervals and pairwise differences. Do not select the winning model from test results; label the validation-selected method separately.

Use shuffled test requests as a negative control, preserving the reference palette assignments. Report whether semantic conditioning improves over that control.

For retrieval methods, test the rank correlation between the internal score and independently measured reference error. Do not report cosine, diffusion strength, or neural similarity as a calibrated probability. Zero-vocabulary requests receive an explicit coverage indicator and no confident semantic score.

## Accessibility experiment

Before seeing test results, select up to 200 retained test rows with seed 20261103. Alternate light/dark requests by fixed sample order. Apply the same role assignment and constraint procedure to every method's palette. Report pre-projection and post-projection fidelity, actual paired color movement, feasibility, and raw pass counts.

Use five primary roles: canvas, surface, body text, brand, and accent. Assign them deterministically from lightness/chroma without reading the target palette. For dark themes cap canvas/surface OKLch lightness at 0.20/0.30; for light themes floor them at 0.97/0.92. This is a declared design prior, not a learned aesthetic fact.

Require body text on both surfaces to meet WCAG AA normal-text 4.5:1 and the engine's conservative APCA Lc90 guidance for 16px/400 body text. Require brand and accent graphics on canvas to meet 3:1. Select black or white button text and measure it against brand at 4.5:1. Retain separate audit values for each pairing. Search for repairs using actual emitted colors; if infeasible, report failure, not an approved palette. Text over images, opacity, color vision, and full WCAG conformance are outside this experiment.

## Prototype and reporting

Keep research models and code separate from published engine behavior. The prototype may accept a weighted token map and return ranked role palettes with score provenance, input coverage, independently computed usage audits, and before/after color changes. Unsupported tokens must be explicit. Examples for missing concepts are capability-limit demonstrations, not evidence that those concepts were learned.

Save all logs, configurations, selected hyperparameters, per-query measurements, source hashes, and reports. Do not overwrite existing artifacts or use current engine heuristic aesthetic scores as evaluation labels. Preserve historical models and default tools. A human preference study and a better labeled aesthetic-token dataset remain necessary before claiming general style quality.
