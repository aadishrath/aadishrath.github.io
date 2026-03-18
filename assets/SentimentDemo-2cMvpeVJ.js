import{j as e,r as n,S as b}from"./index-DPlYtvi5.js";function w({result:d}){if(!d)return null;const{score:a,label:c,tokens:u}=d,s=c==="positive"?"label-positive":c==="negative"?"label-negative":"label-neutral";function h(t){return t?t>0?"token-positive":t<0?"token-negative":"token-neutral":"token-neutral"}return e.jsxs("div",{className:"card-root",children:[e.jsxs("div",{className:"card-header",children:[e.jsxs("div",{children:[e.jsx("div",{className:"card-sub",children:"Overall sentiment"}),e.jsx("div",{className:"card-sub",children:"Score: (-1...1), Label: (Positive/Negative/Neutral)"}),e.jsxs("div",{className:"card-main",children:[e.jsx("div",{className:"card-score",children:a}),e.jsx("div",{className:`card-label ${s}`,children:c.toUpperCase()})]})]}),e.jsxs("div",{className:"card-meta",children:[e.jsxs("div",{className:"meta-line",children:["Model: ",e.jsx("span",{className:"meta-strong",children:"client-lexicon"})]}),e.jsxs("div",{className:"meta-line",children:["Runtime: ",e.jsx("span",{className:"meta-strong",children:"Pyodide"})]})]})]}),e.jsx("hr",{className:"card-divider"}),e.jsxs("div",{children:[e.jsx("div",{className:"card-sub small",children:"Token highlights"}),e.jsx("div",{className:"token-wrap",children:u.map(([t,i],m)=>e.jsx("span",{className:`token ${h(i)}`,title:i?`score: ${i}`:"no score",children:t},m))})]})]})}const k="https://cdn.jsdelivr.net/pyodide/v0.24.0/full/pyodide.js";function C(){const d="I loved the product — it was fast, intuitive, and delightful!",[a,c]=n.useState(!1),[u,s]=n.useState("Initializing Pyodide..."),[h,t]=n.useState(d),[i,m]=n.useState(null),x=n.useRef(null);n.useEffect(()=>{let l=!1;async function o(){if(s("Loading Pyodide runtime (this may take a few seconds)..."),!window.loadPyodide){const p=document.createElement("script");p.src=k,p.async=!0,document.head.appendChild(p),await new Promise((N,g)=>{p.onload=N,p.onerror=()=>g(new Error("Failed to load Pyodide script"))})}s("Starting Pyodide...");const r=await window.loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.24.0/full/"});await r.runPythonAsync(`
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

        TOKEN_RE = re.compile(r"\\w+|[^s\\w]", re.UNICODE)

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
    `),x.current=r,l||(c(!0),s(""))}return o().catch(r=>{console.error("Pyodide load error:",r),s("Failed to load Pyodide. Check console for details.")}),()=>{l=!0}},[]);async function f(l){if(x.current){m(null),s("Analyzing text...");try{const o=x.current;o.globals.set("input_text",l);const r=await o.runPythonAsync("analyze(input_text)"),y=JSON.parse(r);m(y),s("")}catch(o){console.error("Analysis error:",o),s("Analysis failed. See console for details.")}}}const v=async()=>{await f(h)},j=()=>{t(""),m(null),s(""),setTimeout(()=>{t(d)},1500)};return e.jsxs("div",{className:"sentiment-container",children:[e.jsx("h2",{className:"project-title gradient-text",children:"Sentiment Analysis Demo"}),e.jsx("div",{className:"section-underline"}),e.jsx("p",{className:"sentiment-sub",children:"Lightweight Python sentiment analyzer running in your browser via Pyodide."}),e.jsxs(n.Suspense,{fallback:e.jsx(b,{}),children:[!a&&e.jsx("div",{className:"sentiment-warning",children:e.jsx("p",{className:"sentiment-warning-text",children:u})}),e.jsx("textarea",{id:"user-input",className:"sentiment-textarea",value:h,onChange:l=>t(l.target.value),placeholder:"Type or paste text here..."}),e.jsxs("div",{className:"sentiment-controls",children:[e.jsx("button",{onClick:v,disabled:!a,className:`sentiment-btn ${a?"enabled":"disabled"}`,children:"Analyze"}),e.jsx("button",{onClick:j,className:"sentiment-reset-btn",children:"Reset"})]}),u&&a&&e.jsx("div",{className:"sentiment-loading",children:u}),i?e.jsx(w,{result:i}):e.jsx("div",{className:"sentiment-placeholder",children:"No analysis yet. Click Analyze to run."}),e.jsxs("div",{className:"sentiment-note",children:[e.jsx("strong",{children:"Note:"})," This demo uses a compact lexicon for speed and reproducibility."]})]})]})}export{C as default};
