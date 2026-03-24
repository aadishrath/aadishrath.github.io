# RAG Architecture

The portfolio RAG demo uses a modern Python service architecture built around FastAPI, sentence-transformer embeddings, and FAISS vector retrieval. Documents are uploaded as markdown or text files, chunked into overlapping passages, embedded, and indexed for semantic search.

At query time the system embeds the user question, retrieves the most relevant chunks, reranks them with a light lexical score, and generates a grounded answer. If an OpenAI API key is configured, the system can use the Responses API for better synthesis while still constraining the model to retrieved context.

The frontend is a React 19 interface that exposes corpus loading, live status, retrieval diagnostics, and cited answers so users can see why the system responded the way it did.
