import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-comparison-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="min-height:100vh; background:var(--gradient-bg); padding:40px 20px;">
      <div style="max-width:1100px; margin:0 auto;">

        <!-- Header -->
        <div class="animate-fade-up" style="margin-bottom:32px;">
          <h2 style="font-size:32px; font-weight:700; letter-spacing:-0.5px;
                     color:var(--text-primary); margin-bottom:8px;">
            📊 System Comparison Dashboard
          </h2>
          <p style="color:var(--text-secondary); font-size:15px;">
            Current ATS (System A) vs SkillTempus Multi-Source (System C)
          </p>
        </div>

        <!-- No Data -->
        <div *ngIf="!skills.length"
             class="glass-card animate-fade-up"
             style="padding:60px; text-align:center;">
          <div style="font-size:50px; margin-bottom:16px;">📄</div>
          <p style="color:var(--text-secondary); font-size:16px; margin-bottom:20px;">
            Upload your CV first to see the comparison
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
              <span class="stat-number" style="color:var(--color-danger);">
                100%
              </span>
              <div class="stat-label">System A Avg</div>
            </div>
            <div class="stat-card">
              <span class="stat-number" style="color:var(--color-success);">
                {{ systemCAvg }}%
              </span>
              <div class="stat-label">System C Avg</div>
            </div>
            <div class="stat-card"
                 style="border:0.5px solid var(--border-strong);">
              <span class="stat-number" style="color:var(--color-primary);">
                {{ outdatedCount }}
              </span>
              <div class="stat-label">Overconfident (A)</div>
            </div>
          </div>

          <!-- Key Insight -->
          <div class="animate-fade-up-delay-2"
               style="background:var(--gradient-primary);
                      border-radius:var(--radius-lg); padding:24px 28px;
                      margin-bottom:24px; color:white;">
            <h3 style="margin:0 0 8px; font-size:17px; font-weight:600;">
              🔍 Key Insight
            </h3>
            <p style="margin:0; opacity:0.9; font-size:14px; line-height:1.7;">
              System A gives <strong>100% to ALL {{ skills.length }} skills</strong>
              regardless of when they were last used.
              System C correctly identifies
              <strong>{{ outdatedCount }} outdated skills</strong>
              using CV timestamps and GitHub signals —
              preventing overconfident matches that waste recruiter time.
            </p>
          </div>

          <!-- Charts Row -->
          <div class="animate-fade-up-delay-2"
               style="display:grid; grid-template-columns:1fr 1fr;
                      gap:20px; margin-bottom:20px;">

            <div class="glass-card" style="padding:24px;">
              <h3 style="font-size:15px; font-weight:600; color:var(--text-accent);
                         margin-bottom:16px;">
                📊 Score Comparison (A vs C)
              </h3>
              <canvas #barChart></canvas>
            </div>

            <div class="glass-card" style="padding:24px;">
              <h3 style="font-size:15px; font-weight:600; color:var(--text-accent);
                         margin-bottom:16px;">
                🕸️ Skill Profile Radar
              </h3>
              <canvas #radarChart></canvas>
            </div>

          </div>

          <!-- Timeline -->
          <div class="glass-card animate-fade-up-delay-3"
               style="padding:24px; margin-bottom:20px;">
            <h3 style="font-size:15px; font-weight:600; color:var(--text-accent);
                       margin-bottom:6px;">
              📈 Skill Decay Timeline
            </h3>
            <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px;">
              How skill freshness decreases over time per decay category
            </p>
            <canvas #timelineChart></canvas>
          </div>

          <!-- Skill Table -->
          <div class="glass-card animate-fade-up-delay-3"
               style="padding:24px; margin-bottom:20px;">
            <h3 style="font-size:15px; font-weight:600; color:var(--text-accent);
                       margin-bottom:20px;">
              📋 Skill-by-Skill Comparison
            </h3>
            <div style="overflow-x:auto;">
              <table style="width:100%; border-collapse:collapse;">
                <thead>
                  <tr style="background:rgba(79,70,229,0.06);">
                    <th style="padding:12px 16px; text-align:left;
                                color:var(--text-primary); font-size:12px;
                                border-bottom:0.5px solid var(--border-default);">
                      Skill
                    </th>
                    <th style="padding:12px 16px; text-align:center;
                                color:var(--text-primary); font-size:12px;
                                border-bottom:0.5px solid var(--border-default);">
                      Last Used
                    </th>
                    <th style="padding:12px 16px; text-align:center;
                                color:var(--text-primary); font-size:12px;
                                border-bottom:0.5px solid var(--border-default);">
                      Category
                    </th>
                    <th style="padding:12px 16px; text-align:center;
                                color:var(--color-danger); font-size:12px;
                                border-bottom:0.5px solid var(--border-default);">
                      System A
                    </th>
                    <th style="padding:12px 16px; text-align:center;
                                color:var(--color-success); font-size:12px;
                                border-bottom:0.5px solid var(--border-default);">
                      System C
                    </th>
                    <th style="padding:12px 16px; text-align:center;
                                color:var(--text-primary); font-size:12px;
                                border-bottom:0.5px solid var(--border-default);">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let skill of skills; let i = index"
                      [style.background]="i % 2 === 0 ?
                        'transparent' : 'rgba(0,0,0,0.02)'">
                    <td style="padding:12px 16px; font-weight:600;
                                text-transform:capitalize;
                                color:var(--text-primary); font-size:13px;">
                      {{ skill.name }}
                    </td>
                    <td style="padding:12px 16px; text-align:center;
                                color:var(--text-muted); font-size:13px;">
                      {{ skill.last_used }}
                    </td>
                    <td style="padding:12px 16px; text-align:center;">
                      <span style="background:var(--color-primary-light);
                                   color:var(--color-primary); font-size:11px;
                                   padding:2px 8px;
                                   border-radius:var(--radius-full);">
                        {{ skill.category }}
                      </span>
                    </td>
                    <td style="padding:12px 16px; text-align:center;">
                      <div style="display:flex; align-items:center;
                                  justify-content:center; gap:6px;">
                        <div style="background:rgba(0,0,0,0.06);
                                    border-radius:var(--radius-full);
                                    height:6px; width:60px; overflow:hidden;">
                          <div style="width:100%; height:100%;
                                      background:var(--color-danger);
                                      border-radius:var(--radius-full);">
                          </div>
                        </div>
                        <span style="font-size:12px; font-weight:600;
                                     color:var(--color-danger);">100%</span>
                      </div>
                    </td>
                    <td style="padding:12px 16px; text-align:center;">
                      <div style="display:flex; align-items:center;
                                  justify-content:center; gap:6px;">
                        <div style="background:rgba(0,0,0,0.06);
                                    border-radius:var(--radius-full);
                                    height:6px; width:60px; overflow:hidden;">
                          <div [style.width.%]="skill.freshness_score * 100"
                               [class]="'bar-animate bar-' + skill.strength.toLowerCase()"
                               style="height:100%; border-radius:var(--radius-full);">
                          </div>
                        </div>
                        <span [class]="'badge badge-' + skill.strength.toLowerCase()"
                              style="font-size:11px;">
                          {{ (skill.freshness_score * 100).toFixed(0) }}%
                        </span>
                      </div>
                    </td>
                    <td style="padding:12px 16px; text-align:center;">
                      <span [class]="'badge badge-' + skill.strength.toLowerCase()">
                        {{ skill.strength }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- A vs C Summary -->
          <div class="animate-fade-up-delay-4"
               style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">

            <div class="glass-card"
                 style="padding:24px; border-top:3px solid var(--color-danger);">
              <h3 style="color:var(--color-danger); margin:0 0 12px; font-size:16px;">
                ❌ System A — Current ATS
              </h3>
              <p style="color:var(--text-secondary); font-size:14px;
                        line-height:1.7; margin:0 0 16px;">
                Treats all {{ skills.length }} skills equally regardless
                of when they were last used. A skill from 2015 scores the
                same as one used yesterday. Leads to
                <strong>overconfident matches</strong>.
              </p>
              <div style="background:var(--color-danger-bg);
                          border-radius:var(--radius-md); padding:12px 16px;">
                <strong style="color:var(--color-danger);">
                  Average Score: 100%
                </strong>
                <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                  Same for every candidate regardless of skill recency
                </div>
              </div>
            </div>

            <div class="glass-card"
                 style="padding:24px; border-top:3px solid var(--color-success);">
              <h3 style="color:var(--color-success); margin:0 0 12px; font-size:16px;">
                ✅ System C — SkillTempus
              </h3>
              <p style="color:var(--text-secondary); font-size:14px;
                        line-height:1.7; margin:0 0 16px;">
                Combines CV timestamps AND GitHub signals to score skills
                by actual freshness. Achieves
                <strong>85.0% accuracy</strong> vs 75.0% for System A —
                a statistically significant improvement (p = 0.0327).
              </p>
              <div style="background:var(--color-success-bg);
                          border-radius:var(--radius-md); padding:12px 16px;">
                <strong style="color:var(--color-success);">
                  Average Score: {{ systemCAvg }}%
                </strong>
                <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                  Varies based on actual skill freshness from CV + GitHub
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  `
})
export class ComparisonDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('barChart') barChartRef!: ElementRef;
  @ViewChild('radarChart') radarChartRef!: ElementRef;
  @ViewChild('timelineChart') timelineChartRef!: ElementRef;

  skills: any[] = [];
  systemCAvg = 0;
  outdatedCount = 0;

  ngOnInit() {
    const stored = localStorage.getItem('skillProfile');
    if (!stored) return;

    const profile = JSON.parse(stored);
    this.skills = Object.entries(profile)
      .map(([name, data]: [string, any]) => ({ name, ...data }))
      .sort((a, b) => b.last_used - a.last_used);

    this.systemCAvg = Math.round(
      this.skills.reduce((sum, s) => sum + s.freshness_score * 100, 0) /
      this.skills.length
    );

    this.outdatedCount = this.skills.filter(
      s => s.freshness_score < 0.4
    ).length;
  }

  ngAfterViewInit() {
    if (this.skills.length) {
      setTimeout(() => {
        this.buildBarChart();
        this.buildRadarChart();
        this.buildTimelineChart();
      }, 200);
    }
  }

  buildBarChart() {
    if (!this.barChartRef) return;
    const labels = this.skills.slice(0, 10).map(s => s.name);
    const systemCScores = this.skills.slice(0, 10).map(
      s => Math.round(s.freshness_score * 100)
    );

    new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'System A (ATS)',
            data: labels.map(() => 100),
            backgroundColor: 'rgba(220,38,38,0.7)',
            borderRadius: 4
          },
          {
            label: 'System C (SkillTempus)',
            data: systemCScores,
            backgroundColor: 'rgba(5,150,105,0.7)',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true, max: 100,
            grid: { color: 'rgba(0,0,0,0.04)' },
            title: { display: true, text: 'Score (%)' }
          },
          x: { grid: { display: false } }
        },
        plugins: { legend: { position: 'top' } }
      }
    });
  }

  buildRadarChart() {
    if (!this.radarChartRef) return;
    const top = this.skills.slice(0, 7);
    const labels = top.map(s => s.name);
    const systemCScores = top.map(
      s => Math.round(s.freshness_score * 100)
    );

    new Chart(this.radarChartRef.nativeElement, {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label: 'System A',
            data: labels.map(() => 100),
            backgroundColor: 'rgba(220,38,38,0.15)',
            borderColor: '#dc2626',
            borderWidth: 2
          },
          {
            label: 'System C',
            data: systemCScores,
            backgroundColor: 'rgba(5,150,105,0.15)',
            borderColor: '#059669',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        scales: { r: { beginAtZero: true, max: 100 } },
        plugins: { legend: { position: 'top' } }
      }
    });
  }

  buildTimelineChart() {
    if (!this.timelineChartRef) return;
    const years = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const labels = years.map(y => `${2024 - y}`);

    new Chart(this.timelineChartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'System A (No Decay)',
            data: years.map(() => 100),
            borderColor: '#dc2626',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5]
          },
          {
            label: 'Fast (λ=0.3) — Frameworks',
            data: years.map(y => Math.round(Math.exp(-0.3 * y) * 100)),
            borderColor: '#e83e8c',
            backgroundColor: 'transparent',
            borderWidth: 2
          },
          {
            label: 'Medium (λ=0.2) — Languages',
            data: years.map(y => Math.round(Math.exp(-0.2 * y) * 100)),
            borderColor: '#4f46e5',
            backgroundColor: 'transparent',
            borderWidth: 2
          },
          {
            label: 'Slow (λ=0.1) — Fundamentals',
            data: years.map(y => Math.round(Math.exp(-0.1 * y) * 100)),
            borderColor: '#059669',
            backgroundColor: 'transparent',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true, max: 100,
            title: { display: true, text: 'Freshness (%)' }
          },
          x: { title: { display: true, text: 'Year Last Used' } }
        },
        plugins: { legend: { position: 'top' } }
      }
    });
  }
}