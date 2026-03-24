import json

import faiss
import numpy as np

from server.settings import RAG_INDEX_PATH


def _meta_path() -> str:
    return f"{RAG_INDEX_PATH}.meta.json"


def create_index(dim: int) -> faiss.Index:
    return faiss.IndexFlatIP(dim)


def save_index(index: faiss.Index, metas: list[dict]) -> None:
    faiss.write_index(index, str(RAG_INDEX_PATH))
    with open(_meta_path(), "w", encoding="utf-8") as file_handle:
        json.dump(metas, file_handle, ensure_ascii=False, indent=2)


def load_index() -> tuple[faiss.Index | None, list[dict] | None]:
    if not RAG_INDEX_PATH.exists():
        return None, None

    try:
        with open(_meta_path(), "r", encoding="utf-8") as file_handle:
            metas = json.load(file_handle)
    except FileNotFoundError:
        return None, None

    return faiss.read_index(str(RAG_INDEX_PATH)), metas


def build_index(vectors: np.ndarray, metas: list[dict]) -> tuple[faiss.Index, list[dict]]:
    if vectors.size == 0:
        raise ValueError("Cannot build an index with zero vectors.")

    index = create_index(vectors.shape[1])
    index.add(vectors)
    return index, metas


def search(index: faiss.Index | None, query_vec: np.ndarray, top_k: int = 4):
    if index is None:
        return None, None
    return index.search(query_vec, top_k)
