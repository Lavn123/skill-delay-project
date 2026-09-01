from synthetic_evaluation import (
    SYNTHETIC_CANDIDATES, TEST_JOBS,
    system_a_predict, system_c_predict
)
from statsmodels.stats.contingency_tables import mcnemar

a_preds = []
c_preds = []

for candidate in SYNTHETIC_CANDIDATES:
    for job in TEST_JOBS:
        pred_a = system_a_predict(
            candidate['skill_timeline'],
            job['description']
        )
        pred_c = system_c_predict(
            candidate['skill_timeline'],
            job['description'],
            candidate.get('github_timeline', {})
        )
        actual = candidate['ground_truth'].get(job['title'], False)
        a_preds.append(1 if pred_a == actual else 0)
        c_preds.append(1 if pred_c == actual else 0)

b = sum(1 for x,y in zip(a_preds, c_preds) if x==1 and y==0)
c_val = sum(1 for x,y in zip(a_preds, c_preds) if x==0 and y==1)

print(f"Discordant pairs: b={b}, c={c_val}")
print(f"Total test cases: {len(a_preds)}")

table = [[0, b], [c_val, 0]]
result = mcnemar(table, exact=True)
print(f"McNemar p-value: {result.pvalue:.4f}")

if result.pvalue < 0.05:
    print("Result: STATISTICALLY SIGNIFICANT (p < 0.05)")
else:
    print("Result: Not statistically significant (p >= 0.05)")