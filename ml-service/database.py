from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "skill_decay_db")

client = MongoClient(MONGODB_URI)
db = client[DATABASE_NAME]

cv_analyses = db["cv_analyses"]
job_matches = db["job_matches"]
evaluations = db["evaluations"]

print("Connected to MongoDB Atlas!")

def save_cv_analysis(cv_text, skill_timeline, skill_profile):
    document = {
        "cv_text": cv_text[:500],
        "skill_timeline": skill_timeline,
        "skill_profile": skill_profile,
        "total_skills": len(skill_timeline),
        "created_at": datetime.now()
    }
    result = cv_analyses.insert_one(document)
    return str(result.inserted_id)

def get_cv_analysis(analysis_id):
    from bson.objectid import ObjectId
    result = cv_analyses.find_one({"_id": ObjectId(analysis_id)})
    if result:
        result["_id"] = str(result["_id"])
    return result

def save_job_matches(cv_analysis_id, matches, github_username=None):
    document = {
        "cv_analysis_id": cv_analysis_id,
        "github_username": github_username,
        "matches": matches,
        "total_jobs": len(matches),
        "top_match": matches[0]['job_title'] if matches else None,
        "top_score": matches[0]['match_percentage'] if matches else 0,
        "created_at": datetime.now()
    }
    result = job_matches.insert_one(document)
    return str(result.inserted_id)

def get_recent_matches(limit=10):
    results = job_matches.find().sort("created_at", -1).limit(limit)
    return [{**r, "_id": str(r["_id"])} for r in results]

def save_evaluation_result(system_name, accuracy, precision, recall, f1_score):
    document = {
        "system_name": system_name,
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1_score,
        "created_at": datetime.now()
    }
    result = evaluations.insert_one(document)
    return str(result.inserted_id)

def get_all_evaluations():
    results = evaluations.find().sort("created_at", -1)
    return [{**r, "_id": str(r["_id"])} for r in results]

if __name__ == "__main__":
    print("=" * 50)
    print("MONGODB CONNECTION TEST")
    print("=" * 50)
    
    test_id = save_cv_analysis(
        cv_text="Test CV",
        skill_timeline={"python": 2024, "angular": 2022},
        skill_profile={"python": {"freshness_score": 0.67}}
    )
    print(f"Saved CV analysis with ID: {test_id}")
    
    retrieved = get_cv_analysis(test_id)
    print(f"Retrieved: {retrieved['total_skills']} skills")
    
    print()
    print("MongoDB integration working!")