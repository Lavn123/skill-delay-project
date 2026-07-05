import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-skill-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="min-height:100vh; background:linear-gradient(135deg, #f5f7fa, #e8f0fe);
                padding:50px 20px;">
      <div style="max-width:800px; margin:0 auto;">

        <h2 style="color:#1F3864; font-size:32px; margin-bottom:8px;">
          📊 Skill Freshness Dashboard
        </h2>
        <p style="color:#777; margin-bottom:30px;">
          Your skills ranked by freshness score — based on when you last used them
        </p>

        <div *ngIf="!skills.length" 
             style="text-align:center; padding:60px; background:white;
                    border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <div style="font-size:50px; margin-bottom:16px;">📄</div>
          <p style="color:#777; font-size:16px; margin-bottom:20px;">
            No skill data yet. Upload your CV first!
          </p>
          <a routerLink="/upload">
            <button style="background:linear-gradient(135deg, #2E75B6, #1F3864);
                           color:white; padding:12px 30px; border:none;
                           border-radius:25px; cursor:pointer; font-size:15px;">
              Upload CV →
            </button>
          </a>
        </div>

        <!-- Summary Cards -->
        <div *ngIf="skills.length" 
             style="display:flex; gap:16px; margin-bottom:24px; flex-wrap:wrap;">
          <div style="background:white; padding:20px 24px; border-radius:12px;
                      flex:1; min-width:140px; text-align:center;
                      box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <div style="font-size:28px; font-weight:800; color:#1F3864;">
              {{ skills.length }}
            </div>
            <div style="color:#777; font-size:13px;">Total Skills</div>
          </div>
          <div style="background:white; padding:20px 24px; border-radius:12px;
                      flex:1; min-width:140px; text-align:center;
                      box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <div style="font-size:28px; font-weight:800; color:#28a745;">
              {{ strongCount }}
            </div>
            <div style="color:#777; font-size:13px;">Strong Skills</div>
          </div>
          <div style="background:white; padding:20px 24px; border-radius:12px;
                      flex:1; min-width:140px; text-align:center;
                      box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <div style="font-size:28px; font-weight:800; color:#dc3545;">
              {{ outdatedCount }}
            </div>
            <div style="color:#777; font-size:13px;">Outdated Skills</div>
          </div>
          <div style="background:white; padding:20px 24px; border-radius:12px;
                      flex:1; min-width:140px; text-align:center;
                      box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <div style="font-size:28px; font-weight:800; color:#2E75B6;">
              {{ avgScore }}%
            </div>
            <div style="color:#777; font-size:13px;">Avg Freshness</div>
          </div>
        </div>

        <!-- Skill Cards -->
        <div *ngFor="let s of skills"
             style="background:white; border-radius:12px; padding:20px 24px;
                    margin-bottom:12px; box-shadow:0 4px 20px rgba(0,0,0,0.06);">

          <div style="display:flex; justify-content:space-between; 
                      align-items:center; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:18px;">{{ getSkillIcon(s.category) }}</span>
              <strong style="text-transform:capitalize; font-size:16px; color:#1F3864;">
                {{ s.name }}
              </strong>
              <span style="font-size:12px; padding:2px 8px; border-radius:10px;
                           background:#f0f4ff; color:#2E75B6;">
                {{ s.category }}
              </span>
            </div>
            <span [style.color]="getStrengthColor(s.strength)"
                  style="font-weight:700; font-size:15px;">
              {{ s.strength }} · {{ (s.freshness_score * 100).toFixed(0) }}%
            </span>
          </div>

          <div style="background:#f0f0f0; border-radius:10px; 
                      height:10px; overflow:hidden;">
            <div [style.width.%]="s.freshness_score * 100"
                 [style.background]="getStrengthColor(s.strength)"
                 style="height:100%; border-radius:10px;
                        transition:width 0.5s ease;">
            </div>
          </div>

          <div style="display:flex; justify-content:space-between;
                      font-size:12px; color:#999; margin-top:6px;">
            <span>Last used: {{ s.last_used }}</span>
            <span *ngIf="s.strength === 'Outdated'" style="color:#dc3545;">
              ⚠️ Consider refreshing this skill
            </span>
            <span *ngIf="s.strength === 'Strong'" style="color:#28a745;">
              ✅ Keep it up!
            </span>
          </div>

        </div>

      </div>
    </div>
  `
})
export class SkillDashboardComponent implements OnInit {
  skills: any[] = [];
  strongCount = 0;
  outdatedCount = 0;
  avgScore = 0;

  ngOnInit() {
    const stored = localStorage.getItem('skillProfile');
    if (!stored) return;

    const profile = JSON.parse(stored);
    this.skills = Object.entries(profile)
      .map(([name, data]: [string, any]) => ({ name, ...data }))
      .sort((a, b) => b.freshness_score - a.freshness_score);

    this.strongCount = this.skills.filter(s => s.strength === 'Strong').length;
    this.outdatedCount = this.skills.filter(s => s.strength === 'Outdated').length;
    this.avgScore = Math.round(
      this.skills.reduce((sum, s) => sum + s.freshness_score, 0) /
      this.skills.length * 100
    );
  }

  getStrengthColor(strength: string): string {
    switch (strength) {
      case 'Strong': return '#28a745';
      case 'Moderate': return '#2E75B6';
      case 'Weak': return '#ffc107';
      default: return '#dc3545';
    }
  }

  getSkillIcon(category: string): string {
    switch (category) {
      case 'fast': return '⚡';
      case 'medium': return '🔧';
      case 'slow': return '🏛️';
      default: return '💻';
    }
  }
}