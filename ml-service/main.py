from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import pandas as pd
from cv_parser import parse_cv
from decay_model import apply_decay_to_profile
from job_matcher import match_candidate_to_jobs, extract_required_skills, calculate_match_score
from github_signal import extract_github_signals, combine_signals
from evaluation import system_a_static, system_b_cv_decay, system_c_multi_source
from database import save_cv_analysis, save_job_matches

app = FastAPI(
    title="Skill Decay API",
    description="Multi-source temporal skill decay model",
    version="1.0.0"
)

# ================================================
# LOAD REAL JOB DATA ON STARTUP
# ================================================

REAL_JOBS = []

def load_real_jobs():
    """Load real job descriptions from Kaggle dataset"""
    global REAL_JOBS
    try:
        df = pd.read_csv("../data/jobs.csv")
        jobs = []
        for _, row in df.iterrows():
            title = str(row.get('Job Title', ''))
            description = str(row.get('Job Description', ''))

            if not title or not description:
                continue
            if len(description) < 50:
                continue

            required_skills = extract_required_skills(description)
            if not required_skills:
                continue

            jobs.append({
                "title": title,
                "description": description[:500],
                "required_skills": required_skills
            })

        REAL_JOBS = jobs
        print(f"Loaded {len(REAL_JOBS)} real job postings!")
    except Exception as e:
        print(f"Error loading jobs: {e}")
        # Fallback to hardcoded jobs
        REAL_JOBS = [
            {
                "title": "ML Engineer",
                "description": "Python, Machine Learning, TensorFlow, MongoDB, NLP required"
            },
            {
                "title": "Full Stack Developer",
                "description": "Angular, Node.js, MongoDB, JavaScript required"
            },
            {
                "title": "Backend Developer",
                "description": "Python, FastAPI, PostgreSQL, Docker required"
            },
            {
                "title": "Frontend Developer",
                "description": "React, JavaScript, HTML, CSS, TypeScript required"
            },
            {
                "title": "Data Scientist",
                "description": "Python, Machine Learning, PyTorch, SQL required"
            }
        ]
        print("Using fallback hardcoded jobs")

# Load jobs when server starts
load_real_jobs()

# ================================================
# REQUEST MODELS
# ================================================

class CVRequest(BaseModel):
    cv_text: str

class MatchRequest(BaseModel):
    cv_text: str
    github_username: Optional[str] = None

class GithubRequest(BaseModel):
    github_username: str

class EvaluateRequest(BaseModel):
    cv_text: str
    github_username: Optional[str] = None

# ================================================
# ROUTES
# ================================================

@app.get("/")
def root():
    return {
        "message": "Skill Decay ML Service is running!",
        "version": "1.0.0",
        "real_jobs_loaded": len(REAL_JOBS)
    }

@app.post("/parse-cv")
def parse_cv_route(request: CVRequest):
    parsed = parse_cv(request.cv_text)
    profile = apply_decay_to_profile(parsed['skill_timeline'])

    # Save to MongoDB
    analysis_id = save_cv_analysis(
        cv_text=request.cv_text,
        skill_timeline=parsed['skill_timeline'],
        skill_profile={k: v for k, v in profile.items()}
    )

    return {
        "analysis_id": analysis_id,
        "total_skills": parsed['skills_found'],
        "skill_timeline": parsed['skill_timeline'],
        "skill_profile": profile
    }

@app.post("/match-jobs")
def match_jobs_route(request: MatchRequest):
    # Use real jobs if available
    job_descriptions = REAL_JOBS if REAL_JOBS else []

    results = match_candidate_to_jobs(request.cv_text, job_descriptions)

    # Save to MongoDB
    save_job_matches(
        cv_analysis_id="web_app",
        matches=results,
        github_username=request.github_username
    )

    return {"matches": results}

@app.post("/github-signal")
def github_signal_route(request: GithubRequest):
    timeline = extract_github_signals(request.github_username)
    return {
        "github_username": request.github_username,
        "skill_timeline": timeline
    }

@app.post("/evaluate")
def evaluate_route(request: EvaluateRequest):
    # Use sample of real jobs for evaluation
    eval_jobs = REAL_JOBS[:10] if REAL_JOBS else []

    if not eval_jobs:
        eval_jobs = [
            {
                "title": "ML Engineer",
                "description": "Python, Machine Learning, TensorFlow, MongoDB, NLP required"
            },
            {
                "title": "Full Stack Developer",
                "description": "Angular, Node.js, MongoDB, JavaScript required"
            },
            {
                "title": "Backend Developer",
                "description": "Python, FastAPI, PostgreSQL, Docker required"
            }
        ]

    results = []
    github_username = request.github_username or "torvalds"

    for job in eval_jobs:
        result_a = system_a_static(request.cv_text, job['description'])
        result_b = system_b_cv_decay(request.cv_text, job['description'])
        result_c = system_c_multi_source(
            request.cv_text, job['description'], github_username)

        results.append({
            "job": job['title'],
            "system_a": result_a['score'],
            "system_b": result_b['score'],
            "system_c": result_c['score'],
            "b_vs_a": round(result_b['score'] - result_a['score'], 1),
            "c_vs_a": round(result_c['score'] - result_a['score'], 1)
        })

    return {"evaluation_results": results}

@app.get("/jobs")
def get_jobs():
    """Get list of available jobs"""
    return {
        "total_jobs": len(REAL_JOBS),
        "sample_jobs": [
            {"title": j["title"]} 
            for j in REAL_JOBS[:20]
        ]
    }