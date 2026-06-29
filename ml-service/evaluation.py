from pipeline import run_pipeline
from job_matcher import extract_required_skills, calculate_match_score
from github_signal import combine_signals, extract_github_signals
from decay_model import apply_decay_to_profile, calculate_freshness, get_skill_category

# ================================================
# THREE SYSTEMS TO COMPARE
# ================================================

# SYSTEM A - Static Baseline (how current ATS works)
def system_a_static(cv_text, job_description):
    """
    Current ATS approach - simple keyword matching
    No decay, no freshness - just checks if skill exists
    """
    SKILLS = [
        "angular", "react", "vue", "javascript", "typescript", "html", "css",
        "node.js", "express", "python", "java", "django", "flask", "fastapi",
        "mongodb", "mysql", "postgresql", "sql", "firebase",
        "tensorflow", "pytorch", "scikit-learn", "keras", "nlp", "machine learning",
        "docker", "git", "aws", "azure", "linux"
    ]
    
    cv_lower = cv_text.lower()
    job_lower = job_description.lower()
    
    # Find skills in CV (no dates, no decay)
    cv_skills = [s for s in SKILLS if s in cv_lower]
    
    # Find required skills in job
    required_skills = extract_required_skills(job_description)
    
    if not required_skills:
        return 0
    
    # Simple binary match - skill present = 1, not present = 0
    matched = [s for s in required_skills if s in cv_skills]
    score = (len(matched) / len(required_skills)) * 100
    
    return {
        "score": round(score, 1),
        "matched": matched,
        "missing": [s for s in required_skills if s not in cv_skills],
        "system": "A - Static Baseline"
    }

# SYSTEM B - CV Only Decay
def system_b_cv_decay(cv_text, job_description):
    """
    CV-only temporal decay model
    Uses timestamps from CV to calculate freshness
    """
    result = run_pipeline(cv_text)
    skill_profile = result['skill_profile']
    required_skills = extract_required_skills(job_description)
    
    match = calculate_match_score(skill_profile, required_skills)
    
    return {
        "score": match['match_percentage'],
        "matched": [s['skill'] for s in match['matched_skills']],
        "missing": match['missing_skills'],
        "system": "B - CV Decay Only"
    }

# SYSTEM C - Multi Source Decay (CV + GitHub)
def system_c_multi_source(cv_text, job_description, github_username):
    """
    Multi-source decay model
    Combines CV timestamps + GitHub activity
    """
    # Get CV skill timeline
    from cv_parser import parse_cv
    parsed = parse_cv(cv_text)
    cv_timeline = parsed['skill_timeline']
    
    # Get GitHub signals
    github_timeline = extract_github_signals(github_username)
    
    # Combine both signals
    combined = combine_signals(cv_timeline, github_timeline)
    
    # Convert to skill profile format
    skill_profile = {}
    for skill, data in combined.items():
        skill_profile[skill] = {
            "freshness_score": data['final_score'],
            "strength": get_strength(data['final_score'])
        }
    
    # Calculate match
    required_skills = extract_required_skills(job_description)
    match = calculate_match_score(skill_profile, required_skills)
    
    return {
        "score": match['match_percentage'],
        "matched": [s['skill'] for s in match['matched_skills']],
        "missing": match['missing_skills'],
        "system": "C - Multi Source (CV + GitHub)"
    }

def get_strength(score):
    if score >= 0.7:
        return "Strong"
    elif score >= 0.4:
        return "Moderate"
    elif score >= 0.2:
        return "Weak"
    else:
        return "Outdated"

def run_evaluation(cv_text, job_descriptions, github_username):
    """
    Run all three systems and compare results
    """
    print("=" * 70)
    print("EVALUATION - COMPARING 3 SYSTEMS")
    print("=" * 70)
    print()
    print("Systems being compared:")
    print("  A → Static keyword matching (current ATS)")
    print("  B → CV-only temporal decay")
    print("  C → Multi-source decay (CV + GitHub)")
    print()

    all_results = []

    for job in job_descriptions:
        print(f"Job: {job['title']}")
        print("-" * 70)

        # Run all 3 systems
        result_a = system_a_static(cv_text, job['description'])
        result_b = system_b_cv_decay(cv_text, job['description'])
        result_c = system_c_multi_source(
            cv_text, job['description'], github_username)

        # Print comparison
        print(f"  System A (Static)      : {result_a['score']}%")
        print(f"  System B (CV Decay)    : {result_b['score']}%")
        print(f"  System C (Multi-Source): {result_c['score']}%")
        
        # Show improvement
        improvement_b = round(result_b['score'] - result_a['score'], 1)
        improvement_c = round(result_c['score'] - result_a['score'], 1)
        
        print(f"  B vs A improvement     : {improvement_b:+.1f}%")
        print(f"  C vs A improvement     : {improvement_c:+.1f}%")
        print()

        all_results.append({
            "job": job['title'],
            "system_a": result_a['score'],
            "system_b": result_b['score'],
            "system_c": result_c['score'],
            "b_vs_a": improvement_b,
            "c_vs_a": improvement_c
        })

    # Summary
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    avg_a = sum(r['system_a'] for r in all_results) / len(all_results)
    avg_b = sum(r['system_b'] for r in all_results) / len(all_results)
    avg_c = sum(r['system_c'] for r in all_results) / len(all_results)

    print(f"  Average System A score : {round(avg_a, 1)}%")
    print(f"  Average System B score : {round(avg_b, 1)}%")
    print(f"  Average System C score : {round(avg_c, 1)}%")
    print()
    print(f"  B improves over A by   : {round(avg_b - avg_a, 1)}%")
    print(f"  C improves over A by   : {round(avg_c - avg_a, 1)}%")

# ---- TEST IT ----
if __name__ == "__main__":

    sample_cv = """
    John Smith - Software Engineer

    Senior AI Developer at Google 2022 - 2024
    Worked with Python, Machine Learning, MongoDB
    Built NLP models and REST APIs using FastAPI

    Full Stack Developer at Startup 2020 - 2022
    Used Angular, Node.js, MongoDB and JavaScript
    Developed customer-facing web applications

    Junior Developer at Agency 2018 - 2020
    HTML, CSS, JavaScript, MySQL
    Built websites for clients
    """

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

    # Use your own GitHub username here!
    github_username = "torvalds"

    run_evaluation(sample_cv, job_descriptions, github_username)