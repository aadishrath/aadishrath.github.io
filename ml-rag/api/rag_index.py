import json
import os
from typing import Any

import faiss
import numpy as np


def _index_path() -> str:
    return os.getenv("VECTOR_INDEX_PATH", "./vector_index.faiss")


def _meta_path() -> str:
    return f"{_index_path()}.meta.json"


def create_index(dim: int) -> faiss.Index:
    return faiss.IndexFlatIP(dim)


def save_index(index: faiss.Index, metas: list[dict[str, Any]]) -> None:
    faiss.write_index(index, _index_path())
    with open(_meta_path(), "w", encoding="utf-8") as file_handle:
        json.dump(metas, file_handle, ensure_ascii=False, indent=2)


def load_index() -> tuple[faiss.Index | None, list[dict[str, Any]] | None]:
    index_path = _index_path()
    meta_path = _meta_path()
    if not os.path.exists(index_path) or not os.path.exists(meta_path):
        return None, None

    index = faiss.read_index(index_path)
    with open(meta_path, "r", encoding="utf-8") as file_handle:
        metas = json.load(file_handle)
    return index, metas


def build_index(vectors: np.ndarray, metas: list[dict[str, Any]]) -> tuple[faiss.Index, list[dict[str, Any]]]:
    if vectors.size == 0:
        raise ValueError("Cannot build an index with zero vectors.")

    index = create_index(vectors.shape[1])
    index.add(vectors)
    return index, metas


def search(index: faiss.Index | None, query_vec: np.ndarray, top_k: int = 4):
    if index is None:
        return None, None
    return index.search(query_vec, top_k)
