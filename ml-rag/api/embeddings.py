import os

import numpy as np
from sentence_transformers import SentenceTransformer

_model = None


def get_embedding_model(model_name: str | None = None):
    global _model
    if _model is None:
        resolved_name = model_name or os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        _model = SentenceTransformer(resolved_name)
    return _model


def embed_texts(texts: list[str]) -> np.ndarray:
    if not texts:
        return np.zeros((0, 0), dtype=np.float32)

    model = get_embedding_model()
    embeddings = model.encode(
        texts,
        show_progress_bar=False,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )
    return embeddings.astype(np.float32)


def embed_query(text: str) -> np.ndarray:
    vectors = embed_texts([text])
    return vectors[0:1]
