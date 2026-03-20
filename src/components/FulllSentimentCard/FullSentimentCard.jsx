
export default function FullSentimentCard({ result }) {
  if (!result) return null;

  if (result.error) {
    return <div className="sentiment-warning">Error: {result.error}</div>;
  }

  const { sentiment, confidence, tokens = [], model_version } = result;

  // Map backend sentiment → same label classes used in Light version
  const labelClass =
    sentiment === "positive"
      ? "label-positive"
      : sentiment === "negative"
      ? "label-negative"
      : "label-neutral";

  // Backend may not return token scores, so default to neutral
  function tokenClass(tokenScore) {
    if (!tokenScore) return "token-neutral";
    if (tokenScore > 0) return "token-positive";
    if (tokenScore < 0) return "token-negative";
    return "token-neutral";
  }

  return (
    <div className="card-root">
      <div className="card-header">
        <div>
          <div className="card-sub">Overall sentiment</div>
          <div className="card-sub">Confidence: (-1...1), Label: (Positive/Negative/Neutral)</div>
          <div className="card-main">
            <div className="card-score">{confidence.toFixed(3)}</div>
            <div className={`card-label ${labelClass}`}>{sentiment.toUpperCase()}</div>
          </div>
        </div>
        <div className="card-meta">
          <div className="meta-line">Model: <span className="meta-strong">{model_version}</span></div>
          <div className="meta-line">Runtime: <span className="meta-strong">FastAPI</span></div>
        </div>
      </div>

      <hr className="card-divider" />

      <div>
        <div className="card-sub small">Token highlights</div>
        <div className="token-wrap">
          {tokens.length > 0 ? (
              tokens.map(([tok, tscore], idx) => (
                <span
                  key={idx}
                  className={`token ${tokenClass(tscore)}`}
                  title={tscore ? `score: ${tscore}` : "no score"}
                >
                  {tok}
                </span>
              ))
          ) : (
              <span className="token token-neutral">
                (Backend model did not return token-level scores)
              </span>
          )}
        </div>
      </div>
    </div>
  );
}
