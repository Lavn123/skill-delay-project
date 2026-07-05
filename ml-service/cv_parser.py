import spacy
import re
from datetime import datetime

nlp = spacy.load("en_core_web_sm")

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
    "opencv", "huggingface", "transformers", "spark",
    "hadoop", "tableau", "power bi",

    # DevOps/Cloud
    "docker", "kubernetes", "git", "aws", "azure",
    "linux", "jenkins", "ci/cd", "terraform", "ansible",
    "google cloud", "heroku", "nginx", "apache",

    # Mobile
    "android", "ios", "react native", "flutter", "swift",
    "objective-c",

    # Security/Networking
    "cybersecurity", "networking", "tcp/ip", "firewalls",
    "penetration testing", "ethical hacking",

    # General IT
    "agile", "scrum", "jira", "rest api", "graphql",
    "microservices", "object oriented", "data structures",
    "algorithms", "system design", "linux administration"
]

YEAR_PATTERN = re.compile(r'\b(20[0-9]{2})\b')

def extract_years_from_text(text):
    years = YEAR_PATTERN.findall(text)
    return [int(y) for y in years]

def extract_skills_from_text(text):
    text_lower = text.lower()
    found = []
    for skill in SKILLS:
        if skill.lower() in text_lower:
            found.append(skill)
    return found

def parse_cv(cv_text):
    current_year = datetime.now().year
    lines = cv_text.split('\n')
    sections = []
    current_section = []
    for line in lines:
        if line.strip():
            current_section.append(line.strip())
        else:
            if current_section:
                sections.append(' '.join(current_section))
                current_section = []
    if current_section:
        sections.append(' '.join(current_section))
    skill_timeline = {}
    for section in sections:
        years = extract_years_from_text(section)
        skills = extract_skills_from_text(section)
        if years and skills:
            last_used = max(years)
            for skill in skills:
                if skill not in skill_timeline:
                    skill_timeline[skill] = last_used
                else:
                    skill_timeline[skill] = max(skill_timeline[skill], last_used)
    return {
        "skills_found": len(skill_timeline),
        "skill_timeline": skill_timeline,
        "parsed_at": current_year
    }

if __name__ == "__main__":
    sample_cv = """
    John Smith - Software Engineer
    Senior Developer at Google 2021 - 2024
    Worked with Python, TensorFlow, Docker and MongoDB
    Full Stack Developer at Startup 2019 - 2021
    Used Angular, Node.js, MongoDB and JavaScript
    Junior Developer at Agency 2017 - 2019
    HTML, CSS, JavaScript, MySQL
    """
    result = parse_cv(sample_cv)
    print("=" * 50)
    print("CV PARSER RESULTS")
    print("=" * 50)
    print(f"Total skills found: {result['skills_found']}")
    print()
    print("Skill Timeline:")
    for skill, year in sorted(result['skill_timeline'].items()):
        print(f"  {skill:<20} last used: {year}")
