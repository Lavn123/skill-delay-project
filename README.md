# ⏳ SkillTempus

> **Multi-Source Temporal Skill Decay Modelling for Time-Aware Job Recommendation in Software Engineering Roles**

[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://python.org)
[![Angular](https://img.shields.io/badge/Angular-17-red)](https://angular.io)
[![Node.js](https://img.shields.io/badge/Node.js-18-green)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://mongodb.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100-teal)](https://fastapi.tiangolo.com)

---

## 📖 About

**SkillTempus** is an MSc dissertation project developed at the **University of Birmingham**, supervised by **Dr. Leandro Minku**.

Current Applicant Tracking Systems (ATS) treat CVs as static snapshots — a skill used 5 years ago carries the same weight as one used last month. SkillTempus solves this by modelling **temporal skill decay**, calculating a freshness score for each skill based on when it was last used.

### Research Questions

1. Does incorporating temporal skill decay derived from CV work history timestamps improve job recommendation accuracy compared to static skill-matching baselines?
2. Do informal skill signals derived from GitHub contribution activity meaningfully improve temporal skill decay estimation beyond CV-only models?

---

## ✨ Features

- 📄 **CV Upload** — Upload PDF or DOCX, or paste CV text
- ⏳ **Skill Decay Model** — Exponential decay scoring based on skill recency
- 🐙 **GitHub Integration** — Detects skills maintained through personal projects
- 💼 **Job Matching** — Matched against 1943+ real tech job postings
- 📊 **Skill Dashboard** — Visual freshness scores per skill
- 🔐 **User Authentication** — Register, login, protected routes
- 📋 **Analysis History** — Save and review past analyses
- 🧪 **Evaluation** — 3-system comparison (Static vs CV Decay vs Multi-Source)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Angular Frontend                   │
│              http://localhost:4200                   │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                Node.js Backend API                   │
│              http://localhost:3000                   │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Python FastAPI ML Service               │
│              http://localhost:8000                   │
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
│         cv_analyses │ job_matches │ users            │
│         user_analyses │ evaluations                  │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)
- MongoDB Atlas account (free tier)

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

pip install spacy pymupdf python-docx fastapi uvicorn \
            requests pandas pymongo python-dotenv
python -m spacy download en_core_web_sm
```

Create `.env` file in `ml-service/`:
```
MONGODB_URI=your_mongodb_atlas_connection_string
DATABASE_NAME=skill_decay_db
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
- `resumes.csv` — [Resume Dataset](https://www.kaggle.com/datasets/snehaanbhawal/resume-dataset)
- `jobs.csv` — [Jobs Dataset](https://www.kaggle.com/datasets/kshitizregmi/jobs-and-job-description)

---

## ▶️ Running The App

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
├── ml-service/                  # Python ML Service
│   ├── main.py                  # FastAPI app + routes
│   ├── cv_parser.py             # CV text + skill extraction
│   ├── decay_model.py           # Exponential decay formula
│   ├── pipeline.py              # CV parser + decay connected
│   ├── job_matcher.py           # Skill-to-job matching
│   ├── github_signal.py         # GitHub API integration
│   ├── evaluation.py            # 3-system comparison
│   ├── synthetic_evaluation.py  # Synthetic dataset evaluation
│   ├── real_data_processor.py   # Real Kaggle data evaluation
│   ├── database.py              # MongoDB operations
│   └── file_reader.py           # PDF/DOCX text extraction
│
├── backend/                     # Node.js Backend
│   └── server.js                # Express API gateway
│
├── frontend/                    # Angular Frontend
│   └── skill-delay-app/
│       └── src/app/
│           ├── components/
│           │   ├── home/
│           │   ├── cv-upload/
│           │   ├── skill-dashboard/
│           │   ├── job-matches/
│           │   ├── login/
│           │   ├── register/
│           │   └── history/
│           ├── services/
│           │   ├── skill-api.ts
│           │   └── auth.ts
│           └── guards/
│               └── auth.guard.ts
│
└── data/                        # Datasets (not committed)
    ├── resumes.csv
    └── jobs.csv
```

---

## 🧪 Evaluation Results

### Synthetic Evaluation (8 candidates × 3 jobs = 24 test cases)

| System | Accuracy | Precision | Recall | F1 Score |
|--------|----------|-----------|--------|----------|
| A — Static Baseline | 79.2% | 66.7% | 75.0% | 70.6% |
| B — CV Decay Only | **87.5%** | **100%** | 62.5% | **76.9%** |
| C — Enhanced Decay | **87.5%** | **100%** | 62.5% | **76.9%** |

**Key Finding:** Temporal decay modelling improves accuracy by **+8.3%** and eliminates false positives entirely (100% precision vs 66.7%).

### Real Data Evaluation (94 IT resumes × real job postings)

- System A made **overconfident matches** — e.g. 100% match score for candidates with outdated skills
- System B correctly **penalised stale skills** — reducing the same case to 36.8%
- System A produced **7 overconfident matches** corrected by decay model

---

## 🔬 The Decay Formula

Each skill is assigned a freshness score using exponential decay:

```
S(t) = e^(−λ × t)
```

Where:
- `t` = years since skill was last used
- `λ` = category-specific decay rate

| Skill Category | Examples | Decay Rate (λ) |
|---|---|---|
| Fast | Angular, TensorFlow, Docker | 0.4 |
| Medium | Python, JavaScript, Java | 0.2 |
| Slow | SQL, Git, HTML, Algorithms | 0.1 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17, TypeScript |
| Backend | Node.js, Express.js |
| ML Service | Python, FastAPI |
| NLP | spaCy, en_core_web_sm |
| Database | MongoDB Atlas |
| CV Parsing | PyMuPDF, python-docx |
| GitHub API | PyGitHub, requests |
| Auth | JWT, bcryptjs |

---

## 📊 API Endpoints

### ML Service (port 8000)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/parse-cv` | Extract skills + decay scores from CV text |
| POST | `/match-jobs` | Match CV against real job postings |
| POST | `/upload-cv-file` | Upload PDF/DOCX CV file |
| POST | `/github-signal` | Extract skills from GitHub profile |
| POST | `/evaluate` | Run 3-system comparison |
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| GET | `/user/history/{id}` | Get user analysis history |

### Backend API (port 3000)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/parse-cv` | Parse CV text |
| POST | `/api/match-jobs` | Get job matches |
| POST | `/api/upload-cv-file` | Upload CV file |
| POST | `/api/github-signal` | Get GitHub signals |
| POST | `/api/evaluate` | Run evaluation |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/user/history` | Get history |

---

## 🎓 Academic Context

- **Institution:** University of Birmingham
- **Programme:** MSc Artificial Intelligence and Machine Learning
- **Supervisor:** Dr. Leandro Minku
- **Academic Year:** 2024/2025

---

## 📄 Licence

This project is for academic purposes only.

---

## 👤 Author

**Lavanya Ramkumar**
MSc Artificial Intelligence and Machine Learning
University of Birmingham
