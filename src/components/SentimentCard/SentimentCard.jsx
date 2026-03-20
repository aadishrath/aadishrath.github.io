
// Presentational component to display sentiment score, label, and token highlights.
import "./SentimentCard.css";

/**
 * result: {
 *   score: number (-1..1),
 *   label: "positive" | "neutral" | "negative",
 *   tokens: [ [token, score], ... ]
 * }
 */
export default function SentimentCard({ result }) {
  if (!result) return null;

  const { score, label, tokens } = result;
  const labelClass =
    label === "positive" ? "label-positive" : label === "negative" ? "label-negative" : "label-neutral";

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
          <div className="card-sub">Score: (-1...1), Label: (Positive/Negative/Neutral)</div>
          <div className="card-main">
            <div className="card-score">{score}</div>
            <div className={`card-label ${labelClass}`}>{label.toUpperCase()}</div>
          </div>
        </div>
        <div className="card-meta">
          <div className="meta-line">Model: <span className="meta-strong">client-lexicon</span></div>
          <div className="meta-line">Runtime: <span className="meta-strong">Pyodide</span></div>
        </div>
      </div>

      <hr className="card-divider" />

      <div>
        <div className="card-sub small">Token highlights</div>
        <div className="token-wrap">
          {tokens.map(([tok, tscore], idx) => (
            <span
              key={idx}
              className={`token ${tokenClass(tscore)}`}
              title={tscore ? `score: ${tscore}` : "no score"}
            >
              {tok}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
