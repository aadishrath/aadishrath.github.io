# Aadish Rathore Portfolio

This repository contains Aadish Rathore's portfolio site and a unified Python backend that powers two interactive demos:

- Sentiment Analysis
- Retrieval-Augmented Generation (RAG)

The frontend is a React 19 + Vite application. The backend is a single FastAPI server that exposes both demos under one API on port `8000`.

## Live site

[aadishrath.github.io](https://aadishrath.github.io)

## Stack

### Frontend

- React 19
- Vite
- React Router
- React Markdown
- CSS aligned with the existing portfolio styling

### Backend

- FastAPI
- scikit-learn for sentiment inference
- sentence-transformers for embeddings
- FAISS for local vector retrieval
- optional PostgreSQL + pgvector for production-shaped vector search
- optional OpenAI Responses API for higher-quality grounded synthesis

## Repository structure

- `src/`: React application
- `server/`: unified FastAPI backend for sentiment and RAG
- `ml-sentiment/model/`: trained sentiment artifacts
- `ml-sentiment/train/`: sentiment training code
- `ml-rag/rag/demo_corpus/`: packaged RAG demo corpus
- `ml-rag/rag/corpus/`: local uploaded corpus used by the RAG app

## Unified backend routes

- `GET /health`
- `GET /api/sentiment/health`
- `POST /api/sentiment/predict`
- `POST /api/sentiment/predict_batch`
- `POST /api/sentiment/predict_full`
- `GET /api/rag/health`
- `GET /api/rag/stats`
- `POST /api/rag/load_demo`
- `POST /api/rag/ingest`
- `POST /api/rag/query`
- `POST /api/rag/reset`

## Local development

### Frontend

Install frontend dependencies and run Vite:

```powershell
npm install
npm run dev
```

The frontend reads its backend origin from `.env.local`:

```env
VITE_API_ORIGIN=http://localhost:8000
```

### Unified backend

Create a Python virtual environment for the single backend:

```powershell
cd server
python -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Copy the backend env template:

```powershell
Copy-Item .env.example .env
```

Then start the API from the repository root:

```powershell
uvicorn server.main:app --reload --port 8000
```

Once it is running, both the sentiment demo and RAG demo will work from the same backend server.

## RAG configuration

The RAG system supports:

- `.md`
- `.markdown`
- `.txt`
- `.pdf`

It chunks uploaded documents, creates embeddings, and retrieves cited context for answers.

### Default local mode

By default, the RAG backend uses FAISS, which means no database is required.

### Optional pgvector mode

For PostgreSQL + pgvector instead of FAISS, update `server/.env`:

```env
VECTOR_BACKEND=pgvector
EMBEDDING_DIM=384
PGVECTOR_DSN=postgresql://postgres:postgres@localhost:5432/portfolio_rag
PGVECTOR_TABLE=rag_chunks
```

The app will create the `vector` extension, table, and HNSW index automatically when it connects.

## Sentiment demo notes

The backend loads the trained classifier and vectorizer from:

- `ml-sentiment/model/v1/classifier.pkl`
- `ml-sentiment/model/v1/vectorizer.pkl`

The React demo includes:

- a lightweight in-browser Pyodide version
- a full backend-powered inference path using the unified FastAPI server

## Why there is no RAG training dataset

The RAG demo does not require a labeled training dataset because it indexes a runtime document corpus instead of training a classifier.

To add evaluation later, create a small benchmark file with:

- question
- expected answer
- expected source file

## Resume value

This project is intentionally shaped to look strong for ML platform and applied AI roles:

- one React frontend with recruiter-friendly UX
- one shared FastAPI backend for multiple ML features
- classic sklearn model serving for sentiment
- modern retrieval architecture for RAG
- optional pgvector persistence path
- grounded answers with source inspection

## Verification

Useful local checks:

```powershell
npm run lint
npm run build
python -m compileall server
```
