import requests
import base64
import json
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

GITHUB_API = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")

def get_headers():
    """Get headers with authentication if token available"""
    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"
    return headers

# Map GitHub languages to skill names
LANGUAGE_MAP = {
    "Python": "python",
    "JavaScript": "javascript",
    "TypeScript": "typescript",
    "Java": "java",
    "HTML": "html",
    "CSS": "css",
    "Shell": "linux",
    "Kotlin": "kotlin",
    "Swift": "swift",
    "Dart": "flutter",
    "Go": "golang",
    "Ruby": "ruby",
    "PHP": "php",
    "C#": "c#",
    "Scala": "scala"
}

# Map package.json dependencies to skills
JS_FRAMEWORK_DEPS = {
    "@angular/core": "angular",
    "react": "react",
    "react-dom": "react",
    "vue": "vue",
    "express": "express",
    "mongoose": "mongodb",
    "next": "next.js",
    "typescript": "typescript",
    "redux": "redux",
    "gatsby": "gatsby",
    "@nestjs/core": "node.js",
    "socket.io": "node.js",
    "axios": "javascript",
    "jquery": "javascript"
}

# Map requirements.txt packages to skills
PYTHON_FRAMEWORK_DEPS = {
    "django": "django",
    "flask": "flask",
    "fastapi": "fastapi",
    "tensorflow": "tensorflow",
    "torch": "pytorch",
    "scikit-learn": "scikit-learn",
    "sklearn": "scikit-learn",
    "pandas": "pandas",
    "numpy": "numpy",
    "keras": "keras",
    "spacy": "nlp",
    "nltk": "nlp",
    "transformers": "nlp",
    "pymongo": "mongodb",
    "sqlalchemy": "sql",
    "psycopg2": "postgresql",
    "mysql": "mysql",
    "redis": "redis",
    "celery": "python",
    "pytest": "python",
    "boto3": "aws",
    "docker": "docker"
}

def get_user_repos(username):
    """Fetch all public repositories for a GitHub user"""
    all_repos = []
    page = 1
    
    while True:
        url = f"{GITHUB_API}/users/{username}/repos"
        params = {
            "sort": "pushed",
            "per_page": 100,  # Max allowed by GitHub
            "page": page
        }

        response = requests.get(url, headers=get_headers(), params=params)

        if response.status_code == 200:
            repos = response.json()
            if not repos:
                break  # No more pages
            all_repos.extend(repos)
            if len(repos) < 100:
                break  # Last page
            page += 1
        elif response.status_code == 403:
            print("GitHub API rate limit reached!")
            break
        elif response.status_code == 404:
            print(f"GitHub user not found: {username}")
            break
        else:
            print(f"Error fetching repos: {response.status_code}")
            break

    print(f"Found {len(all_repos)} repositories")
    return all_repos

def get_repo_languages(username, repo_name):
    """Get languages used in a repository"""
    url = f"{GITHUB_API}/repos/{username}/{repo_name}/languages"
    response = requests.get(url, headers=get_headers())

    if response.status_code == 200:
        return response.json()
    return {}

def get_last_commit_year(repo):
    """Extract year of last commit from repo data"""
    pushed_at = repo.get('pushed_at', None)
    if pushed_at:
        return int(pushed_at[:4])
    return None

def get_repo_frameworks(username, repo_name):
    """
    Detect frameworks by reading dependency files
    Checks package.json and requirements.txt
    """
    frameworks = []

    # Check package.json for JS/TS frameworks
    url = f"{GITHUB_API}/repos/{username}/{repo_name}/contents/package.json"
    response = requests.get(url, headers=get_headers())

    if response.status_code == 200:
        try:
            content = base64.b64decode(
                response.json()['content']
            ).decode('utf-8')
            pkg = json.loads(content)

            deps = {
                **pkg.get('dependencies', {}),
                **pkg.get('devDependencies', {})
            }

            for dep, skill in JS_FRAMEWORK_DEPS.items():
                if dep in deps and skill not in frameworks:
                    frameworks.append(skill)

        except Exception as e:
            print(f"Error parsing package.json: {e}")

    # Check requirements.txt for Python frameworks
    url = f"{GITHUB_API}/repos/{username}/{repo_name}/contents/requirements.txt"
    response = requests.get(url, headers=get_headers())

    if response.status_code == 200:
        try:
            content = base64.b64decode(
                response.json()['content']
            ).decode('utf-8').lower()

            for pkg, skill in PYTHON_FRAMEWORK_DEPS.items():
                if pkg in content and skill not in frameworks:
                    frameworks.append(skill)

        except Exception as e:
            print(f"Error parsing requirements.txt: {e}")

    return frameworks

def extract_github_signals(username):
    """
    Main function - extracts skill signals from GitHub profile
    Combines language detection + framework detection
    """
    if not username or username.strip() == '':
        return {}

    print(f"Fetching GitHub data for: {username}")

    repos = get_user_repos(username)

    if not repos:
        print("No repos found or invalid username")
        return {}

    print(f"Found {len(repos)} repositories")

    github_skill_timeline = {}

    for repo in repos[:20]:  # Check first 20 repos
        repo_name = repo['name']
        last_commit_year = get_last_commit_year(repo)

        if not last_commit_year:
            continue

        # Skip forked repos — not their own work
        if repo.get('fork', False):
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

        # Extract framework signals from dependency files
        frameworks = get_repo_frameworks(username, repo_name)
        for skill in frameworks:
            if skill not in github_skill_timeline:
                github_skill_timeline[skill] = last_commit_year
            else:
                github_skill_timeline[skill] = max(
                    github_skill_timeline[skill],
                    last_commit_year
                )

    print(f"GitHub skills detected: {list(github_skill_timeline.keys())}")
    return github_skill_timeline

def get_strength(score):
    if score >= 0.7:
        return "Strong"
    elif score >= 0.4:
        return "Moderate"
    elif score >= 0.2:
        return "Weak"
    else:
        return "Outdated"

def combine_signals(cv_timeline, github_timeline, alpha=0.6):
    """
    Combine CV signal and GitHub signal into one score
    Formula: final_score = alpha * cv_score + (1-alpha) * github_score
    alpha = 0.6 means CV gets 60% weight, GitHub gets 40%
    """
    from decay_model import calculate_freshness, get_skill_category

    all_skills = set(
        list(cv_timeline.keys()) +
        list(github_timeline.keys())
    )

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
    print("=" * 65)
    print("GITHUB SIGNAL EXTRACTION TEST")
    print("=" * 65)

    # Test with a real GitHub username
    username = "torvalds"

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

    cv_timeline = {
        "python": 2022,
        "javascript": 2020,
        "html": 2019
    }

    combined = combine_signals(cv_timeline, github_timeline)

    print()
    print(f"{'Skill':<20} {'CV':>8} {'GitHub':>8} {'Final':>8} {'Source'}")
    print("-" * 65)
    for skill, data in sorted(
        combined.items(),
        key=lambda x: x[1]['final_score'],
        reverse=True
    ):
        print(
            f"{skill:<20} "
            f"{data['cv_score']:>8} "
            f"{data['github_score']:>8} "
            f"{data['final_score']:>8} "
            f"{data['source']}"
        )