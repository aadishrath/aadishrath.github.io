import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.routers.rag import router as rag_router
from server.routers.sentiment import router as sentiment_router
from server.settings import ALLOWED_ORIGINS


logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")

app = FastAPI(
    title="Aadish Rathore Portfolio API",
    description="Unified backend for the sentiment analysis and RAG demos.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sentiment_router)
app.include_router(rag_router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "services": {
            "sentiment": "/api/sentiment/health",
            "rag": "/api/rag/health",
        },
    }
