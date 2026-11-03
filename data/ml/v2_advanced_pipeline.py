"""
V2 Advanced Machine Learning & Weak Supervision Pipeline for Color Aesthetics
=============================================================================
Upgrades:
1. Zero-shot dense text embeddings (all-MiniLM-L6-v2) & Programmatic Weak Supervision (Snorkel-style)
2. Continuous soft labels (y_ij in [0.0, 1.0]) with negation handling and colorimetric physical priors
3. 28-dimensional perceptual feature vector (Matsuda template distances, sRGB gamut hull ratio, APCA/WCAG contrast potential)
4. Ensemble of Classifier Chains (ECC) modeling joint multi-label dependencies and mutual exclusivities
5. Mahalanobis distance & Greedy Maximal Marginal Relevance (MMR) diverse exemplar swatch selection
6. Comparative visual evaluation: V1 Baseline vs V2 Upgraded
"""

import os
import sys
import re
import json
import math
import argparse
from datetime import datetime, timezone
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from sklearn.multioutput import ClassifierChain
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
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

from fastembed import TextEmbedding

from color_engine.spaces import (
    rgb_to_oklab,
    oklab_to_oklch,
    rgb_to_cielab,
    oklch_to_srgb_hex,
    hex_to_oklch,
)
from color_engine.psychology.emotions import ou_color_emotions
from color_engine.harmony.matsuda import MATSUDA_SECTORS, distance_to_template_sectors
from color_engine.accessibility.apca import apca_contrast

from data.ml.evaluation_protocol import split_color_groups, normalize_embeddings, protocol_metadata

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser(description="Train V2 and save a new, isolated research run.")
parser.add_argument("--output-dir", type=Path, default=ROOT / "review_runs" / datetime.now(timezone.utc).strftime("training-%Y%m%dT%H%M%S%fZ"))
args = parser.parse_args()
# An existing run is never overwritten. Published weights require explicit promotion.
run_dir = args.output_dir.resolve()
run_dir.mkdir(parents=True, exist_ok=False)
print(f"Saving all new artifacts to {run_dir}; existing published artifacts are preserved.")

print("======================================================================")
print("V2 ADVANCED MACHINE LEARNING & WEAK SUPERVISION PIPELINE")
print("======================================================================\n")

# ---------------------------------------------------------------------
# Step 1: Stratified Ingestion & Feature Engineering (28 Perceptual Dimensions)
# ---------------------------------------------------------------------
print("--> [1/6] Ingesting & Stratifying 20,000 Swatches from Raw Dataset...")
raw_path = ROOT / "data/raw/color_pedia.parquet"
df_full = pd.read_parquet(raw_path)

# Stratify across brightness and hue bins to guarantee uniform color space distribution
df_full["h_bin"] = pd.cut(df_full["Hue"], bins=12, labels=False)
df_full["l_bin"] = pd.cut(df_full["Lightness"], bins=5, labels=False)
df = df_full.groupby(["h_bin", "l_bin"], group_keys=False).apply(
    lambda x: x.sample(min(len(x), 350), random_state=42)
).reset_index(drop=True)

N = len(df)
idx_train, idx_val, idx_test = split_color_groups(df["HEX Code"].tolist())
print(f"    Selected {N} highly diverse color swatches across 60 hue-lightness strata.")

print("--> [2/6] Extracting 28-Dimensional Perceptual Physics Feature Vector...")
rgbs = list(zip(df["R"], df["G"], df["B"]))

features_list = []
matsuda_types = [
    "Type_i_Monochrome", "Type_V_Analogous", "Type_L_Adjacent",
    "Type_I_Complementary", "Type_T_TriadDominant",
    "Type_Y_SplitComplementary", "Type_X_Tetradic"
]

feature_names = [
    "oklch_L", "oklch_C", "oklch_h", "cos_h", "sin_h", "cos_2h", "sin_2h",
    "oklab_a", "oklab_b", "oklab_radius", "cielab_L", "cielab_a", "cielab_b", "cielab_C",
    "warm_cool", "heavy_light", "active_passive",
    "chromatic_moment", "chroma_lightness_ratio",
    "matsuda_dist_i", "matsuda_dist_V", "matsuda_dist_L", "matsuda_dist_I",
    "matsuda_dist_T", "matsuda_dist_Y", "matsuda_dist_X",
    "gamut_hull_ratio", "contrast_potential_white"
]

for i, (r, g, b) in enumerate(rgbs):
    L_ok, a_ok, b_ok = rgb_to_oklab((r, g, b))
    L_c, C_c, h_c = oklab_to_oklch(L_ok, a_ok, b_ok)
    cL, ca, cb, cC, ch = rgb_to_cielab((r, g, b))
    emo = ou_color_emotions((cL, ca, cb, cC, ch))

    h_rad = math.radians(h_c)
    cos_h = math.cos(h_rad)
    sin_h = math.sin(h_rad)
    cos_2h = math.cos(2.0 * h_rad)
    sin_2h = math.sin(2.0 * h_rad)
    radius = math.hypot(a_ok, b_ok)

    # Matsuda harmonic template arc distances
    m_dists = [distance_to_template_sectors(h_c, t, 0.0)[0] for t in matsuda_types]

    # sRGB gamut boundary proximity ratio
    hex_mapped = oklch_to_srgb_hex(L_c, C_c + 0.08, h_c)
    _, C_bound, _ = hex_to_oklch(hex_mapped)
    gamut_ratio = min(1.0, C_c / (C_bound + 1e-4)) if C_c > 0 else 0.0

    # APCA contrast potential against pure white (#FFFFFF)
    lc_white, _ = apca_contrast((r, g, b), (255, 255, 255))

    features_list.append([
        L_c, C_c, h_c, cos_h, sin_h, cos_2h, sin_2h,
        a_ok, b_ok, radius, cL, ca, cb, cC,
        emo["warm_cool"], emo["heavy_light"], emo["active_passive"],
        L_c * C_c, C_c / (L_c + 0.05),
        *m_dists,
        gamut_ratio,
        abs(lc_white)
    ])

X = np.array(features_list, dtype=np.float32)
print(f"    Constructed feature matrix X: {X.shape}")

# ---------------------------------------------------------------------
# Step 2: Zero-Shot Dense Embeddings & Programmatic Weak Supervision
# ---------------------------------------------------------------------
print("--> [3/6] Running Zero-Shot Dense Embeddings & Programmatic Weak Supervision...")

prototypes = {
    "Luxury_HighEnd": "opulent regal grand high-end prestige expensive wealthy luxury aesthetic champagne gold obsidian",
    "Modern_Tech": "futuristic digital innovative sleek contemporary high-tech cyber electric technology interface",
    "Minimalist_Serene": "clean uncluttered neutral aesthetic quiet simplicity zen soft minimal subtle restrained",
    "Playful_Vibrant": "cheerful whimsical joyful lively vivid fun colorful energetic vibrant playfulness",
    "Earthy_Organic": "natural botanical woodland terracotta moss rustic earthy warm organic flora forest",
    "Corporate_Trustworthy": "corporate professional dependable reliable business authoritative institution confident navy",
    "Cyberpunk_Neon": "high-voltage fluorescent neon acid electric glowing cyberpunk laser dark void synthetic",
    "Bold_Dramatic": "intense striking dramatic powerful fierce strong visual impact bold contrast commanding",
    "Calm_Peaceful": "tranquil soothing relaxing gentle quiet peaceful serene contemplation soft harmony",
    "Elegant_Sophisticated": "graceful refined poised chic dignified sophisticated beauty polished timeless",
}

token_names = list(prototypes.keys())
n_tokens = len(token_names)

# Embed Prototypes with all-MiniLM-L6-v2
embed_model = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
proto_vecs = np.array(list(embed_model.embed(list(prototypes.values()))))
proto_vecs = proto_vecs / np.linalg.norm(proto_vecs, axis=1, keepdims=True)

# Build text corpus for each swatch
swatch_texts = (
    df["Color Name"].fillna("") + ": " +
    df["Category"].fillna("") + ". " +
    df["Description"].fillna("") + " " +
    df["Emotion"].fillna("") + " " +
    df["Personality"].fillna("") + " " +
    df["Mood"].fillna("") + " " +
    df["Keywords"].fillna("")
).tolist()

swatch_embed_cache_path = run_dir / "swatch_embeddings.npy"
if os.path.exists(swatch_embed_cache_path):
    print(f"    Loading precomputed embeddings from {swatch_embed_cache_path}...")
    swatch_vecs = np.load(swatch_embed_cache_path)
else:
    print(f"    Embedding {len(swatch_texts)} text descriptions via ONNX runtime...")
    swatch_vecs = np.array(list(embed_model.embed(swatch_texts, batch_size=128)))
    swatch_vecs = swatch_vecs / np.linalg.norm(swatch_vecs, axis=1, keepdims=True)
    np.save(swatch_embed_cache_path, swatch_vecs)
    print(f"    Cached embeddings to {swatch_embed_cache_path}")

# Cosine similarity matrix: (N, n_tokens)
raw_cosine_sim = np.dot(swatch_vecs, proto_vecs.T)

# Learn normalization from training colors only; validation/test remain unseen.
S_embed, normalization_metadata = normalize_embeddings(raw_cosine_sim, idx_train)

# Negation-Aware Keyword Matching Source
token_keywords = {
    "Luxury_HighEnd": ["luxury", "high-end", "opulent", "regal", "prestige", "grandeur", "wealth"],
    "Modern_Tech": ["modern", "futuristic", "digital", "innovative", "contemporary", "high-tech", "cyber"],
    "Minimalist_Serene": ["minimalist", "clean", "zen", "serene", "understated", "simplicity", "neutral"],
    "Playful_Vibrant": ["playful", "cheerful", "whimsical", "joyful", "lively", "vivid", "fun", "energetic"],
    "Earthy_Organic": ["earthy", "organic", "natural", "botanical", "terracotta", "woodland", "rustic", "moss"],
    "Corporate_Trustworthy": ["corporate", "trustworthy", "professional", "dependable", "reliable", "business"],
    "Cyberpunk_Neon": ["neon", "cyberpunk", "fluorescent", "acid", "electric", "laser", "glow"],
    "Bold_Dramatic": ["bold", "dramatic", "intense", "striking", "powerful", "fierce"],
    "Calm_Peaceful": ["calm", "peaceful", "tranquil", "soothing", "relaxing", "gentle", "quiet"],
    "Elegant_Sophisticated": ["elegant", "sophisticated", "graceful", "refined", "chic", "poised"],
}

negation_re = re.compile(r"\b(not|never|no|non|un)\b", re.IGNORECASE)
compiled_patterns = {
    t: re.compile(r"\b(" + "|".join(re.escape(k) for k in kws) + r")\b", re.IGNORECASE)
    for t, kws in token_keywords.items()
}

S_keyword = np.zeros((N, n_tokens), dtype=np.float32)
for i, txt in enumerate(swatch_texts):
    for j, t in enumerate(token_names):
        pattern = compiled_patterns[t]
        matched = False
        for m in pattern.finditer(txt):
            preceding = txt[max(0, m.start() - 30):m.start()]
            if not negation_re.search(preceding):
                matched = True
                break
        if matched:
            S_keyword[i, j] = 1.0

# Colorimetric Physical Priors Source S_prior
S_prior = np.zeros((N, n_tokens), dtype=np.float32)
for i in range(N):
    L = X[i, 0]
    C = X[i, 1]
    h = X[i, 2]
    wc = X[i, 14]
    ap = X[i, 16]

    # Cyberpunk prior: high chroma + dark/contrast canvas alignment
    S_prior[i, 6] = 1.0 if (C > 0.16 and 0.40 <= L <= 0.75) else (0.4 if C > 0.12 else 0.0)
    # Minimalist prior: restrained chroma + neutral temperature
    S_prior[i, 2] = 1.0 if C < 0.04 else (0.5 if C < 0.08 else 0.0)
    # Earthy prior: warm hues in terracotta/moss range
    S_prior[i, 4] = 1.0 if (25.0 <= h <= 150.0 and 0.03 <= C <= 0.14) else 0.1
    # Corporate prior: trustworthy blue/navy spectrum
    S_prior[i, 5] = 1.0 if (210.0 <= h <= 265.0 and 0.03 <= C <= 0.15) else 0.1
    # Playful prior: high chroma + high lightness
    S_prior[i, 3] = 1.0 if (C > 0.14 and L > 0.50) else (0.4 if C > 0.10 else 0.0)
    # Luxury prior: dynamic range with single refined chroma
    S_prior[i, 0] = 1.0 if (0.04 <= C <= 0.22 and (L < 0.25 or L > 0.75)) else 0.3
    # Calm prior: passive activity + cool/neutral
    S_prior[i, 8] = 1.0 if (ap < -0.10 and wc < 0.10) else 0.2
    # Bold prior: high excitement / high saturation
    S_prior[i, 7] = 1.0 if (ap > 0.25 or C > 0.16) else 0.2
    # Modern prior: cool temperature bias
    S_prior[i, 1] = 1.0 if (wc < -0.20 and C >= 0.06) else 0.2
    # Elegant prior: balanced weight and restrained chroma
    S_prior[i, 9] = 1.0 if (0.03 <= C <= 0.16 and 0.30 <= L <= 0.80) else 0.2

# Fused Continuous Soft Labels Y_soft in [0.0, 1.0]
Y_soft = 0.55 * S_embed + 0.30 * S_keyword + 0.15 * S_prior
Y_soft = np.clip(Y_soft, 0.0, 1.0)

# Binarized ground truth labels for multi-label classification chains (threshold = 0.50)
Y_binary = (Y_soft >= 0.50).astype(np.int32)

print("    Soft Labeling Summary (Mean continuous confidence):")
for j, t in enumerate(token_names):
    print(f"      • {t:<24}: Mean Soft Conf={np.mean(Y_soft[:, j]):.3f} | Binary Positives={np.sum(Y_binary[:, j])} ({np.mean(Y_binary[:, j])*100:.1f}%)")

# ---------------------------------------------------------------------
# Step 3: Train / Val / Test Splits
# ---------------------------------------------------------------------
print("--> [4/6] Using preassigned disjoint color groups (approximately 70/15/15)...")
X_train, Y_train = X[idx_train], Y_binary[idx_train]
X_val, Y_val = X[idx_val], Y_binary[idx_val]
X_test, Y_test = X[idx_test], Y_binary[idx_test]

# ---------------------------------------------------------------------
# Step 4: Ensemble of Classifier Chains (ECC); probabilities are not calibrated
# ---------------------------------------------------------------------
print("--> [5/6] Training Ensemble of Classifier Chains (ECC) with Multi-Label Dependency Modeling...")

# Train 3 Diverse Classifier Chains with randomized chain orderings
# Each chain models conditional joint distributions P(y_j | X, y_1 ... y_{j-1})
n_chains = 3
chains = []
for chain_idx in range(n_chains):
    print(f"    • Training Classifier Chain {chain_idx + 1}/{n_chains}...")
    base_clf = HistGradientBoostingClassifier(
        max_iter=70,
        max_leaf_nodes=31,
        learning_rate=0.08,
        min_samples_leaf=15,
        random_state=42 + chain_idx * 17
    )
    chain = ClassifierChain(base_clf, order="random", random_state=42 + chain_idx * 17)
    chain.fit(X_train, Y_train)
    chains.append(chain)

# Predict averaged probabilities from the Ensemble of Classifier Chains
def predict_ecc_proba(x):
    probs = np.zeros((len(x), n_tokens), dtype=np.float32)
    for c in chains:
        probs += c.predict_proba(x)
    return probs / n_chains

val_probs = predict_ecc_proba(X_val)

# Optimal Threshold Tuning per Token on Validation Set
print("    • Tuning optimal decision thresholds per token...")
best_thresholds_v2 = np.zeros(n_tokens, dtype=np.float32)
for j in range(n_tokens):
    best_f1 = -1.0
    best_th = 0.50
    for th in np.linspace(0.15, 0.85, 71):
        preds = (val_probs[:, j] >= th).astype(int)
        score = f1_score(Y_val[:, j], preds, zero_division=0)
        if score > best_f1:
            best_f1 = score
            best_th = th
    best_thresholds_v2[j] = best_th

# Final Evaluation on the Untouched Test Set
test_probs_v2 = predict_ecc_proba(X_test)
test_preds_v2 = np.zeros_like(test_probs_v2, dtype=int)
for j in range(n_tokens):
    test_preds_v2[:, j] = (test_probs_v2[:, j] >= best_thresholds_v2[j]).astype(int)

# Compute V2 Metrics
metrics_v2 = []
roc_data_v2 = {}
pr_data_v2 = {}

for j, t_name in enumerate(token_names):
    fpr, tpr, _ = roc_curve(Y_test[:, j], test_probs_v2[:, j])
    roc_auc = auc(fpr, tpr)

    prec_curve, rec_curve, _ = precision_recall_curve(Y_test[:, j], test_probs_v2[:, j])
    pr_auc = average_precision_score(Y_test[:, j], test_probs_v2[:, j])

    prec = precision_score(Y_test[:, j], test_preds_v2[:, j], zero_division=0)
    rec = recall_score(Y_test[:, j], test_preds_v2[:, j], zero_division=0)
    f1 = f1_score(Y_test[:, j], test_preds_v2[:, j], zero_division=0)
    acc = accuracy_score(Y_test[:, j], test_preds_v2[:, j])
    cm = confusion_matrix(Y_test[:, j], test_preds_v2[:, j])

    metrics_v2.append({
        "token": t_name,
        "optimal_threshold": round(float(best_thresholds_v2[j]), 3),
        "roc_auc": round(float(roc_auc), 4),
        "pr_auc": round(float(pr_auc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "accuracy": round(float(acc), 4),
        "confusion_matrix": cm.tolist(),
    })

    roc_data_v2[t_name] = {"fpr": fpr.tolist(), "tpr": tpr.tolist(), "auc": float(roc_auc)}
    pr_data_v2[t_name] = {"precision": prec_curve.tolist(), "recall": rec_curve.tolist(), "pr_auc": float(pr_auc)}

mean_roc_auc_v2 = float(np.mean([m["roc_auc"] for m in metrics_v2]))
mean_pr_auc_v2 = float(np.mean([m["pr_auc"] for m in metrics_v2]))
mean_f1_v2 = float(np.mean([m["f1_score"] for m in metrics_v2]))
mean_acc_v2 = float(np.mean([m["accuracy"] for m in metrics_v2]))
h_loss_v2 = float(hamming_loss(Y_test, test_preds_v2))

print("-" * 70)
print(f"--> V2 ENSEMBLE TEST PERFORMANCE SUMMARY:")
print(f"    • Mean ROC-AUC           : {mean_roc_auc_v2:.4f}")
print(f"    • Mean Average Precision : {mean_pr_auc_v2:.4f}")
print(f"    • Mean F1-Score (Tuned)  : {mean_f1_v2:.4f}")
print(f"    • Mean Label Accuracy   : {mean_acc_v2*100:.2f}%")
print(f"    • Hamming Accuracy       : {100*(1-h_loss_v2):.2f}%")
print("-" * 70)

# ---------------------------------------------------------------------
# Step 5: Mahalanobis Distance & Diverse Maximal Marginal Relevance (MMR)
# ---------------------------------------------------------------------
print("--> [6/6] Curating Exemplar Swatches via Mahalanobis Distance & Diverse MMR...")

curated_v2: Dict[str, Any] = {}
eval_dir_v2 = run_dir / "evaluation"
os.makedirs(eval_dir_v2, exist_ok=True)

for j, t_name in enumerate(token_names):
    # Select swatches with high confidence (top 20%)
    high_conf_mask = Y_soft[:, j] >= 0.55
    if np.sum(high_conf_mask) < 20:
        high_conf_mask = Y_soft[:, j] >= np.percentile(Y_soft[:, j], 85)

    pos_idx = np.where(high_conf_mask)[0]
    sub_X = X[pos_idx]

    # Normalized feature subset for distance: L, C, cos_h, sin_h, WC, AP
    geom_features = np.column_stack([
        sub_X[:, 0], sub_X[:, 1], sub_X[:, 3], sub_X[:, 4], sub_X[:, 14], sub_X[:, 16]
    ])

    # Centroid & Regularized Covariance
    mu = np.mean(geom_features, axis=0)
    cov = np.cov(geom_features, rowvar=False) + 1e-4 * np.eye(geom_features.shape[1])
    inv_cov = np.linalg.pinv(cov)

    diff = geom_features - mu
    d_mahalanobis = np.sqrt(np.sum(diff @ inv_cov * diff, axis=1))

    # Maximal Marginal Relevance (MMR) Swatch Selection
    # Balances high relevance to centroid against chromatic hue diversity
    hues = sub_X[:, 2]
    selected_sub_indices = [int(np.argmin(d_mahalanobis))]
    lambd = 0.65
    norm_d = d_mahalanobis / (np.max(d_mahalanobis) + 1e-6)

    target_exemplar_count = 8
    for _ in range(target_exemplar_count - 1):
        best_mmr = -float("inf")
        best_cand = None
        for i in range(len(pos_idx)):
            if i in selected_sub_indices:
                continue
            relevance = 1.0 - norm_d[i]
            # Max circular hue similarity to already chosen exemplars
            max_sim = max(math.cos(math.radians(hues[i] - hues[s])) for s in selected_sub_indices)
            mmr_score = lambd * relevance - (1.0 - lambd) * max_sim
            if mmr_score > best_mmr:
                best_mmr = mmr_score
                best_cand = i
        if best_cand is not None:
            selected_sub_indices.append(best_cand)

    diverse_swatches = []
    for s_idx in selected_sub_indices:
        real_idx = pos_idx[s_idx]
        hex_code = df.iloc[real_idx]["HEX Code"]
        color_name = df.iloc[real_idx]["Color Name"]
        diverse_swatches.append({
            "hex": hex_code,
            "name": color_name,
            "L": round(float(X[real_idx, 0]), 4),
            "C": round(float(X[real_idx, 1]), 4),
            "h": round(float(X[real_idx, 2]), 2),
            "mahalanobis_dist": round(float(d_mahalanobis[s_idx]), 3),
        })

    curated_v2[t_name] = {
        "token_name": t_name,
        "description": f"Curated empirical profile (V2) for {t_name.replace('_', ' ')} based on {len(pos_idx)} weak-supervised swatches.",
        "sample_count": int(len(pos_idx)),
        "colorimetric_statistics": {
            "sample_count": int(len(pos_idx)),
            "lightness": {
                "mean": round(float(np.mean(sub_X[:, 0])), 4),
                "std": round(float(np.std(sub_X[:, 0])), 4),
                "p10": round(float(np.percentile(sub_X[:, 0], 10)), 4),
                "median": round(float(np.median(sub_X[:, 0])), 4),
                "p90": round(float(np.percentile(sub_X[:, 0], 90)), 4),
            },
            "chroma": {
                "mean": round(float(np.mean(sub_X[:, 1])), 4),
                "std": round(float(np.std(sub_X[:, 1])), 4),
                "p10": round(float(np.percentile(sub_X[:, 1], 10)), 4),
                "median": round(float(np.median(sub_X[:, 1])), 4),
                "p90": round(float(np.percentile(sub_X[:, 1], 90)), 4),
            },
            "hue": {
                "circular_mean_deg": round(float(math.degrees(math.atan2(np.mean(sub_X[:, 4]), np.mean(sub_X[:, 3])))) % 360.0, 2),
                "median_deg": round(float(np.median(sub_X[:, 2])), 2),
            },
            "emotions": {
                "warm_cool_mean": round(float(np.mean(sub_X[:, 14])), 3),
                "active_passive_mean": round(float(np.mean(sub_X[:, 16])), 3),
                "heavy_light_mean": round(float(np.mean(sub_X[:, 15])), 3),
            },
        },
        "recommended_area_mixing_ratios": {
            "canvas_background": 0.60,
            "surface_container": 0.20,
            "brand_anchor": 0.12,
            "vibrant_accent": 0.05,
            "micro_highlight": 0.03,
        },
        "exemplar_colors": diverse_swatches,
        "curated_diverse_exemplars": diverse_swatches,
    }

# Save Curated V2 Dataset & Artifact
curated_v2_path = run_dir / "aesthetic_token_dataset_v2.json"
with open(curated_v2_path, "w", encoding="utf-8") as f:
    json.dump(curated_v2, f, indent=2)

joblib_v2_path = run_dir / "v2_classifier_chain_ensemble.joblib"
joblib.dump({
    "evaluation_protocol": protocol_metadata(normalization_metadata),
    "chains": chains,
    "feature_names": feature_names,
    "token_names": token_names,
    "thresholds": best_thresholds_v2,
    "metrics": metrics_v2,
    "mean_roc_auc": mean_roc_auc_v2,
}, joblib_v2_path)

print(f"    Saved V2 model artifact to: {joblib_v2_path}")
print(f"    Saved V2 curated dataset to: {curated_v2_path}")

# ---------------------------------------------------------------------
# Step 6: Generate All V2 Visual Charts & Side-by-Side Comparison
# ---------------------------------------------------------------------
print("\n--> Generating Publication-Grade Visual Charts & Side-by-Side Comparison...")
sns.set_theme(style="whitegrid", font="sans-serif")
palette_colors = sns.color_palette("tab10", n_tokens)

# 1. ROC Curves V2
plt.figure(figsize=(10, 8), dpi=300)
for j, t_name in enumerate(token_names):
    plt.plot(
        roc_data_v2[t_name]["fpr"],
        roc_data_v2[t_name]["tpr"],
        color=palette_colors[j],
        lw=2.2,
        label=f"{t_name.replace('_', ' ')} (AUC = {roc_data_v2[t_name]['auc']:.3f})"
    )
plt.plot([0, 1], [0, 1], "k--", lw=1.5, alpha=0.6, label="Random Guess (AUC = 0.50)")
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel("False Positive Rate", fontsize=12, fontweight="bold")
plt.ylabel("True Positive Rate", fontsize=12, fontweight="bold")
plt.title(f"V2 Multi-Label ROC Curves (Mean AUC = {mean_roc_auc_v2:.3f})", fontsize=14, fontweight="bold", pad=15)
plt.legend(loc="lower right", fontsize=9, frameon=True)
plt.tight_layout()
plt.savefig(os.path.join(eval_dir_v2, "roc_curves_v2.png"), dpi=300)
plt.close()

# 2. Precision-Recall Curves V2
plt.figure(figsize=(10, 8), dpi=300)
for j, t_name in enumerate(token_names):
    plt.plot(
        pr_data_v2[t_name]["recall"],
        pr_data_v2[t_name]["precision"],
        color=palette_colors[j],
        lw=2.2,
        label=f"{t_name.replace('_', ' ')} (AP = {pr_data_v2[t_name]['pr_auc']:.3f})"
    )
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel("Recall", fontsize=12, fontweight="bold")
plt.ylabel("Precision", fontsize=12, fontweight="bold")
plt.title(f"V2 Precision-Recall Curves (Mean AP = {mean_pr_auc_v2:.3f})", fontsize=14, fontweight="bold", pad=15)
plt.legend(loc="lower left", fontsize=9, frameon=True)
plt.tight_layout()
plt.savefig(os.path.join(eval_dir_v2, "precision_recall_curves_v2.png"), dpi=300)
plt.close()

# 3. Top Feature Importances V2 (Random Forest Baseline on 28 features)
rf_explainer = RandomForestClassifier(n_estimators=60, max_depth=12, random_state=42, n_jobs=-1)
rf_explainer.fit(X_train, Y_train)
plt.figure(figsize=(10, 8), dpi=300)
fi = rf_explainer.feature_importances_
top_idx = np.argsort(fi)[::-1][:15]
sns.barplot(
    x=[fi[i] * 100 for i in top_idx],
    y=[feature_names[i] for i in top_idx],
    palette="viridis"
)
plt.xlabel("Relative Feature Importance (%)", fontsize=12, fontweight="bold")
plt.ylabel("Perceptual Feature (Expanded 28-D)", fontsize=12, fontweight="bold")
plt.title("V2 Expanded Feature Importances (Matsuda, Gamut Hull & Contrast Included)", fontsize=14, fontweight="bold", pad=15)
plt.tight_layout()
plt.savefig(os.path.join(eval_dir_v2, "feature_importance_v2.png"), dpi=300)
plt.close()

# 4. Token Semantic Correlation Matrix V2
plt.figure(figsize=(10, 8), dpi=300)
corr_v2 = pd.DataFrame(Y_soft, columns=[t.replace('_', ' ') for t in token_names]).corr()
mask = np.triu(np.ones_like(corr_v2, dtype=bool))
sns.heatmap(
    corr_v2,
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
plt.title("V2 Semantic Soft-Label Correlation Matrix (Zero-Shot + Heuristics)", fontsize=14, fontweight="bold", pad=15)
plt.tight_layout()
plt.savefig(os.path.join(eval_dir_v2, "token_correlation_matrix_v2.png"), dpi=300)
plt.close()

# 5. Confusion Matrices Grid V2 (2x5)
fig, axes = plt.subplots(2, 5, figsize=(18, 8), dpi=300)
axes = axes.flatten()
for j, t_name in enumerate(token_names):
    cm = metrics_v2[j]["confusion_matrix"]
    cm_norm = np.array(cm) / np.sum(cm)
    sns.heatmap(
        cm_norm,
        annot=True,
        fmt=".1%",
        cmap="Purples",
        cbar=False,
        ax=axes[j],
        xticklabels=["Neg", "Pos"],
        yticklabels=["Neg", "Pos"],
    )
    axes[j].set_title(f"{t_name.replace('_', ' ')}\n(F1={metrics_v2[j]['f1_score']:.3f})", fontsize=10, fontweight="bold")
    axes[j].set_xlabel("Predicted", fontsize=8)
    axes[j].set_ylabel("Actual", fontsize=8)
plt.suptitle("V2 Normalized Confusion Matrices (Ensemble of Classifier Chains)", fontsize=15, fontweight="bold", y=1.02)
plt.tight_layout()
plt.savefig(os.path.join(eval_dir_v2, "confusion_matrices_grid_v2.png"), dpi=300)
plt.close()

# 6. V1 Baseline vs V2 Upgraded: DIRECT COMPARISON CHART
# Historical metrics are contextual only: labels and held-out colors differ.
v1_report_path = ROOT / "model/eval/evaluation_report.json"
with open(v1_report_path, "r", encoding="utf-8") as f:
    v1_report = json.load(f)

v1_tokens = {m["token"]: m for m in v1_report["token_metrics"]}

plt.figure(figsize=(15, 7), dpi=300)
tokens_disp = [t.replace('_', '\n') for t in token_names]
x = np.arange(len(tokens_disp))
bar_w = 0.35

v1_f1 = [v1_tokens[t]["f1_score"] for t in token_names]
v2_f1 = [m["f1_score"] for m in metrics_v2]

plt.bar(x - bar_w / 2.0, v1_f1, width=bar_w, label="V1 Baseline (Regex + Independent RF)", color="#94A3B8")
plt.bar(x + bar_w / 2.0, v2_f1, width=bar_w, label="V2 Upgraded (Dense Embeddings + Classifier Chains)", color="#4F46E5")

plt.xticks(x, tokens_disp, fontsize=9, fontweight="bold")
plt.ylim([0.0, 1.05])
plt.ylabel("F1 Score [0.0 - 1.0]", fontsize=12, fontweight="bold")
plt.title(f"Historical Metrics: Different Labels and Test Sets (Not an Ablation)\n(V1 Mean F1 = {np.mean(v1_f1):.3f} vs V2 Mean F1 = {np.mean(v2_f1):.3f})", fontsize=14, fontweight="bold", pad=15)
plt.legend(loc="lower right", fontsize=11, frameon=True)
plt.tight_layout()
comp_chart_path = os.path.join(eval_dir_v2, "v1_vs_v2_comparison_chart.png")
plt.savefig(comp_chart_path, dpi=300)
plt.close()
print(f"    • Saved: {comp_chart_path}")

# Save JSON Evaluation Report V2
eval_report_v2_path = os.path.join(eval_dir_v2, "evaluation_report_v2.json")
with open(eval_report_v2_path, "w", encoding="utf-8") as f:
    json.dump({
        "evaluation_protocol": protocol_metadata(normalization_metadata),
        "split_indices": {"train": idx_train.tolist(), "validation": idx_val.tolist(), "test": idx_test.tolist()},
        "v2_summary": {
            "test_sample_count": len(X_test),
            "mean_roc_auc": round(mean_roc_auc_v2, 4),
            "mean_pr_auc": round(mean_pr_auc_v2, 4),
            "mean_f1_score": round(mean_f1_v2, 4),
            "mean_accuracy": round(mean_acc_v2, 4),
            "hamming_loss": round(h_loss_v2, 4),
        },
        "historical_v1_context": {
            "comparable": False,
            "reason": "Different label-generation methods, sampling, and held-out colors; no improvement can be inferred.",
            "v1_mean_roc_auc": v1_report["overall_summary"]["mean_roc_auc"],
            "v1_mean_f1": v1_report["overall_summary"]["mean_f1_score"],
        },
        "token_metrics": metrics_v2,
    }, f, indent=2)

print(f"--> Saved V2 evaluation report to: {eval_report_v2_path}")
print("\n======================================================================")
print("V2 ADVANCED PIPELINE COMPLETED SUCCESSFULLY!")
print("======================================================================")
