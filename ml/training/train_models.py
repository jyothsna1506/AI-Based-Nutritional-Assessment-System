"""
Train Nutritional Deficiency Prediction Models
===============================================
Loads the NHANES processed dataset, trains a separate Random Forest
classifier for each deficiency target, evaluates performance, and
persists models, scaler, feature names, and an evaluation report.

Usage:
    python ml/training/train_models.py
"""

import os
import sys
import json
import datetime

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
)
import joblib

# ---------------------------------------------------------------------------
# Path setup – works regardless of where the script is invoked from
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))

DATA_PATH = os.path.join(PROJECT_ROOT, "ml", "datasets", "raw", "df_transformed.csv")
MODEL_DIR = os.path.join(PROJECT_ROOT, "ml", "saved_models")
REPORT_DIR = os.path.join(PROJECT_ROOT, "ml", "reports")
REPORT_PATH = os.path.join(REPORT_DIR, "model_evaluation.txt")

# ---------------------------------------------------------------------------
# Feature & target definitions
# ---------------------------------------------------------------------------
FEATURE_COLS = [
    "RIDAGEYR",
    "BMXHT",
    "BMXWAIST",
    "BMXBMI",
    "PAD680",
    "LBXSKSI",
    "LBXSCA",
    "LBXMAGN",
    "LBXHGB",
    "LBXSIR",
    "RIAGENDR_Male",
    "HSQ590_2.0",
    "MCQ010_2.0",
]

TARGET_COLS = [
    "Vitamin_D_Deficiency",
    "Iron_Anemia_Deficiency",
    "MAGN_Deficiency",
    "R_Deficiency",
    "SCA_Deficiency",
    "SK_Deficiency",
]


def evaluate_model(model, X_test, y_test):
    """Return a dict of evaluation metrics for a trained classifier."""
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    return {
        "accuracy": accuracy_score(y_test, y_pred),
        "precision": precision_score(y_test, y_pred, zero_division=0),
        "recall": recall_score(y_test, y_pred, zero_division=0),
        "f1": f1_score(y_test, y_pred, zero_division=0),
        "roc_auc": roc_auc_score(y_test, y_proba),
    }


def main():
    print("=" * 70)
    print("  Nutritional Deficiency Model Training Pipeline")
    print("=" * 70)

    # ------------------------------------------------------------------
    # 1. Load dataset
    # ------------------------------------------------------------------
    print(f"\n[1/6] Loading dataset from:\n      {DATA_PATH}")
    if not os.path.exists(DATA_PATH):
        print(f"ERROR: Dataset not found at {DATA_PATH}")
        sys.exit(1)

    df = pd.read_csv(DATA_PATH)
    print(f"      Loaded {len(df):,} rows × {df.shape[1]} columns")

    # Verify required columns exist
    missing_features = [c for c in FEATURE_COLS if c not in df.columns]
    missing_targets = [c for c in TARGET_COLS if c not in df.columns]
    if missing_features:
        print(f"ERROR: Missing feature columns: {missing_features}")
        sys.exit(1)
    if missing_targets:
        print(f"ERROR: Missing target columns: {missing_targets}")
        sys.exit(1)

    # Drop rows with NaN in feature or target columns
    df = df[FEATURE_COLS + TARGET_COLS].dropna()
    print(f"      Rows after dropping NaN: {len(df):,}")

    # ------------------------------------------------------------------
    # 2. Prepare features
    # ------------------------------------------------------------------
    print("\n[2/6] Preparing features ...")
    X = df[FEATURE_COLS].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    print(f"      Scaled {X_scaled.shape[1]} features with StandardScaler")

    # ------------------------------------------------------------------
    # 3. Train models
    # ------------------------------------------------------------------
    print("\n[3/6] Training models ...")

    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(REPORT_DIR, exist_ok=True)

    results = {}

    for target in TARGET_COLS:
        print(f"\n  -- {target} --")
        y = df[target].values.astype(int)

        # Stratified 80/20 split
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, stratify=y, random_state=42
        )
        print(f"      Train: {len(X_train):,}  |  Test: {len(X_test):,}")
        print(f"      Positive rate (train): {y_train.mean():.3f}")

        # Train Random Forest
        clf = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            class_weight="balanced",
            random_state=42,
        )
        clf.fit(X_train, y_train)

        # Evaluate
        metrics = evaluate_model(clf, X_test, y_test)
        results[target] = metrics

        print(f"      Accuracy:  {metrics['accuracy']:.4f}")
        print(f"      Precision: {metrics['precision']:.4f}")
        print(f"      Recall:    {metrics['recall']:.4f}")
        print(f"      F1 Score:  {metrics['f1']:.4f}")
        print(f"      ROC-AUC:   {metrics['roc_auc']:.4f}")

        # Save model
        model_path = os.path.join(MODEL_DIR, f"random_forest_model_{target}.joblib")
        joblib.dump(clf, model_path)
        print(f"      Saved -> {model_path}")

    # ------------------------------------------------------------------
    # 4. Save scaler
    # ------------------------------------------------------------------
    print("\n[4/6] Saving scaler ...")
    scaler_path = os.path.join(MODEL_DIR, "scaler.joblib")
    joblib.dump(scaler, scaler_path)
    print(f"      Saved -> {scaler_path}")

    # ------------------------------------------------------------------
    # 5. Save feature names
    # ------------------------------------------------------------------
    print("\n[5/6] Saving feature names ...")
    feature_path = os.path.join(MODEL_DIR, "feature_names.json")
    with open(feature_path, "w", encoding="utf-8") as f:
        json.dump(FEATURE_COLS, f, indent=2)
    print(f"      Saved -> {feature_path}")

    # ------------------------------------------------------------------
    # 6. Save evaluation report
    # ------------------------------------------------------------------
    print("\n[6/6] Saving evaluation report ...")
    report_lines = []
    report_lines.append("=" * 70)
    report_lines.append("  Nutritional Deficiency Model Evaluation Report")
    report_lines.append(f"  Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report_lines.append("=" * 70)
    report_lines.append("")

    for target, metrics in results.items():
        report_lines.append(f"Model: {target}")
        report_lines.append("-" * 40)
        report_lines.append(f"  Accuracy:  {metrics['accuracy']:.4f}")
        report_lines.append(f"  Precision: {metrics['precision']:.4f}")
        report_lines.append(f"  Recall:    {metrics['recall']:.4f}")
        report_lines.append(f"  F1 Score:  {metrics['f1']:.4f}")
        report_lines.append(f"  ROC-AUC:   {metrics['roc_auc']:.4f}")
        report_lines.append("")

    report_lines.append("=" * 70)
    report_lines.append("  Training complete.")
    report_lines.append("=" * 70)

    report_text = "\n".join(report_lines)
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write(report_text)
    print(f"      Saved -> {REPORT_PATH}")

    # ------------------------------------------------------------------
    # Final summary
    # ------------------------------------------------------------------
    print("\n" + "=" * 70)
    print("  All models trained and saved successfully!")
    print(f"  Models directory:  {MODEL_DIR}")
    print(f"  Report:            {REPORT_PATH}")
    print("=" * 70)


if __name__ == "__main__":
    main()
