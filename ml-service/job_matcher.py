from pipeline import run_pipeline

def extract_required_skills(job_description):
    """
    Extract required skills from a job description
    """
    SKILLS = [
        "angular", "react", "vue", "javascript", "typescript", "html", "css",
        "node.js", "express", "python", "java", "django", "flask", "fastapi",
        "mongodb", "mysql", "postgresql", "sql", "firebase",
        "tensorflow", "pytorch", "scikit-learn", "keras", "nlp", "machine learning",
        "docker", "git", "aws", "azure", "linux"
    ]
    
    job_lower = job_description.lower()
    required = []
    for skill in SKILLS:
        if skill in job_lower:
            required.append(skill)
    return required

def calculate_match_score(skill_profile, required_skills):
    """
    Match candidate skill profile against job requirements
    Uses decay scores instead of binary matching
    """
    if not required_skills:
        return 0
    
    total_score = 0
    matched_skills = []
    missing_skills = []

    for skill in required_skills:
        if skill in skill_profile:
            freshness = skill_profile[skill]['freshness_score']
            total_score += freshness
            matched_skills.append({
                "skill": skill,
                "freshness": freshness,
                "strength": skill_profile[skill]['strength']
            })
        else:
            missing_skills.append(skill)
            total_score += 0

    # Calculate percentage match
    max_possible = len(required_skills)
    match_percentage = (total_score / max_possible) * 100

    return {
        "match_percentage": round(match_percentage, 1),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "total_required": len(required_skills),
        "total_matched": len(matched_skills)
    }

def match_candidate_to_jobs(cv_text, job_descriptions):
    """
    Match one candidate against multiple job descriptions
    Returns ranked list of jobs
    """
    # Get candidate skill profile
    candidate_profile = run_pipeline(cv_text)
    skill_profile = candidate_profile['skill_profile']

    results = []

    for job in job_descriptions:
        required_skills = extract_required_skills(job['description'])
        match = calculate_match_score(skill_profile, required_skills)
        
        results.append({
            "job_title": job['title'],
            "match_percentage": match['match_percentage'],
            "matched_skills": match['matched_skills'],
            "missing_skills": match['missing_skills'],
            "total_required": match['total_required'],
            "total_matched": match['total_matched']
        })

    # Rank jobs by match percentage
    results = sorted(results, 
                    key=lambda x: x['match_percentage'], 
                    reverse=True)
    return results

# ---- TEST IT ----
if __name__ == "__main__":

    # Sample candidate CV
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

    # Sample job descriptions
    job_descriptions = [
        {
            "title": "ML Engineer",
            "description": "Looking for Python developer with Machine Learning, TensorFlow and MongoDB experience. NLP knowledge is a plus."
        },
        {
            "title": "Full Stack Developer",
            "description": "We need Angular, Node.js and MongoDB developer with JavaScript experience."
        },
        {
            "title": "Backend Developer",
            "description": "Python, FastAPI, PostgreSQL and Docker experience required."
        },
        {
            "title": "Frontend Developer",
            "description": "React, JavaScript, HTML, CSS and TypeScript required."
        }
    ]

    print("Matching candidate to jobs...")
    print()
    
    results = match_candidate_to_jobs(sample_cv, job_descriptions)

    print("=" * 65)
    print("JOB MATCH RESULTS")
    print("=" * 65)

    for i, job in enumerate(results, 1):
        print(f"\n#{i} {job['job_title']}")
        print(f"    Match Score: {job['match_percentage']}%")
        print(f"    Matched: {job['total_matched']}/{job['total_required']} skills")
        
        if job['matched_skills']:
            print(f"    ✅ Strong matches:", end=" ")
            strong = [s['skill'] for s in job['matched_skills'] 
                     if s['strength'] in ['Strong', 'Moderate']]
            print(', '.join(strong) if strong else 'None')
        
        if job['missing_skills']:
            print(f"    ❌ Missing: {', '.join(job['missing_skills'])}")