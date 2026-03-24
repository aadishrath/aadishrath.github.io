import logging

import joblib
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from server.settings import SENTIMENT_CLASSIFIER_PATH, SENTIMENT_MODEL_VERSION, SENTIMENT_VECTORIZER_PATH


router = APIRouter(prefix="/api/sentiment", tags=["sentiment"])
logger = logging.getLogger(__name__)

vectorizer = joblib.load(SENTIMENT_VECTORIZER_PATH)
classifier = joblib.load(SENTIMENT_CLASSIFIER_PATH)
logger.info("Sentiment artifacts loaded successfully.")


class SentimentRequest(BaseModel):
    text: str


class BatchSentimentRequest(BaseModel):
    texts: list[str]


@router.post("/predict")
def predict_sentiment(payload: SentimentRequest):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text input cannot be empty.")

    features = vectorizer.transform([text])
    prediction = classifier.predict(features)[0]
    confidence = float(classifier.predict_proba(features)[0].max()) if hasattr(classifier, "predict_proba") else None

    return {
        "sentiment": prediction,
        "confidence": confidence,
    }


@router.post("/predict_batch")
def predict_batch(payload: BatchSentimentRequest):
    if not payload.texts:
        raise HTTPException(status_code=400, detail="List of texts cannot be empty.")

    if any(not isinstance(text, str) or not text.strip() for text in payload.texts):
        raise HTTPException(status_code=400, detail="All items must be non-empty strings.")

    features = vectorizer.transform(payload.texts)
    predictions = classifier.predict(features)
    confidences = classifier.predict_proba(features).max(axis=1) if hasattr(classifier, "predict_proba") else None

    results = []
    for index, text in enumerate(payload.texts):
        results.append(
            {
                "text": text,
                "sentiment": predictions[index],
                "confidence": float(confidences[index]) if confidences is not None else None,
            }
        )

    return {
        "model_version": SENTIMENT_MODEL_VERSION,
        "results": results,
    }


@router.post("/predict_full")
def predict_full(payload: SentimentRequest, version: str = "v1"):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text input is empty.")

    try:
        features = vectorizer.transform([text])
        prediction = classifier.predict(features)[0]
        probabilities = classifier.predict_proba(features)[0]
        confidence = max(probabilities)

        analyzer = vectorizer.build_analyzer()
        tokens = analyzer(text)

        feature_names = vectorizer.get_feature_names_out()
        feature_index = {name: idx for idx, name in enumerate(feature_names)}
        coefficients = classifier.coef_[0]
        max_abs = max(abs(value) for value in coefficients) or 1.0

        token_scores = []
        for token in tokens:
            idx = feature_index.get(token)
            normalized_score = float(coefficients[idx]) / max_abs if idx is not None else 0.0
            token_scores.append([token, normalized_score])
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {
        "sentiment": prediction,
        "confidence": float(confidence),
        "tokens": token_scores,
        "model_version": SENTIMENT_MODEL_VERSION,
        "requested_version": version,
    }


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": vectorizer is not None and classifier is not None,
        "model_version": SENTIMENT_MODEL_VERSION,
    }


@router.get("/version")
def version_info():
    return {"model_version": SENTIMENT_MODEL_VERSION}
