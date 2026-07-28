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
from database import save_cv_analysis, save_job_matches, db, save_user_analysis, get_user_history
from file_reader import extract_text_from_file

def get_strength_label(score):
    if score >= 0.7:
        return "Strong"
    elif score >= 0.4:
        return "Moderate"
    elif score >= 0.2:
        return "Weak"
    else:
        return "Outdated"

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
    user_id: Optional[str] = None

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

    # Debug
    print(f"user_id received: '{request.user_id}'")

    # Save to user history if user_id provided
    if request.user_id:
        try:
            parsed = parse_cv(request.cv_text)
            profile = apply_decay_to_profile(parsed['skill_timeline'])
            save_user_analysis(
                user_id=request.user_id,
                cv_text=request.cv_text,
                skill_timeline=parsed['skill_timeline'],
                skill_profile={k: v for k, v in profile.items()},
                matches=results
            )
            print(f"Saved history for user: {request.user_id}")
        except Exception as e:
            print(f"Could not save user history: {e}")

    return {"matches": results}

def match_jobs_route(request: MatchRequest):
    job_descriptions = REAL_JOBS if REAL_JOBS else []
    results = match_candidate_to_jobs(request.cv_text, job_descriptions)

    save_job_matches(
        cv_analysis_id="web_app",
        matches=results,
        github_username=request.github_username
    )

    # Save to user history if user_id provided
    if request.user_id:
        try:
            parsed = parse_cv(request.cv_text)
            profile = apply_decay_to_profile(parsed['skill_timeline'])
            save_user_analysis(
                user_id=request.user_id,
                cv_text=request.cv_text,
                skill_timeline=parsed['skill_timeline'],
                skill_profile={k: v for k, v in profile.items()},
                matches=results
            )
        except Exception as e:
            print(f"Could not save user history: {e}")

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
    github_username: str = Form(default=""),
    user_id: str = Form(default="")
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

        # Use GitHub signals if username provided
        if github_username and github_username.strip():
            try:
                print(f"Using GitHub signal for: {github_username}")
                github_timeline = extract_github_signals(github_username)

                if github_timeline:
                    combined = combine_signals(
                        parsed['skill_timeline'],
                        github_timeline
                    )

                    from decay_model import get_skill_category
                    skill_profile = {}
                    for skill, data in combined.items():
                        skill_profile[skill] = {
                            "freshness_score": data['final_score'],
                            "strength": get_strength_label(data['final_score']),
                            "last_used": data['cv_last_used'] or data['github_last_used'],
                            "category": get_skill_category(skill),
                            "source": data['source']
                        }

                    print(f"Multi-source profile built with {len(skill_profile)} skills")
                else:
                    skill_profile = profile
                    print("GitHub returned nothing — using CV only")

            except Exception as e:
                print(f"GitHub error: {e}")
                skill_profile = profile
        else:
            skill_profile = profile

        # Match against real jobs
        results = []
        for job in REAL_JOBS:
            required_skills = extract_required_skills(job['description'])

            if len(required_skills) < 2:
                continue

            job_title_lower = job['title'].lower()
            title_mismatch = False
            TITLE_SKILL_MAP = {
                "java": ["java"],
                "python": ["python"],
                "angular": ["angular"],
                "react": ["react"],
                "flutter": ["flutter"],
                "ios": ["ios", "swift"],
                "android": ["android"],
                "devops": ["docker", "linux", "aws"],
                "machine learning": ["machine learning", "python"],
                "data scientist": ["python", "machine learning"],
                "full stack": ["javascript", "node.js"],
                "frontend": ["javascript", "html", "css"],
                "backend": ["python", "java", "node.js"],
                "django": ["django", "python"],
                "node": ["node.js", "javascript"]
            }

            for title_keyword, expected_skills in TITLE_SKILL_MAP.items():
                if title_keyword in job_title_lower:
                    if not any(s in required_skills for s in expected_skills):
                        title_mismatch = True
                        break

            if title_mismatch:
                continue

            match = calculate_match_score(skill_profile, required_skills)

            if not isinstance(match, dict):
                continue
            if match['match_percentage'] == 0:
                continue

            results.append({
                "job_title": job['title'],
                "match_percentage": match['match_percentage'],
                "matched_skills": match['matched_skills'],
                "missing_skills": match['missing_skills'],
                "total_required": match['total_required'],
                "total_matched": match['total_matched']
            })

        results = sorted(
            results,
            key=lambda x: x['match_percentage'],
            reverse=True
        )[:10]

        if not results:
            return {"error": "No job matches found"}

        save_job_matches(
            cv_analysis_id=analysis_id,
            matches=results,
            github_username=github_username
        )

        if user_id:
            try:
                save_user_analysis(
                    user_id=user_id,
                    cv_text=cv_text,
                    skill_timeline=parsed['skill_timeline'],
                    skill_profile={k: v for k, v in skill_profile.items()},
                    matches=results
                )
            except Exception as e:
                print(f"Could not save user history: {e}")

        return {
            "cv_text": cv_text[:500],
            "analysis_id": analysis_id,
            "total_skills": parsed['skills_found'],
            "skill_timeline": parsed['skill_timeline'],
            "skill_profile": skill_profile,
            "matches": results,
            "github_used": bool(github_username and github_username.strip())
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

# ================================================
# USER HISTORY ROUTES
# ================================================

@app.get("/user/history/{user_id}")
def get_history(user_id: str):
    try:
        history = get_user_history(user_id)
        return {
            "user_id": user_id,
            "total_analyses": len(history),
            "history": history
        }
    except Exception as e:
        return {"error": str(e)}