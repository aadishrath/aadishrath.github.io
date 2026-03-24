import './RagChat.css';
import { startTransition, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const examplePrompts = [
  'What stack does this RAG system use?',
  'Why is this project strong for AI engineer interviews?',
  'How would you scale this demo beyond a local portfolio build?',
];

export default function RagChat({ apiUrl, systemStatus }) {
  const [query, setQuery] = useState(examplePrompts[0]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAsk(nextQuery = query) {
    const question = nextQuery.trim();
    if (!question) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question, top_k: 4 }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.detail || 'Query failed.');
      }

      startTransition(() => {
        setMessages((currentMessages) => [
          {
            id: `${question}-${Date.now()}`,
            query: question,
            ...payload,
          },
          ...currentMessages,
        ]);
      });
      setQuery('');
    } catch (requestError) {
      setError(requestError.message || 'Query failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rag-panel rag-chat-panel">
      <div className="rag-panel-header">
        <div>
          <h3>Ask the corpus</h3>
          <p>Each response is grounded in retrieved chunks so users can inspect the evidence behind the answer.</p>
        </div>
        <div className="rag-chat-meta">
          <span>{systemStatus.chunks_indexed || 0} indexed chunks</span>
        </div>
      </div>

      <div className="rag-prompt-row">
        {examplePrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="rag-prompt-chip"
            onClick={() => {
              setQuery(prompt);
              handleAsk(prompt);
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="rag-query-box">
        <textarea
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ask a question about the indexed corpus..."
          className="rag-query-input"
        />
        <div className="rag-query-actions">
          <p className="rag-muted-copy">
            Try questions about the architecture, stack choices, or how the system could scale in production.
          </p>
          <button
            type="button"
            className="rag-primary-button"
            onClick={() => handleAsk()}
            disabled={loading || systemStatus.status !== 'ok'}
          >
            {loading ? 'Retrieving...' : 'Run Query'}
          </button>
        </div>
      </div>

      {error && <div className="rag-chat-error">{error}</div>}

      <div className="rag-results-list">
        {messages.length === 0 ? (
          <div className="rag-empty-state">
            <h4>No queries yet</h4>
            <p>
              {systemStatus.status === 'ok'
                ? 'Load the demo corpus and ask your first question.'
                : 'Start the FastAPI backend first so the demo can retrieve and answer questions.'}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <article key={message.id} className="rag-answer-card">
              <div className="rag-answer-question">Q: {message.query}</div>
              <div className="rag-answer-body">
                <ReactMarkdown>{message.answer}</ReactMarkdown>
              </div>

              <div className="rag-answer-footer">
                <span className="rag-mode-pill">{message.answer_mode}</span>
                <span>{message.retrieval?.top_k || 0} chunks searched</span>
              </div>

              <div className="rag-context-grid">
                {(message.contexts || []).map((context) => (
                  <div key={context.chunk_id} className="rag-context-card">
                    <div className="rag-context-head">
                      <strong>{context.source}</strong>
                      <span>{context.score}</span>
                    </div>
                    <p>{context.preview}</p>
                    <div className="rag-context-metrics">
                      <span>semantic {context.semantic_score}</span>
                      <span>lexical {context.lexical_score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
