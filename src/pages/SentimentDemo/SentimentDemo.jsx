
// React page that loads Pyodide and runs a small Python sentiment analyzer in-browser.
import { useEffect, useState, useRef, Suspense } from "react";
import SentimentCard from "../../components/SentimentCard/SentimentCard";
import Spinner from "../../components/Spinner/Spinner";
import "./SentimentDemo.css";

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.24.0/full/pyodide.js";

export default function SentimentDemo() {
  const defaultText = "I loved the product — it was fast, intuitive, and delightful!";
  const [pyodideLoaded, setPyodideLoaded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Initializing Pyodide...");
  const [inputText, setInputText] = useState(defaultText);
  const [result, setResult] = useState(null);
  const pyodideRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPyodideAndInit() {
      setLoadingMessage(
        "Loading Pyodide runtime (this may take a few seconds)...",
      );
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
      // eslint-disable-next-line no-undef
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
            "disappointing": -3, "poor": -2, "best": 3, "worst": -3
        }

        TOKEN_RE = re.compile(r"\\w+|[^\s\\w]", re.UNICODE)

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

  return (
    <div className="sentiment-container">
      <h2 className="project-title gradient-text">Sentiment Analysis Demo</h2>
      <div className='section-underline'></div>
      <p className="sentiment-sub">
        Lightweight Python sentiment analyzer running in your browser via Pyodide.
      </p>

      <Suspense fallback={<Spinner />}>
        {!pyodideLoaded && (
            <div className="sentiment-warning">
                <p className="sentiment-warning-text">{loadingMessage}</p>
            </div>
        )}

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
    </div>
  );
}
