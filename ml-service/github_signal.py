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

# Map skills to relevant file extensions
SKILL_FILE_EXTENSIONS = {
    "angular": [".ts", ".component.ts", ".module.ts", ".component.html"],
    "react": [".jsx", ".tsx", ".react.js"],
    "vue": [".vue"],
    "javascript": [".js", ".mjs", ".cjs"],
    "typescript": [".ts", ".tsx"],
    "python": [".py"],
    "java": [".java"],
    "django": ["views.py", "urls.py", "models.py", "settings.py"],
    "flask": ["app.py", "routes.py"],
    "fastapi": ["main.py", "router.py", "api.py"],
    "css": [".css", ".scss", ".sass", ".less"],
    "html": [".html", ".htm"],
    "sql": [".sql"],
    "mongodb": ["models.py", "schema.js", "model.js"],
    "docker": ["Dockerfile", "docker-compose.yml", "docker-compose.yaml"],
    "kubernetes": [".yaml", ".yml"],
    "golang": [".go"],
    "rust": [".rs"],
    "swift": [".swift"],
    "kotlin": [".kt"],
    "php": [".php"],
    "ruby": [".rb"],
    "node.js": ["package.json", "server.js", "app.js", "index.js"],
    "express": ["server.js", "app.js", "routes.js"],
    "tensorflow": ["model.py", "train.py", "*.ipynb"],
    "pytorch": ["model.py", "train.py", "*.ipynb"],
    "pandas": [".ipynb", ".py"],
    "numpy": [".ipynb", ".py"],
    "scikit-learn": [".ipynb", ".py"],
    "linux": [".sh", ".bash", "Makefile"],
    "aws": ["*.tf", "serverless.yml", "*.yaml"],
    "c#": [".cs"],
    "redux": ["reducer.js", "store.js", "action.js"]
}

def get_skill_last_commit_year(username, repo_name, skill, repo_last_year):
    """
    Get the actual last year a specific skill was used
    by checking which files were changed in recent commits.
    Falls back to repo last commit year if no skill files found.
    """
    extensions = SKILL_FILE_EXTENSIONS.get(skill.lower(), [])

    if not extensions:
        # No file mapping for this skill — use repo date as fallback
        return repo_last_year

    try:
        # Fetch recent commits
        url = f"{GITHUB_API}/repos/{username}/{repo_name}/commits"
        params = {"per_page": 5}
        response = requests.get(url, headers=get_headers(), params=params)

        if response.status_code != 200:
            return repo_last_year

        commits = response.json()

        for commit in commits:
            sha = commit['sha']
            commit_year = int(commit['commit']['author']['date'][:4])

            # Get files changed in this commit
            commit_url = f"{GITHUB_API}/repos/{username}/{repo_name}/commits/{sha}"
            commit_response = requests.get(commit_url, headers=get_headers())

            if commit_response.status_code != 200:
                continue

            files_changed = [
                f['filename']
                for f in commit_response.json().get('files', [])
            ]

            # Check if any skill-related files were changed
            for filename in files_changed:
                for ext in extensions:
                    if filename.endswith(ext) or ext in filename:
                        return commit_year

        # No skill-related files found in recent commits
        # Return None to indicate skill not actively used
        return None

    except Exception as e:
        print(f"Error checking commits for {skill}: {e}")
        return repo_last_year
    
def extract_github_signals(username):
    """
    Main function - extracts skill signals from GitHub profile
    Uses file-level commit checking for accurate skill dating
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

    for repo in repos[:20]:
        repo_name = repo['name']
        repo_last_year = get_last_commit_year(repo)

        if not repo_last_year:
            continue

        # Skip forked repos
        if repo.get('fork', False):
            continue

        # Step 1 — Get languages used in repo
        languages = get_repo_languages(username, repo_name)
        repo_skills = []

        for lang, _ in languages.items():
            skill = LANGUAGE_MAP.get(lang)
            if skill:
                repo_skills.append(skill)

        # Step 2 — Get frameworks from dependency files
        frameworks = get_repo_frameworks(username, repo_name)
        repo_skills.extend(frameworks)
        repo_skills = list(set(repo_skills))

        # Step 3 — For each skill check file-level commits
        for skill in repo_skills:
            actual_year = get_skill_last_commit_year(
                username, repo_name, skill, repo_last_year
            )

            if actual_year is None:
                # Skill files not found in recent commits — skip
                print(f"  {skill} in {repo_name}: no skill files in recent commits")
                continue

            if skill not in github_skill_timeline:
                github_skill_timeline[skill] = actual_year
            else:
                github_skill_timeline[skill] = max(
                    github_skill_timeline[skill],
                    actual_year
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