# ⏳ SkillTempus

> **Multi-Source Temporal Skill Decay Modelling for Time-Aware Job Recommendation in Software Engineering Roles**

[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://python.org)
[![Angular](https://img.shields.io/badge/Angular-21-red)](https://angular.io)
[![Node.js](https://img.shields.io/badge/Node.js-18-green)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://mongodb.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.138-teal)](https://fastapi.tiangolo.com)
[![Render](https://img.shields.io/badge/Deployed-Render-purple)](https://render.com)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-black)](https://vercel.com)

---

## 📖 About

**SkillTempus** is an MSc dissertation project developed at the **University of Birmingham**, supervised by **Dr. Leandro Minku**.

Current Applicant Tracking Systems (ATS) treat CVs as static snapshots — a skill used 5 years ago carries the same weight as one used last month. SkillTempus solves this by modelling **temporal skill decay**, calculating a freshness score for each skill based on when it was last used, and supplementing this with **GitHub contribution signals** to detect informal skill maintenance outside formal employment.

### Research Questions

1. **RQ1:** Does incorporating temporal skill decay derived from CV work history timestamps improve job recommendation accuracy compared to static skill-matching baselines in software engineering roles?
2. **RQ2:** Do informal skill signals derived from GitHub contribution activity meaningfully improve temporal skill decay estimation beyond CV-only models, particularly for skills maintained through personal projects?

---

## ✨ Features

- 📄 **CV Upload** — Upload PDF or DOCX, or paste CV text directly
- ⏳ **Skill Decay Model** — Exponential decay scoring based on skill recency
- 🐙 **GitHub Integration** — Detects skills maintained through personal projects and open-source contributions
- 💼 **Job Matching** — Matched against 1,943+ real tech job postings from Kaggle
- 📊 **Skill Dashboard** — Visual freshness scores per skill with progress bars
- 📊 **Comparison Dashboard** — Side-by-side System A vs System C comparison with charts
- 🔬 **Research Evaluation Page** — Live evaluation metrics, charts and synthetic dataset
- 🔐 **User Authentication** — Register, login, JWT-protected routes
- 📋 **Analysis History** — Save and review past analyses per user
- 🧪 **3-System Evaluation** — Static vs CV Decay vs Multi-Source comparison

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│              Angular Frontend (Vercel)               │
│         https://skilltempus.vercel.app               │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│           Node.js Backend API (Render)               │
│      https://skilltempus-backend.onrender.com        │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│         Python FastAPI ML Service (Render)           │
│      https://skill-delay-project.onrender.com        │
│                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  CV Parser  │  │ Decay Model │  │GitHub Signal│ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │Job Matcher  │  │  Evaluator  │  │  Pipeline   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  MongoDB Atlas                       │
│  cv_analyses │ job_matches │ users │ user_analyses   │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)
- MongoDB Atlas account (free tier)
- GitHub Personal Access Token (for GitHub signal)

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/Lavn123/skilltempus.git
cd skilltempus
```

#### 2. Set up ML Service

```bash
cd ml-service
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # Mac/Linux

pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

Create `.env` file in `ml-service/`:
```
MONGODB_URI=your_mongodb_atlas_connection_string
DATABASE_NAME=skill_decay_db
GITHUB_TOKEN=your_github_personal_access_token
```

#### 3. Set up Backend

```bash
cd backend
npm install
```

#### 4. Set up Frontend

```bash
cd frontend/skill-delay-app
npm install
```

#### 5. Add Datasets

Download and place in `data/` folder:
- `resumes.csv` — [Resume Dataset (snehaanbhawal)](https://www.kaggle.com/datasets/snehaanbhawal/resume-dataset) — 2,484 CVs
- `jobs.csv` — [Jobs Dataset (kshitizregmi)](https://www.kaggle.com/datasets/kshitizregmi/jobs-and-job-description) — 2,277 tech job postings

---

## ▶️ Running The App Locally

Open **3 separate terminals**:

**Terminal 1 — ML Service:**
```bash
cd ml-service
venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Backend:**
```bash
cd backend
node server.js
```

**Terminal 3 — Frontend:**
```bash
cd frontend/skill-delay-app
ng serve
```

Open your browser at `http://localhost:4200` 🎉

---

## 📁 Project Structure

```
skilltempus/
├── ml-service/                   # Python ML Service
│   ├── main.py                   # FastAPI app + all routes
│   ├── cv_parser.py              # CV text + skill extraction (spaCy + regex)
│   ├── decay_model.py            # Exponential decay formula S(t) = e^(-λt)
│   ├── pipeline.py               # CV parser + decay model connected
│   ├── job_matcher.py            # Decay-weighted skill-to-job matching
│   ├── github_signal.py          # GitHub API + framework detection
│   ├── evaluation.py             # 3-system comparison framework
│   ├── synthetic_evaluation.py   # 20-candidate synthetic evaluation
│   ├── real_data_processor.py    # Real Kaggle data evaluation
│   ├── database.py               # MongoDB Atlas operations
│   ├── file_reader.py            # PDF/DOCX text extraction
│   └── requirements.txt          # Python dependencies
│
├── backend/                      # Node.js Backend
│   └── server.js                 # Express API gateway + JWT auth
│
├── frontend/                     # Angular Frontend
│   └── skill-delay-app/
│       └── src/app/
│           ├── components/
│           │   ├── home/                  # Landing page
│           │   ├── cv-upload/             # CV upload (PDF/DOCX/text)
│           │   ├── skill-dashboard/       # Freshness scores
│           │   ├── job-matches/           # Ranked job matches
│           │   ├── comparison-dashboard/  # System A vs C charts
│           │   ├── evaluation/            # Research results page
│           │   ├── history/               # User analysis history
│           │   ├── login/                 # Login page
│           │   └── register/              # Register page
│           ├── services/
│           │   ├── skill-api.ts           # ML service API calls
│           │   └── auth.ts                # Auth + JWT management
│           └── guards/
│               └── auth.guard.ts          # Route protection
│
└── data/                         # Datasets (not committed to git)
    ├── resumes.csv                # 2,484 IT resumes
    └── jobs.csv                   # 2,277 tech job postings
```

---

## 🧪 Evaluation Results

### Synthetic Evaluation (20 candidates × 3 jobs = 60 test cases)

| System | Description | Accuracy | Precision | Recall | F1 Score | False Positives |
|--------|-------------|----------|-----------|--------|----------|-----------------|
| **A** | Static Baseline (Current ATS) | 76.7% | 61.1% | 61.1% | 61.1% | 7 |
| **B** | CV Decay Only | 85.0% | **100%** | 50.0% | 66.7% | **0** |
| **C** | Multi-Source (CV + GitHub) | **86.7%** | 81.2% | **72.2%** | **76.5%** | 3 |

**Key Findings:**
- System B improves accuracy by **+8.3%** over static baseline
- System C improves accuracy by **+10.0%** over static baseline
- System C improves F1 by **+15.4%** — the largest improvement across all metrics
- System B eliminates all false positives (7 → 0)
- Statistical significance: p = 0.096 (approaching 0.05 threshold)
- Average NDCG@3 = 0.70

### Ablation Study

| Component | F1 Score | Improvement |
|---|---|---|
| No Decay (Baseline) | 61.1% | — |
| Uniform Decay | 73.3% | +12.2% |
| Category Decay | 66.7% | +5.6% |
| CV + GitHub (System C) | 76.5% | **+15.4%** |

### Real Data Evaluation (94 IT resumes × 1,943 job postings)

- System A produced **overconfident matches** — e.g. 100% match score for candidates with outdated skills
- System B correctly **penalised stale skills** — reducing the same case to 36.8%
- System A produced **7 overconfident matches** corrected by the decay model

---

## 🔬 The Decay Formula

Each skill is assigned a freshness score using exponential decay:

```
S(t) = e^(−λ × t)
```

Where:
- `t` = years since skill was last used
- `λ` = category-specific decay rate (informed by Stack Overflow Developer Survey 2024)

| Skill Category | Examples | Decay Rate (λ) |
|---|---|---|
| Fast | Angular, TensorFlow, Docker, React | 0.3 |
| Medium | Python, JavaScript, Java, Node.js | 0.2 |
| Slow | SQL, Git, HTML, Algorithms | 0.1 |

### Multi-Source Fusion Formula

```
S_final = α × S_cv + (1 − α) × S_github
```

Where α = 0.6 (CV gets 60% weight, GitHub gets 40%)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21, TypeScript, Chart.js |
| Backend | Node.js, Express.js, JWT |
| ML Service | Python 3.11, FastAPI, uvicorn |
| NLP | spaCy, en_core_web_sm |
| Database | MongoDB Atlas |
| CV Parsing | PyMuPDF, python-docx |
| GitHub API | requests, GitHub REST API v3 |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Deployment | Render (ML + Backend), Vercel (Frontend) |
| Evaluation | scipy (t-test), scikit-learn metrics |

---

## 📊 API Endpoints

### ML Service (port 8000)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check + jobs loaded count |
| POST | `/parse-cv` | Extract skills + decay scores from CV text |
| POST | `/match-jobs` | Match CV against real job postings |
| POST | `/upload-cv-file` | Upload PDF/DOCX — uses GitHub if provided |
| POST | `/github-signal` | Extract skills from GitHub profile |
| POST | `/evaluate` | Run 3-system comparison |
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| GET | `/user/history/{id}` | Get user analysis history |

### Backend API (port 3000)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/api/parse-cv` | Parse CV text |
| POST | `/api/match-jobs` | Get job matches (CV only) |
| POST | `/api/upload-cv-file` | Upload CV file (CV + GitHub) |
| POST | `/api/github-signal` | Get GitHub signals |
| POST | `/api/evaluate` | Run evaluation |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/user/history` | Get history (JWT protected) |

---

## 🌐 Deployment

| Service | Platform | URL |
|---|---|---|
| ML Service | Render | https://skill-delay-project.onrender.com |
| Backend | Render | https://skilltempus-backend.onrender.com |
| Frontend | Vercel | https://your-vercel-url.vercel.app |
| Database | MongoDB Atlas | Cloud (EU Ireland) |

> ⚠️ Free tier Render services spin down after 15 minutes of inactivity. First request may take 30-60 seconds to wake up.

---

## 🎓 Academic Context

- **Institution:** University of Birmingham
- **Programme:** MSc Artificial Intelligence and Machine Learning
- **Supervisor:** Dr. Leandro Minku (Associate Professor, ML for Software Engineering)
- **Academic Year:** 2024/2025
- **Submission:** 1st September 2025

---

## 📄 Licence

This project is for academic purposes only.

---

## 👤 Author

**Lavanya Ramkumar**
MSc Artificial Intelligence and Machine Learning
University of Birmingham