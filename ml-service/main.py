from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import hashlib
from datetime import datetime
from cv_parser import parse_cv
from decay_model import apply_decay_to_profile
from job_matcher import match_candidate_to_jobs, extract_required_skills, calculate_match_score
from github_signal import extract_github_signals, combine_signals
from evaluation import system_a_static, system_b_cv_decay, system_c_multi_source
from database import save_cv_analysis, save_job_matches, db
from file_reader import extract_text_from_file

app = FastAPI(
    title="SkillTempus API",
    description="SkillTempus — Temporal skill decay modelling for time-aware job recommendation",
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

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

# ================================================
# LOAD REAL JOB DATA ON STARTUP
# ================================================

REAL_JOBS = []

def load_real_jobs():
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

load_real_jobs()

# ================================================
# ROUTES
# ================================================

@app.get("/")
def root():
    return {
        "message": "SkillTempus ML Service is running!",
        "version": "1.0.0",
        "real_jobs_loaded": len(REAL_JOBS)
    }

@app.post("/parse-cv")
def parse_cv_route(request: CVRequest):
    parsed = parse_cv(request.cv_text)
    profile = apply_decay_to_profile(parsed['skill_timeline'])

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
    job_descriptions = REAL_JOBS if REAL_JOBS else []
    results = match_candidate_to_jobs(request.cv_text, job_descriptions)

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
    return {
        "total_jobs": len(REAL_JOBS),
        "sample_jobs": [
            {"title": j["title"]}
            for j in REAL_JOBS[:20]
        ]
    }

@app.post("/upload-cv-file")
async def upload_cv_file(
    file: UploadFile = File(...),
    github_username: str = Form(default="")
):
    try:
        filename = file.filename.lower()
        if not (filename.endswith('.pdf') or filename.endswith('.docx')):
            return {"error": "Only PDF and DOCX files are supported"}

        file_bytes = await file.read()

        if len(file_bytes) > 5 * 1024 * 1024:
            return {"error": "File too large. Maximum size is 5MB"}

        cv_text = extract_text_from_file(file_bytes, file.filename)

        if not cv_text or len(cv_text.strip()) < 50:
            return {"error": "Could not extract text from file"}

        parsed = parse_cv(cv_text)

        if parsed['skills_found'] == 0:
            return {"error": "No technical skills found in CV"}

        profile = apply_decay_to_profile(parsed['skill_timeline'])

        analysis_id = save_cv_analysis(
            cv_text=cv_text,
            skill_timeline=parsed['skill_timeline'],
            skill_profile={k: v for k, v in profile.items()}
        )

        results = match_candidate_to_jobs(cv_text, REAL_JOBS)

        if not results:
            return {"error": "No job matches found"}

        save_job_matches(
            cv_analysis_id=analysis_id,
            matches=results,
            github_username=github_username
        )

        return {
            "cv_text": cv_text[:500],
            "analysis_id": analysis_id,
            "total_skills": parsed['skills_found'],
            "skill_timeline": parsed['skill_timeline'],
            "skill_profile": profile,
            "matches": results
        }

    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}

# ================================================
# AUTH ROUTES
# ================================================

@app.post("/auth/register")
def register(request: RegisterRequest):
    try:
        existing = db["users"].find_one({"email": request.email})
        if existing:
            return {"error": "Email already registered"}

        hashed = hashlib.sha256(request.password.encode()).hexdigest()

        result = db["users"].insert_one({
            "name": request.name,
            "email": request.email,
            "password": hashed,
            "created_at": datetime.now()
        })

        return {
            "user_id": str(result.inserted_id),
            "message": "User registered successfully"
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/auth/login")
def login(request: LoginRequest):
    try:
        hashed = hashlib.sha256(request.password.encode()).hexdigest()

        user = db["users"].find_one({
            "email": request.email,
            "password": hashed
        })

        if not user:
            return {"error": "Invalid email or password"}

        return {
            "user_id": str(user["_id"]),
            "name": user["name"],
            "message": "Login successful"
        }
    except Exception as e:
        return {"error": str(e)}