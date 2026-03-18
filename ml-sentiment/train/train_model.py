
"""
train_model.py

End-to-end training script for an ML-based sentiment classifier.

High-level steps:
1. Load labeled text data from a Kaggle-style CSV.
2. Clean and preprocess the text (lowercasing, punctuation removal, etc.).
3. Split into train/validation sets.
4. Vectorize text (e.g., TF-IDF).
5. Train a classifier (e.g., Logistic Regression).
6. Evaluate and print metrics.
7. Persist the vectorizer + model to disk for serving.
"""

import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import joblib
import re
import nltk
from nltk.corpus import stopwords


# -------- CONFIG SECTION --------
# You can later move these into config.yaml if you want more flexibility.
DATA_PATH = os.path.join("data", "raw", "kaggle_sentiment.csv")  # <-- put your Kaggle file here
TEXT_COLUMN = "text"      # <-- adjust to match your Kaggle dataset
LABEL_COLUMN = "label"    # <-- adjust to match your Kaggle dataset

VECTORIZER_PATH = os.path.join("..", "model", "vectorizer.pkl")
MODEL_PATH = os.path.join("..", "model", "classifier.pkl")
# --------------------------------

def ensure_nltk_resources() -> None:
    """
    Ensure required NLTK resources are available.

    This function is safe to call multiple times; NLTK will skip downloads
    if the resources already exist.

    Why this matters:
    - Makes the script more "plug-and-play" for recruiters or teammates.
    """
    try:
        nltk.data.find("corpora/stopwords")
    except LookupError:
        nltk.download("stopwords")


def load_data(path: str) -> pd.DataFrame:
    """
    Load the Kaggle sentiment dataset from a CSV file.

    Args:
        path (str): Relative or absolute path to the CSV file.

    Returns:
        pd.DataFrame: DataFrame containing at least [TEXT_COLUMN, LABEL_COLUMN].
    """
    df = pd.read_csv(path)
    # Basic sanity check to fail fast if columns are wrong
    if TEXT_COLUMN not in df.columns or LABEL_COLUMN not in df.columns:
        raise ValueError(
            f"Expected columns '{TEXT_COLUMN}' and '{LABEL_COLUMN}' in dataset, "
            f"but got: {list(df.columns)}"
        )
    return df


def preprocess_text(text_series: pd.Series) -> pd.Series:
    """
    Apply lightweight but realistic NLP preprocessing.

    Steps:
      1. Lowercase text.
      2. Remove URLs.
      3. Remove non-alphabetic characters.
      4. Remove extra whitespace.
      5. Remove stopwords.

    This is intentionally simple but shows:
      - awareness of common text-cleaning steps
      - ability to balance performance vs. complexity
    """
    stop_words = set(stopwords.words("english"))

    def clean(text: str) -> str:
        if not isinstance(text, str):
            return ""

        # 1. Lowercase
        text = text.lower()

        # 2. Remove URLs
        text = re.sub(r"http\S+|www\.\S+", " ", text)

        # 3. Keep only letters and spaces
        text = re.sub(r"[^a-z\s]", " ", text)

        # 4. Tokenize on whitespace
        tokens = text.split()

        # 5. Remove stopwords
        tokens = [t for t in tokens if t not in stop_words]

        # 6. Re-join
        return " ".join(tokens)

    return text_series.astype(str).apply(clean)


def main():
    # Make sure NLTK has what we need before preprocessing
    ensure_nltk_resources()

    # 1. Load data
    df = load_data(DATA_PATH)

    # 2. Preprocess text
    df[TEXT_COLUMN] = preprocess_text(df[TEXT_COLUMN])


    # 3. Train/validation split
    X_train, X_val, y_train, y_val = train_test_split(
        df[TEXT_COLUMN],
        df[LABEL_COLUMN],
        test_size=0.2,
        random_state=42,
        stratify=df[LABEL_COLUMN],
    )

    # 4. Vectorize text using TF-IDF
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),      # unigrams + bigrams
        max_features=20000,      # cap vocab size for efficiency
        min_df=5                 # ignore very rare terms
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_val_vec = vectorizer.transform(X_val)

    # 5. Train a simple but strong baseline classifier
    clf = LogisticRegression(
        max_iter=1000,
        n_jobs=-1
    )
    clf.fit(X_train_vec, y_train)

    # 6. Evaluate
    y_pred = clf.predict(X_val_vec)
    print("Validation performance:")
    print(classification_report(y_val, y_pred))

    # 7. Persist artifacts for serving
    os.makedirs(os.path.join("..", "model"), exist_ok=True)
    joblib.dump(vectorizer, VECTORIZER_PATH)
    joblib.dump(clf, MODEL_PATH)
    print(f"Saved vectorizer to {VECTORIZER_PATH}")
    print(f"Saved classifier to {MODEL_PATH}")


if __name__ == "__main__":
    main()
