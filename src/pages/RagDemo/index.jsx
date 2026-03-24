import { useEffect, useState } from 'react';
import RagUploader from '../../components/RagUploader/RagUploader';
import RagChat from '../../components/RagChat/RagChat';
import { RAG_API_URL } from '../../lib/api';
import './RagDemo.css';

const stackHighlights = [
  'React 19 + Vite frontend integrated into the portfolio',
  'FastAPI retrieval service with upload, indexing, and query endpoints',
  'Sentence-Transformers embeddings with FAISS and optional pgvector retrieval',
  'Optional OpenAI Responses API synthesis for grounded final answers',
];

const employerSignals = [
  'Grounded citations and chunk-level retrieval diagnostics',
  'Hybrid semantic + lexical reranking instead of pure keyword search',
  'Portfolio-native product design instead of a notebook-only demo',
];

export default function RagDemo() {
  const [systemStatus, setSystemStatus] = useState({
    status: 'loading',
    ready: false,
    embedding_model: null,
    source_count: 0,
    chunks_indexed: 0,
    sources: [],
  });

  async function refreshStatus() {
    try {
      const response = await fetch(`${RAG_API_URL}/health`);
      const payload = await response.json();
      setSystemStatus(payload);
    } catch {
      setSystemStatus({
        status: 'offline',
        ready: false,
        embedding_model: null,
        source_count: 0,
        chunks_indexed: 0,
        sources: [],
      });
    }
  }

  useEffect(() => {
    refreshStatus();
  }, []);

  return (
    <div className="rag-demo-page">
      <section className="rag-demo-hero">
        <div className="rag-demo-hero-copy">
          <span className="rag-demo-eyebrow  gradient-text">Portfolio-grade retrieval system</span>
          <h2 className="project-title gradient-text">Interactive RAG Assistant</h2>
          <div className="section-underline"></div>
          <p className="rag-demo-subtitle">
            A recruiter-friendly full-stack RAG demo with upload flows, retrieval diagnostics, grounded citations, and
            a Python API that can swap between local embeddings and an optional hosted LLM answer layer.
          </p>
        </div>

        <div className="rag-hero-status-card">
          <div className="rag-status-row">
            <span>Backend</span>
            <strong className={systemStatus.status === 'ok' ? 'rag-pill online' : 'rag-pill offline'}>
              {systemStatus.status === 'ok' ? 'Connected' : 'Offline'}
            </strong>
          </div>
          <div className="rag-status-row">
            <span>Embedding model</span>
            <strong>{systemStatus.embedding_model || 'Waiting for API'}</strong>
          </div>
          <div className="rag-status-row">
            <span>Vector backend</span>
            <strong>{systemStatus.vector_backend || 'Unknown'}</strong>
          </div>
          <div className="rag-status-grid">
            <div>
              <p>Indexed chunks</p>
              <strong>{systemStatus.chunks_indexed}</strong>
            </div>
            <div>
              <p>Sources</p>
              <strong>{systemStatus.source_count}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="rag-demo-summary-grid">
        <article className="rag-summary-card">
          <h3>Stack chosen for 2026-style AI roles</h3>
          <ul>
            {stackHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="rag-summary-card">
          <h3>Why this stands out on a resume</h3>
          <ul>
            {employerSignals.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="rag-summary-card rag-usage-card">
          <h3>How to use this demo</h3>
          <ol>
            <li>Load the demo corpus or upload your own markdown, text, or PDF files.</li>
            <li>Wait for the index status to confirm how many chunks were created.</li>
            <li>Ask a specific question and inspect the retrieved source cards below the answer.</li>
          </ol>
        </article>
      </section>

      <section className="rag-workbench">
        <aside className="rag-sidebar">
          <RagUploader apiUrl={RAG_API_URL} onIngested={refreshStatus} />

          <article className="rag-panel rag-system-panel">
            <div className="rag-panel-header">
              <div>
                <h3>Corpus status</h3>
                <p>The backend keeps a local vector index for uploaded markdown, text, and PDF documents.</p>
              </div>
              <button type="button" className="rag-secondary-button" onClick={refreshStatus}>
                Refresh
              </button>
            </div>

            <div className="rag-system-list">
              <div>
                <span>Ready for queries</span>
                <strong>{systemStatus.ready ? 'Yes' : 'Not yet'}</strong>
              </div>
              <div>
                <span>API status</span>
                <strong>{systemStatus.status === 'ok' ? 'Healthy' : 'Unavailable'}</strong>
              </div>
            </div>

            <div className="rag-source-list">
              {(systemStatus.sources || []).length ? (
                systemStatus.sources.map((source) => (
                  <span key={source} className="rag-source-chip">
                    {source}
                  </span>
                ))
              ) : (
                <p className="rag-muted-copy">Load the demo corpus or upload your own files to populate the index.</p>
              )}
            </div>
          </article>
        </aside>

        <section className="rag-chat-shell">
          <RagChat apiUrl={RAG_API_URL} systemStatus={systemStatus} />
        </section>
      </section>
    </div>
  );
}
