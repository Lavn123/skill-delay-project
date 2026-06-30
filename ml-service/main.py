from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from cv_parser import parse_cv
from decay_model import apply_decay_to_profile
from job_matcher import match_candidate_to_jobs
from github_signal import extract_github_signals, combine_signals
from evaluation import system_a_static, system_b_cv_decay, system_c_multi_source

app = FastAPI(
    title="Skill Decay API",
    description="Multi-source temporal skill decay model",
    version="1.0.0"
)

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
        "version": "1.0.0"
    }

@app.post("/parse-cv")
def parse_cv_route(request: CVRequest):
    parsed = parse_cv(request.cv_text)
    profile = apply_decay_to_profile(parsed['skill_timeline'])
    return {
        "total_skills": parsed['skills_found'],
        "skill_timeline": parsed['skill_timeline'],
        "skill_profile": profile
    }

@app.post("/match-jobs")
def match_jobs_route(request: MatchRequest):
    job_descriptions = [
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
    results = match_candidate_to_jobs(request.cv_text, job_descriptions)
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
    job_descriptions = [
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

    for job in job_descriptions:
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