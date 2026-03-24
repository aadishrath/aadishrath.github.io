import './RagUploader.css';
import { useState } from 'react';

export default function RagUploader({ apiUrl, onIngested }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('Load the bundled corpus or upload your own markdown, text, or PDF files.');
  const [busy, setBusy] = useState(false);

  function onFileChange(event) {
    setFiles(Array.from(event.target.files || []));
  }

  async function handleLoadDemo() {
    setBusy(true);
    setStatus('Loading demo corpus and rebuilding the vector index...');

    try {
      const response = await fetch(`${apiUrl}/load_demo`, { method: 'POST' });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.detail || 'Demo corpus failed to load.');
      }

      setStatus(`Loaded ${payload.ingested_files.length} demo files and indexed ${payload.chunks_indexed} chunks.`);
      onIngested?.();
    } catch (error) {
      setStatus(error.message || 'Demo corpus failed to load.');
    } finally {
      setBusy(false);
    }
  }

  async function handleIngest() {
    if (!files.length) {
      setStatus('Choose one or more `.md`, `.txt`, or `.pdf` files before indexing.');
      return;
    }

    setBusy(true);
    setStatus('Uploading files and rebuilding the vector index...');

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    try {
      const response = await fetch(`${apiUrl}/ingest`, {
        method: 'POST',
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.detail || 'Ingest failed.');
      }

      setStatus(`Indexed ${payload.ingested_files.length} file(s) across ${payload.chunks_indexed} chunks.`);
      setFiles([]);
      onIngested?.();
    } catch (error) {
      setStatus(error.message || 'Ingest failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rag-panel rag-upload-panel">
      <div className="rag-panel-header">
        <div>
          <h3>Corpus ingestion</h3>
          <p>Use the packaged knowledge base or upload your own markdown, text, and PDF files for retrieval.</p>
        </div>
      </div>

      <div className="rag-upload-actions">
        <button type="button" className="rag-primary-button" onClick={handleLoadDemo} disabled={busy}>
          {busy ? 'Working...' : 'Load Demo Corpus'}
        </button>

        <label className="rag-file-picker">
          <span>Select Files</span>
          <input type="file" accept=".md,.markdown,.txt,.pdf,application/pdf" multiple onChange={onFileChange} />
        </label>

        <button type="button" className="rag-secondary-button" onClick={handleIngest} disabled={busy}>
          Index Uploads
        </button>
      </div>

      <div className="rag-upload-meta">
        <p className="rag-upload-status">{status}</p>
        {files.length > 0 && (
          <div className="rag-selected-files">
            {files.map((file) => (
              <span key={`${file.name}-${file.size}`} className="rag-source-chip">
                {file.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
