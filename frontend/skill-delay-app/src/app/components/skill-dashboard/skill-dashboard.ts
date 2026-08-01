import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-skill-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="min-height:100vh; background:var(--gradient-bg); padding:50px 20px;">
      <div style="max-width:1000px; margin:0 auto;">

        <!-- Header -->
        <div class="animate-fade-up" style="margin-bottom:32px;">
          <h2 style="font-size:32px; font-weight:700; letter-spacing:-0.5px;
                     color:var(--text-primary); margin-bottom:8px;">
            📊 Skill Freshness Dashboard
          </h2>
          <p style="color:var(--text-secondary); font-size:15px;">
            Temporal decay analysis of your skill profile
          </p>
        </div>

        <!-- No Data -->
        <div *ngIf="!skills.length"
             class="glass-card animate-fade-up"
             style="padding:60px; text-align:center;">
          <div style="font-size:50px; margin-bottom:16px;">📄</div>
          <p style="color:var(--text-secondary); font-size:16px; margin-bottom:20px;">
            No skill data yet. Upload your CV first!
          </p>
          <a routerLink="/upload" class="btn-primary" style="text-decoration:none;">
            Upload CV →
          </a>
        </div>

        <div *ngIf="skills.length">

          <!-- Summary Cards -->
          <div class="animate-fade-up-delay-1"
               style="display:grid; grid-template-columns:repeat(4,1fr);
                      gap:16px; margin-bottom:24px;">
            <div class="stat-card">
              <span class="stat-number">{{ skills.length }}</span>
              <div class="stat-label">Total Skills</div>
            </div>
            <div class="stat-card">
              <span class="stat-number" style="color:var(--color-success);">
                {{ strongCount }}
              </span>
              <div class="stat-label">Strong</div>
            </div>
            <div class="stat-card">
              <span class="stat-number" style="color:var(--color-warning);">
                {{ weakCount }}
              </span>
              <div class="stat-label">Needs Refresh</div>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{ avgScore }}%</span>
              <div class="stat-label">Avg Freshness</div>
            </div>
          </div>

          <!-- Timeline + Heatmap Row -->
          <div class="animate-fade-up-delay-2"
               style="display:grid; grid-template-columns:1fr 1fr;
                      gap:20px; margin-bottom:20px;">

            <!-- Timeline -->
            <div class="glass-card" style="padding:24px;">
              <h3 style="font-size:15px; font-weight:600; color:var(--text-accent);
                         margin-bottom:20px; display:flex; align-items:center; gap:6px;">
                ⏳ Skill Timeline
              </h3>
              <div style="position:relative; padding-left:24px;">
                <div style="position:absolute; left:8px; top:0; bottom:0;
                             width:1.5px; background:var(--border-strong);">
                </div>
                <div *ngFor="let group of timelineGroups">
                  <div style="position:relative; margin-bottom:20px;">
                    <div [style.background]="group.color"
                         style="position:absolute; left:-19px; top:3px;
                                width:12px; height:12px; border-radius:50%;
                                border:2px solid white;
                                box-shadow:0 0 0 2px rgba(0,0,0,0.1);">
                    </div>
                    <div style="font-size:11px; color:var(--text-muted);
                                margin-bottom:3px; font-weight:500;">
                      {{ group.year }}
                    </div>
                    <div style="font-size:13px; font-weight:500;
                                color:var(--text-primary); margin-bottom:3px;
                                text-transform:capitalize;">
                      {{ group.skills.join(' · ') }}
                    </div>
                    <div [style.color]="group.color"
                         style="font-size:12px; font-weight:500;">
                      {{ group.label }} ({{ group.range }})
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Heatmap -->
            <div class="glass-card" style="padding:24px;">
              <h3 style="font-size:15px; font-weight:600; color:var(--text-accent);
                         margin-bottom:20px; display:flex; align-items:center; gap:6px;">
                🔥 Skill Heatmap
              </h3>
              <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px;">
                <div *ngFor="let s of skills.slice(0, 12)"
                     [style.background]="getHeatBg(s.freshness_score)"
                     style="border-radius:10px; padding:10px 8px;
                            text-align:center; transition:transform 0.2s;"
                     onmouseover="this.style.transform='scale(1.05)'"
                     onmouseout="this.style.transform='scale(1)'">
                  <div style="font-size:11px; font-weight:500;
                               color:var(--text-primary); text-transform:capitalize;
                               white-space:nowrap; overflow:hidden;
                               text-overflow:ellipsis;">
                    {{ s.name }}
                  </div>
                  <div [style.color]="getScoreColor(s.freshness_score)"
                       style="font-size:13px; font-weight:700; margin-top:4px;">
                    {{ (s.freshness_score * 100).toFixed(0) }}%
                  </div>
                </div>
              </div>
              <!-- Legend -->
              <div style="display:flex; gap:12px; margin-top:16px;
                          padding-top:16px; border-top:0.5px solid var(--border-default);">
                <div style="display:flex; align-items:center; gap:4px; font-size:11px; color:var(--text-muted);">
                  <div style="width:12px; height:12px; border-radius:3px; background:#d1fae5;"></div> Strong
                </div>
                <div style="display:flex; align-items:center; gap:4px; font-size:11px; color:var(--text-muted);">
                  <div style="width:12px; height:12px; border-radius:3px; background:#e0e7ff;"></div> Moderate
                </div>
                <div style="display:flex; align-items:center; gap:4px; font-size:11px; color:var(--text-muted);">
                  <div style="width:12px; height:12px; border-radius:3px; background:#fef3c7;"></div> Weak
                </div>
                <div style="display:flex; align-items:center; gap:4px; font-size:11px; color:var(--text-muted);">
                  <div style="width:12px; height:12px; border-radius:3px; background:#fee2e2;"></div> Outdated
                </div>
              </div>
            </div>

          </div>

          <!-- Decay Chart -->
          <div class="glass-card animate-fade-up-delay-3"
               style="padding:24px; margin-bottom:20px;">
            <h3 style="font-size:15px; font-weight:600; color:var(--text-accent);
                       margin-bottom:6px;">
              📈 Freshness Score by Skill
            </h3>
            <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px;">
              Horizontal bar chart — longer bar = fresher skill
            </p>
            <canvas #barChart style="max-height:300px;"></canvas>
          </div>

          <!-- Full Skill List -->
          <div class="glass-card animate-fade-up-delay-4" style="padding:24px;">
            <h3 style="font-size:15px; font-weight:600; color:var(--text-accent);
                       margin-bottom:20px;">
              📋 All Skills
            </h3>
            <div *ngFor="let s of skills"
                 style="display:flex; align-items:center; gap:12px;
                        padding:10px 0; border-bottom:0.5px solid var(--border-default);">

              <span style="font-size:16px;">{{ getSkillIcon(s.category) }}</span>

              <span style="font-size:13px; font-weight:500; color:var(--text-primary);
                           text-transform:capitalize; width:130px; flex-shrink:0;">
                {{ s.name }}
              </span>

              <span style="font-size:11px; color:var(--text-muted);
                           width:36px; flex-shrink:0;">
                {{ s.last_used }}
              </span>

              <div style="flex:1; background:rgba(0,0,0,0.06);
                          border-radius:var(--radius-full); height:8px; overflow:hidden;">
                <div [style.width.%]="s.freshness_score * 100"
                     [class]="'bar-animate bar-' + s.strength.toLowerCase()"
                     style="height:100%; border-radius:var(--radius-full);
                            transition:width 0.8s ease;">
                </div>
              </div>

              <span [class]="'badge badge-' + s.strength.toLowerCase()"
                    style="flex-shrink:0;">
                {{ (s.freshness_score * 100).toFixed(0) }}%
              </span>

            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class SkillDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('barChart') barChartRef!: ElementRef;

  skills: any[] = [];
  timelineGroups: any[] = [];
  strongCount = 0;
  weakCount = 0;
  avgScore = 0;

  ngOnInit() {
    const stored = localStorage.getItem('skillProfile');
    if (!stored) return;

    const profile = JSON.parse(stored);
    this.skills = Object.entries(profile)
      .map(([name, data]: [string, any]) => ({ name, ...data }))
      .sort((a, b) => b.freshness_score - a.freshness_score);

    this.strongCount = this.skills.filter(
      s => s.strength === 'Strong'
    ).length;
    this.weakCount = this.skills.filter(
      s => s.strength === 'Weak' || s.strength === 'Outdated'
    ).length;
    this.avgScore = Math.round(
      this.skills.reduce((sum, s) => sum + s.freshness_score, 0) /
      this.skills.length * 100
    );

    this.buildTimelineGroups();
  }

  ngAfterViewInit() {
    if (this.skills.length) {
      setTimeout(() => this.buildBarChart(), 200);
    }
  }

  buildTimelineGroups() {
    const yearMap: any = {};
    this.skills.forEach(s => {
      const year = s.last_used;
      if (!yearMap[year]) yearMap[year] = [];
      yearMap[year].push(s.name);
    });

    const years = Object.keys(yearMap).sort((a, b) => +b - +a);

    this.timelineGroups = years.map(year => {
      const skillsInYear = yearMap[year];
      const avgFreshness = this.skills
        .filter(s => s.last_used == year)
        .reduce((sum, s) => sum + s.freshness_score, 0) /
        skillsInYear.length;

      let color = '#dc2626';
      let label = 'Outdated';
      let range = '< 30%';

      if (avgFreshness >= 0.7) {
        color = '#059669'; label = 'Strong'; range = '70-100%';
      } else if (avgFreshness >= 0.4) {
        color = '#4f46e5'; label = 'Moderate'; range = '40-70%';
      } else if (avgFreshness >= 0.2) {
        color = '#d97706'; label = 'Weak'; range = '20-40%';
      }

      return { year, skills: skillsInYear.slice(0, 4), color, label, range };
    });
  }

  buildBarChart() {
    if (!this.barChartRef) return;
    const top = this.skills.slice(0, 12);

    new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: top.map(s => s.name),
        datasets: [{
          label: 'Freshness Score (%)',
          data: top.map(s => Math.round(s.freshness_score * 100)),
          backgroundColor: top.map(s => this.getBarColor(s.freshness_score)),
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            grid: { color: 'rgba(0,0,0,0.04)' }
          },
          y: {
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  getBarColor(score: number): string {
    if (score >= 0.7) return '#059669';
    if (score >= 0.4) return '#4f46e5';
    if (score >= 0.2) return '#d97706';
    return '#dc2626';
  }

  getScoreColor(score: number): string {
    if (score >= 0.7) return '#059669';
    if (score >= 0.4) return '#4f46e5';
    if (score >= 0.2) return '#d97706';
    return '#dc2626';
  }

  getHeatBg(score: number): string {
    if (score >= 0.7) return '#d1fae5';
    if (score >= 0.4) return '#e0e7ff';
    if (score >= 0.2) return '#fef3c7';
    return '#fee2e2';
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