import math
from datetime import datetime

CURRENT_YEAR = datetime.now().year

# Decay rates per skill category
DECAY_RATES = {
    "fast": 0.4,    # Specific frameworks: Angular, React, TensorFlow
    "medium": 0.2,  # Languages: Python, JavaScript, Java
    "slow": 0.1     # Fundamentals: SQL, Git, Algorithms
}

# Categorise each skill
SKILL_CATEGORIES = {
    # Fast decaying - frameworks change quickly
    "angular": "fast",
    "react": "fast",
    "vue": "fast",
    "tensorflow": "fast",
    "pytorch": "fast",
    "keras": "fast",
    "django": "fast",
    "flask": "fast",
    "fastapi": "fast",
    "docker": "fast",
    "aws": "fast",
    "azure": "fast",
    "firebase": "fast",

    # Medium decaying - languages are more stable
    "python": "medium",
    "javascript": "medium",
    "typescript": "medium",
    "java": "medium",
    "node.js": "medium",
    "express": "medium",

    # Slow decaying - fundamentals don't change
    "sql": "slow",
    "mysql": "slow",
    "postgresql": "slow",
    "mongodb": "slow",
    "html": "slow",
    "css": "slow",
    "git": "slow",
    "linux": "slow",
    "nlp": "slow",
    "machine learning": "slow"
}

def get_skill_category(skill):
    return SKILL_CATEGORIES.get(skill.lower(), "medium")

def calculate_freshness(last_used_year, skill_category):
    """
    Calculate skill freshness score using exponential decay
    S(t) = e^(-lambda * t)
    """
    years_elapsed = CURRENT_YEAR - last_used_year
    decay_rate = DECAY_RATES[skill_category]
    freshness = math.exp(-decay_rate * years_elapsed)
    return round(freshness, 3)

def apply_decay_to_profile(skill_timeline):
    """
    Takes skill timeline from CV parser and returns
    decay-weighted skill scores
    """
    decayed_profile = {}

    for skill, last_used_year in skill_timeline.items():
        category = get_skill_category(skill)
        freshness = calculate_freshness(last_used_year, category)
        
        decayed_profile[skill] = {
            "last_used": last_used_year,
            "category": category,
            "freshness_score": freshness,
            "strength": get_strength_label(freshness)
        }

    return decayed_profile

def get_strength_label(score):
    if score >= 0.7:
        return "Strong"
    elif score >= 0.4:
        return "Moderate"
    elif score >= 0.2:
        return "Weak"
    else:
        return "Outdated"

# ---- TEST IT ----
if __name__ == "__main__":
    
    # Simulate output from CV parser
    sample_timeline = {
        "python": 2024,
        "tensorflow": 2021,
        "angular": 2024,
        "node.js": 2022,
        "mongodb": 2024,
        "mysql": 2019,
        "docker": 2021,
        "javascript": 2022,
        "html": 2019,
        "machine learning": 2024
    }

    profile = apply_decay_to_profile(sample_timeline)

    print("=" * 65)
    print("SKILL DECAY MODEL RESULTS")
    print("=" * 65)
    print(f"{'Skill':<20} {'Last Used':<12} {'Category':<10} {'Score':<8} {'Strength'}")
    print("-" * 65)

    for skill, data in sorted(profile.items(), 
                              key=lambda x: x[1]['freshness_score'], 
                              reverse=True):
        print(f"{skill:<20} {data['last_used']:<12} {data['category']:<10} {data['freshness_score']:<8} {data['strength']}")