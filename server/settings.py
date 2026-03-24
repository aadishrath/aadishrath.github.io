import os
from pathlib import Path

from dotenv import load_dotenv


SERVER_DIR = Path(__file__).resolve().parent
REPO_ROOT = SERVER_DIR.parent

load_dotenv(SERVER_DIR / ".env")


ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "https://aadishrath.github.io",
]

SENTIMENT_MODEL_VERSION = os.getenv("SENTIMENT_MODEL_VERSION", "v1")
SENTIMENT_MODEL_DIR = REPO_ROOT / "ml-sentiment" / "model" / SENTIMENT_MODEL_VERSION
SENTIMENT_VECTORIZER_PATH = SENTIMENT_MODEL_DIR / "vectorizer.pkl"
SENTIMENT_CLASSIFIER_PATH = SENTIMENT_MODEL_DIR / "classifier.pkl"

RAG_EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
RAG_EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", "384"))
RAG_TOP_K = int(os.getenv("TOP_K", "4"))
RAG_VECTOR_BACKEND = os.getenv("VECTOR_BACKEND", "faiss").strip().lower()
RAG_INDEX_PATH = Path(os.getenv("VECTOR_INDEX_PATH", str(SERVER_DIR / "data" / "rag" / "vector_index.faiss")))
RAG_CORPUS_DIR = Path(os.getenv("DATA_DIR", str(REPO_ROOT / "ml-rag" / "rag" / "corpus")))
RAG_DEMO_CORPUS_DIR = Path(os.getenv("DEMO_CORPUS_DIR", str(REPO_ROOT / "ml-rag" / "rag" / "demo_corpus")))

RAG_INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)
RAG_CORPUS_DIR.mkdir(parents=True, exist_ok=True)
