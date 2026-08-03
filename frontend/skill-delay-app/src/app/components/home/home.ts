import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html'
})
export class HomeComponent implements OnInit, AfterViewInit {

  skillsA = [
    { name: 'Python', year: 2024 },
    { name: 'TensorFlow', year: 2024 },
    { name: 'Angular', year: 2020 },
    { name: 'Java', year: 2016 },
    { name: 'jQuery', year: 2015 }
  ];

  skillsC = [
    { name: 'Python', year: 2024, score: 67, strength: 'moderate' },
    { name: 'TensorFlow', year: 2024, score: 82, strength: 'strong' },
    { name: 'Angular', year: 2020, score: 45, strength: 'moderate' },
    { name: 'Java', year: 2016, score: 22, strength: 'weak' },
    { name: 'jQuery', year: 2015, score: 8, strength: 'outdated' }
  ];

  steps = [
    {
      icon: '📄',
      title: 'Upload your CV',
      desc: 'PDF or DOCX. We extract every skill and when you used it.'
    },
    {
      icon: '⏳',
      title: 'Decay scoring',
      desc: 'Each skill gets a freshness score using S(t) = e^(−λt).'
    },
    {
      icon: '🐙',
      title: 'GitHub signals',
      desc: 'We check your public repos to catch skills used in personal projects.'
    },
    {
      icon: '💼',
      title: 'Ranked matches',
      desc: 'Jobs ranked by your actual current skill strength — not keywords.'
    }
  ];

  results = [
    {
      label: 'System A — Static ATS',
      pct: 75.0,
      color: '#dc2626',
      animated: false
    },
    {
      label: 'System B — CV decay only',
      pct: 81.7,
      color: '#4f46e5',
      animated: false
    },
    {
      label: 'System C — CV + GitHub',
      pct: 85.0,
      color: '#059669',
      animated: false
    }
  ];

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.animateCounter('stat-acc', 85.0, '%', 1500);
      this.animateCounter('stat-jobs', 1943, '', 1500);
      this.animateCounter('stat-imp', 10, '%', 1500);
    }, 400);

    setTimeout(() => {
      this.results = this.results.map(r => ({ ...r, animated: true }));
    }, 600);
  }

  animateCounter(
    id: string,
    target: number,
    suffix: string,
    duration: number
  ) {
    const el = document.getElementById(id);
    if (!el) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = (
        Number.isInteger(target)
          ? Math.round(start)
          : Math.round(start * 10) / 10
      ) + suffix;
      if (start >= target) clearInterval(timer);
    }, 16);
  }
}