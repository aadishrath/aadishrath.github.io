
"""
app.py

FastAPI service for serving the trained sentiment analysis model.

This file demonstrates:
- Loading persisted ML artifacts (vectorizer + classifier)
- Defining a REST API with FastAPI
- Input validation using Pydantic models
- Clean separation between preprocessing and inference
- A production-friendly structure that employers expect
"""

import os
import logging
import joblib
from http.client import HTTPException
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

# -----------------------------
# Logging configuration
# -----------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger(__name__)

# -----------------------------
# Load model artifacts at startup
# -----------------------------
MODEL_VERSION = "v1"
MODEL_DIR = os.path.join("..", "model", MODEL_VERSION)
VECTORIZER_PATH = os.path.join(MODEL_DIR, "vectorizer.pkl")
MODEL_PATH = os.path.join(MODEL_DIR, "classifier.pkl")

vectorizer = joblib.load(VECTORIZER_PATH)
classifier = joblib.load(MODEL_PATH)
logger.info("Vectorizer and classifier loaded successfully.")

# -----------------------------
# FastAPI initialization
# -----------------------------
app = FastAPI(
    title="ML Sentiment Analysis API",
    description="Serves predictions from a trained ML sentiment classifier.",
    version="1.0.0"
)

# -----------------------------
# CORS configuration
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",     # Vite dev server
        "http://127.0.0.1:5173",

        "http://localhost:4173",     # Vite preview
        "http://127.0.0.1:4173",

        "https://localhost:8000",
        "https://127.0.0.1:8000",
        "https://aadishrath.github.io" # Production site
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Global Exception Handlers
# -----------------------------
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    logger.error(f"HTTP error: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.error(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"error": "Invalid request format", "details": exc.errors()}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unexpected error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )

# -----------------------------
# Request schema
# -----------------------------
class SentimentRequest(BaseModel):
    text: str

class BatchSentimentRequest(BaseModel):
    texts: list[str]


# -----------------------------
# Prediction endpoint
# -----------------------------
@app.post("/predict")
def predict_sentiment(payload: SentimentRequest):
    """
    Predict sentiment for a single text input.

    Returns:
      - predicted label
      - confidence score (max class probability)
    """
    text = payload.text.strip()
    if not text:
        logger.warning("Empty text received")
        return JSONResponse(
            status_code=400,
            content={"error": "Text input cannot be empty"}
        )

    logger.info(f"Received prediction request: {text[:60]}...")

    # Vectorize input text
    X = vectorizer.transform([text])

    # Predict label
    pred = classifier.predict(X)[0]

    # Predict probabilities for each class
    if hasattr(classifier, "predict_proba"):
        proba = classifier.predict_proba(X)[0]
        confidence = float(proba.max())
    else:
        # Fallback if model doesn't support predict_proba
        confidence = None

    logger.info(f"Prediction: {pred} (confidence={confidence})")

    return {
        "sentiment": pred,
        "confidence": confidence,
    }

# -----------------------------
# Batch Prediction endpoint
# -----------------------------
@app.post("/predict_batch")
def predict_batch(payload: BatchSentimentRequest):
    """
    Predict sentiment for a batch of text inputs.

    Steps:
      1. Vectorize all texts at once (efficient).
      2. Predict labels.
      3. Predict confidence scores.
      4. Return a list of results.

    This mirrors real-world ML batch inference patterns.
    """
    if not payload.texts or len(payload.texts) == 0:
        return JSONResponse(
            status_code=400,
            content={"error": "List of texts cannot be empty"}
        )

    if any(not isinstance(t, str) or not t.strip() for t in payload.texts):
        return JSONResponse(
            status_code=400,
            content={"error": "All items must be non-empty strings"}
        )

    logger.info(f"Batch request received with {len(payload.texts)} items")

    # Vectorize all texts at once
    X = vectorizer.transform(payload.texts)

    # Predict labels
    preds = classifier.predict(X)

    # Predict probabilities (if supported)
    confidences = None
    if hasattr(classifier, "predict_proba"):
        proba = classifier.predict_proba(X)
        confidences = proba.max(axis=1)

    # Build response list
    results = []
    for i, text in enumerate(payload.texts):
        result = {
            "text": text,
            "sentiment": preds[i],
            "confidence": float(confidences[i]) if confidences is not None else None
        }
        results.append(result)

    logger.info("Batch prediction completed")

    return {
        "model_version": MODEL_VERSION,
        "results": results
    }

# -----------------------------
# Full Pipeline Prediction endpoint
# -----------------------------
@app.post("/predict_full")
async def predict_full(request: SentimentRequest, version: str = "v1"):
    text = request.text

    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Text input is empty")

    try:
        X = vectorizer.transform([text])                     # 1. Transform text
        prediction = classifier.predict(X)[0]                # 2. Predict sentiment + confidence
        proba = classifier.predict_proba(X)[0]
        confidence = max(proba)

        analyzer = vectorizer.build_analyzer()               # 3. Extract tokens using the same tokenizer as vectorizer
        tokens = analyzer(text)

        feature_names = vectorizer.get_feature_names_out()   # 4. Get feature names and model coefficients
        coef = classifier.coef_[0]  # assuming binary classifier

        max_abs = max(abs(c) for c in coef) or 1.0           # 5. Compute max absolute weight for normalization

        token_scores = []                                    # 6. Build normalized token-level scores
        for tok in tokens:
            if tok in feature_names:
                idx = list(feature_names).index(tok)
                raw_score = float(coef[idx])
                norm_score = raw_score / max_abs  # Normalize to [-1, 1]
            else:
                norm_score = 0.0
            token_scores.append([tok, norm_score])

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "sentiment": prediction,
        "confidence": float(confidence),
        "tokens": token_scores,
        "model_version": MODEL_VERSION
    }

# -----------------------------
# Endpoint for monitoring, uptime checks, and deployment pipelines
# -----------------------------
@app.get("/health")
def health_check():
    """
    Lightweight health check endpoint.

    Returns:
      - API status
      - Model load status
    """
    model_loaded = vectorizer is not None and classifier is not None

    return {
        "status": "ok",
        "model_loaded": model_loaded
    }

# -----------------------------
# Endpoint for version info, useful for monitoring and deployment pipelines
# -----------------------------
@app.get("/version")
def version_info():
    """
    Returns the currently deployed model version.
    """
    return {"model_version": MODEL_VERSION}