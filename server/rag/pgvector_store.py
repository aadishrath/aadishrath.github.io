import json
import os
from contextlib import contextmanager
from typing import Any

try:
    from pgvector.psycopg import register_vector
    from psycopg import connect
    from psycopg.rows import dict_row
except ModuleNotFoundError:
    register_vector = None
    connect = None
    dict_row = None

from server.settings import RAG_EMBEDDING_DIM


def _dsn() -> str:
    return os.getenv("PGVECTOR_DSN", "").strip()


def _table() -> str:
    return os.getenv("PGVECTOR_TABLE", "rag_chunks").strip() or "rag_chunks"


def is_enabled() -> bool:
    return bool(_dsn()) and connect is not None and register_vector is not None


@contextmanager
def get_connection():
    if not is_enabled():
        raise RuntimeError("pgvector backend is not configured.")

    connection = connect(_dsn(), row_factory=dict_row)
    register_vector(connection)
    try:
        yield connection
    finally:
        connection.close()


def initialize() -> None:
    if not is_enabled():
        return

    table_name = _table()
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("CREATE EXTENSION IF NOT EXISTS vector")
            cursor.execute(
                f"""
                CREATE TABLE IF NOT EXISTS {table_name} (
                    id BIGSERIAL PRIMARY KEY,
                    chunk_id TEXT UNIQUE NOT NULL,
                    source TEXT NOT NULL,
                    path TEXT NOT NULL,
                    preview TEXT NOT NULL,
                    text TEXT NOT NULL,
                    word_count INTEGER NOT NULL,
                    metadata JSONB NOT NULL,
                    embedding VECTOR({RAG_EMBEDDING_DIM}) NOT NULL
                )
                """
            )
            cursor.execute(
                f"""
                CREATE INDEX IF NOT EXISTS {table_name}_embedding_idx
                ON {table_name}
                USING hnsw (embedding vector_cosine_ops)
                """
            )
        connection.commit()


def reset() -> None:
    if not is_enabled():
        return

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(f"TRUNCATE TABLE {_table()}")
        connection.commit()


def upsert_chunks(metas: list[dict[str, Any]], vectors) -> None:
    initialize()
    rows = []
    for meta, vector in zip(metas, vectors):
        rows.append(
            (
                meta["chunk_id"],
                meta["source"],
                meta["path"],
                meta["preview"],
                meta["text"],
                meta["word_count"],
                json.dumps(meta, ensure_ascii=False),
                vector.tolist(),
            )
        )

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(f"TRUNCATE TABLE {_table()}")
            cursor.executemany(
                f"""
                INSERT INTO {_table()}
                    (chunk_id, source, path, preview, text, word_count, metadata, embedding)
                VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, %s)
                """,
                rows,
            )
        connection.commit()


def fetch_all_metadata() -> list[dict[str, Any]]:
    if not is_enabled():
        return []

    initialize()
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(f"SELECT metadata FROM {_table()} ORDER BY source, chunk_id")
            rows = cursor.fetchall()
    return [row["metadata"] for row in rows]


def search(query_vector, top_k: int = 4) -> list[dict[str, Any]]:
    initialize()
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                f"""
                SELECT
                    metadata,
                    1 - (embedding <=> %s) AS semantic_score
                FROM {_table()}
                ORDER BY embedding <=> %s
                LIMIT %s
                """,
                (query_vector[0].tolist(), query_vector[0].tolist(), top_k),
            )
            rows = cursor.fetchall()

    results: list[dict[str, Any]] = []
    for row in rows:
        metadata = row["metadata"]
        metadata["semantic_score"] = round(float(row["semantic_score"]), 4)
        results.append(metadata)
    return results
