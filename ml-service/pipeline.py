from cv_parser import parse_cv
from decay_model import apply_decay_to_profile

def run_pipeline(cv_text):
    """
    Full pipeline:
    Step 1 - Parse CV → extract skills + dates
    Step 2 - Apply decay → calculate freshness scores
    """
    
    # Step 1 - Parse the CV
    print("Step 1: Parsing CV...")
    parsed = parse_cv(cv_text)
    print(f"✓ Found {parsed['skills_found']} skills")
    print()

    # Step 2 - Apply decay model
    print("Step 2: Applying decay model...")
    decayed = apply_decay_to_profile(parsed['skill_timeline'])
    print(f"✓ Freshness scores calculated")
    print()

    return {
        "total_skills": parsed['skills_found'],
        "skill_profile": decayed
    }

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

    result = run_pipeline(sample_cv)

    print("=" * 65)
    print("FINAL SKILL PROFILE")
    print("=" * 65)
    print(f"{'Skill':<20} {'Last Used':<12} {'Score':<8} {'Strength'}")
    print("-" * 65)

    for skill, data in sorted(result['skill_profile'].items(),
                              key=lambda x: x[1]['freshness_score'],
                              reverse=True):
        print(f"{skill:<20} {data['last_used']:<12} {data['freshness_score']:<8} {data['strength']}")