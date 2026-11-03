# Color Engine Research & Technical Reports

This directory houses the foundational research papers, mathematical derivations, architecture specifications, and empirical machine learning evaluations developed for the **Scientific Color Engine for AI Agents**.

---

## Technical Reports Index

| Report | Document | Focus & Highlights |
| :---: | :--- | :--- |
| **01** | [`color_engine_research.md`](./color_engine_research.md) | **Foundational Research & Science**: Colorimetric pitfalls (sRGB, CIELAB Abney effect), OKLch perceptual space, Matsuda 8 templates, Cohen-Or harmonic energy optimization, Munsell renotation, WCAG 2.2 vs APCA, and Ou et al. empirical emotion coordinates. |
| **02** | [`color_theory_and_generators.md`](./color_theory_and_generators.md) | **Advanced Math Theory & Algorithmic Generators**: Formulates classical theory (Moon & Spencer area balance, Birkhoff aesthetic measure, Itten chords) into OKLch geometry. Derives monochromatic, analogous, complementary, split-complementary, triadic, tetradic, 12-step monotonic tonal ramps, and full UI design systems. |
| **03** | [`color_engine_spec.md`](./color_engine_spec.md) | **Modular Architecture & JSON Specification**: Complete architecture specification of [`color_engine/`](../../color_engine). Documents API interfaces, input parameters, prescriptive agent guidance algorithms, and deterministic JSON schemas. |
| **04** | [`model_evaluation_v1.md`](./model_evaluation_v1.md) | **Machine Learning Ensemble Evaluation (V1 Baseline)**: Multi-model ensemble (Random Forest, HistGradientBoosting, Calibrated Logistic Regression) trained across 100,000 swatches. Macro ROC-AUC $0.8982$, PR-AUC $0.6954$, Hamming Accuracy $84.24\%$. Identifies class collapse on rare tokens. |
| **05** | [`model_evaluation_v2.md`](./model_evaluation_v2.md) | **Ablation Benchmark: V1 Baseline vs V2 Upgraded**: Zero-shot dense text embeddings (`all-MiniLM-L6-v2`), negation-aware programmatic weak supervision, 28-D perceptual physics features, Ensemble of Classifier Chains (ECC), Mahalanobis distance, and Maximal Marginal Relevance (MMR) diverse swatch curation. |

---

## Visual Evaluation Assets

- **V1 Baseline Charts**: [`../../model/eval/`](../../model/eval)
  - `roc_curves.png`, `precision_recall_curves.png`, `model_performance_dashboard.png`, `feature_importance.png`, `token_correlation_matrix.png`, `confusion_matrices_grid.png`.
- **V2 Upgraded Charts**: [`../../model/eval_v2/`](../../model/eval_v2)
  - `v1_vs_v2_comparison_chart.png`, `roc_curves_v2.png`, `precision_recall_curves_v2.png`, `feature_importance_v2.png`, `token_correlation_matrix_v2.png`, `confusion_matrices_grid_v2.png`.
