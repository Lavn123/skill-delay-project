import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-job-matches',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="min-height:100vh; background:linear-gradient(135deg, #f5f7fa, #e8f0fe);
                padding:50px 20px;">
      <div style="max-width:850px; margin:0 auto;">

        <h2 style="color:#1F3864; font-size:32px; margin-bottom:8px;">
          💼 Job Match Results
        </h2>
        <p style="color:#777; margin-bottom:30px;">
          {{ matches.length }} jobs matched based on your current skill freshness
        </p>

        <div *ngIf="!matches.length"
             style="text-align:center; padding:60px; background:white;
                    border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <div style="font-size:50px; margin-bottom:16px;">💼</div>
          <p style="color:#777; font-size:16px; margin-bottom:20px;">
            No results yet. Upload your CV first!
          </p>
          <a routerLink="/upload">
            <button style="background:linear-gradient(135deg, #2E75B6, #1F3864);
                           color:white; padding:12px 30px; border:none;
                           border-radius:25px; cursor:pointer; font-size:15px;">
              Upload CV →
            </button>
          </a>
        </div>

        <div *ngFor="let job of matches; let i = index"
             style="background:white; border-radius:16px; padding:24px 28px;
                    margin-bottom:20px; box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <div style="display:flex; justify-content:space-between; 
                      align-items:center; margin-bottom:16px;">
            <div>
              <span style="background:#f0f4ff; color:#2E75B6; font-size:12px;
                           padding:3px 10px; border-radius:10px; font-weight:600;">
                #{{ i + 1 }} Match
              </span>
              <h3 style="color:#1F3864; margin:8px 0 4px; font-size:20px;">
                {{ job.job_title }}
              </h3>
              <p style="color:#777; margin:0; font-size:14px;">
                {{ job.total_matched }} of {{ job.total_required }} required skills matched
              </p>
            </div>
            <div style="text-align:center;">
              <div [style.background]="getScoreGradient(job.match_percentage)"
                   style="width:70px; height:70px; border-radius:50%;
                          display:flex; align-items:center; justify-content:center;
                          color:white; font-size:18px; font-weight:800;
                          box-shadow:0 4px 12px rgba(0,0,0,0.15);">
                {{ job.match_percentage }}%
              </div>
            </div>
          </div>

          <!-- Progress bar -->
          <div style="background:#f0f0f0; border-radius:10px; 
                      height:8px; overflow:hidden; margin-bottom:16px;">
            <div [style.width.%]="job.match_percentage"
                 [style.background]="getScoreGradient(job.match_percentage)"
                 style="height:100%; border-radius:10px; transition:width 0.5s;">
            </div>
          </div>

          <!-- Matched skills -->
          <div *ngIf="job.matched_skills?.length" style="margin-bottom:12px;">
            <p style="font-size:13px; font-weight:600; color:#28a745; margin:0 0 8px;">
              ✅ Matched Skills
            </p>
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
              <span *ngFor="let s of job.matched_skills"
                    [style.background]="getStrengthBg(s.strength)"
                    [style.color]="getStrengthColor(s.strength)"
                    style="padding:5px 12px; border-radius:20px; 
                           font-size:13px; font-weight:500; border:1px solid;">
                {{ s.skill }} · {{ (s.freshness * 100).toFixed(0) }}%
              </span>
            </div>
          </div>

          <!-- Missing skills -->
          <div *ngIf="job.missing_skills?.length" style="margin-bottom:12px;">
            <p style="font-size:13px; font-weight:600; color:#dc3545; margin:0 0 8px;">
              ❌ Missing Skills
            </p>
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
              <span *ngFor="let s of job.missing_skills"
                    style="background:#fff5f5; color:#dc3545; padding:5px 12px;
                           border-radius:20px; font-size:13px; 
                           border:1px solid #ffcccc;">
                {{ s }}
              </span>
            </div>
          </div>

          <!-- Recommendation -->
          <div style="background:#f8f9ff; border-radius:10px; padding:12px 16px;
                      border-left:4px solid #2E75B6;">
            <p style="margin:0; font-size:14px; color:#555;">
              💡 <strong>Tip:</strong> {{ getRecommendation(job) }}
            </p>
          </div>

        </div>
      </div>
    </div>
  `
})
export class JobMatchesComponent implements OnInit {
  matches: any[] = [];

  ngOnInit() {
    const stored = localStorage.getItem('jobMatches');
    if (!stored) return;
    const data = JSON.parse(stored);
    this.matches = data?.data?.matches || data?.matches || [];
  }

  getScoreGradient(score: number): string {
    if (score >= 60) return 'linear-gradient(135deg, #28a745, #20c997)';
    if (score >= 35) return 'linear-gradient(135deg, #ffc107, #fd7e14)';
    return 'linear-gradient(135deg, #dc3545, #e83e8c)';
  }

  getStrengthColor(strength: string): string {
    switch (strength) {
      case 'Strong': return '#28a745';
      case 'Moderate': return '#2E75B6';
      case 'Weak': return '#856404';
      default: return '#dc3545';
    }
  }

  getStrengthBg(strength: string): string {
    switch (strength) {
      case 'Strong': return '#f0fff4';
      case 'Moderate': return '#f0f4ff';
      case 'Weak': return '#fffbf0';
      default: return '#fff5f5';
    }
  }

  getRecommendation(job: any): string {
    if (job.missing_skills?.length === 0) {
      return 'You meet all requirements — apply with confidence!';
    }
    if (job.match_percentage >= 50) {
      return `Strong match! Brush up on ${job.missing_skills.slice(0, 2).join(', ')} to strengthen your application.`;
    }
    return `Upskill in ${job.missing_skills.slice(0, 3).join(', ')} to improve your chances for this role.`;
  }
}