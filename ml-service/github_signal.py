import requests
from datetime import datetime

# GitHub API base URL
GITHUB_API = "https://api.github.com"

# Map GitHub languages to our skill names
LANGUAGE_MAP = {
    "Python": "python",
    "JavaScript": "javascript",
    "TypeScript": "typescript",
    "Java": "java",
    "HTML": "html",
    "CSS": "css",
    "Shell": "linux"
}

# Map dependency files to frameworks
FRAMEWORK_MAP = {
    "package.json": {
        "@angular/core": "angular",
        "react": "react",
        "vue": "vue",
        "express": "express",
        "mongoose": "mongodb"
    },
    "requirements.txt": {
        "tensorflow": "tensorflow",
        "torch": "pytorch",
        "scikit-learn": "scikit-learn",
        "keras": "keras",
        "flask": "flask",
        "fastapi": "fastapi",
        "django": "django"
    }
}

def get_user_repos(username):
    """
    Fetch all public repositories for a GitHub user
    """
    url = f"{GITHUB_API}/users/{username}/repos"
    headers = {"Accept": "application/vnd.github.v3+json"}
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching repos: {response.status_code}")
        return []

def get_repo_languages(username, repo_name):
    """
    Get languages used in a repository
    """
    url = f"{GITHUB_API}/repos/{username}/{repo_name}/languages"
    headers = {"Accept": "application/vnd.github.v3+json"}
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    return {}

def get_last_commit_year(repo):
    """
    Extract year of last commit from repo data
    """
    pushed_at = repo.get('pushed_at', None)
    if pushed_at:
        return int(pushed_at[:4])
    return None

def extract_github_signals(username):
    """
    Main function - extracts skill signals from GitHub profile
    Returns skill timeline based on GitHub activity
    """
    print(f"Fetching GitHub data for: {username}")
    
    repos = get_user_repos(username)
    
    if not repos:
        print("No repos found or invalid username")
        return {}
    
    print(f"Found {len(repos)} repositories")
    
    github_skill_timeline = {}
    
    for repo in repos:
        repo_name = repo['name']
        last_commit_year = get_last_commit_year(repo)
        
        if not last_commit_year:
            continue
        
        # Extract language signals
        languages = get_repo_languages(username, repo_name)
        
        for lang, _ in languages.items():
            skill = LANGUAGE_MAP.get(lang)
            if skill:
                if skill not in github_skill_timeline:
                    github_skill_timeline[skill] = last_commit_year
                else:
                    github_skill_timeline[skill] = max(
                        github_skill_timeline[skill],
                        last_commit_year
                    )
    
    return github_skill_timeline

def combine_signals(cv_timeline, github_timeline, alpha=0.6):
    """
    Combine CV signal and GitHub signal into one score
    
    Formula: final_score = alpha * cv_score + (1-alpha) * github_score
    alpha = 0.6 means CV gets 60% weight, GitHub gets 40%
    """
    from decay_model import calculate_freshness, get_skill_category
    
    all_skills = set(list(cv_timeline.keys()) + 
                    list(github_timeline.keys()))
    
    combined = {}
    
    for skill in all_skills:
        category = get_skill_category(skill)
        
        # Get CV score
        if skill in cv_timeline:
            cv_score = calculate_freshness(cv_timeline[skill], category)
            cv_last_used = cv_timeline[skill]
        else:
            cv_score = 0
            cv_last_used = None
        
        # Get GitHub score
        if skill in github_timeline:
            gh_score = calculate_freshness(github_timeline[skill], category)
            gh_last_used = github_timeline[skill]
        else:
            gh_score = 0
            gh_last_used = None
        
        # Combine scores
        if cv_score > 0 and gh_score > 0:
            final_score = (alpha * cv_score) + ((1 - alpha) * gh_score)
            source = "CV + GitHub"
        elif cv_score > 0:
            final_score = cv_score
            source = "CV only"
        else:
            final_score = gh_score
            source = "GitHub only"
        
        combined[skill] = {
            "cv_last_used": cv_last_used,
            "github_last_used": gh_last_used,
            "cv_score": round(cv_score, 3),
            "github_score": round(gh_score, 3),
            "final_score": round(final_score, 3),
            "source": source
        }
    
    return combined

# ---- TEST IT ----
if __name__ == "__main__":
    
    # Test with a real GitHub username
    # Using a public profile for testing
    username = "torvalds"  # Linux creator - has public repos
    
    print("=" * 65)
    print("GITHUB SIGNAL EXTRACTION")
    print("=" * 65)
    
    github_timeline = extract_github_signals(username)
    
    print()
    print("GitHub Skill Timeline:")
    print("-" * 40)
    for skill, year in sorted(github_timeline.items()):
        print(f"  {skill:<20} last active: {year}")
    
    print()
    print("=" * 65)
    print("COMBINED SIGNAL TEST")
    print("=" * 65)
    
    # Sample CV timeline to combine with
    cv_timeline = {
        "python": 2022,
        "javascript": 2020,
        "html": 2019
    }
    
    combined = combine_signals(cv_timeline, github_timeline)
    
    print()
    print(f"{'Skill':<20} {'CV Score':<12} {'GH Score':<12} {'Final':<10} {'Source'}")
    print("-" * 65)
    for skill, data in sorted(combined.items(),
                              key=lambda x: x[1]['final_score'],
                              reverse=True):
        print(f"{skill:<20} {data['cv_score']:<12} {data['github_score']:<12} {data['final_score']:<10} {data['source']}")