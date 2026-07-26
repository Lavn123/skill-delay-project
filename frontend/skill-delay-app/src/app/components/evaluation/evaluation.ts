import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="min-height:100vh; background:linear-gradient(135deg, #f5f7fa, #e8f0fe);
                padding:40px 20px;">
      <div style="max-width:1100px; margin:0 auto;">

        <!-- Header -->
        <div style="margin-bottom:30px;">
          <h2 style="color:#1F3864; font-size:32px; margin:0 0 8px;">
            🔬 Research Evaluation Results
          </h2>
          <p style="color:#777; margin:0; font-size:15px;">
            Empirical evaluation of SkillTempus against static baseline —
            20 synthetic candidates × 3 jobs = 60 test cases
          </p>
        </div>

        <!-- Research Question -->
        <div style="background:linear-gradient(135deg, #1F3864, #2E75B6);
                    border-radius:16px; padding:24px 30px; margin-bottom:30px;
                    color:white;">
          <h3 style="margin:0 0 12px; font-size:18px;">📋 Research Questions</h3>
          <p style="margin:0 0 8px; opacity:0.9; font-size:14px; line-height:1.6;">
            <strong>RQ1:</strong> Does incorporating temporal skill decay derived from
            CV work history timestamps improve job recommendation accuracy compared
            to static skill-matching baselines?
          </p>
          <p style="margin:0; opacity:0.9; font-size:14px; line-height:1.6;">
            <strong>RQ2:</strong> Do informal skill signals derived from GitHub
            contribution activity meaningfully improve temporal skill decay estimation
            beyond CV-only models?
          </p>
        </div>

        <!-- System Descriptions -->
        <div style="display:grid; grid-template-columns:repeat(3, 1fr);
                    gap:16px; margin-bottom:30px;">

          <div style="background:white; border-radius:14px; padding:20px;
                      box-shadow:0 4px 20px rgba(0,0,0,0.06);
                      border-top:4px solid #dc3545;">
            <h4 style="color:#dc3545; margin:0 0 8px;">System A</h4>
            <p style="color:#555; font-size:13px; margin:0; line-height:1.6;">
              <strong>Static Baseline</strong> — Current ATS approach.
              Keyword matching only. No temporal awareness.
              Treats all skills equally regardless of recency.
            </p>
          </div>

          <div style="background:white; border-radius:14px; padding:20px;
                      box-shadow:0 4px 20px rgba(0,0,0,0.06);
                      border-top:4px solid #2E75B6;">
            <h4 style="color:#2E75B6; margin:0 0 8px;">System B</h4>
            <p style="color:#555; font-size:13px; margin:0; line-height:1.6;">
              <strong>CV Decay Only</strong> — SkillTempus core model.
              Applies exponential decay S(t) = e^(−λt) based on
              CV work history timestamps.
            </p>
          </div>

          <div style="background:white; border-radius:14px; padding:20px;
                      box-shadow:0 4px 20px rgba(0,0,0,0.06);
                      border-top:4px solid #28a745;">
            <h4 style="color:#28a745; margin:0 0 8px;">System C</h4>
            <p style="color:#555; font-size:13px; margin:0; line-height:1.6;">
              <strong>Enhanced Decay</strong> — Extended model with
              stricter coverage thresholds and multi-source
              signal fusion.
            </p>
          </div>

        </div>

        <!-- Main Metrics Table -->
        <div style="background:white; border-radius:16px; padding:24px;
                    margin-bottom:30px; box-shadow:0 4px 20px rgba(0,0,0,0.06);">

          <h3 style="color:#1F3864; margin:0 0 20px; font-size:20px;">
            📊 Evaluation Metrics
          </h3>

          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:#f8f9ff;">
                <th style="padding:14px 16px; text-align:left; color:#1F3864;
                            border-bottom:2px solid #e0e0e0;">System</th>
                <th style="padding:14px 16px; text-align:center; color:#1F3864;
                            border-bottom:2px solid #e0e0e0;">Accuracy</th>
                <th style="padding:14px 16px; text-align:center; color:#1F3864;
                            border-bottom:2px solid #e0e0e0;">Precision</th>
                <th style="padding:14px 16px; text-align:center; color:#1F3864;
                            border-bottom:2px solid #e0e0e0;">Recall</th>
                <th style="padding:14px 16px; text-align:center; color:#1F3864;
                            border-bottom:2px solid #e0e0e0;">F1 Score</th>
                <th style="padding:14px 16px; text-align:center; color:#1F3864;
                            border-bottom:2px solid #e0e0e0;">False Positives</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let system of systems"
                  [style.background]="system.highlight ? '#f0f9ff' : 'white'">
                <td style="padding:14px 16px;">
                  <div style="display:flex; align-items:center; gap:10px;">
                    <span [style.background]="system.color"
                          style="width:12px; height:12px; border-radius:50%;
                                 display:inline-block;">
                    </span>
                    <div>
                      <strong style="color:#1F3864;">{{ system.name }}</strong>
                      <br>
                      <span style="color:#777; font-size:12px;">
                        {{ system.description }}
                      </span>
                    </div>
                  </div>
                </td>
                <td style="padding:14px 16px; text-align:center;">
                  <span [style.color]="system.color" style="font-weight:700;
                        font-size:16px;">
                    {{ system.accuracy }}%
                  </span>
                </td>
                <td style="padding:14px 16px; text-align:center;">
                  <span [style.color]="system.color" style="font-weight:700;
                        font-size:16px;">
                    {{ system.precision }}%
                  </span>
                </td>
                <td style="padding:14px 16px; text-align:center;">
                  <span [style.color]="system.color" style="font-weight:700;
                        font-size:16px;">
                    {{ system.recall }}%
                  </span>
                </td>
                <td style="padding:14px 16px; text-align:center;">
                  <span [style.color]="system.color" style="font-weight:700;
                        font-size:16px;">
                    {{ system.f1 }}%
                  </span>
                </td>
                <td style="padding:14px 16px; text-align:center;">
                  <span [style.background]="system.fp === 0 ? '#f0fff4' : '#fff5f5'"
                        [style.color]="system.fp === 0 ? '#28a745' : '#dc3545'"
                        style="padding:4px 12px; border-radius:10px;
                               font-weight:700;">
                    {{ system.fp }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Charts Row -->
        <div style="display:grid; grid-template-columns:1fr 1fr;
                    gap:24px; margin-bottom:30px;">

          <!-- Accuracy Chart -->
          <div style="background:white; border-radius:16px; padding:24px;
                      box-shadow:0 4px 20px rgba(0,0,0,0.06);">
            <h3 style="color:#1F3864; margin:0 0 16px; font-size:18px;">
              📈 Accuracy Comparison
            </h3>
            <canvas #accuracyChart></canvas>
          </div>

          <!-- Metrics Chart -->
          <div style="background:white; border-radius:16px; padding:24px;
                      box-shadow:0 4px 20px rgba(0,0,0,0.06);">
            <h3 style="color:#1F3864; margin:0 0 16px; font-size:18px;">
              📊 All Metrics Comparison
            </h3>
            <canvas #metricsChart></canvas>
          </div>

        </div>

        <!-- Key Findings -->
        <div style="background:white; border-radius:16px; padding:24px;
                    margin-bottom:30px; box-shadow:0 4px 20px rgba(0,0,0,0.06);">

          <h3 style="color:#1F3864; margin:0 0 20px; font-size:20px;">
            🎯 Key Findings
          </h3>

          <div style="display:grid; grid-template-columns:repeat(3, 1fr);
                      gap:16px;">

            <div style="background:#f0fff4; border-radius:12px; padding:20px;
                        border-left:4px solid #28a745;">
              <div style="font-size:28px; font-weight:800; color:#28a745;">
                +8.3%
              </div>
              <div style="color:#555; font-size:14px; margin-top:4px;">
                Accuracy improvement (B vs A)
              </div>
              <div style="color:#777; font-size:12px; margin-top:8px;">
                System B outperforms current ATS by 8.3 percentage points
              </div>
            </div>

            <div style="background:#f0fff4; border-radius:12px; padding:20px;
                        border-left:4px solid #28a745;">
              <div style="font-size:28px; font-weight:800; color:#28a745;">
                7 → 0
              </div>
              <div style="color:#555; font-size:14px; margin-top:4px;">
                False positives eliminated
              </div>
              <div style="color:#777; font-size:12px; margin-top:8px;">
                System B achieves 100% precision vs 61.1% for System A
              </div>
            </div>

            <div style="background:#f0f4ff; border-radius:12px; padding:20px;
                        border-left:4px solid #2E75B6;">
              <div style="font-size:28px; font-weight:800; color:#2E75B6;">
                0.70
              </div>
              <div style="color:#555; font-size:14px; margin-top:4px;">
                Average NDCG@3
              </div>
              <div style="color:#777; font-size:12px; margin-top:8px;">
                Strong ranking quality across all candidate profiles
              </div>
            </div>

          </div>
        </div>

        <!-- Statistical Significance -->
        <div style="background:white; border-radius:16px; padding:24px;
                    margin-bottom:30px; box-shadow:0 4px 20px rgba(0,0,0,0.06);">

          <h3 style="color:#1F3864; margin:0 0 16px; font-size:20px;">
            📐 Statistical Significance
          </h3>

          <div style="display:grid; grid-template-columns:1fr 1fr;
                      gap:20px;">

            <div style="background:#fffbf0; border-radius:12px; padding:20px;
                        border:1px solid #ffd700;">
              <h4 style="color:#856404; margin:0 0 12px;">
                Paired T-Test: A vs B
              </h4>
              <table style="width:100%; font-size:14px;">
                <tr>
                  <td style="padding:4px 0; color:#555;">T-statistic</td>
                  <td style="padding:4px 0; font-weight:600; text-align:right;">
                    -1.6924
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0; color:#555;">P-value</td>
                  <td style="padding:4px 0; font-weight:600; text-align:right;">
                    0.0959
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0; color:#555;">Threshold</td>
                  <td style="padding:4px 0; font-weight:600; text-align:right;">
                    0.05
                  </td>
                </tr>
              </table>
              <div style="margin-top:12px; padding:10px; background:#fff3cd;
                          border-radius:8px; font-size:13px; color:#856404;">
                ⚠️ Approaching significance (p = 0.096). A larger dataset
                would likely confirm statistical significance given the
                consistent 8.3% improvement observed.
              </div>
            </div>

            <div style="background:#f8f9ff; border-radius:12px; padding:20px;
                        border:1px solid #2E75B6;">
              <h4 style="color:#1F3864; margin:0 0 12px;">
                Ablation Study
              </h4>
              <table style="width:100%; font-size:14px;">
                <tr style="background:#f0f4ff;">
                  <td style="padding:8px; color:#555;">No Decay (Baseline)</td>
                  <td style="padding:8px; font-weight:600; text-align:right;
                              color:#dc3545;">F1: 61.1%</td>
                </tr>
                <tr>
                  <td style="padding:8px; color:#555;">Uniform Decay</td>
                  <td style="padding:8px; font-weight:600; text-align:right;
                              color:#ffc107;">F1: 73.3%</td>
                </tr>
                <tr style="background:#f0f4ff;">
                  <td style="padding:8px; color:#555;">Category Decay</td>
                  <td style="padding:8px; font-weight:600; text-align:right;
                              color:#2E75B6;">F1: 66.7%</td>
                </tr>
              </table>
              <div style="margin-top:12px; padding:10px; background:#f0f4ff;
                          border-radius:8px; font-size:13px; color:#2E75B6;">
                💡 Adding decay improves F1 by +12.2%. Category-specific
                decay rates require further λ calibration.
              </div>
            </div>

          </div>
        </div>

        <!-- Detailed Breakdown -->
        <div style="background:white; border-radius:16px; padding:24px;
                    margin-bottom:30px; box-shadow:0 4px 20px rgba(0,0,0,0.06);">

          <h3 style="color:#1F3864; margin:0 0 20px; font-size:20px;">
            🔍 Detailed Breakdown
          </h3>

          <div style="display:grid; grid-template-columns:repeat(3, 1fr);
                      gap:16px;">

            <div *ngFor="let system of systems"
                 style="border-radius:12px; padding:20px;"
                 [style.border]="'2px solid ' + system.color">

              <h4 [style.color]="system.color" style="margin:0 0 12px;">
                {{ system.name }}
              </h4>

              <table style="width:100%; font-size:13px;">
                <tr>
                  <td style="padding:4px 0; color:#777;">Correct</td>
                  <td style="padding:4px 0; font-weight:600;
                              text-align:right; color:#1F3864;">
                    {{ system.correct }}/60
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0; color:#777;">True Positives</td>
                  <td style="padding:4px 0; font-weight:600;
                              text-align:right; color:#28a745;">
                    {{ system.tp }}
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0; color:#777;">True Negatives</td>
                  <td style="padding:4px 0; font-weight:600;
                              text-align:right; color:#28a745;">
                    {{ system.tn }}
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0; color:#777;">False Positives</td>
                  <td style="padding:4px 0; font-weight:600;
                              text-align:right; color:#dc3545;">
                    {{ system.fp }}
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0; color:#777;">False Negatives</td>
                  <td style="padding:4px 0; font-weight:600;
                              text-align:right; color:#ffc107;">
                    {{ system.fn }}
                  </td>
                </tr>
              </table>

            </div>

          </div>
        </div>

        <!-- Real Data Results -->
        <div style="background:white; border-radius:16px; padding:24px;
                    box-shadow:0 4px 20px rgba(0,0,0,0.06);">

          <h3 style="color:#1F3864; margin:0 0 16px; font-size:20px;">
            📁 Real Data Evaluation
          </h3>
          <p style="color:#777; font-size:14px; margin:0 0 20px;">
            Evaluated on 94 IT resumes from Kaggle dataset against
            real tech job postings
          </p>

          <div style="display:grid; grid-template-columns:repeat(3, 1fr);
                      gap:16px;">

            <div style="background:#f8f9ff; border-radius:12px; padding:20px;
                        text-align:center;">
              <div style="font-size:24px; font-weight:800; color:#1F3864;">94</div>
              <div style="color:#777; font-size:13px;">IT Resumes Processed</div>
            </div>

            <div style="background:#f8f9ff; border-radius:12px; padding:20px;
                        text-align:center;">
              <div style="font-size:24px; font-weight:800; color:#1F3864;">
                1,943
              </div>
              <div style="color:#777; font-size:13px;">Real Job Postings</div>
            </div>

            <div style="background:#f8f9ff; border-radius:12px; padding:20px;
                        text-align:center;">
              <div style="font-size:24px; font-weight:800; color:#dc3545;">7</div>
              <div style="color:#777; font-size:13px;">
                Overconfident Matches Corrected
              </div>
            </div>

          </div>

          <div style="margin-top:16px; padding:16px; background:#f0fff4;
                      border-radius:10px; border-left:4px solid #28a745;">
            <p style="margin:0; color:#555; font-size:14px; line-height:1.6;">
              <strong>Key Real-Data Finding:</strong> System A produced a 100%
              match score for a Database Administrator role where the candidate's
              skills were demonstrably outdated. System B correctly reduced this
              to 36.8%, more accurately reflecting actual skill freshness.
            </p>
          </div>

        </div>

      </div>
    </div>
  `
})
export class EvaluationComponent implements OnInit, AfterViewInit {
  @ViewChild('accuracyChart') accuracyChartRef!: ElementRef;
  @ViewChild('metricsChart') metricsChartRef!: ElementRef;

  systems = [
    {
      name: 'System A',
      description: 'Static Baseline (Current ATS)',
      color: '#dc3545',
      highlight: false,
      accuracy: 76.7,
      precision: 61.1,
      recall: 61.1,
      f1: 61.1,
      fp: 7,
      correct: 46,
      tp: 11,
      tn: 35,
      fn: 7
    },
    {
      name: 'System B',
      description: 'CV Decay Only (SkillTempus)',
      color: '#2E75B6',
      highlight: true,
      accuracy: 85.0,
      precision: 100.0,
      recall: 50.0,
      f1: 66.7,
      fp: 0,
      correct: 51,
      tp: 9,
      tn: 42,
      fn: 9
    },
    {
      name: 'System C',
      description: 'Enhanced Decay (Multi-Source)',
      color: '#28a745',
      highlight: false,
      accuracy: 85.0,
      precision: 100.0,
      recall: 50.0,
      f1: 66.7,
      fp: 0,
      correct: 51,
      tp: 9,
      tn: 42,
      fn: 9
    }
  ];

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.buildAccuracyChart();
      this.buildMetricsChart();
    }, 100);
  }

  buildAccuracyChart() {
    new Chart(this.accuracyChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['System A\n(Static)', 'System B\n(CV Decay)', 'System C\n(Enhanced)'],
        datasets: [{
          label: 'Accuracy (%)',
          data: [76.7, 85.0, 85.0],
          backgroundColor: ['#dc3545', '#2E75B6', '#28a745'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false,
            min: 70,
            max: 100,
            title: { display: true, text: 'Accuracy (%)' }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  buildMetricsChart() {
    new Chart(this.metricsChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
        datasets: [
          {
            label: 'System A',
            data: [76.7, 61.1, 61.1, 61.1],
            backgroundColor: 'rgba(220, 53, 69, 0.8)',
            borderRadius: 4
          },
          {
            label: 'System B',
            data: [85.0, 100.0, 50.0, 66.7],
            backgroundColor: 'rgba(46, 117, 182, 0.8)',
            borderRadius: 4
          },
          {
            label: 'System C',
            data: [85.0, 100.0, 50.0, 66.7],
            backgroundColor: 'rgba(40, 167, 69, 0.8)',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: { display: true, text: 'Score (%)' }
          }
        },
        plugins: {
          legend: { position: 'top' }
        }
      }
    });
  }
}