import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-job-matches',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './job-matches.html'
})
export class JobMatchesComponent implements OnInit {
  matches: any[] = [];

  ngOnInit() {
    const stored = localStorage.getItem('jobMatches');
    if (!stored) return;
    const data = JSON.parse(stored);
    this.matches = data?.data?.matches || data?.matches || [];
  }

  getScoreColor(score: number): string {
    if (score >= 60) return '#059669';
    if (score >= 35) return '#4f46e5';
    return '#dc2626';
  }

  getCircle(score: number): string {
    const circumference = 2 * Math.PI * 28;
    const filled = (score / 100) * circumference;
    return `${filled} ${circumference}`;
  }

  getRecommendation(job: any): string {
    if (!job.missing_skills?.length) {
      return 'You meet all requirements — apply with confidence!';
    }
    if (job.match_percentage >= 50) {
      return `Strong match! Brush up on ${job.missing_skills.slice(0, 2).join(', ')} to strengthen your application.`;
    }
    return `Upskill in ${job.missing_skills.slice(0, 3).join(', ')} to improve your chances.`;
  }
}