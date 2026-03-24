import shutil
from collections import Counter
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel
from pypdf import PdfReader

from server.rag.chunking import chunk_text, normalize_text
from server.rag.embeddings import embed_query, embed_texts
from server.rag.generator import generate_answer
from server.rag.pgvector_store import fetch_all_metadata, is_enabled as pgvector_enabled, reset as pgvector_reset, search as pgvector_search, upsert_chunks
from server.rag.rag_index import build_index, load_index, save_index, search
from server.settings import RAG_CORPUS_DIR, RAG_DEMO_CORPUS_DIR, RAG_EMBEDDING_DIM, RAG_EMBEDDING_MODEL, RAG_INDEX_PATH, RAG_TOP_K, RAG_VECTOR_BACKEND


router = APIRouter(prefix="/api/rag", tags=["rag"])
SUPPORTED_EXTENSIONS = {".txt", ".md", ".markdown", ".pdf"}


class QueryRequest(BaseModel):
    query: str
    top_k: int | None = None


class IngestResponse(BaseModel):
    ingested_files: list[str]
    chunks_indexed: int
    source_count: int
    vector_backend: str


def _resolve_backend() -> str:
    if RAG_VECTOR_BACKEND == "pgvector" and pgvector_enabled():
        return "pgvector"
    return "faiss"


def _safe_filename(name: str) -> str:
    return Path(name).name.strip().replace(" ", "_")


def _read_text_file(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def _read_pdf_file(path: Path) -> str:
    reader = PdfReader(str(path))
    pages = []
    for page in reader.pages:
        extracted = page.extract_text() or ""
        if extracted.strip():
            pages.append(extracted)
    return "\n\n".join(pages)


def _build_metadata() -> list[dict]:
    chunks = []
    for path in sorted(RAG_CORPUS_DIR.glob("**/*")):
        if not path.is_file() or path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue

        raw_text = _read_pdf_file(path) if path.suffix.lower() == ".pdf" else _read_text_file(path)
        normalized = normalize_text(raw_text)
        if not normalized:
            continue

        for chunk_index, chunk in enumerate(chunk_text(normalized), start=1):
            chunks.append(
                {
                    "chunk_id": f"{path.stem}-{chunk_index}",
                    "source": path.name,
                    "path": str(path),
                    "text": chunk,
                    "preview": chunk[:220].strip(),
                    "word_count": len(chunk.split()),
                }
            )
    return chunks


def _rebuild_index() -> dict:
    metadata = _build_metadata()
    if not metadata:
        raise HTTPException(status_code=400, detail="No supported documents found to index.")

    vectors = embed_texts([item["text"] for item in metadata])
    backend = _resolve_backend()

    if backend == "pgvector":
        upsert_chunks(metadata, vectors)
    else:
        index, metadata = build_index(vectors, metadata)
        save_index(index, metadata)

    return {
        "chunks_indexed": len(metadata),
        "source_count": len({item["source"] for item in metadata}),
        "vector_backend": backend,
    }


def _load_or_rebuild():
    if _resolve_backend() == "pgvector":
        metadata = fetch_all_metadata()
        if metadata:
            return "pgvector", metadata
        _rebuild_index()
        metadata = fetch_all_metadata()
        if metadata:
            return "pgvector", metadata
        raise HTTPException(status_code=500, detail="pgvector rebuild failed.")

    index, metadata = load_index()
    if index is not None and metadata:
        return index, metadata

    _rebuild_index()
    index, metadata = load_index()
    if index is None or metadata is None:
        raise HTTPException(status_code=500, detail="Index rebuild failed.")
    return index, metadata


def _stats() -> dict:
    backend = _resolve_backend()
    if backend == "pgvector":
        metadata = fetch_all_metadata()
        index = metadata
    else:
        index, metadata = load_index()

    corpus_files = [path for path in RAG_CORPUS_DIR.glob("**/*") if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS]
    if not metadata:
        return {
            "ready": False,
            "embedding_model": RAG_EMBEDDING_MODEL,
            "embedding_dim": RAG_EMBEDDING_DIM,
            "vector_backend": backend,
            "source_count": len(corpus_files),
            "chunks_indexed": 0,
            "sources": [path.name for path in corpus_files],
        }

    file_counts = Counter(item["source"] for item in metadata)
    return {
        "ready": index is not None,
        "embedding_model": RAG_EMBEDDING_MODEL,
        "embedding_dim": RAG_EMBEDDING_DIM,
        "vector_backend": backend,
        "source_count": len(file_counts),
        "chunks_indexed": len(metadata),
        "sources": sorted(file_counts.keys()),
        "chunk_distribution": dict(file_counts),
    }


def _lexical_score(query: str, text: str) -> float:
    query_terms = {token for token in query.lower().split() if len(token) > 2}
    if not query_terms:
        return 0.0
    return len(query_terms & set(text.lower().split())) / len(query_terms)


@router.get("/health")
def health():
    return {
        "status": "ok",
        **_stats(),
    }


@router.get("/stats")
def stats():
    return _stats()


@router.post("/ingest", response_model=IngestResponse)
async def ingest(files: list[UploadFile] = File(...)):
    saved = []
    for upload in files:
        filename = _safe_filename(upload.filename or "upload.txt")
        suffix = Path(filename).suffix.lower()
        if suffix not in SUPPORTED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {suffix or 'unknown'}")

        (RAG_CORPUS_DIR / filename).write_bytes(await upload.read())
        saved.append(filename)

    return {
        "ingested_files": saved,
        **_rebuild_index(),
    }


@router.post("/load_demo", response_model=IngestResponse)
def load_demo():
    if not RAG_DEMO_CORPUS_DIR.exists():
        raise HTTPException(status_code=404, detail="Demo corpus not found.")

    saved = []
    for path in sorted(RAG_DEMO_CORPUS_DIR.glob("*")):
        if not path.is_file() or path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue
        shutil.copyfile(path, RAG_CORPUS_DIR / path.name)
        saved.append(path.name)

    return {
        "ingested_files": saved,
        **_rebuild_index(),
    }


@router.post("/reset")
def reset_corpus():
    if RAG_CORPUS_DIR.exists():
        shutil.rmtree(RAG_CORPUS_DIR)
    RAG_CORPUS_DIR.mkdir(parents=True, exist_ok=True)

    if RAG_INDEX_PATH.exists():
        RAG_INDEX_PATH.unlink()
    meta_path = Path(f"{RAG_INDEX_PATH}.meta.json")
    if meta_path.exists():
        meta_path.unlink()

    pgvector_reset()
    return {"status": "reset"}


@router.post("/query")
def query(request: QueryRequest):
    question = request.query.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Query is required.")

    loaded_index, metadata = _load_or_rebuild()
    top_k = max(1, min(request.top_k or RAG_TOP_K, 8))
    query_vector = embed_query(question)
    backend = _resolve_backend()
    ranked_contexts = []

    if backend == "pgvector":
        for context in pgvector_search(query_vector, top_k=top_k):
            lexical = _lexical_score(question, context["text"])
            ranked_contexts.append(
                {
                    **context,
                    "lexical_score": round(lexical, 4),
                    "score": round((float(context["semantic_score"]) * 0.8) + (lexical * 0.2), 4),
                }
            )
    else:
        distances, indices = search(loaded_index, query_vector, top_k=top_k)
        if distances is None or indices is None:
            raise HTTPException(status_code=400, detail="The corpus is empty. Ingest documents first.")

        for score, idx in zip(distances[0], indices[0]):
            if idx < 0:
                continue
            context = metadata[idx]
            lexical = _lexical_score(question, context["text"])
            ranked_contexts.append(
                {
                    **context,
                    "semantic_score": round(float(score), 4),
                    "lexical_score": round(lexical, 4),
                    "score": round((float(score) * 0.8) + (lexical * 0.2), 4),
                }
            )

    ranked_contexts.sort(key=lambda item: item["score"], reverse=True)
    contexts = ranked_contexts[:top_k]
    answer, answer_mode = generate_answer(question, contexts)

    return {
        "answer": answer,
        "answer_mode": answer_mode,
        "sources": [context["source"] for context in contexts],
        "contexts": contexts,
        "retrieval": {
            "top_k": top_k,
            "vector_backend": backend,
            "chunks_indexed": len(metadata),
            "source_count": len({item["source"] for item in metadata}),
        },
    }
