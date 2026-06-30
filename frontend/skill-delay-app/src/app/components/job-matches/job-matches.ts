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

      <div *ngIf="!matches.length" style="text-align:center; padding:40px;">
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
                  padding:20px; margin-bottom:20px; box-shadow:0 2px 4px rgba(0,0,0,0.1)">
        
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="color:#1F3864; margin:0;">
            #{{ i + 1 }} {{ job.job_title }}
          </h3>
          <span [style.background]="getScoreColor(job.match_percentage)"
                style="color:white; padding:5px 15px; border-radius:20px; font-weight:bold;">
            {{ job.match_percentage }}%
          </span>
        </div>

        <p style="color:#555; margin:10px 0;">
          Matched {{ job.total_matched }}/{{ job.total_required }} skills
        </p>

        <div *ngIf="job.matched_skills?.length">
          <strong>✅ Matched Skills:</strong>
          <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:5px;">
            <span *ngFor="let s of job.matched_skills"
                  [style.background]="getStrengthColor(s.strength)"
                  style="color:white; padding:3px 10px; border-radius:12px; font-size:13px;">
              {{ s.skill }} ({{ s.strength }})
            </span>
          </div>
        </div>

        <div *ngIf="job.missing_skills?.length" style="margin-top:10px;">
          <strong>❌ Missing Skills:</strong>
          <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:5px;">
            <span *ngFor="let s of job.missing_skills"
                  style="background:#dc3545; color:white; padding:3px 10px; 
                         border-radius:12px; font-size:13px;">
              {{ s }}
            </span>
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
    if (stored) {
      const data = JSON.parse(stored);
      this.matches = data.data?.matches || [];
    }
  }

  getScoreColor(score: number): string {
    if (score >= 70) return '#28a745';
    if (score >= 40) return '#ffc107';
    return '#dc3545';
  }

  getStrengthColor(strength: string): string {
    switch(strength) {
      case 'Strong': return '#28a745';
      case 'Moderate': return '#2E75B6';
      case 'Weak': return '#ffc107';
      default: return '#dc3545';
    }
  }
}