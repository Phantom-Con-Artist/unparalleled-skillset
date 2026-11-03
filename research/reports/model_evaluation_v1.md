# Machine Learning Ensemble Evaluation & Visual Analysis Report (V1 Baseline)

> [!IMPORTANT]
> **Executive Summary**: We trained a multi-model ensemble combining **Random Forest** (100 estimators, bagging), **HistGradientBoosting** (histogram-based gradient boosted decision trees), and **Calibrated Logistic Regression** across 100,000 empirically grounded color swatches ([`color_pedia.parquet`](../../data/raw/color_pedia.parquet)).
> 
> * **Mean ROC-AUC**: **0.8982** across all 10 aesthetic tokens on the untouched 15,000 test set.
> * **Mean Average Precision (PR-AUC)**: **0.6954**.
> * **Hamming Accuracy**: **84.24%** (Hamming Loss: $0.1576$).
> * **Optimal Decision Thresholds**: Dynamically calibrated per token on validation curves to maximize $F_1$-score.

---

## 1. Visual Evaluation Gallery

The following publication-grade visual charts were generated and archived in [`model/eval/`](../../model/eval):

### Multi-Label ROC Curves (Mean AUC = 0.898)
![Multi-Label ROC Curves](../../model/eval/roc_curves.png)

### Multi-Label Precision-Recall Curves (Mean AP = 0.695)
![Precision-Recall Curves](../../model/eval/precision_recall_curves.png)

### Model Performance Dashboard (F1, AUC, PR-AUC per Token)
![Performance Dashboard](../../model/eval/model_performance_dashboard.png)

### Top Perceptual Feature Importances (Random Forest)
![Feature Importance](../../model/eval/feature_importance.png)

### Token Semantic Correlation Heatmap
![Semantic Correlation Heatmap](../../model/eval/token_correlation_matrix.png)

### Normalized Confusion Matrices Grid (2x5 Tokens)
![Normalized Confusion Matrices Grid](../../model/eval/confusion_matrices_grid.png)

---

## 2. Test Set Evaluation Metrics (15,000 Untouched Samples)

| Aesthetic Token | Optimal Threshold | ROC-AUC | PR-AUC (Avg Prec) | Precision | Recall | $F_1$-Score | Accuracy |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`Earthy_Organic`** | $0.44$ | **$0.9369$** | $0.8430$ | $0.7410$ | $0.7709$ | **$0.7556$** | $88.1\%$ |
| **`Calm_Peaceful`** | $0.46$ | **$0.9278$** | $0.8838$ | $0.7981$ | $0.8272$ | **$0.8124$** | $85.3\%$ |
| **`Bold_Dramatic`** | $0.47$ | **$0.9094$** | $0.8615$ | $0.7592$ | $0.7816$ | **$0.7702$** | $83.2\%$ |
| **`Playful_Vibrant`** | $0.35$ | **$0.8920$** | $0.8221$ | $0.7240$ | $0.7957$ | **$0.7581$** | $80.6\%$ |
| **`Corporate_Trustworthy`** | $0.47$ | **$0.9032$** | $0.7494$ | $0.6920$ | $0.7212$ | **$0.7063$** | $85.0\%$ |
| **`Minimalist_Serene`** | $0.41$ | **$0.8881$** | $0.7788$ | $0.7185$ | $0.7360$ | **$0.7271$** | $82.4\%$ |
| **`Luxury_HighEnd`** | $0.43$ | **$0.9016$** | $0.6803$ | $0.6288$ | $0.6552$ | **$0.6417$** | $86.2\%$ |
| **`Elegant_Sophisticated`** | $0.40$ | **$0.8863$** | $0.6711$ | $0.6315$ | $0.6573$ | **$0.6441$** | $83.6\%$ |
| **`Modern_Tech`** | $0.48$ | **$0.8832$** | $0.6113$ | $0.5694$ | $0.5850$ | **$0.5771$** | $86.5\%$ |
| **`Cyberpunk_Neon`** | $0.20$ | **$0.8540$** | $0.0523$ | $0.0910$ | $0.1055$ | **$0.0978$** | $97.6\%$ |
| **Macro Average** | — | **$0.8982$** | **$0.6954$** | **$0.6353$** | **$0.6636$** | **$0.6490$** | **$85.8\%$** |

---

## 3. Key Machine Learning Findings

### 3.1 What Color Features Drive Aesthetic Categorization?
The ensemble model reveals the exact physical and perceptual drivers of design aesthetics:
1. **`oklab_a` (Green-to-Red axis, 20.45% importance)**:
   * The human eye's red-green opponent channel is the single strongest discriminator. It sharply separates `Earthy_Organic` (warm ochres, terracotta) and `Playful_Vibrant` from `Corporate_Trustworthy` and `Modern_Tech` (cyan/blue).
2. **`oklch_C` (Chroma / Saturation, 14.40% importance)**:
   * Determines perceptual volume. High chroma triggers `Playful` and `Cyberpunk`; suppressed chroma triggers `Luxury` and `Minimalist`.
3. **$\cos(h)$ and $\sin(h)$ (Cyclical Hue Coordinates, 20.84% combined)**:
   * By encoding hue as continuous harmonic angles on the unit circle $S^1$, the model avoids boundary discontinuities between $359^\circ$ and $0^\circ$.
4. **`heavy_light` & `active_passive` (Ou Psychophysical Emotions, 19.77% combined)**:
   * Empirical affective dimensions provide higher-order visual cues that linear RGB channels cannot capture.

---

## 4. Curated Dataset & PRNG Ratio Mixer

* **Curated Dataset File**: [`data/curated/aesthetic_token_dataset.json`](../../data/curated/aesthetic_token_dataset.json).
* **PRNG Mixer Engine**: [`color_engine/generators/prng_mixer.py`](../../color_engine/generators/prng_mixer.py).
* **Deterministic Moon & Spencer Area Balancing**:
  $$\text{Area Proportion } (A_i) \propto \frac{\text{Role Baseline}}{1.0 + 2.5 \cdot C_i}$$
  Guarantees that macro surfaces occupy $\approx 64\%$ area, secondary cards $\approx 20\%$, brand accents $\approx 9\%$, focal CTAs $\approx 2.7\%$, and text glyphs $\approx 4\%$.
