import{j as e,r as t,S as $}from"./index-CdoV4dTa.js";import{S as O}from"./api-CdiO3Vv4.js";function V({result:l}){if(!l)return null;const{score:r,label:h,tokens:d}=l,a=h==="positive"?"label-positive":h==="negative"?"label-negative":"label-neutral";function x(i){return i?i>0?"token-positive":i<0?"token-negative":"token-neutral":"token-neutral"}return e.jsxs("div",{className:"card-root",children:[e.jsxs("div",{className:"card-header",children:[e.jsxs("div",{children:[e.jsx("div",{className:"card-sub",children:"Overall sentiment"}),e.jsx("div",{className:"card-sub",children:"Score: (-1...1), Label: (Positive/Negative/Neutral)"}),e.jsxs("div",{className:"card-main",children:[e.jsx("div",{className:"card-score",children:r}),e.jsx("div",{className:`card-label ${a}`,children:h.toUpperCase()})]})]}),e.jsxs("div",{className:"card-meta",children:[e.jsxs("div",{className:"meta-line",children:["Model: ",e.jsx("span",{className:"meta-strong",children:"client-lexicon"})]}),e.jsxs("div",{className:"meta-line",children:["Runtime: ",e.jsx("span",{className:"meta-strong",children:"Pyodide"})]})]})]}),e.jsx("hr",{className:"card-divider"}),e.jsxs("div",{children:[e.jsx("div",{className:"card-sub small",children:"Token highlights"}),e.jsx("div",{className:"token-wrap",children:d.map(([i,n],o)=>e.jsx("span",{className:`token ${x(n)}`,title:n?`score: ${n}`:"no score",children:i},o))})]})]})}function B({result:l}){if(!l)return null;if(l.error)return e.jsxs("div",{className:"sentiment-warning",children:["Error: ",l.error]});const{sentiment:r,confidence:h,tokens:d=[],model_version:a}=l,x=r==="positive"?"label-positive":r==="negative"?"label-negative":"label-neutral";function i(n){return n?n>0?"token-positive":n<0?"token-negative":"token-neutral":"token-neutral"}return e.jsxs("div",{className:"card-root",children:[e.jsxs("div",{className:"card-header",children:[e.jsxs("div",{children:[e.jsx("div",{className:"card-sub",children:"Overall sentiment"}),e.jsx("div",{className:"card-sub",children:"Confidence: (-1...1), Label: (Positive/Negative/Neutral)"}),e.jsxs("div",{className:"card-main",children:[e.jsx("div",{className:"card-score",children:h.toFixed(3)}),e.jsx("div",{className:`card-label ${x}`,children:r.toUpperCase()})]})]}),e.jsxs("div",{className:"card-meta",children:[e.jsxs("div",{className:"meta-line",children:["Model: ",e.jsx("span",{className:"meta-strong",children:a})]}),e.jsxs("div",{className:"meta-line",children:["Runtime: ",e.jsx("span",{className:"meta-strong",children:"FastAPI"})]})]})]}),e.jsx("hr",{className:"card-divider"}),e.jsxs("div",{children:[e.jsx("div",{className:"card-sub small",children:"Token highlights"}),e.jsx("div",{className:"token-wrap",children:d.length>0?d.map(([n,o],v)=>e.jsx("span",{className:`token ${i(o)}`,title:o?`score: ${o}`:"no score",children:n},v)):e.jsx("span",{className:"token token-neutral",children:"(Backend model did not return token-level scores)"})})]})]})}const U="https://cdn.jsdelivr.net/pyodide/v0.24.0/full/pyodide.js";function J(){const l="I loved the product — it was fast, intuitive, and delightful!",[r,h]=t.useState(!1),[d,a]=t.useState("Initializing Pyodide..."),[x,i]=t.useState(l),[n,o]=t.useState(null),v=t.useRef(null),[P,E]=t.useState("v1"),L=n?.label==="positive"?"label-positive":n?.label==="negative"?"label-negative":"label-neutral",[p,f]=t.useState(l),[c,g]=t.useState(null),[N,y]=t.useState(!1),[k,b]=t.useState(""),[w,S]=t.useState("v1"),A=c?.sentiment==="positive"?"label-positive":c?.sentiment==="negative"?"label-negative":"label-neutral";t.useEffect(()=>{let s=!1;async function m(){if(a("Loading Pyodide runtime (this may take a few seconds)..."),!window.loadPyodide){const j=document.createElement("script");j.src=U,j.async=!0,document.head.appendChild(j),await new Promise((I,M)=>{j.onload=I,j.onerror=()=>M(new Error("Failed to load Pyodide script"))})}a("Starting Pyodide...");const u=await window.loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.24.0/full/"});await u.runPythonAsync(`
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
    `),v.current=u,s||(h(!0),a(""))}return m().catch(u=>{console.error("Pyodide load error:",u),a("Failed to load Pyodide. Check console for details.")}),()=>{s=!0}},[]);async function T(s){if(v.current){o(null),a("Analyzing text...");try{const m=v.current;m.globals.set("input_text",s);const u=await m.runPythonAsync("analyze(input_text)"),C=JSON.parse(u);o(C),a("")}catch(m){console.error("Analysis error:",m),a("Analysis failed. See console for details.")}}}const _=async()=>{await T(x)},F=()=>{i(""),o(null),a(""),setTimeout(()=>{i(l)},1500)};async function R(){if(p.trim()){y(!0),g(null),b("");try{const s=await fetch(`${O}/predict_full?version=${w}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:p})});if(!s.ok){const u=await s.json().catch(()=>({}));throw new Error(u.detail||`API error: ${s.status}`)}const m=await s.json();g(m)}catch(s){console.error("Full pipeline API error:",s),b(s.message||"Full pipeline analysis failed.")}finally{y(!1)}}}const z=()=>{f(""),g(null),b(""),setTimeout(()=>{f("This product exceeded my expectations!")},1500)};return e.jsxs("div",{className:"sentiment-container",children:[e.jsx("h2",{className:"project-title gradient-text",children:"Sentiment Analysis Demo"}),e.jsx("div",{className:"section-underline"}),e.jsx("p",{className:"sentiment-sub",children:"Lightweight Python sentiment analyzer running in your browser via Pyodide."}),e.jsxs("section",{className:"sentiment-section",children:[e.jsx("h3",{className:"sentiment-section-title",children:"In-Browser Python Version"}),e.jsxs(t.Suspense,{fallback:e.jsx($,{}),children:[!r&&e.jsx("div",{className:"sentiment-warning",children:e.jsx("p",{className:"sentiment-warning-text",children:d})}),e.jsxs("div",{className:"sentiment-dropdown",children:[e.jsx("label",{children:"Light Model Version:"}),e.jsxs("select",{value:P,onChange:s=>E(s.target.value),className:"sentiment-select",children:[e.jsx("option",{value:"v1",children:"v1 — Basic Lexicon"}),e.jsx("option",{value:"v2",children:"v2 — Expanded Lexicon"}),e.jsx("option",{value:"v3",children:"v3 — Negation Handling"})]})]}),e.jsx("textarea",{id:"user-input",className:"sentiment-textarea",value:x,onChange:s=>i(s.target.value),placeholder:"Type or paste text here..."}),e.jsxs("div",{className:"sentiment-controls",children:[e.jsx("button",{onClick:_,disabled:!r,className:`sentiment-btn ${r?"enabled":"disabled"}`,children:"Analyze"}),e.jsx("button",{onClick:F,className:"sentiment-reset-btn",children:"Reset"})]}),d&&r&&e.jsx("div",{className:"sentiment-loading",children:d}),n?e.jsx(V,{result:n}):e.jsx("div",{className:"sentiment-placeholder",children:"No analysis yet. Click Analyze to run."}),e.jsxs("div",{className:"sentiment-note",children:[e.jsx("strong",{children:"Note:"})," This demo uses a compact lexicon for speed and reproducibility."]})]})]}),e.jsxs("section",{className:"sentiment-section",children:[e.jsx("h3",{className:"sentiment-section-title",children:"End-to-End Version (Backend Model)"}),e.jsxs("div",{className:"sentiment-dropdown",children:[e.jsx("label",{children:"Backend Model Version:"}),e.jsxs("select",{value:w,onChange:s=>S(s.target.value),className:"sentiment-select",children:[e.jsx("option",{value:"v1",children:"v1 — Baseline ML Model"}),e.jsx("option",{value:"v2",children:"v2 — Improved Vectorizer"}),e.jsx("option",{value:"v3",children:"v3 — Fine-tuned Classifier"})]})]}),e.jsx("textarea",{className:"sentiment-textarea",value:p,onChange:s=>f(s.target.value),placeholder:"Type or paste text for the backend model..."}),e.jsxs("div",{className:"sentiment-controls",children:[e.jsx("button",{onClick:R,disabled:N||!p.trim(),className:`sentiment-btn ${!N&&p.trim()?"enabled":"disabled"}`,children:N?"Analyzing...":"Analyze"}),e.jsx("button",{onClick:z,className:"sentiment-reset-btn",children:"Reset"})]}),N&&e.jsx("div",{className:"sentiment-loading",children:"Contacting backend model..."}),k&&e.jsx("div",{className:"sentiment-warning",children:e.jsx("p",{className:"sentiment-warning-text",children:k})}),c?e.jsx(B,{result:c}):e.jsx("div",{className:"sentiment-placeholder",children:"No backend analysis yet. Click Analyze to run."})]}),n&&c&&e.jsxs("section",{className:"sentiment-section",children:[e.jsx("h3",{className:"sentiment-section-title",children:"Model Comparison"}),e.jsxs("div",{className:"comparison-card",children:[e.jsxs("div",{className:"card-main",children:[e.jsx("strong",{children:"Light Model:"}),e.jsx("div",{className:`card-label ${L}`,children:n.label.toUpperCase()})]}),e.jsxs("div",{className:"card-main",children:[e.jsx("strong",{children:"Full Model:"}),e.jsx("div",{className:`card-label ${A}`,children:c.sentiment.toUpperCase()})]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Agreement:"})," ",n.label===c.sentiment?"Models agree":"Models disagree"]}),e.jsxs("div",{className:"comparison-bars",children:[e.jsxs("div",{children:[e.jsx("label",{children:"Light Score:"}),e.jsx("div",{className:"bar",children:e.jsx("div",{className:"bar-fill",style:{width:`${(n.score+1)*50}%`}})})]}),e.jsxs("div",{children:[e.jsx("label",{children:"Full Confidence:"}),e.jsx("div",{className:"bar",children:e.jsx("div",{className:"bar-fill",style:{width:`${c.confidence*100}%`}})})]})]})]})]})]})}export{J as default};
