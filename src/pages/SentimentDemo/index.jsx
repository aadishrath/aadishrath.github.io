
// React page that loads Pyodide and runs a small Python sentiment analyzer in-browser.
import { useEffect, useState, useRef, Suspense } from "react";
import SentimentCard from "../../components/SentimentCard/SentimentCard";
import Spinner from "../../components/Spinner/Spinner";
import FullSentimentCard from "../../components/FulllSentimentCard/FullSentimentCard";
import { SENTIMENT_API_URL } from "../../lib/api";
import "./LightSection.css";

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.24.0/full/pyodide.js";

export default function SentimentDemo() {
  const defaultText = "I loved the product — it was fast, intuitive, and delightful!";

  // Light (Pyodide) version state
  const [pyodideLoaded, setPyodideLoaded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Initializing Pyodide...");
  const [inputText, setInputText] = useState(defaultText);
  const [result, setResult] = useState(null);
  const pyodideRef = useRef(null);
  const [lightVersion, setLightVersion] = useState("v1");
  const labelClass =
    result?.label === "positive" ? "label-positive" : result?.label === "negative" ? "label-negative" : "label-neutral";

  // Full end-to-end version state
  const [fullText, setFullText] = useState(defaultText);
  const [fullResult, setFullResult] = useState(null);
  const [fullLoading, setFullLoading] = useState(false);
  const [fullError, setFullError] = useState("");
  const [fullVersion, setFullVersion] = useState("v1");
  const fullLabelClass =
    fullResult?.sentiment === "positive" ? "label-positive" : fullResult?.sentiment === "negative" ? "label-negative" : "label-neutral";

  useEffect(() => {
    let cancelled = false;

    async function loadPyodideAndInit() {
      setLoadingMessage("Loading Pyodide runtime (this may take a few seconds)...");
      if (!window.loadPyodide) {
        const script = document.createElement("script");
        script.src = PYODIDE_CDN;
        script.async = true;
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () =>
            reject(new Error("Failed to load Pyodide script"));
        });
      }

      setLoadingMessage("Starting Pyodide...");
      const pyodide = await window.loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.0/full/" });

      const pythonCode = `
        import json
        import re
        from math import copysign

        LEXICON = {
            "love": 3, "loved": 3, "lovely": 2, "like": 2, "liked": 2,
            "great": 3, "good": 2, "excellent": 4, "amazing": 4, "awesome": 4,
            "delightful": 3, "happy": 2, "pleasant": 2,
            "bad": -2, "terrible": -3, "awful": -3, "hate": -3, "hated": -3,
            "slow": -2, "bug": -2, "bugs": -2, "frustrating": -3, "confusing": -2,
            "fast": 2, "intuitive": 2, "easy": 2, "hard": -2, "difficult": -2,
            "disappointing": -3, "poor": -2, "best": 3, "worst": -3, "exceeded": 3,
            "expectations": 2
        }

        TOKEN_RE = re.compile(r"\\w+|[^\\s\\w]", re.UNICODE)

        def analyze_sentiment(text):
            tokens = TOKEN_RE.findall(text.lower())
            token_scores = []
            total = 0.0
            count = 0
            for t in tokens:
                if t.isalpha():
                    score = LEXICON.get(t, 0)
                    if score != 0:
                        token_scores.append((t, score))
                        total += score
                        count += 1
                    else:
                        token_scores.append((t, 0))
                else:
                    token_scores.append((t, 0))
            if count == 0:
                norm = 0.0
            else:
                max_abs = max(abs(v) for v in LEXICON.values()) or 1
                norm = total / (max_abs * count)
                if norm > 1: norm = 1.0
                if norm < -1: norm = -1.0

            if norm > 0.15:
                label = "positive"
            elif norm < -0.15:
                label = "negative"
            else:
                label = "neutral"

            return json.dumps({
                "score": round(norm, 3),
                "label": label,
                "tokens": token_scores
            })

        def analyze(text):
            return analyze_sentiment(text)
    `;

      await pyodide.runPythonAsync(pythonCode);

      pyodideRef.current = pyodide;
      if (!cancelled) {
        setPyodideLoaded(true);
        setLoadingMessage("");
      }
    }

    loadPyodideAndInit().catch((err) => {
      console.error("Pyodide load error:", err);
      setLoadingMessage("Failed to load Pyodide. Check console for details.");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function runAnalysis(text) {
    if (!pyodideRef.current) return;
    setResult(null);
    setLoadingMessage("Analyzing text...");
    try {
      const py = pyodideRef.current;
      py.globals.set("input_text", text);
      const pyResult = await py.runPythonAsync(`analyze(input_text)`);
      const parsed = JSON.parse(pyResult);
      setResult(parsed);
      setLoadingMessage("");
    } catch (err) {
      console.error("Analysis error:", err);
      setLoadingMessage("Analysis failed. See console for details.");
    }
  }

  const handleAnalyze = async () => {
    await runAnalysis(inputText);
  };

  const handleReset = () => {
    setInputText("");
    setResult(null);
    setLoadingMessage("");

    setTimeout(() => {
      setInputText(defaultText)
    }, 1500);
  };

    async function handleFullAnalyze() {
    if (!fullText.trim()) return;

    setFullLoading(true);
    setFullResult(null);
    setFullError("");

    try {
      const res = await fetch(`${SENTIMENT_API_URL}/predict_full?version=${fullVersion}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fullText }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.detail || `API error: ${res.status}`);
      }

      const data = await res.json();
      setFullResult(data);
    } catch (err) {
      console.error("Full pipeline API error:", err);
      setFullError(err.message || "Full pipeline analysis failed.");
    } finally {
      setFullLoading(false);
    }
  }

  const handleFullReset = () => {
    setFullText("");
    setFullResult(null);
    setFullError("");
    setTimeout(() => {
      setFullText("This product exceeded my expectations!");
    }, 1500);
  };


  return (
    <div className="sentiment-container">
      <h2 className="project-title gradient-text">Sentiment Analysis Demo</h2>
      <div className='section-underline'></div>
      <p className="sentiment-sub">
        Lightweight Python sentiment analyzer running in your browser via Pyodide.
      </p>

      {/* LIGHT VERSION (Pyodide) */}
      <section className="sentiment-section">
        <h3 className="sentiment-section-title">In-Browser Python Version</h3>

        <Suspense fallback={<Spinner />}>
          {!pyodideLoaded && (
              <div className="sentiment-warning">
                  <p className="sentiment-warning-text">{loadingMessage}</p>
              </div>
          )}

          <div className="sentiment-dropdown">
            <label>Light Model Version:</label>
            <select
              value={lightVersion}
              onChange={(e) => setLightVersion(e.target.value)}
              className="sentiment-select"
            >
              <option value="v1">v1 — Basic Lexicon</option>
              <option value="v2">v2 — Expanded Lexicon</option>
              <option value="v3">v3 — Negation Handling</option>
            </select>
          </div>

          <textarea id="user-input"
              className="sentiment-textarea"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste text here..."
          />

          <div className="sentiment-controls">
              <button onClick={handleAnalyze} disabled={!pyodideLoaded} className={`sentiment-btn ${pyodideLoaded ? "enabled" : "disabled"}`}>
                  Analyze
              </button>
              
              <button onClick={handleReset} className="sentiment-reset-btn">
                  Reset
              </button>
              
          </div>

          {loadingMessage && pyodideLoaded && (
              <div className="sentiment-loading">{loadingMessage}</div>
          )}

          {result 
              ? (<SentimentCard result={result} />)
              : (
                  <div className="sentiment-placeholder">
                      No analysis yet. Click Analyze to run.
                  </div>
              )
          }

          <div className="sentiment-note">
              <strong>Note:</strong> This demo uses a compact lexicon for speed and reproducibility.
          </div>
        </Suspense>
      </section>

      {/* FULL END-TO-END VERSION (Backend API) */}
      <section className="sentiment-section">
        <h3 className="sentiment-section-title">End-to-End Version (Backend Model)</h3>

        <div className="sentiment-dropdown">
          <label>Backend Model Version:</label>
          <select
            value={fullVersion}
            onChange={(e) => setFullVersion(e.target.value)}
            className="sentiment-select"
          >
            <option value="v1">v1 — Baseline ML Model</option>
            <option value="v2">v2 — Improved Vectorizer</option>
            <option value="v3">v3 — Fine-tuned Classifier</option>
          </select>
        </div>

        <textarea
          className="sentiment-textarea"
          value={fullText}
          onChange={(e) => setFullText(e.target.value)}
          placeholder="Type or paste text for the backend model..."
        />

        <div className="sentiment-controls">
          <button
            onClick={handleFullAnalyze}
            disabled={fullLoading || !fullText.trim()}
            className={`sentiment-btn ${!fullLoading && fullText.trim() ? "enabled" : "disabled"}`}
          >
            {fullLoading ? "Analyzing..." : "Analyze"}
          </button>

          <button onClick={handleFullReset} className="sentiment-reset-btn">
            Reset
          </button>
        </div>

        {fullLoading && (
          <div className="sentiment-loading">Contacting backend model...</div>
        )}

        {fullError && (
          <div className="sentiment-warning">
            <p className="sentiment-warning-text">{fullError}</p>
          </div>
        )}

        {fullResult ? (
          <FullSentimentCard result={fullResult} />
        ) : (
          <div className="sentiment-placeholder">
            No backend analysis yet. Click Analyze to run.
          </div>
        )}
      </section>

      {result && fullResult && (
        <section className="sentiment-section">
          <h3 className="sentiment-section-title">Model Comparison</h3>

          <div className="comparison-card">
            <div className="card-main">
              <strong>Light Model:</strong>
              <div className={`card-label ${labelClass}`}>{result.label.toUpperCase()}</div>
            </div>
            <div className="card-main">
              <strong>Full Model:</strong>
              <div className={`card-label ${fullLabelClass}`}>{fullResult.sentiment.toUpperCase()}</div>
            </div>

            <p>
              <strong>Agreement:</strong>{" "}
              {result.label === fullResult.sentiment
                ? "Models agree"
                : "Models disagree"}
            </p>

            <div className="comparison-bars">
              <div>
                <label>Light Score:</label>
                <div className="bar">
                  <div
                    className="bar-fill"
                    style={{ width: `${(result.score + 1) * 50}%` }}
                  />
                </div>
              </div>

              <div>
                <label>Full Confidence:</label>
                <div className="bar">
                  <div
                    className="bar-fill"
                    style={{ width: `${fullResult.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
