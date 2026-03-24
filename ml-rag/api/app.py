import os
import pathlib
import shutil
from collections import Counter
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader

from chunking import chunk_text, normalize_text
from embeddings import embed_query, embed_texts
from generator import generate_answer
from pgvector_store import fetch_all_metadata, is_enabled as pgvector_enabled, reset as pgvector_reset, search as pgvector_search, upsert_chunks
from rag_index import build_index, load_index, save_index, search


ROOT = pathlib.Path(__file__).parent
PROJECT_ROOT = ROOT.parent
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(ROOT / ".env")

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", "384"))
VECTOR_INDEX_PATH = os.getenv("VECTOR_INDEX_PATH", str(ROOT / "vector_index.faiss"))
CORPUS_DIR = pathlib.Path(os.getenv("DATA_DIR", str(PROJECT_ROOT / "rag" / "corpus")))
DEMO_CORPUS_DIR = pathlib.Path(os.getenv("DEMO_CORPUS_DIR", str(PROJECT_ROOT / "rag" / "demo_corpus")))
TOP_K = int(os.getenv("TOP_K", "4"))
VECTOR_BACKEND = os.getenv("VECTOR_BACKEND", "faiss").strip().lower()

os.environ["VECTOR_INDEX_PATH"] = VECTOR_INDEX_PATH

SUPPORTED_EXTENSIONS = {".txt", ".md", ".markdown", ".pdf"}

app = FastAPI(title="Portfolio RAG API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = None


class IngestResponse(BaseModel):
    ingested_files: list[str]
    chunks_indexed: int
    source_count: int


def _safe_filename(name: str) -> str:
    candidate = pathlib.Path(name).name.strip()
    return candidate.replace(" ", "_")


def _read_text_file(path: pathlib.Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def _read_pdf_file(path: pathlib.Path) -> str:
    reader = PdfReader(str(path))
    pages: list[str] = []
    for page in reader.pages:
        extracted = page.extract_text() or ""
        if extracted.strip():
            pages.append(extracted)
    return "\n\n".join(pages)


def _build_metadata() -> list[dict]:
    CORPUS_DIR.mkdir(parents=True, exist_ok=True)

    chunks: list[dict] = []
    for path in sorted(CORPUS_DIR.glob("**/*")):
        if not path.is_file() or path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue

        if path.suffix.lower() == ".pdf":
            raw_text = _read_pdf_file(path)
        else:
            raw_text = _read_text_file(path)
        normalized = normalize_text(raw_text)
        if not normalized:
            continue

        for chunk_index, chunk in enumerate(chunk_text(normalized), start=1):
            preview = chunk[:220].strip()
            chunks.append(
                {
                    "chunk_id": f"{path.stem}-{chunk_index}",
                    "source": path.name,
                    "path": str(path),
                    "text": chunk,
                    "preview": preview,
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
    corpus_files = [
        path for path in CORPUS_DIR.glob("**/*")
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    ]

    if not metadata:
        return {
            "ready": False,
            "embedding_model": EMBEDDING_MODEL,
            "vector_backend": backend,
            "source_count": len(corpus_files),
            "chunks_indexed": 0,
            "sources": [path.name for path in corpus_files],
        }

    file_counts = Counter(item["source"] for item in metadata)
    return {
        "ready": index is not None,
        "embedding_model": EMBEDDING_MODEL,
        "vector_backend": backend,
        "source_count": len(file_counts),
        "chunks_indexed": len(metadata),
        "sources": sorted(file_counts.keys()),
        "chunk_distribution": dict(file_counts),
    }


def _resolve_backend() -> str:
    if VECTOR_BACKEND == "pgvector" and pgvector_enabled():
        return "pgvector"
    return "faiss"


def _lexical_score(query: str, text: str) -> float:
    query_terms = {token for token in query.lower().split() if len(token) > 2}
    if not query_terms:
        return 0.0

    text_terms = set(text.lower().split())
    return len(query_terms & text_terms) / len(query_terms)


@app.get("/health")
def health():
    stats = _stats()
    return {
        "status": "ok",
        "embedding_dim": EMBEDDING_DIM,
        **stats,
    }


@app.get("/stats")
def stats():
    return _stats()


@app.post("/ingest", response_model=IngestResponse)
async def ingest(files: list[UploadFile] = File(...)):
    CORPUS_DIR.mkdir(parents=True, exist_ok=True)
    saved: list[str] = []

    for upload in files:
        filename = _safe_filename(upload.filename or "upload.txt")
        suffix = pathlib.Path(filename).suffix.lower()
        if suffix not in SUPPORTED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {suffix or 'unknown'}")

        destination = CORPUS_DIR / filename
        content = await upload.read()
        destination.write_bytes(content)
        saved.append(filename)

    stats = _rebuild_index()
    return {
        "ingested_files": saved,
        **stats,
    }


@app.post("/load_demo", response_model=IngestResponse)
def load_demo():
    if not DEMO_CORPUS_DIR.exists():
        raise HTTPException(status_code=404, detail="Demo corpus not found.")

    CORPUS_DIR.mkdir(parents=True, exist_ok=True)
    saved: list[str] = []
    for path in sorted(DEMO_CORPUS_DIR.glob("*")):
        if not path.is_file() or path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue
        destination = CORPUS_DIR / path.name
        shutil.copyfile(path, destination)
        saved.append(path.name)

    stats = _rebuild_index()
    return {
        "ingested_files": saved,
        **stats,
    }


@app.post("/reset")
def reset_corpus():
    if CORPUS_DIR.exists():
        shutil.rmtree(CORPUS_DIR)
    CORPUS_DIR.mkdir(parents=True, exist_ok=True)

    index_path = pathlib.Path(VECTOR_INDEX_PATH)
    meta_path = pathlib.Path(f"{VECTOR_INDEX_PATH}.meta.json")
    if index_path.exists():
        index_path.unlink()
    if meta_path.exists():
        meta_path.unlink()

    pgvector_reset()

    return {"status": "reset"}


@app.post("/query")
def query(request: QueryRequest):
    question = request.query.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Query is required.")

    loaded_index, metadata = _load_or_rebuild()
    top_k = max(1, min(request.top_k or TOP_K, 8))
    ranked_contexts: list[dict] = []
    query_vector = embed_query(question)
    backend = _resolve_backend()

    if backend == "pgvector":
        for context in pgvector_search(query_vector, top_k=top_k):
            lexical = _lexical_score(question, context["text"])
            final_score = round((float(context["semantic_score"]) * 0.8) + (lexical * 0.2), 4)
            ranked_contexts.append(
                {
                    **context,
                    "lexical_score": round(lexical, 4),
                    "score": final_score,
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
            final_score = round((float(score) * 0.8) + (lexical * 0.2), 4)
            ranked_contexts.append(
                {
                    **context,
                    "semantic_score": round(float(score), 4),
                    "lexical_score": round(lexical, 4),
                    "score": final_score,
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
