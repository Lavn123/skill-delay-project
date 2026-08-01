import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-job-matches',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="min-height:100vh; background:var(--gradient-bg); padding:50px 20px;">
      <div style="max-width:900px; margin:0 auto;">

        <!-- Header -->
        <div class="animate-fade-up" style="margin-bottom:32px;">
          <h2 style="font-size:32px; font-weight:700; letter-spacing:-0.5px;
                     color:var(--text-primary); margin-bottom:8px;">
            💼 Job Match Results
          </h2>
          <p style="color:var(--text-secondary); font-size:15px;">
            {{ matches.length }} roles matched based on your actual skill freshness
          </p>
        </div>

        <!-- No Data -->
        <div *ngIf="!matches.length"
             class="glass-card animate-fade-up"
             style="padding:60px; text-align:center;">
          <div style="font-size:50px; margin-bottom:16px;">💼</div>
          <p style="color:var(--text-secondary); font-size:16px; margin-bottom:20px;">
            No results yet. Upload your CV to get matched!
          </p>
          <a routerLink="/upload" class="btn-primary" style="text-decoration:none;">
            Upload CV →
          </a>
        </div>

        <!-- Match Cards -->
        <div *ngFor="let job of matches; let i = index"
             class="glass-card animate-fade-up"
             style="padding:28px; margin-bottom:20px;"
             [style.animation-delay]="i * 0.05 + 's'">

          <!-- Header Row -->
          <div style="display:flex; justify-content:space-between;
                      align-items:flex-start; margin-bottom:20px;">
            <div>
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <span style="background:var(--color-primary-light);
                             color:var(--color-primary); font-size:11px;
                             padding:3px 10px; border-radius:var(--radius-full);
                             font-weight:600;">
                  #{{ i + 1 }} Match
                </span>
                <span *ngIf="i === 0"
                      style="background:var(--color-success-bg);
                             color:var(--color-success); font-size:11px;
                             padding:3px 10px; border-radius:var(--radius-full);
                             font-weight:600;">
                  ⭐ Best Match
                </span>
              </div>
              <h3 style="font-size:20px; font-weight:700; color:var(--text-primary);
                         margin:0 0 4px; letter-spacing:-0.3px;">
                {{ job.job_title }}
              </h3>
              <p style="color:var(--text-muted); font-size:13px; margin:0;">
                {{ job.total_matched }} of {{ job.total_required }} required skills matched
              </p>
            </div>

            <!-- Score Circle -->
            <div style="position:relative; width:72px; height:72px; flex-shrink:0;">
              <svg width="72" height="72" viewBox="0 0 72 72"
                   style="transform:rotate(-90deg);">
                <circle cx="36" cy="36" r="28"
                        fill="none" stroke="rgba(0,0,0,0.06)"
                        stroke-width="6"/>
                <circle cx="36" cy="36" r="28" fill="none"
                        [attr.stroke]="getScoreColor(job.match_percentage)"
                        stroke-width="6" stroke-linecap="round"
                        [attr.stroke-dasharray]="getCircle(job.match_percentage)"/>
              </svg>
              <div style="position:absolute; inset:0; display:flex;
                          align-items:center; justify-content:center;
                          flex-direction:column;">
                <span [style.color]="getScoreColor(job.match_percentage)"
                      style="font-size:15px; font-weight:700; line-height:1;">
                  {{ job.match_percentage }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div style="background:rgba(0,0,0,0.06); border-radius:var(--radius-full);
                      height:6px; overflow:hidden; margin-bottom:20px;">
            <div [style.width.%]="job.match_percentage"
                 [style.background]="getScoreColor(job.match_percentage)"
                 style="height:100%; border-radius:var(--radius-full);
                        transition:width 1s ease;">
            </div>
          </div>

          <!-- Matched Skills -->
          <div *ngIf="job.matched_skills?.length" style="margin-bottom:16px;">
            <p style="font-size:12px; font-weight:600; color:var(--color-success);
                      margin:0 0 10px; text-transform:uppercase; letter-spacing:0.5px;">
              ✅ Matched Skills
            </p>
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
              <div *ngFor="let s of job.matched_skills"
                   [class]="'badge badge-' + s.strength.toLowerCase()"
                   style="padding:5px 12px; border-radius:var(--radius-full);
                          font-size:12px; display:flex; align-items:center; gap:4px;">
                {{ s.skill }}
                <span style="opacity:0.7;">· {{ (s.freshness * 100).toFixed(0) }}%</span>
              </div>
            </div>
          </div>

          <!-- Missing Skills -->
          <div *ngIf="job.missing_skills?.length" style="margin-bottom:16px;">
            <p style="font-size:12px; font-weight:600; color:var(--color-danger);
                      margin:0 0 10px; text-transform:uppercase; letter-spacing:0.5px;">
              ❌ Missing Skills
            </p>
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
              <span *ngFor="let s of job.missing_skills"
                    style="background:var(--color-danger-bg);
                           color:var(--color-danger); padding:5px 12px;
                           border-radius:var(--radius-full); font-size:12px;
                           font-weight:500;">
                {{ s }}
              </span>
            </div>
          </div>

          <!-- Recommendation -->
          <div style="background:rgba(79,70,229,0.06);
                      border-left:3px solid var(--color-primary);
                      border-radius:0 var(--radius-md) var(--radius-md) 0;
                      padding:12px 16px;">
            <p style="margin:0; font-size:13px; color:var(--text-secondary);
                      line-height:1.6;">
              💡 <strong style="color:var(--text-primary);">Tip:</strong>
              {{ getRecommendation(job) }}
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

  getScoreColor(score: number): string {
    if (score >= 60) return '#059669';
    if (score >= 35) return '#4f46e5';
    return '#dc2626';
  }

  getCircle(score: number): string {
    const circumference = 2 * Math.PI * 28;
    const filled = (score / 100) * circumference;
    return `${filled} ${circumference}`;
  }

  getRecommendation(job: any): string {
    if (!job.missing_skills?.length) {
      return 'You meet all requirements — apply with confidence!';
    }
    if (job.match_percentage >= 50) {
      return `Strong match! Brush up on ${job.missing_skills.slice(0, 2).join(', ')} to strengthen your application.`;
    }
    return `Upskill in ${job.missing_skills.slice(0, 3).join(', ')} to improve your chances.`;
  }
}