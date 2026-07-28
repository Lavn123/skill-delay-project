import math
from datetime import datetime
from scipy import stats
from decay_model import apply_decay_to_profile, calculate_freshness, get_skill_category
from job_matcher import extract_required_skills, calculate_match_score
def get_strength(score):
    if score >= 0.7:
        return "Strong"
    elif score >= 0.4:
        return "Moderate"
    elif score >= 0.2:
        return "Weak"
    else:
        return "Outdated"
# ================================================
# GROUND TRUTH RULES
# Fixed BEFORE model tuning — based on
# Stack Overflow Developer Survey 2024
# ================================================

GROUND_TRUTH_RULES = {
    "suitability_threshold": 0.3,
    "skill_coverage_threshold": 0.5,
    "fresh": 2023,
    "moderate": 2021,
    "stale": 2019,
    "very_stale": 2017
}

# ================================================
# SYNTHETIC CANDIDATES — 20 candidates
# Ground truth built in by construction
# ================================================

SYNTHETIC_CANDIDATES = [
    {
        "id": "C001",
        "name": "Fresh ML Engineer",
        "github_username": "chiphuyen",
        "skill_timeline": {
            "python": 2024,
            "tensorflow": 2024,
            "machine learning": 2024,
            "mongodb": 2024,
            "nlp": 2024
        },
        "ground_truth": {
            "ML Engineer": True,
            "Full Stack Developer": False,
            "Frontend Developer": False
        }
    },
    {
        "id": "C002",
        "name": "Stale ML Engineer",
        "github_username": "",
        "skill_timeline": {
            "python": 2017,
            "tensorflow": 2017,
            "machine learning": 2017,
            "mongodb": 2017,
            "nlp": 2017
        },
        "ground_truth": {
            "ML Engineer": False,
            "Full Stack Developer": False,
            "Frontend Developer": False
        }
    },
    {
        "id": "C003",
        "name": "Fresh Full Stack Developer",
        "github_username": "bradtraversy",
        "skill_timeline": {
            "angular": 2024,
            "node.js": 2024,
            "mongodb": 2024,
            "javascript": 2024,
            "typescript": 2024
        },
        "ground_truth": {
            "ML Engineer": False,
            "Full Stack Developer": True,
            "Frontend Developer": True
        }
    },
    {
        "id": "C004",
        "name": "Stale Full Stack Developer",
        "github_username": "",
        "skill_timeline": {
            "angular": 2017,
            "node.js": 2017,
            "mongodb": 2017,
            "javascript": 2017,
            "typescript": 2017
        },
        "ground_truth": {
            "ML Engineer": False,
            "Full Stack Developer": False,
            "Frontend Developer": False
        }
    },
    {
        "id": "C005",
        "name": "Mixed Skills Developer",
        "github_username": "",
        "skill_timeline": {
            "python": 2024,
            "machine learning": 2024,
            "angular": 2017,
            "node.js": 2017,
            "javascript": 2017
        },
        "ground_truth": {
            "ML Engineer": True,
            "Full Stack Developer": False,
            "Frontend Developer": False
        }
    },
    {
        "id": "C006",
        "name": "Career Switcher ML",
        "github_username": "fastai",
        "skill_timeline": {
            "python": 2024,
            "machine learning": 2024,
            "tensorflow": 2024,
            "angular": 2020,
            "javascript": 2020
        },
        "ground_truth": {
            "ML Engineer": True,
            "Full Stack Developer": False,
            "Frontend Developer": False
        }
    },
    {
        "id": "C007",
        "name": "Fresh Frontend Specialist",
        "github_username": "wesbos",
        "skill_timeline": {
            "react": 2024,
            "javascript": 2024,
            "typescript": 2024,
            "html": 2024,
            "css": 2024
        },
        "ground_truth": {
            "ML Engineer": False,
            "Full Stack Developer": False,
            "Frontend Developer": True
        }
    },
    {
        "id": "C008",
        "name": "Generalist Developer 2022",
        "github_username": "",
        "skill_timeline": {
            "python": 2022,
            "javascript": 2022,
            "angular": 2022,
            "machine learning": 2022,
            "mongodb": 2022
        },
        "ground_truth": {
            "ML Engineer": True,
            "Full Stack Developer": True,
            "Frontend Developer": False
        }
    },
    {
        "id": "C009",
        "name": "Recently Upskilled Developer",
        "github_username": "",
        "skill_timeline": {
            "java": 2019,
            "python": 2024,
            "machine learning": 2024,
            "tensorflow": 2024,
            "nlp": 2023
        },
        "ground_truth": {
            "ML Engineer": True,
            "Full Stack Developer": False,
            "Frontend Developer": False
        }
    },
    {
        "id": "C010",
        "name": "Outdated Full Stack",
        "github_username": "",
        "skill_timeline": {
            "angular": 2018,
            "node.js": 2018,
            "javascript": 2018,
            "mongodb": 2018,
            "typescript": 2018
        },
        "ground_truth": {
            "ML Engineer": False,
            "Full Stack Developer": False,
            "Frontend Developer": False
        }
    },
    {
        "id": "C011",
        "name": "Current Full Stack",
        "github_username": "gothinkster",
        "skill_timeline": {
            "angular": 2024,
            "node.js": 2024,
            "javascript": 2024,
            "mongodb": 2024,
            "typescript": 2024
        },
        "ground_truth": {
            "ML Engineer": False,
            "Full Stack Developer": True,
            "Frontend Developer": True
        }
    },
    {
        "id": "C012",
        "name": "Senior Developer Mixed",
        "github_username": "",
        "skill_timeline": {
            "python": 2024,
            "java": 2016,
            "javascript": 2024,
            "machine learning": 2023,
            "angular": 2019
        },
        "ground_truth": {
            "ML Engineer": True,
            "Full Stack Developer": False,
            "Frontend Developer": False
        }
    },
    {
        "id": "C013",
        "name": "Fresh Data Scientist",
        "github_username": "jakevdp",
        "skill_timeline": {
            "python": 2024,
            "machine learning": 2024,
            "sql": 2024,
            "pandas": 2024,
            "numpy": 2023
        },
        "ground_truth": {
            "ML Engineer": True,
            "Full Stack Developer": False,
            "Frontend Developer": False
        }
    },
    {
        "id": "C014",
        "name": "Stale Frontend Developer",
        "github_username": "",
        "skill_timeline": {
            "react": 2018,
            "javascript": 2018,
            "html": 2018,
            "css": 2018,
            "typescript": 2018
        },
        "ground_truth": {
            "ML Engineer": False,
            "Full Stack Developer": False,
            "Frontend Developer": False
        }
    },
    {
        "id": "C015",
        "name": "Moderate Full Stack",
        "github_username": "",
        "skill_timeline": {
            "angular": 2021,
            "node.js": 2021,
            "javascript": 2021,
            "mongodb": 2021,
            "typescript": 2021
        },
        "ground_truth": {
            "ML Engineer": False,
            "Full Stack Developer": True,
            "Frontend Developer": False
        }
    },
    {
        "id": "C016",
        "name": "Career Switcher Frontend",
        "github_username": "cassidoo",
        "skill_timeline": {
            "python": 2020,
            "java": 2020,
            "react": 2024,
            "javascript": 2024,
            "typescript": 2024
        },
        "ground_truth": {
            "ML Engineer": False,
            "Full Stack Developer": False,
            "Frontend Developer": True
        }
    },
    {
        "id": "C017",
        "name": "Fresh Backend Developer",
        "github_username": "",
        "skill_timeline": {
            "python": 2024,
            "fastapi": 2024,
            "postgresql": 2024,
            "docker": 2024,
            "git": 2024
        },
        "ground_truth": {
            "ML Engineer": False,
            "Full Stack Developer": False,
            "Frontend Developer": False
        }
    },
    {
        "id": "C018",
        "name": "Moderate ML Engineer",
        "github_username": "",
        "skill_timeline": {
            "python": 2022,
            "tensorflow": 2022,
            "machine learning": 2022,
            "mongodb": 2023,
            "nlp": 2022
        },
        "ground_truth": {
            "ML Engineer": True,
            "Full Stack Developer": False,
            "Frontend Developer": False
        }
    },
    {
        "id": "C019",
        "name": "Very Stale All Skills",
        "github_username": "",
        "skill_timeline": {
            "python": 2016,
            "angular": 2016,
            "react": 2016,
            "machine learning": 2016,
            "javascript": 2016
        },
        "ground_truth": {
            "ML Engineer": False,
            "Full Stack Developer": False,
            "Frontend Developer": False
        }
    },
    {
        "id": "C020",
        "name": "Balanced Current Developer",
        "github_username": "nicedoc",
        "skill_timeline": {
            "python": 2024,
            "javascript": 2024,
            "react": 2024,
            "machine learning": 2023,
            "sql": 2024
        },
        "ground_truth": {
            "ML Engineer": True,
            "Full Stack Developer": False,
            "Frontend Developer": True
        }
    }
]
# ================================================
# JOB DESCRIPTIONS
# ================================================

TEST_JOBS = [
    {
        "title": "ML Engineer",
        "description": "Python, Machine Learning, TensorFlow, MongoDB, NLP required"
    },
    {
        "title": "Full Stack Developer",
        "description": "Angular, Node.js, MongoDB, JavaScript, TypeScript required"
    },
    {
        "title": "Frontend Developer",
        "description": "React, JavaScript, TypeScript, HTML, CSS required"
    }
]

# ================================================
# SYSTEM A — STATIC BASELINE
# ================================================

def system_a_predict(skill_timeline, job_description):
    SKILLS = [
        "angular", "react", "vue", "javascript", "typescript", "html", "css",
        "node.js", "express", "python", "java", "django", "flask", "fastapi",
        "mongodb", "mysql", "postgresql", "sql", "firebase",
        "tensorflow", "pytorch", "scikit-learn", "keras", "nlp",
        "machine learning", "docker", "git", "aws", "azure", "linux",
        "pandas", "numpy"
    ]

    job_lower = job_description.lower()
    required = [s for s in SKILLS if s in job_lower]

    if not required:
        return False

    matched = [s for s in required if s in skill_timeline]
    coverage = len(matched) / len(required)

    return coverage >= GROUND_TRUTH_RULES["skill_coverage_threshold"]

# ================================================
# SYSTEM B — CV DECAY ONLY
# ================================================

def system_b_predict(skill_timeline, job_description):
    profile = apply_decay_to_profile(skill_timeline)
    required = extract_required_skills(job_description)

    if not required:
        return False

    match = calculate_match_score(profile, required)
    avg_freshness = match['match_percentage'] / 100

    return avg_freshness >= GROUND_TRUTH_RULES["suitability_threshold"]

# ================================================
# SYSTEM C — ENHANCED DECAY
# ================================================

def system_c_predict(skill_timeline, job_description, github_username=""):
    """
    System C - Multi source decay with GitHub signals
    """
    from github_signal import extract_github_signals, combine_signals
    from decay_model import get_skill_category

    # Try to get GitHub signals
    if github_username:
        try:
            github_timeline = extract_github_signals(github_username)
            if github_timeline:
                combined = combine_signals(skill_timeline, github_timeline)
                profile = {}
                for skill, data in combined.items():
                    profile[skill] = {
                        "freshness_score": data['final_score'],
                        "strength": get_strength(data['final_score'])
                    }
            else:
                profile = apply_decay_to_profile(skill_timeline)
        except Exception as e:
            print(f"GitHub error: {e}")
            profile = apply_decay_to_profile(skill_timeline)
    else:
        profile = apply_decay_to_profile(skill_timeline)

    required = extract_required_skills(job_description)
    if not required:
        return False

    match = calculate_match_score(profile, required)
    coverage = (match['total_matched'] / match['total_required']
                if match['total_required'] > 0 else 0)
    avg_freshness = match['match_percentage'] / 100

    return (avg_freshness >= GROUND_TRUTH_RULES["suitability_threshold"]
            and coverage >= GROUND_TRUTH_RULES["skill_coverage_threshold"])

# ================================================
# EVALUATE ONE SYSTEM
# ================================================

def evaluate_system(system_fn, system_name, use_github=False):
    correct = 0
    total = 0
    true_positives = 0
    true_negatives = 0
    false_positives = 0
    false_negatives = 0
    all_scores = []

    for candidate in SYNTHETIC_CANDIDATES:
        for job in TEST_JOBS:
            if use_github:
                predicted = system_fn(
                    candidate['skill_timeline'],
                    job['description'],
                    candidate.get('github_username', '')
                )
            else:
                predicted = system_fn(
                    candidate['skill_timeline'],
                    job['description']
                )

            actual = candidate['ground_truth'].get(job['title'], False)
            total += 1
            all_scores.append(1 if predicted == actual else 0)

            if predicted == actual:
                correct += 1
                if actual:
                    true_positives += 1
                else:
                    true_negatives += 1
            else:
                if predicted and not actual:
                    false_positives += 1
                else:
                    false_negatives += 1

    accuracy = correct / total if total > 0 else 0
    precision = (true_positives / (true_positives + false_positives)
                 if (true_positives + false_positives) > 0 else 0)
    recall = (true_positives / (true_positives + false_negatives)
              if (true_positives + false_negatives) > 0 else 0)
    f1 = (2 * (precision * recall) / (precision + recall)
          if (precision + recall) > 0 else 0)

    return {
        "system": system_name,
        "accuracy": round(accuracy * 100, 1),
        "precision": round(precision * 100, 1),
        "recall": round(recall * 100, 1),
        "f1_score": round(f1 * 100, 1),
        "correct": correct,
        "total": total,
        "true_positives": true_positives,
        "true_negatives": true_negatives,
        "false_positives": false_positives,
        "false_negatives": false_negatives,
        "scores": all_scores
    }
# ================================================
# STATISTICAL SIGNIFICANCE TEST
# ================================================

def statistical_significance_test(result_a, result_b, label_b):
    """
    Paired t-test to check if improvement is statistically significant
    p < 0.05 means the improvement is not due to chance
    """
    scores_a = result_a['scores']
    scores_b = result_b['scores']

    t_stat, p_value = stats.ttest_rel(scores_a, scores_b)

    print(f"\nStatistical Significance: A vs {label_b}")
    print(f"  T-statistic : {round(t_stat, 4)}")
    print(f"  P-value     : {round(p_value, 4)}")

    if p_value < 0.05:
        print(f"  Result      : ✅ STATISTICALLY SIGNIFICANT (p < 0.05)")
        print(f"  Meaning     : Improvement is NOT due to chance")
    else:
        print(f"  Result      : ⚠️  Not statistically significant (p >= 0.05)")
        print(f"  Meaning     : Need more data to confirm improvement")

    return t_stat, p_value

# ================================================
# NDCG METRIC
# ================================================

def calculate_ndcg(candidate, k=3):
    """
    Calculate NDCG@K for one candidate
    Measures quality of job ranking
    """
    scores = []
    for job in TEST_JOBS:
        profile = apply_decay_to_profile(candidate['skill_timeline'])
        required = extract_required_skills(job['description'])
        if required:
            match = calculate_match_score(profile, required)
            scores.append((job['title'], match['match_percentage']))

    # Sort by score
    ranked = sorted(scores, key=lambda x: x[1], reverse=True)

    # Ground truth relevant jobs
    relevant = [j for j, v in candidate['ground_truth'].items() if v]

    # DCG
    dcg = 0
    for i, (job_title, _) in enumerate(ranked[:k]):
        relevance = 1 if job_title in relevant else 0
        dcg += relevance / math.log2(i + 2)

    # IDCG
    idcg = sum(1 / math.log2(i + 2) for i in range(min(len(relevant), k)))

    ndcg = dcg / idcg if idcg > 0 else 0
    return round(ndcg, 3)

# ================================================
# ABLATION STUDY
# ================================================

def ablation_study():
    """
    Test contribution of each component separately
    Shows which parts of model matter most
    """
    print("\n" + "=" * 70)
    print("ABLATION STUDY")
    print("=" * 70)
    print("Testing contribution of each component:\n")

    # Component 1 — No decay
    result_no_decay = evaluate_system(
        system_a_predict,
        "No Decay (Baseline)"
    )

    # Component 2 — Uniform decay (no skill categories)
    def uniform_decay_predict(skill_timeline, job_description):
        required = extract_required_skills(job_description)
        if not required:
            return False

        import math
        current_year = 2024
        total_score = 0
        matched = 0

        for skill in required:
            if skill in skill_timeline:
                years = current_year - skill_timeline[skill]
                score = math.exp(-0.2 * years)  # Same λ for all
                total_score += score
                matched += 1

        coverage = matched / len(required)
        avg_score = total_score / len(required)

        return (avg_score >= GROUND_TRUTH_RULES["suitability_threshold"]
                and coverage >= GROUND_TRUTH_RULES["skill_coverage_threshold"])

    result_uniform = evaluate_system(
        uniform_decay_predict,
        "Uniform Decay (no categories)"
    )

    # Component 3 — Full decay with categories
    result_full = evaluate_system(
        system_b_predict,
        "Category Decay (full model)"
    )

    print(f"{'Component':<35} {'Accuracy':>10} {'F1':>10}")
    print("-" * 60)
    for r in [result_no_decay, result_uniform, result_full]:
        print(f"{r['system']:<35} {r['accuracy']:>9}% {r['f1_score']:>9}%")

    print()
    print("Interpretation:")
    diff_uniform = round(result_uniform['f1_score'] - result_no_decay['f1_score'], 1)
    diff_full = round(result_full['f1_score'] - result_uniform['f1_score'], 1)
    print(f"  Adding decay (uniform):     {diff_uniform:+.1f}% F1")
    print(f"  Adding skill categories:    {diff_full:+.1f}% F1")

# ================================================
# NDCG EVALUATION
# ================================================

def ndcg_evaluation():
    """Calculate average NDCG across all candidates"""
    print("\n" + "=" * 70)
    print("NDCG EVALUATION (Ranking Quality)")
    print("=" * 70)

    ndcg_scores = []
    for candidate in SYNTHETIC_CANDIDATES:
        ndcg = calculate_ndcg(candidate, k=3)
        ndcg_scores.append(ndcg)

    avg_ndcg = sum(ndcg_scores) / len(ndcg_scores)
    print(f"\nNDCG@3 scores per candidate:")
    for i, (c, s) in enumerate(zip(SYNTHETIC_CANDIDATES, ndcg_scores)):
        print(f"  {c['name']:<35} NDCG@3: {s}")

    print(f"\nAverage NDCG@3: {round(avg_ndcg, 3)}")
    print("(1.0 = perfect ranking, 0.0 = worst ranking)")

# ================================================
# MAIN
# ================================================

if __name__ == "__main__":
    print("=" * 70)
    print("SKILLTEMPUS — SYNTHETIC EVALUATION")
    print("=" * 70)
    print(f"Candidates : {len(SYNTHETIC_CANDIDATES)}")
    print(f"Jobs       : {len(TEST_JOBS)}")
    print(f"Test cases : {len(SYNTHETIC_CANDIDATES) * len(TEST_JOBS)}")
    print()

    # Run all 3 systems
    result_a = evaluate_system(system_a_predict, "A - Static Baseline")
    result_b = evaluate_system(system_b_predict, "B - CV Decay Only")
    result_c = evaluate_system(
        system_c_predict,
        "C - Multi Source (CV + GitHub)",
        use_github=True  # ← Now uses real GitHub!
    )

    # Main results table
    print(f"\n{'System':<25} {'Accuracy':>10} {'Precision':>10} "
          f"{'Recall':>10} {'F1 Score':>10}")
    print("-" * 70)
    for r in [result_a, result_b, result_c]:
        print(f"{r['system']:<25} {r['accuracy']:>9}% "
              f"{r['precision']:>9}% {r['recall']:>9}% "
              f"{r['f1_score']:>9}%")

    # Detailed breakdown
    print("\n" + "=" * 70)
    print("DETAILED BREAKDOWN")
    print("=" * 70)
    for r in [result_a, result_b, result_c]:
        print(f"\n{r['system']}")
        print(f"  Correct        : {r['correct']}/{r['total']}")
        print(f"  True Positives : {r['true_positives']}")
        print(f"  True Negatives : {r['true_negatives']}")
        print(f"  False Positives: {r['false_positives']} ← overconfident")
        print(f"  False Negatives: {r['false_negatives']} ← missed matches")

    # Key findings
    print("\n" + "=" * 70)
    print("KEY FINDINGS")
    print("=" * 70)
    print(f"  B vs A accuracy : {result_b['accuracy'] - result_a['accuracy']:+.1f}%")
    print(f"  C vs A accuracy : {result_c['accuracy'] - result_a['accuracy']:+.1f}%")
    print(f"  B vs A F1       : {result_b['f1_score'] - result_a['f1_score']:+.1f}%")
    print(f"  C vs A F1       : {result_c['f1_score'] - result_a['f1_score']:+.1f}%")

    # Statistical significance
    print("\n" + "=" * 70)
    print("STATISTICAL SIGNIFICANCE TESTS")
    print("=" * 70)
    statistical_significance_test(result_a, result_b, "System B")
    statistical_significance_test(result_a, result_c, "System C")

    # NDCG
    ndcg_evaluation()

    # Ablation study
    ablation_study()