import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evaluation.html'
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
