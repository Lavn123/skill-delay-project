import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-skill-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './skill-dashboard.html'
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