from pipeline import run_pipeline

def extract_required_skills(job_description):
    """
    Extract required skills from a job description
    Uses expanded keyword matching for real world job postings
    """
    SKILLS = [
        # Frontend
        "angular", "react", "vue", "javascript", "typescript",
        "html", "css", "jquery", "bootstrap", "sass",
        "webpack", "redux", "next.js", "gatsby",

        # Backend
        "node.js", "express", "python", "java", "django",
        "flask", "fastapi", "spring", "php", "ruby",
        "rails", "asp.net", "c#", "golang", "rust",
        "kotlin", "scala", "perl",

        # Database
        "mongodb", "mysql", "postgresql", "sql", "firebase",
        "redis", "elasticsearch", "cassandra", "oracle",
        "sqlite", "dynamodb", "mariadb",

        # AI/ML
        "tensorflow", "pytorch", "scikit-learn", "keras",
        "nlp", "machine learning", "deep learning",
        "computer vision", "pandas", "numpy", "matplotlib",
        "opencv", "spark", "hadoop", "tableau", "power bi",

        # DevOps/Cloud
        "docker", "kubernetes", "git", "aws", "azure",
        "linux", "jenkins", "terraform", "ansible",
        "google cloud", "heroku", "nginx", "apache",

        # Mobile
        "android", "ios", "react native", "flutter", "swift",

        # General IT
        "agile", "scrum", "jira", "rest api", "graphql",
        "microservices", "object oriented", "data structures",
        "algorithms", "system design", "linux administration",
        "networking", "cybersecurity", "penetration testing"
    ]

    SKILL_VARIATIONS = {
        "js": "javascript",
        "ts": "typescript",
        "py": "python",
        "node": "node.js",
        "mongo": "mongodb",
        "postgres": "postgresql",
        "k8s": "kubernetes",
        "ml": "machine learning",
        "ai": "machine learning",
        "gcp": "google cloud",
        "ec2": "aws",
        "s3": "aws",
        "devops": "docker",
        "big data": "spark",
        "data science": "machine learning",
        "data analytics": "sql",
        "full stack": "javascript",
        "fullstack": "javascript",
        "front end": "javascript",
        "frontend": "javascript",
        "backend": "python"
    }

    job_lower = job_description.lower()
    required = []

    # Check exact skill matches
    for skill in SKILLS:
        if skill.lower() in job_lower:
            required.append(skill)

    # Check variations
    for variation, skill in SKILL_VARIATIONS.items():
        if variation in job_lower and skill not in required:
            required.append(skill)

    return list(set(required))


def calculate_match_score(skill_profile, required_skills):
    """
    Match candidate skill profile against job requirements
    Uses decay scores instead of binary matching
    """
    if not required_skills:
        return {
            "match_percentage": 0,
            "matched_skills": [],
            "missing_skills": [],
            "total_required": 0,
            "total_matched": 0
        }

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
    candidate_profile = run_pipeline(cv_text)
    skill_profile = candidate_profile['skill_profile']

    # Map job titles to expected core skills
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

    results = []

    for job in job_descriptions:
        required_skills = extract_required_skills(job['description'])

        # Skip jobs with fewer than 2 required skills
        if len(required_skills) < 2:
            continue

        # Check job title matches required skills
        job_title_lower = job['title'].lower()
        title_mismatch = False

        for title_keyword, expected_skills in TITLE_SKILL_MAP.items():
            if title_keyword in job_title_lower:
                # Check if at least one expected skill is required
                if not any(s in required_skills for s in expected_skills):
                    title_mismatch = True
                    break

        # Skip jobs where title doesn't match description
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

    results = sorted(results,
                    key=lambda x: x['match_percentage'],
                    reverse=True)

    return results[:10]


    candidate_profile = run_pipeline(cv_text)
    skill_profile = candidate_profile['skill_profile']

    results = []

    for job in job_descriptions:
        required_skills = extract_required_skills(job['description'])

        # Skip jobs with fewer than 2 required skills
        # This removes low quality job descriptions
        if len(required_skills) < 2:
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

    results = sorted(results,
                    key=lambda x: x['match_percentage'],
                    reverse=True)

    return results[:10]
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
        },
        {
            "title": "Frontend Developer",
            "description": "React, JavaScript, HTML, CSS, TypeScript required"
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
            strong = [s['skill'] for s in job['matched_skills']
                     if s['strength'] in ['Strong', 'Moderate']]
            print(f"    ✅ Matched: {', '.join(strong) if strong else 'None'}")

        if job['missing_skills']:
            print(f"    ❌ Missing: {', '.join(job['missing_skills'])}")