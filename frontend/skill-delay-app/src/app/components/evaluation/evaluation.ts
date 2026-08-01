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
    <div style="min-height:100vh; background:var(--gradient-bg); padding:40px 20px;">
      <div style="max-width:1100px; margin:0 auto;">

        <!-- Header -->
        <div class="animate-fade-up" style="margin-bottom:32px;">
          <h2 style="font-size:32px; font-weight:700; letter-spacing:-0.5px;
                     color:var(--text-primary); margin-bottom:8px;">
            🔬 Research Evaluation Results
          </h2>
          <p style="color:var(--text-secondary); font-size:15px;">
            Empirical evaluation · 20 synthetic candidates · 3 job roles · 60 test cases
          </p>
        </div>

        <!-- Research Questions -->
        <div class="animate-fade-up-delay-1"
             style="background:var(--gradient-primary);
                    border-radius:var(--radius-lg); padding:24px 28px;
                    margin-bottom:24px; color:white;">
          <h3 style="margin:0 0 14px; font-size:17px; font-weight:600;">
            📋 Research Questions
          </h3>
          <p style="margin:0 0 8px; opacity:0.9; font-size:14px; line-height:1.7;">
            <strong>RQ1:</strong> Does incorporating temporal skill decay derived
            from CV work history timestamps improve job recommendation accuracy
            compared to static skill-matching baselines?
          </p>
          <p style="margin:0; opacity:0.9; font-size:14px; line-height:1.7;">
            <strong>RQ2:</strong> Do informal skill signals derived from GitHub
            contribution activity meaningfully improve temporal skill decay
            estimation beyond CV-only models?
          </p>
        </div>

        <!-- System Descriptions -->
        <div class="animate-fade-up-delay-1"
             style="display:grid; grid-template-columns:repeat(3,1fr);
                    gap:16px; margin-bottom:24px;">
          <div class="glass-card"
               style="padding:20px; border-top:3px solid var(--color-danger);">
            <h4 style="color:var(--color-danger); margin:0 0 8px; font-size:14px;">
              System A
            </h4>
            <p style="color:var(--text-secondary); font-size:13px;
                      margin:0; line-height:1.6;">
              <strong>Static Baseline</strong> — Current ATS approach.
              Keyword matching only. No temporal awareness.
            </p>
          </div>
          <div class="glass-card"
               style="padding:20px; border-top:3px solid var(--color-primary);">
            <h4 style="color:var(--color-primary); margin:0 0 8px; font-size:14px;">
              System B
            </h4>
            <p style="color:var(--text-secondary); font-size:13px;
                      margin:0; line-height:1.6;">
              <strong>CV Decay Only</strong> — Applies S(t) = e^(−λt)
              using CV work history timestamps.
            </p>
          </div>
          <div class="glass-card"
               style="padding:20px; border-top:3px solid var(--color-success);">
            <h4 style="color:var(--color-success); margin:0 0 8px; font-size:14px;">
              System C
            </h4>
            <p style="color:var(--text-secondary); font-size:13px;
                      margin:0; line-height:1.6;">
              <strong>Multi-Source Decay</strong> — CV timestamps +
              synthetic GitHub timelines for controlled evaluation.
            </p>
          </div>
        </div>

        <!-- Metrics Table -->
        <div class="glass-card animate-fade-up-delay-2"
             style="padding:24px; margin-bottom:24px;">
          <h3 style="font-size:15px; font-weight:600; color:var(--text-accent);
                     margin-bottom:20px;">
            📊 Evaluation Metrics
          </h3>
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:rgba(79,70,229,0.06);">
                  <th style="padding:14px 16px; text-align:left;
                              color:var(--text-primary); font-size:12px;
                              border-bottom:0.5px solid var(--border-default);">
                    System
                  </th>
                  <th style="padding:14px 16px; text-align:center;
                              color:var(--text-primary); font-size:12px;
                              border-bottom:0.5px solid var(--border-default);">
                    Accuracy
                  </th>
                  <th style="padding:14px 16px; text-align:center;
                              color:var(--text-primary); font-size:12px;
                              border-bottom:0.5px solid var(--border-default);">
                    Precision
                  </th>
                  <th style="padding:14px 16px; text-align:center;
                              color:var(--text-primary); font-size:12px;
                              border-bottom:0.5px solid var(--border-default);">
                    Recall
                  </th>
                  <th style="padding:14px 16px; text-align:center;
                              color:var(--text-primary); font-size:12px;
                              border-bottom:0.5px solid var(--border-default);">
                    F1 Score
                  </th>
                  <th style="padding:14px 16px; text-align:center;
                              color:var(--text-primary); font-size:12px;
                              border-bottom:0.5px solid var(--border-default);">
                    False Positives
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of systems"
                    [style.background]="s.highlight ?
                      'rgba(79,70,229,0.04)' : 'transparent'">
                  <td style="padding:14px 16px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                      <div [style.background]="s.color"
                           style="width:10px; height:10px; border-radius:50%;">
                      </div>
                      <div>
                        <strong style="color:var(--text-primary); font-size:14px;">
                          {{ s.name }}
                        </strong>
                        <div style="font-size:11px; color:var(--text-muted);">
                          {{ s.description }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style="padding:14px 16px; text-align:center;">
                    <span [style.color]="s.color"
                          style="font-weight:700; font-size:16px;">
                      {{ s.accuracy }}%
                    </span>
                  </td>
                  <td style="padding:14px 16px; text-align:center;">
                    <span [style.color]="s.color"
                          style="font-weight:700; font-size:16px;">
                      {{ s.precision }}%
                    </span>
                  </td>
                  <td style="padding:14px 16px; text-align:center;">
                    <span [style.color]="s.color"
                          style="font-weight:700; font-size:16px;">
                      {{ s.recall }}%
                    </span>
                  </td>
                  <td style="padding:14px 16px; text-align:center;">
                    <span [style.color]="s.color"
                          style="font-weight:700; font-size:16px;">
                      {{ s.f1 }}%
                    </span>
                  </td>
                  <td style="padding:14px 16px; text-align:center;">
                    <span [style.background]="s.fp === 0 ?
                            'var(--color-success-bg)' : 'var(--color-danger-bg)'"
                          [style.color]="s.fp === 0 ?
                            'var(--color-success)' : 'var(--color-danger)'"
                          style="padding:4px 12px; border-radius:var(--radius-full);
                                 font-weight:700; font-size:13px;">
                      {{ s.fp }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Charts -->
        <div class="animate-fade-up-delay-2"
             style="display:grid; grid-template-columns:1fr 1fr;
                    gap:20px; margin-bottom:24px;">
          <div class="glass-card" style="padding:24px;">
            <h3 style="font-size:15px; font-weight:600; color:var(--text-accent);
                       margin-bottom:16px;">📈 Accuracy Comparison</h3>
            <canvas #accuracyChart></canvas>
          </div>
          <div class="glass-card" style="padding:24px;">
            <h3 style="font-size:15px; font-weight:600; color:var(--text-accent);
                       margin-bottom:16px;">📊 All Metrics</h3>
            <canvas #metricsChart></canvas>
          </div>
        </div>

        <!-- Key Findings -->
        <div class="glass-card animate-fade-up-delay-3"
             style="padding:24px; margin-bottom:24px;">
          <h3 style="font-size:15px; font-weight:600; color:var(--text-accent);
                     margin-bottom:20px;">🎯 Key Findings</h3>
          <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px;">
            <div style="background:var(--color-success-bg);
                        border-radius:var(--radius-md); padding:20px;
                        border-left:3px solid var(--color-success);">
              <div style="font-size:28px; font-weight:800;
                          color:var(--color-success);">+10.0%</div>
              <div style="color:var(--text-primary); font-size:13px;
                          margin-top:4px; font-weight:500;">
                Accuracy (C vs A)
              </div>
              <div style="color:var(--text-muted); font-size:12px; margin-top:6px;">
                System C beats current ATS by 10 points
              </div>
            </div>
            <div style="background:var(--color-success-bg);
                        border-radius:var(--radius-md); padding:20px;
                        border-left:3px solid var(--color-success);">
              <div style="font-size:28px; font-weight:800;
                          color:var(--color-success);">+9.5%</div>
              <div style="color:var(--text-primary); font-size:13px;
                          margin-top:4px; font-weight:500;">
                F1 Score (C vs A)
              </div>
              <div style="color:var(--text-muted); font-size:12px; margin-top:6px;">
                Largest improvement across all metrics
              </div>
            </div>
            <div style="background:var(--color-primary-light);
                        border-radius:var(--radius-md); padding:20px;
                        border-left:3px solid var(--color-primary);">
              <div style="font-size:28px; font-weight:800;
                          color:var(--color-primary);">7 → 0</div>
              <div style="color:var(--text-primary); font-size:13px;
                          margin-top:4px; font-weight:500;">
                False Positives (B)
              </div>
              <div style="color:var(--text-muted); font-size:12px; margin-top:6px;">
                System B eliminates all overconfident matches
              </div>
            </div>
            <div style="background:var(--color-primary-light);
                        border-radius:var(--radius-md); padding:20px;
                        border-left:3px solid var(--color-primary);">
              <div style="font-size:28px; font-weight:800;
                          color:var(--color-primary);">0.746</div>
              <div style="color:var(--text-primary); font-size:13px;
                          margin-top:4px; font-weight:500;">
                NDCG@3
              </div>
              <div style="color:var(--text-muted); font-size:12px; margin-top:6px;">
                Strong ranking quality
              </div>
            </div>
          </div>
        </div>

        <!-- Statistical Significance -->
        <div class="animate-fade-up-delay-3"
             style="display:grid; grid-template-columns:1fr 1fr;
                    gap:20px; margin-bottom:24px;">

          <div class="glass-card" style="padding:24px;">
            <h3 style="font-size:15px; font-weight:600; color:var(--text-accent);
                       margin-bottom:16px;">📐 Statistical Significance</h3>
            <table style="width:100%; font-size:13px;">
              <tr style="border-bottom:0.5px solid var(--border-default);">
                <td style="padding:8px 0; color:var(--text-muted);">
                  A vs B — T-statistic
                </td>
                <td style="padding:8px 0; font-weight:600; text-align:right;
                            color:var(--text-primary);">-1.2714</td>
              </tr>
              <tr style="border-bottom:0.5px solid var(--border-default);">
                <td style="padding:8px 0; color:var(--text-muted);">
                  A vs B — P-value
                </td>
                <td style="padding:8px 0; font-weight:600; text-align:right;
                            color:var(--color-warning);">0.2086 ⚠️</td>
              </tr>
              <tr style="border-bottom:0.5px solid var(--border-default);">
                <td style="padding:8px 0; color:var(--text-muted);">
                  A vs C — T-statistic
                </td>
                <td style="padding:8px 0; font-weight:600; text-align:right;
                            color:var(--text-primary);">-2.1872</td>
              </tr>
              <tr>
                <td style="padding:8px 0; color:var(--text-muted);">
                  A vs C — P-value
                </td>
                <td style="padding:8px 0; font-weight:600; text-align:right;
                            color:var(--color-success);">0.0327 ✅</td>
              </tr>
            </table>
            <div style="margin-top:16px; padding:12px;
                        background:var(--color-success-bg);
                        border-radius:var(--radius-md); font-size:13px;
                        color:var(--color-success);">
              ✅ System C result is statistically significant (p &lt; 0.05)
            </div>
          </div>

          <div class="glass-card" style="padding:24px;">
            <h3 style="font-size:15px; font-weight:600; color:var(--text-accent);
                       margin-bottom:16px;">🔬 Ablation Study</h3>
            <div *ngFor="let a of ablation"
                 style="display:flex; align-items:center; gap:10px;
                        margin-bottom:14px;">
              <span style="font-size:12px; color:var(--text-muted);
                           width:160px; flex-shrink:0;">
                {{ a.label }}
              </span>
              <div style="flex:1; background:rgba(0,0,0,0.06);
                          border-radius:var(--radius-full); height:8px;
                          overflow:hidden;">
                <div [style.width.%]="a.f1"
                     [style.background]="a.color"
                     style="height:100%; border-radius:var(--radius-full);
                            transition:width 1s ease;">
                </div>
              </div>
              <span [style.color]="a.color"
                    style="font-size:12px; font-weight:700; width:60px;
                           text-align:right;">
                {{ a.f1 }}%
              </span>
            </div>
          </div>

        </div>

        <!-- Detailed Breakdown -->
        <div class="glass-card animate-fade-up-delay-4"
             style="padding:24px; margin-bottom:24px;">
          <h3 style="font-size:15px; font-weight:600; color:var(--text-accent);
                     margin-bottom:20px;">🔍 Detailed Breakdown</h3>
          <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px;">
            <div *ngFor="let s of systems"
                 style="border-radius:var(--radius-md); padding:20px;"
                 [style.border]="'1.5px solid ' + s.color">
              <h4 [style.color]="s.color" style="margin:0 0 14px; font-size:14px;">
                {{ s.name }}
              </h4>
              <table style="width:100%; font-size:13px;">
                <tr>
                  <td style="padding:4px 0; color:var(--text-muted);">Correct</td>
                  <td style="padding:4px 0; font-weight:600; text-align:right;
                              color:var(--text-primary);">
                    {{ s.correct }}/60
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0; color:var(--text-muted);">
                    True Positives
                  </td>
                  <td style="padding:4px 0; font-weight:600; text-align:right;
                              color:var(--color-success);">
                    {{ s.tp }}
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0; color:var(--text-muted);">
                    True Negatives
                  </td>
                  <td style="padding:4px 0; font-weight:600; text-align:right;
                              color:var(--color-success);">
                    {{ s.tn }}
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0; color:var(--text-muted);">
                    False Positives
                  </td>
                  <td style="padding:4px 0; font-weight:600; text-align:right;
                              color:var(--color-danger);">
                    {{ s.fp }}
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0; color:var(--text-muted);">
                    False Negatives
                  </td>
                  <td style="padding:4px 0; font-weight:600; text-align:right;
                              color:var(--color-warning);">
                    {{ s.fn }}
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <!-- Synthetic Dataset -->
        <div class="glass-card animate-fade-up-delay-4"
             style="padding:24px; margin-bottom:24px;">
          <h3 style="font-size:15px; font-weight:600; color:var(--text-accent);
                     margin-bottom:8px;">🧪 Synthetic Evaluation Dataset</h3>
          <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">
            20 candidates with controlled ground truth — designed before
            model tuning to avoid evaluation bias
          </p>
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:13px;">
              <thead>
                <tr style="background:rgba(79,70,229,0.06);">
                  <th style="padding:10px 12px; text-align:left;
                              color:var(--text-primary); font-size:11px;
                              border-bottom:0.5px solid var(--border-default);">
                    ID
                  </th>
                  <th style="padding:10px 12px; text-align:left;
                              color:var(--text-primary); font-size:11px;
                              border-bottom:0.5px solid var(--border-default);">
                    Profile
                  </th>
                  <th style="padding:10px 12px; text-align:left;
                              color:var(--text-primary); font-size:11px;
                              border-bottom:0.5px solid var(--border-default);">
                    Key Skills
                  </th>
                  <th style="padding:10px 12px; text-align:center;
                              color:var(--color-danger); font-size:11px;
                              border-bottom:0.5px solid var(--border-default);">
                    ML Eng
                  </th>
                  <th style="padding:10px 12px; text-align:center;
                              color:var(--color-primary); font-size:11px;
                              border-bottom:0.5px solid var(--border-default);">
                    Full Stack
                  </th>
                  <th style="padding:10px 12px; text-align:center;
                              color:var(--color-success); font-size:11px;
                              border-bottom:0.5px solid var(--border-default);">
                    Frontend
                  </th>
                  <th style="padding:10px 12px; text-align:center;
                              color:var(--text-primary); font-size:11px;
                              border-bottom:0.5px solid var(--border-default);">
                    GitHub
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of syntheticCandidates; let i = index"
                    [style.background]="i % 2 === 0 ?
                      'transparent' : 'rgba(0,0,0,0.02)'">
                  <td style="padding:8px 12px; color:var(--text-muted);
                              font-weight:600; font-size:11px;">
                    {{ c.id }}
                  </td>
                  <td style="padding:8px 12px;">
                    <div style="font-weight:500; color:var(--text-primary);
                                font-size:12px;">
                      {{ c.name }}
                    </div>
                    <div style="color:var(--text-muted); font-size:11px;">
                      {{ c.description }}
                    </div>
                  </td>
                  <td style="padding:8px 12px;">
                    <div style="display:flex; flex-wrap:wrap; gap:4px;">
                      <span *ngFor="let skill of c.skills"
                            style="background:var(--color-primary-light);
                                   color:var(--color-primary); padding:1px 6px;
                                   border-radius:var(--radius-full); font-size:10px;">
                        {{ skill }}
                      </span>
                    </div>
                  </td>
                  <td style="padding:8px 12px; text-align:center; font-size:14px;">
                    {{ c.ml ? '✅' : '❌' }}
                  </td>
                  <td style="padding:8px 12px; text-align:center; font-size:14px;">
                    {{ c.fs ? '✅' : '❌' }}
                  </td>
                  <td style="padding:8px 12px; text-align:center; font-size:14px;">
                    {{ c.fe ? '✅' : '❌' }}
                  </td>
                  <td style="padding:8px 12px; text-align:center; font-size:14px;">
                    {{ c.hasGithub ? '🐙' : '—' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style="margin-top:16px; padding:14px;
                      background:var(--color-primary-light);
                      border-radius:var(--radius-md); font-size:13px;
                      color:var(--color-primary);">
            <strong>Design Principle:</strong> Ground truth labels were fixed
            before model development. Candidates cover fresh, stale, career
            transitions and mixed profiles. 8 candidates have synthetic
            GitHub timelines for controlled multi-source evaluation.
          </div>
        </div>

        <!-- Real Data -->
        <div class="glass-card animate-fade-up-delay-4" style="padding:24px;">
          <h3 style="font-size:15px; font-weight:600; color:var(--text-accent);
                     margin-bottom:16px;">📁 Real Data Evaluation</h3>
          <div style="display:grid; grid-template-columns:repeat(3,1fr);
                      gap:16px; margin-bottom:16px;">
            <div class="stat-card">
              <span class="stat-number">94</span>
              <div class="stat-label">IT Resumes</div>
            </div>
            <div class="stat-card">
              <span class="stat-number">1,943</span>
              <div class="stat-label">Job Postings</div>
            </div>
            <div class="stat-card">
              <span class="stat-number" style="color:var(--color-danger);">7</span>
              <div class="stat-label">Overconfident Fixed</div>
            </div>
          </div>
          <div style="padding:16px; background:var(--color-success-bg);
                      border-radius:var(--radius-md);
                      border-left:3px solid var(--color-success);">
            <p style="margin:0; font-size:13px; color:var(--text-secondary);
                      line-height:1.6;">
              <strong style="color:var(--text-primary);">Key Finding:</strong>
              System A produced a 100% match score for a Database Administrator
              role where the candidate's skills were demonstrably outdated.
              System B correctly reduced this to 36.8%. System C with GitHub
              signals further refines matching by detecting skills maintained
              through open-source contributions.
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
      name: 'System A', description: 'Static Baseline (Current ATS)',
      color: '#dc2626', highlight: false,
      accuracy: 75.0, precision: 63.2, recall: 60.0, f1: 61.5,
      fp: 7, correct: 45, tp: 12, tn: 33, fn: 8
    },
    {
      name: 'System B', description: 'CV Decay Only',
      color: '#4f46e5', highlight: false,
      accuracy: 81.7, precision: 100.0, recall: 45.0, f1: 62.1,
      fp: 0, correct: 49, tp: 9, tn: 40, fn: 11
    },
    {
      name: 'System C', description: 'Multi-Source (CV + GitHub)',
      color: '#059669', highlight: true,
      accuracy: 85.0, precision: 100.0, recall: 55.0, f1: 71.0,
      fp: 0, correct: 51, tp: 11, tn: 40, fn: 9
    }
  ];

  ablation = [
    { label: 'No Decay (Baseline)', f1: 61.5, color: '#dc2626' },
    { label: 'Uniform Decay', f1: 68.7, color: '#d97706' },
    { label: 'Category Decay', f1: 62.1, color: '#4f46e5' },
    { label: 'CV + GitHub (System C)', f1: 71.0, color: '#059669' }
  ];

  syntheticCandidates = [
    { id: 'C001', name: 'Fresh ML Engineer', description: 'Recently active (2024)', skills: ['python', 'tensorflow', 'nlp'], ml: true, fs: false, fe: false, hasGithub: true },
    { id: 'C002', name: 'Stale ML Engineer', description: 'ML skills from 2017', skills: ['python↓', 'tensorflow↓'], ml: false, fs: false, fe: false, hasGithub: false },
    { id: 'C003', name: 'Fresh Full Stack', description: 'Active full stack (2024)', skills: ['angular', 'node.js', 'mongodb'], ml: false, fs: true, fe: true, hasGithub: true },
    { id: 'C004', name: 'Stale Full Stack', description: 'FS skills from 2017', skills: ['angular↓', 'node.js↓'], ml: false, fs: false, fe: false, hasGithub: false },
    { id: 'C005', name: 'Mixed Skills Dev', description: 'Fresh Python, stale Angular', skills: ['python', 'ML', 'angular↓'], ml: true, fs: false, fe: false, hasGithub: true },
    { id: 'C006', name: 'Career Switcher ML', description: 'Was FS, switched to ML', skills: ['python', 'tensorflow'], ml: true, fs: false, fe: false, hasGithub: true },
    { id: 'C007', name: 'Fresh Frontend', description: 'Strong frontend (2024)', skills: ['react', 'typescript', 'css'], ml: false, fs: false, fe: true, hasGithub: true },
    { id: 'C008', name: 'Generalist Dev', description: 'Average skills (2022)', skills: ['python', 'javascript'], ml: true, fs: true, fe: false, hasGithub: true },
    { id: 'C009', name: 'Recently Upskilled', description: 'Java → Python/ML', skills: ['python', 'tensorflow', 'java↓'], ml: true, fs: false, fe: false, hasGithub: true },
    { id: 'C010', name: 'Outdated Full Stack', description: 'FS from 2018', skills: ['angular↓', 'node.js↓'], ml: false, fs: false, fe: false, hasGithub: false },
    { id: 'C011', name: 'Current Full Stack', description: 'Active FS (2024)', skills: ['angular', 'node.js', 'ts'], ml: false, fs: true, fe: true, hasGithub: true },
    { id: 'C012', name: 'Senior Mixed Dev', description: 'Fresh Python, stale Java', skills: ['python', 'javascript', 'java↓'], ml: true, fs: false, fe: false, hasGithub: false },
    { id: 'C013', name: 'Fresh Data Scientist', description: 'Active DS (2024)', skills: ['python', 'ML', 'pandas'], ml: true, fs: false, fe: false, hasGithub: true },
    { id: 'C014', name: 'Stale Frontend', description: 'FE from 2018', skills: ['react↓', 'javascript↓'], ml: false, fs: false, fe: false, hasGithub: false },
    { id: 'C015', name: 'Moderate Full Stack', description: 'FS from 2021', skills: ['angular', 'node.js'], ml: false, fs: true, fe: false, hasGithub: true },
    { id: 'C016', name: 'Career Switcher FE', description: 'Backend → Frontend', skills: ['react', 'typescript'], ml: false, fs: false, fe: true, hasGithub: true },
    { id: 'C017', name: 'Ghost GitHub User', description: 'KEY: Stale CV, active GitHub', skills: ['angular↓', 'node.js↓'], ml: false, fs: true, fe: true, hasGithub: true },
    { id: 'C018', name: 'Moderate ML Eng', description: 'ML from 2022', skills: ['python', 'tensorflow'], ml: true, fs: false, fe: false, hasGithub: true },
    { id: 'C019', name: 'Very Stale All', description: 'All from 2016', skills: ['python↓', 'angular↓'], ml: false, fs: false, fe: false, hasGithub: false },
    { id: 'C020', name: 'Balanced Dev', description: 'Good mix (2024)', skills: ['python', 'react', 'ML'], ml: true, fs: false, fe: true, hasGithub: true }
  ];

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.buildAccuracyChart();
      this.buildMetricsChart();
    }, 200);
  }

  buildAccuracyChart() {
    if (!this.accuracyChartRef) return;
    new Chart(this.accuracyChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['System A', 'System B', 'System C'],
        datasets: [{
          label: 'Accuracy (%)',
          data: [75.0, 81.7, 85.0],
          backgroundColor: ['#dc2626', '#4f46e5', '#059669'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false, min: 70, max: 90,
            grid: { color: 'rgba(0,0,0,0.04)' },
            title: { display: true, text: 'Accuracy (%)' }
          },
          x: { grid: { display: false } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  buildMetricsChart() {
    if (!this.metricsChartRef) return;
    new Chart(this.metricsChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
        datasets: [
          {
            label: 'System A',
            data: [75.0, 63.2, 60.0, 61.5],
            backgroundColor: 'rgba(220,38,38,0.8)',
            borderRadius: 4
          },
          {
            label: 'System B',
            data: [81.7, 100.0, 45.0, 62.1],
            backgroundColor: 'rgba(79,70,229,0.8)',
            borderRadius: 4
          },
          {
            label: 'System C',
            data: [85.0, 100.0, 55.0, 71.0],
            backgroundColor: 'rgba(5,150,105,0.8)',
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
}
