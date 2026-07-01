import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-job-matches',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="max-width:800px; margin:50px auto; padding:20px;">
      <h2 style="color:#1F3864;">💼 Job Match Results</h2>
      <p style="color:#555;">{{ matches.length }} jobs found based on your skill profile</p>

      <div *ngIf="matches.length === 0" style="text-align:center; padding:40px;">
        <p>No results yet.</p>
        <a routerLink="/upload">
          <button style="background:#2E75B6; color:white; padding:10px 20px;
                         border:none; border-radius:8px; cursor:pointer;">
            Upload CV First
          </button>
        </a>
      </div>

      <div *ngFor="let job of matches; let i = index"
           style="background:white; border:1px solid #ddd; border-radius:10px;
                  padding:20px; margin-bottom:20px; 
                  box-shadow:0 2px 4px rgba(0,0,0,0.1)">

        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="color:#1F3864; margin:0;">
            #{{ i + 1 }} {{ job.job_title }}
          </h3>
          <span [style.background]="getScoreColor(job.match_percentage)"
                style="color:white; padding:5px 15px; 
                       border-radius:20px; font-weight:bold;">
            {{ job.match_percentage }}%
          </span>
        </div>

        <p style="color:#555; margin:10px 0;">
          Matched {{ job.total_matched }}/{{ job.total_required }} skills
        </p>

        <div *ngIf="job.matched_skills?.length">
          <strong>✅ Matched Skills:</strong>
          <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;">
            <span *ngFor="let s of job.matched_skills"
                  [style.background]="getStrengthColor(s.strength)"
                  style="color:white; padding:4px 12px; 
                         border-radius:12px; font-size:13px;">
              {{ s.skill }} · {{ s.strength }} · {{ (s.freshness * 100).toFixed(0) }}%
            </span>
          </div>
        </div>

        <div *ngIf="job.missing_skills?.length" style="margin-top:12px;">
          <strong>❌ Missing Skills:</strong>
          <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;">
            <span *ngFor="let s of job.missing_skills"
                  style="background:#dc3545; color:white; padding:4px 12px;
                         border-radius:12px; font-size:13px;">
              {{ s }}
            </span>
          </div>
        </div>

        <div style="margin-top:12px; padding-top:12px; border-top:1px solid #eee;">
          <strong>💡 Recommendation: </strong>
          <span style="color:#555; font-size:14px;">
            {{ getRecommendation(job) }}
          </span>
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
    this.matches = data?.data?.matches ||
                   data?.matches ||
                   [];
  }

  getScoreColor(score: number): string {
    if (score >= 60) return '#28a745';
    if (score >= 40) return '#ffc107';
    return '#dc3545';
  }

  getStrengthColor(strength: string): string {
    switch (strength) {
      case 'Strong': return '#28a745';
      case 'Moderate': return '#2E75B6';
      case 'Weak': return '#ffc107';
      default: return '#dc3545';
    }
  }

  getRecommendation(job: any): string {
    if (job.missing_skills?.length === 0) {
      return 'You meet all the skill requirements for this role!';
    }
    return `Upskill in ${job.missing_skills.join(', ')} to strengthen your application.`;
  }
}