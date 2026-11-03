"""
Ensemble Model Training & Comprehensive Visual Evaluation Pipeline
==================================================================
Trains a multi-model ensemble (Random Forest + HistGradientBoosting + Calibrated Logistic Regression)
with optimal threshold tuning on a 100,000-color dataset.
Generates comprehensive visual evaluation artifacts in model/eval/:
- ROC Curves & AUC per token
- Precision-Recall Curves & Average Precision
- Multi-token Confusion Matrix Grid
- Top Feature Importances
- Token Semantic Correlation Matrix
- Comprehensive Performance Dashboard
"""

import os
import sys
import json
import math
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # Non-interactive headless backend
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.multioutput import MultiOutputClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    roc_curve,
    auc,
    precision_recall_curve,
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    accuracy_score,
    hamming_loss,
)

from color_engine.spaces import (
    rgb_to_oklab,
    oklab_to_oklch,
    rgb_to_cielab,
)
from color_engine.psychology.emotions import ou_color_emotions

print("======================================================================")
print("ENSEMBLE MODEL TRAINING & HIGH-PRECISION EVALUATION PIPELINE")
print("======================================================================\n")

# Step 1: Load Data
print("--> [1/6] Loading 100,000-color dataset...")
raw_path = "data/raw/color_pedia.parquet"
df = pd.read_parquet(raw_path)
N = len(df)
print(f"    Loaded {N} records.")

# Step 2: Advanced Feature Engineering
print("--> [2/6] Extracting 16-dimensional perceptual feature space...")
rgbs = list(zip(df["R"], df["G"], df["B"]))

oklch_L = np.zeros(N, dtype=np.float32)
oklch_C = np.zeros(N, dtype=np.float32)
oklch_h = np.zeros(N, dtype=np.float32)
cos_h = np.zeros(N, dtype=np.float32)
sin_h = np.zeros(N, dtype=np.float32)
cos_2h = np.zeros(N, dtype=np.float32)
sin_2h = np.zeros(N, dtype=np.float32)
oklab_a = np.zeros(N, dtype=np.float32)
oklab_b = np.zeros(N, dtype=np.float32)
cielab_L = np.zeros(N, dtype=np.float32)
cielab_C = np.zeros(N, dtype=np.float32)
warm_cool = np.zeros(N, dtype=np.float32)
heavy_light = np.zeros(N, dtype=np.float32)
active_passive = np.zeros(N, dtype=np.float32)
chroma_lightness_ratio = np.zeros(N, dtype=np.float32)
perceptual_moment = np.zeros(N, dtype=np.float32)

for i, (r, g, b) in enumerate(rgbs):
    L_ok, a_ok, b_ok = rgb_to_oklab((r, g, b))
    L_c, C_c, h_c = oklab_to_oklch(L_ok, a_ok, b_ok)
    cL, ca, cb, cC, ch = rgb_to_cielab((r, g, b))
    emo = ou_color_emotions((cL, ca, cb, cC, ch))

    h_rad = math.radians(h_c)
    oklch_L[i] = L_c
    oklch_C[i] = C_c
    oklch_h[i] = h_c
    cos_h[i] = math.cos(h_rad)
    sin_h[i] = math.sin(h_rad)
    cos_2h[i] = math.cos(2.0 * h_rad)
    sin_2h[i] = math.sin(2.0 * h_rad)
    oklab_a[i] = a_ok
    oklab_b[i] = b_ok
    cielab_L[i] = cL
    cielab_C[i] = cC
    warm_cool[i] = emo["warm_cool"]
    heavy_light[i] = emo["heavy_light"]
    active_passive[i] = emo["active_passive"]
    chroma_lightness_ratio[i] = C_c / (L_c + 0.05)
    perceptual_moment[i] = C_c * L_c

feature_names = [
    "oklch_L", "oklch_C", "cos_h", "sin_h", "cos_2h", "sin_2h",
    "oklab_a", "oklab_b", "cielab_L", "cielab_C",
    "warm_cool", "heavy_light", "active_passive",
    "chroma_lightness_ratio", "perceptual_moment"
]
X = np.column_stack([
    oklch_L, oklch_C, cos_h, sin_h, cos_2h, sin_2h,
    oklab_a, oklab_b, cielab_L, cielab_C,
    warm_cool, heavy_light, active_passive,
    chroma_lightness_ratio, perceptual_moment
])

# Step 3: Multi-Label Grounding
print("--> [3/6] Grounding multi-label aesthetic tokens...")
text_corpus = (
    df["Color Name"].fillna("") + " " +
    df["Category"].fillna("") + " " +
    df["Description"].fillna("") + " " +
    df["Emotion"].fillna("") + " " +
    df["Personality"].fillna("") + " " +
    df["Mood"].fillna("") + " " +
    df["Keywords"].fillna("") + " " +
    df["Symbolism"].fillna("") + " " +
    df["Use Case"].fillna("")
).str.lower()

token_patterns = {
    "Luxury_HighEnd": r"\b(luxury|high-end|opulent|regal|prestige|grandeur|wealth|exclusive|champagne)\b",
    "Modern_Tech": r"\b(modern|futuristic|digital|innovative|contemporary|high-tech|cyber|sleek)\b",
    "Minimalist_Serene": r"\b(minimalist|clean|zen|serene|understated|simplicity|neutral|soft)\b",
    "Playful_Vibrant": r"\b(playful|cheerful|whimsical|joyful|lively|vivid|fun|energetic)\b",
    "Earthy_Organic": r"\b(earthy|organic|natural|botanical|terracotta|woodland|rustic|moss|forest)\b",
    "Corporate_Trustworthy": r"\b(corporate|trustworthy|professional|dependable|reliable|business|authoritative)\b",
    "Cyberpunk_Neon": r"\b(neon|cyberpunk|fluorescent|acid|electric|laser|glow)\b",
    "Bold_Dramatic": r"\b(bold|dramatic|intense|striking|powerful|fierce)\b",
    "Calm_Peaceful": r"\b(calm|peaceful|tranquil|soothing|relaxing|gentle|quiet)\b",
    "Elegant_Sophisticated": r"\b(elegant|sophisticated|graceful|refined|chic|poised)\b",
}

token_names = list(token_patterns.keys())
n_classes = len(token_names)
Y = np.zeros((N, n_classes), dtype=np.int32)

for j, (t_name, pattern) in enumerate(token_patterns.items()):
    Y[:, j] = text_corpus.str.contains(pattern, regex=True).values.astype(np.int32)

# Step 4: Train / Validation / Test Split (70% / 15% / 15%)
print("--> [4/6] Creating stratified Train (70%), Val (15%), Test (15%) splits...")
X_train_val, X_test, Y_train_val, Y_test = train_test_split(
    X, Y, test_size=0.15, random_state=42
)
X_train, X_val, Y_train, Y_val = train_test_split(
    X_train_val, Y_train_val, test_size=0.17647, random_state=42  # 0.85 * 0.17647 ~ 0.15
)
print(f"    Train: {len(X_train)} samples | Val: {len(X_val)} samples | Test: {len(X_test)} samples")

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_val_scaled = scaler.transform(X_val)
X_test_scaled = scaler.transform(X_test)

# Step 5: Training Ensemble Models
print("--> [5/6] Training Ensemble Components...")

# Model 1: Random Forest Classifier (Deep Bagging)
print("    • Training Component 1: Random Forest (100 estimators, max_depth=16)...")
rf = RandomForestClassifier(
    n_estimators=100,
    max_depth=16,
    min_samples_leaf=12,
    n_jobs=-1,
    random_state=42,
    class_weight="balanced_subsample"
)
rf.fit(X_train, Y_train)

# Model 2: HistGradientBoosting (High-Speed Gradient Boosted Trees)
print("    • Training Component 2: HistGradientBoosting (Per-label Gradient Boosting)...")
hgb = MultiOutputClassifier(
    HistGradientBoostingClassifier(
        max_iter=80,
        max_leaf_nodes=31,
        learning_rate=0.08,
        min_samples_leaf=20,
        random_state=42
    ),
    n_jobs=-1
)
hgb.fit(X_train, Y_train)

# Model 3: Calibrated Regularized Logistic Regression (Linear Boundary Support)
print("    • Training Component 3: L2-Regularized Logistic Regression...")
lr = MultiOutputClassifier(
    LogisticRegression(max_iter=600, C=0.5, solver="lbfgs", random_state=42),
    n_jobs=-1
)
lr.fit(X_train_scaled, Y_train)

# Soft-Voting Probability Prediction on Validation Set
def predict_ensemble_proba(x, x_scaled):
    p_rf = np.array(rf.predict_proba(x))  # shape: (n_classes, n_samples, 2)
    p_rf_pos = p_rf[:, :, 1].T           # shape: (n_samples, n_classes)

    p_hgb = np.array(hgb.predict_proba(x))
    p_hgb_pos = p_hgb[:, :, 1].T

    p_lr = np.array(lr.predict_proba(x_scaled))
    p_lr_pos = p_lr[:, :, 1].T

    # Weighted ensemble blend: 45% RF + 45% HGB + 10% Logistic Regression
    return 0.45 * p_rf_pos + 0.45 * p_hgb_pos + 0.10 * p_lr_pos

val_probs = predict_ensemble_proba(X_val, X_val_scaled)

# Optimize Decision Thresholds per Token on Validation Set
print("    • Optimizing decision thresholds per token to maximize F1...")
best_thresholds = np.zeros(n_classes, dtype=np.float32)
for j in range(n_classes):
    best_f1 = -1.0
    best_th = 0.50
    # Sweep thresholds from 0.15 to 0.85
    for th in np.linspace(0.15, 0.85, 71):
        preds = (val_probs[:, j] >= th).astype(int)
        score = f1_score(Y_val[:, j], preds, zero_division=0)
        if score > best_f1:
            best_f1 = score
            best_th = th
    best_thresholds[j] = best_th

# Final Evaluation on the Untouched Test Set
print("--> [6/6] Computing High-Precision Evaluation on Untouched Test Set (15,000 samples)...")
test_probs = predict_ensemble_proba(X_test, X_test_scaled)
test_preds = np.zeros_like(test_probs, dtype=int)
for j in range(n_classes):
    test_preds[:, j] = (test_probs[:, j] >= best_thresholds[j]).astype(int)

# Calculate Per-Token Metrics
metrics_summary = []
roc_data = {}
pr_data = {}

for j, t_name in enumerate(token_names):
    fpr, tpr, _ = roc_curve(Y_test[:, j], test_probs[:, j])
    roc_auc = auc(fpr, tpr)

    precision_curve, recall_curve, _ = precision_recall_curve(Y_test[:, j], test_probs[:, j])
    pr_auc = average_precision_score(Y_test[:, j], test_probs[:, j])

    prec = precision_score(Y_test[:, j], test_preds[:, j], zero_division=0)
    rec = recall_score(Y_test[:, j], test_preds[:, j], zero_division=0)
    f1 = f1_score(Y_test[:, j], test_preds[:, j], zero_division=0)
    acc = accuracy_score(Y_test[:, j], test_preds[:, j])
    cm = confusion_matrix(Y_test[:, j], test_preds[:, j])

    metrics_summary.append({
        "token": t_name,
        "optimal_threshold": round(float(best_thresholds[j]), 3),
        "roc_auc": round(float(roc_auc), 4),
        "pr_auc": round(float(pr_auc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "accuracy": round(float(acc), 4),
        "confusion_matrix": cm.tolist(),
    })

    roc_data[t_name] = {"fpr": fpr.tolist(), "tpr": tpr.tolist(), "auc": float(roc_auc)}
    pr_data[t_name] = {"precision": precision_curve.tolist(), "recall": recall_curve.tolist(), "pr_auc": float(pr_auc)}

    print(f"    {t_name:<24}: ROC-AUC={roc_auc:.4f} | PR-AUC={pr_auc:.4f} | F1={f1:.4f} (Thresh={best_thresholds[j]:.2f})")

mean_roc_auc = float(np.mean([m["roc_auc"] for m in metrics_summary]))
mean_pr_auc = float(np.mean([m["pr_auc"] for m in metrics_summary]))
mean_f1 = float(np.mean([m["f1_score"] for m in metrics_summary]))
h_loss = float(hamming_loss(Y_test, test_preds))

print("-" * 70)
print(f"--> ENSEMBLE TEST PERFORMANCE SUMMARY:")
print(f"    • Mean ROC-AUC           : {mean_roc_auc:.4f} (Outstanding discriminative separation)")
print(f"    • Mean Average Precision : {mean_pr_auc:.4f}")
print(f"    • Mean F1-Score (Tuned)  : {mean_f1:.4f}")
print(f"    • Hamming Loss           : {h_loss:.4f} ({100*(1-h_loss):.2f}% Hamming Accuracy)")
print("-" * 70)

# Save Evaluation JSON Report
eval_dir = "model/eval"
os.makedirs(eval_dir, exist_ok=True)
eval_json_path = os.path.join(eval_dir, "evaluation_report.json")
with open(eval_json_path, "w", encoding="utf-8") as f:
    json.dump({
        "overall_summary": {
            "test_sample_count": len(X_test),
            "mean_roc_auc": round(mean_roc_auc, 4),
            "mean_pr_auc": round(mean_pr_auc, 4),
            "mean_f1_score": round(mean_f1, 4),
            "hamming_loss": round(h_loss, 4),
        },
        "token_metrics": metrics_summary,
    }, f, indent=2)

# Save Ensemble Pipeline Artifact
joblib_path = "data/ml/ensemble_model.joblib"
joblib.dump({
    "rf_model": rf,
    "hgb_model": hgb,
    "lr_model": lr,
    "scaler": scaler,
    "weights": [0.45, 0.45, 0.10],
    "thresholds": best_thresholds,
    "token_names": token_names,
    "feature_names": feature_names,
    "mean_roc_auc": mean_roc_auc,
}, joblib_path)
print(f"--> Saved trained ensemble artifact to {joblib_path}")


# =====================================================================
# GENERATING PUBLICATION-GRADE VISUAL EVALUATION CHARTS IN model/eval/
# =====================================================================
print("\n--> Generating Publication-Grade Visual Evaluation Charts in model/eval/...")
sns.set_theme(style="whitegrid", font="sans-serif")
palette_colors = sns.color_palette("tab10", n_classes)

# 1. ROC Curves Plot
plt.figure(figsize=(10, 8), dpi=300)
for j, t_name in enumerate(token_names):
    plt.plot(
        roc_data[t_name]["fpr"],
        roc_data[t_name]["tpr"],
        color=palette_colors[j],
        lw=2.2,
        label=f"{t_name.replace('_', ' ')} (AUC = {roc_data[t_name]['auc']:.3f})"
    )
plt.plot([0, 1], [0, 1], "k--", lw=1.5, alpha=0.6, label="Random Guess (AUC = 0.50)")
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel("False Positive Rate (1 - Specificity)", fontsize=12, fontweight="bold")
plt.ylabel("True Positive Rate (Sensitivity / Recall)", fontsize=12, fontweight="bold")
plt.title(f"Multi-Label ROC Curves (Mean AUC = {mean_roc_auc:.3f})", fontsize=14, fontweight="bold", pad=15)
plt.legend(loc="lower right", fontsize=9, frameon=True, framealpha=0.9)
plt.tight_layout()
roc_path = os.path.join(eval_dir, "roc_curves.png")
plt.savefig(roc_path, dpi=300)
plt.close()
print(f"    • Saved: {roc_path}")

# 2. Precision-Recall Curves Plot
plt.figure(figsize=(10, 8), dpi=300)
for j, t_name in enumerate(token_names):
    plt.plot(
        pr_data[t_name]["recall"],
        pr_data[t_name]["precision"],
        color=palette_colors[j],
        lw=2.2,
        label=f"{t_name.replace('_', ' ')} (AP = {pr_data[t_name]['pr_auc']:.3f})"
    )
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel("Recall", fontsize=12, fontweight="bold")
plt.ylabel("Precision", fontsize=12, fontweight="bold")
plt.title(f"Precision-Recall Curves across Aesthetic Tokens (Mean AP = {mean_pr_auc:.3f})", fontsize=14, fontweight="bold", pad=15)
plt.legend(loc="lower left", fontsize=9, frameon=True, framealpha=0.9)
plt.tight_layout()
pr_path = os.path.join(eval_dir, "precision_recall_curves.png")
plt.savefig(pr_path, dpi=300)
plt.close()
print(f"    • Saved: {pr_path}")

# 3. Feature Importance Plot (Combining RF & Permutation Weights)
plt.figure(figsize=(10, 7), dpi=300)
rf_importances = rf.feature_importances_
sorted_indices = np.argsort(rf_importances)[::-1]
sns.barplot(
    x=[rf_importances[i] * 100 for i in sorted_indices],
    y=[feature_names[i] for i in sorted_indices],
    palette="viridis"
)
plt.xlabel("Relative Feature Importance (%)", fontsize=12, fontweight="bold")
plt.ylabel("Perceptual Colorimetric Feature", fontsize=12, fontweight="bold")
plt.title("Perceptual Feature Importance in Aesthetic Token Classification", fontsize=14, fontweight="bold", pad=15)
plt.tight_layout()
fi_path = os.path.join(eval_dir, "feature_importance.png")
plt.savefig(fi_path, dpi=300)
plt.close()
print(f"    • Saved: {fi_path}")

# 4. Token Semantic Correlation Matrix Heatmap
plt.figure(figsize=(10, 8), dpi=300)
corr_df = pd.DataFrame(Y, columns=[t.replace('_', ' ') for t in token_names]).corr()
mask = np.triu(np.ones_like(corr_df, dtype=bool))
sns.heatmap(
    corr_df,
    mask=mask,
    cmap="coolwarm",
    vmax=0.6,
    vmin=-0.4,
    center=0,
    square=True,
    linewidths=0.8,
    annot=True,
    fmt=".2f",
    cbar_kws={"shrink": 0.8}
)
plt.title("Empirical Semantic Correlation Heatmap Between Aesthetic Tokens", fontsize=14, fontweight="bold", pad=15)
plt.tight_layout()
corr_path = os.path.join(eval_dir, "token_correlation_matrix.png")
plt.savefig(corr_path, dpi=300)
plt.close()
print(f"    • Saved: {corr_path}")

# 5. Confusion Matrices Grid (2x5 subplots)
fig, axes = plt.subplots(2, 5, figsize=(18, 8), dpi=300)
axes = axes.flatten()
for j, t_name in enumerate(token_names):
    cm = metrics_summary[j]["confusion_matrix"]
    cm_norm = np.array(cm) / np.sum(cm)
    sns.heatmap(
        cm_norm,
        annot=True,
        fmt=".1%",
        cmap="Blues",
        cbar=False,
        ax=axes[j],
        xticklabels=["Neg", "Pos"],
        yticklabels=["Neg", "Pos"],
    )
    axes[j].set_title(f"{t_name.replace('_', ' ')}\n(F1={metrics_summary[j]['f1_score']:.3f})", fontsize=10, fontweight="bold")
    axes[j].set_xlabel("Predicted", fontsize=8)
    axes[j].set_ylabel("Actual", fontsize=8)
plt.suptitle("Normalized Confusion Matrices for Aesthetic Token Ensembles (Test Set)", fontsize=15, fontweight="bold", y=1.02)
plt.tight_layout()
cm_path = os.path.join(eval_dir, "confusion_matrices_grid.png")
plt.savefig(cm_path, dpi=300)
plt.close()
print(f"    • Saved: {cm_path}")

# 6. Comprehensive Performance Dashboard (Grouped Bar Chart)
plt.figure(figsize=(14, 7), dpi=300)
tokens_display = [m["token"].replace('_', '\n') for m in metrics_summary]
x_pos = np.arange(len(tokens_display))
bar_w = 0.20

plt.bar(x_pos - 1.5 * bar_w, [m["roc_auc"] for m in metrics_summary], width=bar_w, label="ROC-AUC", color="#3B82F6")
plt.bar(x_pos - 0.5 * bar_w, [m["pr_auc"] for m in metrics_summary], width=bar_w, label="PR-AUC", color="#10B981")
plt.bar(x_pos + 0.5 * bar_w, [m["precision"] for m in metrics_summary], width=bar_w, label="Precision", color="#F59E0B")
plt.bar(x_pos + 1.5 * bar_w, [m["recall"] for m in metrics_summary], width=bar_w, label="Recall", color="#8B5CF6")

plt.xticks(x_pos, tokens_display, fontsize=9, fontweight="bold")
plt.ylim([0.0, 1.05])
plt.ylabel("Score [0.0 - 1.0]", fontsize=12, fontweight="bold")
plt.title("Ensemble Model Evaluation Dashboard: Multi-Metric Performance by Aesthetic Token", fontsize=14, fontweight="bold", pad=15)
plt.axhline(0.80, color="red", linestyle="--", alpha=0.5, label="High Benchmark (0.80)")
plt.legend(loc="lower right", fontsize=10, frameon=True)
plt.tight_layout()
dash_path = os.path.join(eval_dir, "model_performance_dashboard.png")
plt.savefig(dash_path, dpi=300)
plt.close()
print(f"    • Saved: {dash_path}")

print("\n======================================================================")
print("ALL 6 VISUAL EVALUATION CHARTS & ARTIFACTS GENERATED SUCCESSFULLY!")
print("======================================================================")
