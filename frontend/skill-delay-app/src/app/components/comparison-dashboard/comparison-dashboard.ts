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
    <div style="min-height:100vh; background:linear-gradient(135deg, #f5f7fa, #e8f0fe);
                padding:40px 20px;">
      <div style="max-width:1100px; margin:0 auto;">

        <!-- Header -->
        <div style="margin-bottom:30px;">
          <h2 style="color:#1F3864; font-size:32px; margin:0 0 8px;">
            📊 System Comparison Dashboard
          </h2>
          <p style="color:#777; margin:0;">
            Comparing Current ATS (System A) vs SkillTempus Decay Model (System B)
          </p>
        </div>

        <!-- No data state -->
        <div *ngIf="!skills.length"
             style="text-align:center; padding:60px; background:white;
                    border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <div style="font-size:50px; margin-bottom:16px;">📄</div>
          <p style="color:#777; font-size:16px; margin-bottom:20px;">
            Upload your CV first to see the comparison
          </p>
          <a routerLink="/upload">
            <button style="background:linear-gradient(135deg, #2E75B6, #1F3864);
                           color:white; padding:12px 30px; border:none;
                           border-radius:25px; cursor:pointer; font-size:15px;">
              Upload CV →
            </button>
          </a>
        </div>

        <!-- Dashboard Content -->
        <div *ngIf="skills.length">

          <!-- Summary Cards -->
          <div style="display:grid; grid-template-columns:repeat(4, 1fr);
                      gap:16px; margin-bottom:30px;">

            <div style="background:white; border-radius:14px; padding:20px;
                        text-align:center; box-shadow:0 4px 20px rgba(0,0,0,0.06);">
              <div style="font-size:28px; font-weight:800; color:#1F3864;">
                {{ skills.length }}
              </div>
              <div style="color:#777; font-size:13px; margin-top:4px;">
                Total Skills
              </div>
            </div>

            <div style="background:white; border-radius:14px; padding:20px;
                        text-align:center; box-shadow:0 4px 20px rgba(0,0,0,0.06);">
              <div style="font-size:28px; font-weight:800; color:#dc3545;">
                100%
              </div>
              <div style="color:#777; font-size:13px; margin-top:4px;">
                System A Avg Score
              </div>
            </div>

            <div style="background:white; border-radius:14px; padding:20px;
                        text-align:center; box-shadow:0 4px 20px rgba(0,0,0,0.06);">
              <div style="font-size:28px; font-weight:800; color:#28a745;">
                {{ systemBAvg }}%
              </div>
              <div style="color:#777; font-size:13px; margin-top:4px;">
                System B Avg Score
              </div>
            </div>

            <div style="background:white; border-radius:14px; padding:20px;
                        text-align:center; box-shadow:0 4px 20px rgba(0,0,0,0.06);
                        border:2px solid #2E75B6;">
              <div style="font-size:28px; font-weight:800; color:#2E75B6;">
                {{ outdatedCount }}
              </div>
              <div style="color:#777; font-size:13px; margin-top:4px;">
                Overconfident (System A)
              </div>
            </div>

          </div>

          <!-- Key Insight Banner -->
          <div style="background:linear-gradient(135deg, #1F3864, #2E75B6);
                      border-radius:14px; padding:20px 30px; margin-bottom:30px;
                      color:white;">
            <h3 style="margin:0 0 8px; font-size:18px;">🔍 Key Insight</h3>
            <p style="margin:0; opacity:0.9; font-size:15px; line-height:1.6;">
              System A (Current ATS) gives <strong>100% score to ALL skills</strong>
              regardless of when they were last used.
              System B (SkillTempus) correctly assigns lower scores to
              <strong>{{ outdatedCount }} outdated skills</strong> that System A
              overestimates. This prevents recommending candidates with stale skills
              for roles requiring current expertise.
            </p>
          </div>

          <!-- Skills Comparison Table -->
          <div style="background:white; border-radius:16px; padding:24px;
                      margin-bottom:30px; box-shadow:0 4px 20px rgba(0,0,0,0.06);">

            <h3 style="color:#1F3864; margin:0 0 20px; font-size:20px;">
              📋 Skill-by-Skill Comparison
            </h3>

            <div style="overflow-x:auto;">
              <table style="width:100%; border-collapse:collapse;">
                <thead>
                  <tr style="background:#f8f9ff;">
                    <th style="padding:12px 16px; text-align:left; color:#1F3864;
                                font-size:13px; border-bottom:2px solid #e0e0e0;">
                      Skill
                    </th>
                    <th style="padding:12px 16px; text-align:center; color:#1F3864;
                                font-size:13px; border-bottom:2px solid #e0e0e0;">
                      Last Used
                    </th>
                    <th style="padding:12px 16px; text-align:center; color:#1F3864;
                                font-size:13px; border-bottom:2px solid #e0e0e0;">
                      Category
                    </th>
                    <th style="padding:12px 16px; text-align:center; color:#dc3545;
                                font-size:13px; border-bottom:2px solid #e0e0e0;">
                      System A (ATS)
                    </th>
                    <th style="padding:12px 16px; text-align:center; color:#28a745;
                                font-size:13px; border-bottom:2px solid #e0e0e0;">
                      System B (SkillTempus)
                    </th>
                    <th style="padding:12px 16px; text-align:center; color:#1F3864;
                                font-size:13px; border-bottom:2px solid #e0e0e0;">
                      Difference
                    </th>
                    <th style="padding:12px 16px; text-align:center; color:#1F3864;
                                font-size:13px; border-bottom:2px solid #e0e0e0;">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let skill of skills; let i = index"
                      [style.background]="i % 2 === 0 ? 'white' : '#fafafa'">

                    <td style="padding:12px 16px; font-weight:600;
                                text-transform:capitalize; color:#1F3864;">
                      {{ skill.name }}
                    </td>

                    <td style="padding:12px 16px; text-align:center;
                                color:#555; font-size:14px;">
                      {{ skill.last_used }}
                    </td>

                    <td style="padding:12px 16px; text-align:center;">
                      <span style="background:#f0f4ff; color:#2E75B6;
                                   padding:3px 10px; border-radius:10px;
                                   font-size:12px;">
                        {{ skill.category }}
                      </span>
                    </td>

                    <td style="padding:12px 16px; text-align:center;">
                      <div style="display:flex; align-items:center;
                                  justify-content:center; gap:8px;">
                        <div style="background:#f0f0f0; border-radius:10px;
                                    height:8px; width:80px; overflow:hidden;">
                          <div style="width:100%; height:100%;
                                      background:#dc3545; border-radius:10px;">
                          </div>
                        </div>
                        <span style="color:#dc3545; font-weight:600; font-size:13px;">
                          100%
                        </span>
                      </div>
                    </td>

                    <td style="padding:12px 16px; text-align:center;">
                      <div style="display:flex; align-items:center;
                                  justify-content:center; gap:8px;">
                        <div style="background:#f0f0f0; border-radius:10px;
                                    height:8px; width:80px; overflow:hidden;">
                          <div [style.width.%]="skill.freshness_score * 100"
                               [style.background]="getScoreColor(skill.freshness_score)"
                               style="height:100%; border-radius:10px;
                                      transition:width 0.5s;">
                          </div>
                        </div>
                        <span [style.color]="getScoreColor(skill.freshness_score)"
                              style="font-weight:600; font-size:13px;">
                          {{ (skill.freshness_score * 100).toFixed(0) }}%
                        </span>
                      </div>
                    </td>

                    <td style="padding:12px 16px; text-align:center;
                                font-weight:600; font-size:13px;"
                        [style.color]="getDiffColor(skill.freshness_score)">
                      {{ getDiff(skill.freshness_score) }}
                    </td>

                    <td style="padding:12px 16px; text-align:center;">
                      <span [style.background]="getStatusBg(skill.strength)"
                            [style.color]="getStatusColor(skill.strength)"
                            style="padding:4px 10px; border-radius:10px;
                                   font-size:12px; font-weight:600;">
                        {{ skill.strength }}
                      </span>
                    </td>

                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Charts Row -->
          <div style="display:grid; grid-template-columns:1fr 1fr;
                      gap:24px; margin-bottom:30px;">

            <!-- Bar Chart -->
            <div style="background:white; border-radius:16px; padding:24px;
                        box-shadow:0 4px 20px rgba(0,0,0,0.06);">
              <h3 style="color:#1F3864; margin:0 0 16px; font-size:18px;">
                📊 Score Comparison
              </h3>
              <canvas #barChart></canvas>
            </div>

            <!-- Radar Chart -->
            <div style="background:white; border-radius:16px; padding:24px;
                        box-shadow:0 4px 20px rgba(0,0,0,0.06);">
              <h3 style="color:#1F3864; margin:0 0 16px; font-size:18px;">
                🕸️ Skill Profile Radar
              </h3>
              <canvas #radarChart></canvas>
            </div>

          </div>

          <!-- Timeline Chart -->
          <div style="background:white; border-radius:16px; padding:24px;
                      margin-bottom:30px; box-shadow:0 4px 20px rgba(0,0,0,0.06);">
            <h3 style="color:#1F3864; margin:0 0 8px; font-size:18px;">
              📈 Skill Decay Timeline
            </h3>
            <p style="color:#777; font-size:13px; margin:0 0 16px;">
              Shows how skill freshness decreases over time for each category
            </p>
            <canvas #timelineChart></canvas>
          </div>

          <!-- System A vs B Summary -->
          <div style="display:grid; grid-template-columns:1fr 1fr;
                      gap:24px; margin-bottom:30px;">

            <div style="background:white; border-radius:16px; padding:24px;
                        box-shadow:0 4px 20px rgba(0,0,0,0.06);
                        border-top:4px solid #dc3545;">
              <h3 style="color:#dc3545; margin:0 0 16px;">
                ❌ System A — Current ATS
              </h3>
              <p style="color:#555; font-size:14px; line-height:1.8; margin:0;">
                Treats all {{ skills.length }} skills as equally relevant regardless
                of when they were last used. Would give a candidate with skills
                from 2015 the same score as one with skills from 2024.
                This leads to <strong>overconfident matches</strong> and
                poor hiring decisions.
              </p>
              <div style="margin-top:16px; padding:12px; background:#fff5f5;
                          border-radius:8px;">
                <strong style="color:#dc3545;">Average Score: 100%</strong>
                <br>
                <span style="color:#777; font-size:13px;">
                  (Same for every candidate regardless of skill recency)
                </span>
              </div>
            </div>

            <div style="background:white; border-radius:16px; padding:24px;
                        box-shadow:0 4px 20px rgba(0,0,0,0.06);
                        border-top:4px solid #28a745;">
              <h3 style="color:#28a745; margin:0 0 16px;">
                ✅ System B — SkillTempus
              </h3>
              <p style="color:#555; font-size:14px; line-height:1.8; margin:0;">
                Uses temporal decay modelling to assign freshness scores based
                on when each skill was last actively used. Skills used recently
                score higher than skills not used in years. This produces
                <strong>more accurate, honest matches</strong>.
              </p>
              <div style="margin-top:16px; padding:12px; background:#f0fff4;
                          border-radius:8px;">
                <strong style="color:#28a745;">
                  Average Score: {{ systemBAvg }}%
                </strong>
                <br>
                <span style="color:#777; font-size:13px;">
                  (Varies based on actual skill freshness)
                </span>
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
  systemBAvg = 0;
  outdatedCount = 0;

  barChartInstance: any;
  radarChartInstance: any;
  timelineChartInstance: any;

  ngOnInit() {
    const stored = localStorage.getItem('skillProfile');
    if (!stored) return;

    const profile = JSON.parse(stored);
    this.skills = Object.entries(profile)
      .map(([name, data]: [string, any]) => ({ name, ...data }))
      .sort((a, b) => b.last_used - a.last_used);

    this.systemBAvg = Math.round(
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
      }, 100);
    }
  }

  buildBarChart() {
    const labels = this.skills.map(s => s.name);
    const systemAScores = this.skills.map(() => 100);
    const systemBScores = this.skills.map(s =>
      Math.round(s.freshness_score * 100)
    );

    this.barChartInstance = new Chart(
      this.barChartRef.nativeElement,
      {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'System A (Current ATS)',
              data: systemAScores,
              backgroundColor: 'rgba(220, 53, 69, 0.7)',
              borderColor: '#dc3545',
              borderWidth: 1
            },
            {
              label: 'System B (SkillTempus)',
              data: systemBScores,
              backgroundColor: 'rgba(40, 167, 69, 0.7)',
              borderColor: '#28a745',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Score (%)'
              }
            }
          },
          plugins: {
            legend: { position: 'top' }
          }
        }
      }
    );
  }

  buildRadarChart() {
    const labels = this.skills.slice(0, 8).map(s => s.name);
    const systemBScores = this.skills.slice(0, 8).map(s =>
      Math.round(s.freshness_score * 100)
    );

    this.radarChartInstance = new Chart(
      this.radarChartRef.nativeElement,
      {
        type: 'radar',
        data: {
          labels,
          datasets: [
            {
              label: 'System A (ATS)',
              data: labels.map(() => 100),
              backgroundColor: 'rgba(220, 53, 69, 0.2)',
              borderColor: '#dc3545',
              borderWidth: 2
            },
            {
              label: 'System B (SkillTempus)',
              data: systemBScores,
              backgroundColor: 'rgba(46, 117, 182, 0.2)',
              borderColor: '#2E75B6',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            r: {
              beginAtZero: true,
              max: 100
            }
          },
          plugins: {
            legend: { position: 'top' }
          }
        }
      }
    );
  }

  buildTimelineChart() {
    const years = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const currentYear = 2024;
    const labels = years.map(y => `${currentYear - y}`);

    const fastDecay = years.map(y =>
      Math.round(Math.exp(-0.3 * y) * 100)
    );
    const mediumDecay = years.map(y =>
      Math.round(Math.exp(-0.2 * y) * 100)
    );
    const slowDecay = years.map(y =>
      Math.round(Math.exp(-0.1 * y) * 100)
    );
    const systemA = years.map(() => 100);

    this.timelineChartInstance = new Chart(
      this.timelineChartRef.nativeElement,
      {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'System A (No Decay)',
              data: systemA,
              borderColor: '#dc3545',
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderDash: [5, 5]
            },
            {
              label: 'Fast Decay (Frameworks)',
              data: fastDecay,
              borderColor: '#e83e8c',
              backgroundColor: 'transparent',
              borderWidth: 2
            },
            {
              label: 'Medium Decay (Languages)',
              data: mediumDecay,
              borderColor: '#2E75B6',
              backgroundColor: 'transparent',
              borderWidth: 2
            },
            {
              label: 'Slow Decay (Fundamentals)',
              data: slowDecay,
              borderColor: '#28a745',
              backgroundColor: 'transparent',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Freshness Score (%)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Year Last Used'
              }
            }
          },
          plugins: {
            legend: { position: 'top' }
          }
        }
      }
    );
  }

  getScoreColor(score: number): string {
    if (score >= 0.7) return '#28a745';
    if (score >= 0.4) return '#2E75B6';
    if (score >= 0.2) return '#ffc107';
    return '#dc3545';
  }

  getDiff(score: number): string {
    const diff = Math.round((score - 1) * 100);
    return `${diff}%`;
  }

  getDiffColor(score: number): string {
    if (score >= 0.7) return '#28a745';
    if (score >= 0.4) return '#ffc107';
    return '#dc3545';
  }

  getStatusBg(strength: string): string {
    switch (strength) {
      case 'Strong': return '#f0fff4';
      case 'Moderate': return '#f0f4ff';
      case 'Weak': return '#fffbf0';
      default: return '#fff5f5';
    }
  }

  getStatusColor(strength: string): string {
    switch (strength) {
      case 'Strong': return '#28a745';
      case 'Moderate': return '#2E75B6';
      case 'Weak': return '#856404';
      default: return '#dc3545';
    }
  }
}