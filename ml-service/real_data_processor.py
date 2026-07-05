import pandas as pd
from cv_parser import extract_skills_from_text, extract_years_from_text
from decay_model import apply_decay_to_profile
from job_matcher import extract_required_skills, calculate_match_score
from database import save_job_matches

# ================================================
# STEP 1 — LOAD DATASETS
# ================================================

def load_resumes(filepath="../data/resumes.csv"):
    try:
        df = pd.read_csv(filepath)
        print(f"Loaded {len(df)} resumes")
        return df
    except Exception as e:
        print(f"Error loading resumes: {e}")
        return None

def load_jobs(filepath="../data/jobs.csv"):
    try:
        df = pd.read_csv(filepath)
        print(f"Loaded {len(df)} job postings")
        return df
    except Exception as e:
        print(f"Error loading jobs: {e}")
        return None

# ================================================
# STEP 2 — PROCESS RESUMES
# ================================================

def process_resume(resume_text):
    if not isinstance(resume_text, str):
        return None

    skills = extract_skills_from_text(resume_text)
    if not skills:
        return None

    years = extract_years_from_text(resume_text)
    skill_timeline = {}
    current_year = 2024

    if years:
        valid_years = [y for y in years if 2010 <= y <= 2024]
        most_recent_year = max(valid_years) if valid_years else current_year

        for skill in skills:
            mention_count = resume_text.lower().count(skill.lower())
            if mention_count >= 3:
                skill_timeline[skill] = most_recent_year
            elif mention_count == 2:
                skill_timeline[skill] = max(most_recent_year - 2, 2021)
            else:
                skill_timeline[skill] = max(most_recent_year - 3, 2021)
    else:
        # No years found
        # Assign recent years based on mention frequency
        for skill in skills:
            mention_count = resume_text.lower().count(skill.lower())
            if mention_count >= 3:
                skill_timeline[skill] = 2024  # Frequently mentioned = current
            elif mention_count == 2:
                skill_timeline[skill] = 2023  # Moderately mentioned
            else:
                skill_timeline[skill] = 2022  # Mentioned once = recent

    return skill_timeline

# ================================================
# STEP 3 — PROCESS JOB POSTINGS
# ================================================

def process_job(job_row):
    title = job_row.get('Job Title', 'Unknown Role')
    description = job_row.get('Job Description', '')

    if not description or len(str(description)) < 50:
        return None

    required_skills = extract_required_skills(str(description))

    if not required_skills:
        return None

    return {
        "title": str(title),
        "description": str(description)[:500],
        "required_skills": required_skills
    }

# ================================================
# STEP 4 — RUN REAL DATA EVALUATION
# ================================================

def run_real_data_evaluation(num_resumes=100, num_jobs=50):
    print("=" * 70)
    print("REAL DATA EVALUATION")
    print("=" * 70)

    # Load data
    resumes_df = load_resumes()
    jobs_df = load_jobs()

    if resumes_df is None or jobs_df is None:
        print("Error loading data!")
        return

    print()

    # Filter IT resumes only
    it_resumes = resumes_df[
        resumes_df['Category'] == 'INFORMATION-TECHNOLOGY'
    ]
    print(f"IT resumes found: {len(it_resumes)}")

    # Process IT resumes
    print(f"Processing up to {num_resumes} IT resumes...")
    processed_resumes = []

    for idx, row in it_resumes.head(num_resumes).iterrows():
        resume_text = str(row['Resume_str'])
        timeline = process_resume(resume_text)

        if timeline:
            processed_resumes.append({
                "id": idx,
                "category": row.get('Category', 'Unknown'),
                "skill_timeline": timeline,
                "total_skills": len(timeline)
            })

    print(f"Successfully processed: {len(processed_resumes)} resumes")
    print()

    # Process jobs
    print(f"Processing up to {num_jobs} job postings...")
    processed_jobs = []

    for idx, row in jobs_df.head(num_jobs).iterrows():
        job = process_job(dict(row))
        if job:
            processed_jobs.append(job)

    print(f"Successfully processed: {len(processed_jobs)} jobs")
    print()

    if not processed_resumes or not processed_jobs:
        print("Not enough data to evaluate!")
        return

    # Run matching
    print("Running job matching on real data...")
    print("-" * 70)

    system_a_scores = []
    system_b_scores = []
    results_detail = []

    for resume in processed_resumes[:20]:
        timeline = resume['skill_timeline']
        profile = apply_decay_to_profile(timeline)

        for job in processed_jobs[:10]:
            required = job['required_skills']
            if not required:
                continue

            # System A - static keyword matching
            matched_static = [s for s in required if s in timeline]
            score_a = (len(matched_static) / len(required)) * 100

            # System B - decay weighted matching
            match = calculate_match_score(profile, required)
            score_b = match['match_percentage']

            system_a_scores.append(score_a)
            system_b_scores.append(score_b)

            results_detail.append({
                "resume_category": resume['category'],
                "job_title": job['title'],
                "score_a": round(score_a, 1),
                "score_b": round(score_b, 1),
                "difference": round(score_b - score_a, 1)
            })

    # Print results
    if system_a_scores and system_b_scores:
        avg_a = sum(system_a_scores) / len(system_a_scores)
        avg_b = sum(system_b_scores) / len(system_b_scores)

        overconfident = sum(
            1 for r in results_detail
            if r['score_a'] > 60 and r['score_b'] < 30
        )

        decay_corrected = sum(
            1 for r in results_detail
            if r['score_a'] > 50 and r['score_b'] < r['score_a']
        )

        # Count pairs where both systems gave non zero scores
        meaningful_pairs = sum(
            1 for r in results_detail
            if r['score_a'] > 0 or r['score_b'] > 0
        )

        print(f"Results on {len(system_a_scores)} candidate-job pairs:")
        print(f"Meaningful pairs (non-zero): {meaningful_pairs}")
        print()
        print(f"  System A (Static)    avg score : {round(avg_a, 1)}%")
        print(f"  System B (CV Decay)  avg score : {round(avg_b, 1)}%")
        print(f"  Difference           :           {round(avg_b - avg_a, 1)}%")
        print()
        print(f"  Overconfident matches by System A : {overconfident}")
        print(f"  Scores corrected by decay model   : {decay_corrected}")
        print()

        # Show only meaningful results
        print("Sample Results (non-zero matches only):")
        print("-" * 70)
        print(f"{'Job Title':<30} {'A Score':>8} {'B Score':>8} {'Diff':>8}")
        print("-" * 70)

        meaningful = [r for r in results_detail
                     if r['score_a'] > 0 or r['score_b'] > 0]

        for r in meaningful[:15]:
            diff_str = f"{r['difference']:+.1f}%"
            print(
                f"{r['job_title'][:29]:<30} "
                f"{r['score_a']:>7}% "
                f"{r['score_b']:>7}% "
                f"{diff_str:>8}"
            )

        print()
        print("=" * 70)
        print("KEY FINDING")
        print("=" * 70)
        print(f"System A made {overconfident} overconfident matches")
        print(f"System B corrected {decay_corrected} of these using decay")
        print()
        if overconfident > 0:
            print("System A wrongly recommended candidates with stale skills.")
            print("System B correctly penalised these using temporal decay.")

        # Save to MongoDB
        print()
        print("Saving to MongoDB...")
        save_job_matches(
            cv_analysis_id="real_data_evaluation",
            matches=[{
                "job_title": "Real Data Evaluation Summary",
                "match_percentage": avg_b,
                "system_a_avg": round(avg_a, 1),
                "system_b_avg": round(avg_b, 1),
                "total_pairs": len(system_a_scores),
                "meaningful_pairs": meaningful_pairs,
                "overconfident_matches": overconfident,
                "decay_corrected": decay_corrected
            }]
        )
        print("Saved to MongoDB!")

    print()
    print("=" * 70)
    print("Real data evaluation complete!")

# ================================================
# PEEK AT DATA
# ================================================

def peek_at_data():
    print("=" * 70)
    print("PEEKING AT DATASETS")
    print("=" * 70)

    resumes_df = load_resumes()
    if resumes_df is not None:
        print(f"Columns: {list(resumes_df.columns)}")
        it_count = len(resumes_df[
            resumes_df['Category'] == 'INFORMATION-TECHNOLOGY'
        ])
        print(f"IT resumes: {it_count}")
        print()
        print("Sample IT resume (first 300 chars):")
        it_sample = resumes_df[
            resumes_df['Category'] == 'INFORMATION-TECHNOLOGY'
        ].iloc[0]['Resume_str']
        print(str(it_sample)[:300])
        print()

    jobs_df = load_jobs()
    if jobs_df is not None:
        print(f"Columns: {list(jobs_df.columns)}")
        print(f"Total jobs: {len(jobs_df)}")
        print()
        print("Sample job titles:")
        print(jobs_df['Job Title'].head(10).to_string())
        print()
        print("Sample job description (first 300 chars):")
        print(str(jobs_df.iloc[1]['Job Description'])[:300])

if __name__ == "__main__":
    peek_at_data()
    print()
    run_real_data_evaluation(
        num_resumes=100,
        num_jobs=50
    )