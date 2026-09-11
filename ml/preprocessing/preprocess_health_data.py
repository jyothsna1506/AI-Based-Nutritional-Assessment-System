"""
Preprocess Health (NHANES) Data
===============================
Loads the already-preprocessed/normalized NHANES health data, splits into
train/test sets (80/20) with stratification on each deficiency label,
and saves the splits.

Usage:
    python ml/preprocessing/preprocess_health_data.py
"""

import os
import sys
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

# ---------------------------------------------------------------------------
# Path setup
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))

RAW_PATH = os.path.join(PROJECT_ROOT, "ml", "datasets", "raw", "df_transformed.csv")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "ml", "datasets", "processed")
TRAIN_PATH = os.path.join(OUTPUT_DIR, "health_train.csv")
TEST_PATH = os.path.join(OUTPUT_DIR, "health_test.csv")

# ---------------------------------------------------------------------------
# Column definitions
# ---------------------------------------------------------------------------
FEATURE_COLS = [
    "RIDAGEYR",       # Age
    "BMXHT",          # Height
    "BMXWAIST",       # Waist circumference
    "BMXBMI",         # BMI
    "PAD680",         # Physical activity
    "LBXSKSI",        # Potassium
    "LBXSCA",         # Calcium
    "LBXMAGN",        # Magnesium
    "LBXHGB",         # Hemoglobin
    "LBXSIR",         # Iron
    "RIAGENDR_Male",  # Gender (male indicator)
    "HSQ590_2.0",     # Health status
    "MCQ010_2.0",     # Medical condition
]

DEFICIENCY_LABELS = [
    "Vitamin_D_Deficiency",
    "SCA_Deficiency",
    "MAGN_Deficiency",
    "SK_Deficiency",
    "R_Deficiency",
    "Iron_Anemia_Deficiency",
]


def main():
    print("=" * 60)
    print("  Health Data Preprocessing Pipeline")
    print("=" * 60)

    # ------------------------------------------------------------------
    # 1. Load data
    # ------------------------------------------------------------------
    print(f"\n[1/4] Loading health data from:\n      {RAW_PATH}")
    if not os.path.exists(RAW_PATH):
        print(f"ERROR: Raw file not found at {RAW_PATH}")
        sys.exit(1)

    df = pd.read_csv(RAW_PATH)
    print(f"      Loaded {len(df):,} rows × {df.shape[1]} columns")
    print(f"      Columns: {df.columns.tolist()}")

    # ------------------------------------------------------------------
    # 2. Validate columns exist
    # ------------------------------------------------------------------
    print("\n[2/4] Validating columns ...")
    missing_features = [c for c in FEATURE_COLS if c not in df.columns]
    missing_labels = [c for c in DEFICIENCY_LABELS if c not in df.columns]
    if missing_features:
        print(f"  WARNING: Missing feature columns: {missing_features}")
    if missing_labels:
        print(f"  WARNING: Missing label columns: {missing_labels}")

    # Use only columns that exist
    feature_cols = [c for c in FEATURE_COLS if c in df.columns]
    label_cols = [c for c in DEFICIENCY_LABELS if c in df.columns]

    print(f"      Feature columns ({len(feature_cols)}): {feature_cols}")
    print(f"      Label columns ({len(label_cols)}): {label_cols}")

    # Drop rows with NaN in feature or label columns
    before = len(df)
    df = df.dropna(subset=feature_cols + label_cols)
    print(f"      Dropped {before - len(df):,} rows with NaN values")
    print(f"      Remaining rows: {len(df):,}")

    # Ensure label columns are integer type
    for col in label_cols:
        df[col] = df[col].astype(int)

    # Print deficiency label distributions
    print("\n      Deficiency label distributions:")
    for col in label_cols:
        counts = df[col].value_counts().to_dict()
        positive_rate = df[col].mean() * 100
        print(f"        {col}: {counts} ({positive_rate:.1f}% positive)")

    # ------------------------------------------------------------------
    # 3. Train/test split with stratification
    # ------------------------------------------------------------------
    print("\n[3/4] Splitting into train/test (80/20) ...")

    # Create a composite stratification key from all deficiency labels
    # This ensures each split has similar label distributions
    df["_strat_key"] = df[label_cols].astype(str).agg("-".join, axis=1)

    # Check if any stratification group has fewer than 2 samples
    strat_counts = df["_strat_key"].value_counts()
    min_count = strat_counts.min()
    print(f"      Stratification groups: {len(strat_counts)}")
    print(f"      Smallest group size: {min_count}")

    if min_count < 2:
        # Fall back to stratifying on the most imbalanced single label
        print("      Some groups too small for composite stratification.")
        # Find the label with the most imbalance
        imbalances = {col: abs(df[col].mean() - 0.5) for col in label_cols}
        strat_col = max(imbalances, key=imbalances.get)
        print(f"      Falling back to stratification on: {strat_col}")
        stratify_on = df[strat_col]
    else:
        stratify_on = df["_strat_key"]

    # Drop helper column
    df = df.drop(columns=["_strat_key"])

    # Keep only feature + label columns for output
    output_cols = feature_cols + label_cols
    df_out = df[output_cols]

    train_df, test_df = train_test_split(
        df_out,
        test_size=0.2,
        random_state=42,
        stratify=stratify_on,
    )

    print(f"      Train set: {len(train_df):,} rows")
    print(f"      Test set:  {len(test_df):,} rows")

    # ------------------------------------------------------------------
    # 4. Save
    # ------------------------------------------------------------------
    print(f"\n[4/4] Saving processed data ...")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    train_df.to_csv(TRAIN_PATH, index=False)
    test_df.to_csv(TEST_PATH, index=False)

    train_size = os.path.getsize(TRAIN_PATH) / 1024
    test_size = os.path.getsize(TEST_PATH) / 1024
    print(f"      Train → {TRAIN_PATH} ({train_size:.1f} KB)")
    print(f"      Test  → {TEST_PATH} ({test_size:.1f} KB)")

    # Verify label distributions in splits
    print("\n      Label distributions (train vs test):")
    for col in label_cols:
        train_rate = train_df[col].mean() * 100
        test_rate = test_df[col].mean() * 100
        print(f"        {col}: train={train_rate:.1f}%, test={test_rate:.1f}%")

    print("\n" + "=" * 60)
    print("  Health data preprocessing complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
