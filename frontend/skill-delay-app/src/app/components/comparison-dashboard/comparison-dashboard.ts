import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-comparison-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comparison-dashboard.html',
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