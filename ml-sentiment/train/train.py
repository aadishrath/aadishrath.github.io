
import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Example training data
texts = [
    "I love this!", "This is great", "Amazing work",
    "I hate this", "This is terrible", "Awful experience"
]
labels = ["positive", "positive", "positive", "negative", "negative", "negative"]

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)

clf = LogisticRegression(max_iter=1000)
clf.fit(X, labels)

MODEL_DIR = "ml-sentiment/model/v1"
os.makedirs(MODEL_DIR, exist_ok=True)

joblib.dump(vectorizer, f"{MODEL_DIR}/vectorizer.pkl")
joblib.dump(clf, f"{MODEL_DIR}/classifier.pkl")

print("Model saved.")
