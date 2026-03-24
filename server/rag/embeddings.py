import numpy as np
from sentence_transformers import SentenceTransformer

from server.settings import RAG_EMBEDDING_MODEL


_model = None


def get_embedding_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(RAG_EMBEDDING_MODEL)
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
    return embed_texts([text])[0:1]
