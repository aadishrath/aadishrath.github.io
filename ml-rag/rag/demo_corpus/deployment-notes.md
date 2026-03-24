# Deployment Notes

This demo is intentionally local-first so it can run on a laptop without requiring a hosted database. FAISS provides fast vector search for the portfolio version, while the architecture leaves room to swap in a production vector store later.

A common production upgrade path is to move document metadata into PostgreSQL and use a vector extension such as pgvector or a managed vector database. That lets the same retrieval workflow scale while keeping the API surface, chunking logic, and evaluation approach largely unchanged.
