# Aadish Rathore — Portfolio

Welcome to my personal portfolio, built with **React**, **Vite**, and **Tailwind CSS v4**. This site showcases my work as a Machine Learning Engineer and Full-Stack Developer, with a focus on recruiter-facing polish, modular architecture, and real-world impact.

## 🚀 Live Site

🔗 [aadishrath.github.io](https://aadishrath.github.io)

## 🧠 About Me

I'm a Data Engineer with 6+ years of production frontend experience and a Master’s in Applied Science (Data Science). I specialize in NLP, Transformers, deploying ML pipelines using PyTorch, AWS and strong foundations in ETL pipelines, SQL. My portfolio highlights full-stack ML projects, scalable UI components, and end-to-end engineering.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS v4
- **Deployment**: GitHub Pages

## 📦 Features

- Responsive layout with Tailwind v4
- SEO-optimized metadata and social preview images
- Dynamic Languages & Tools grid with icon mapping
- Modular data architecture for easy updates
- Recruiter-focused presentation and branding

## 📬 Contact

- 🔗 [LinkedIn](https://www.linkedin.com/in/adirathore)  
- 🧑‍💻 [GitHub](https://github.com/aadishrath)

---

## Sentiment Analysis (Client‑Side + Backend ML)
This project includes a full‑stack sentiment analysis system with two complementary models:

### 1. In‑Browser Model (Pyodide)
Runs entirely in the browser using a lightweight lexicon‑based model compiled to WebAssembly via Pyodide.
- No backend required
- Real‑time scoring
- Token‑level sentiment highlights
- Works offline and preserves user privacy

### 2. Backend ML Model (FastAPI + scikit‑learn)
A more advanced machine‑learning classifier served through a FastAPI backend.
- Trained using scikit‑learn (Logistic Regression)
- Normalized token‑level feature attribution
- Model versioning support
- Exposed through a REST API

⚠️ **The backend model only works locally.** To use it, you must:
- Clone the repository
- Navigate to /ml-sentiment/api/
- Start the FastAPI server manually:   
  ```
  uvicorn app:app --reload --port 8000
  ```
- The frontend will then communicate with:
http://localhost:8000
Users visiting the deployed GitHub Pages site cannot access the backend model unless they run the backend locally.

### 🔍 Features
- Side‑by‑side comparison of lexicon vs. ML predictions
- Interactive token‑level sentiment visualization
- Real‑time inference (<50ms for client model)
- Clean UI built with React + Vite
- Fully deployable frontend via GitHub Pages

### 📁 Code Locations
- Frontend (React): /sentiment/
- Backend (FastAPI): /ml-sentiment/api/
- Model artifacts: /ml-sentiment/api/models/


