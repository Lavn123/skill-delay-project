import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-skill-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="max-width:800px; margin:50px auto; padding:20px;">
      <h2 style="color:#1F3864;">📊 Your Skill Freshness Dashboard</h2>

      <div *ngIf="!skills.length" style="text-align:center; padding:40px;">
        <p>No skill data yet.</p>
        <a routerLink="/upload">
          <button style="background:#2E75B6; color:white; padding:10px 20px; 
                         border:none; border-radius:8px; cursor:pointer;">
            Upload CV First
          </button>
        </a>
      </div>

      <div *ngFor="let s of skills"
           style="background:white; border:1px solid #ddd; border-radius:10px; 
                  padding:15px 20px; margin-bottom:12px; 
                  box-shadow:0 1px 3px rgba(0,0,0,0.08)">
        
        <div style="display:flex; justify-content:space-between; 
                    align-items:center; margin-bottom:8px;">
          <strong style="text-transform:capitalize; font-size:16px;">
            {{ s.name }}
          </strong>
          <span [style.color]="getStrengthColor(s.strength)" 
                style="font-weight:bold;">
            {{ s.strength }} ({{ (s.freshness_score * 100).toFixed(0) }}%)
          </span>
        </div>

        <div style="background:#eee; border-radius:10px; 
                    height:12px; overflow:hidden;">
          <div [style.width.%]="s.freshness_score * 100"
               [style.background]="getStrengthColor(s.strength)"
               style="height:100%; transition:width 0.5s;">
          </div>
        </div>

        <div style="font-size:13px; color:#888; margin-top:6px;">
          Last used: {{ s.last_used }} · Category: {{ s.category }}
        </div>
      </div>
    </div>
  `
})
export class SkillDashboardComponent implements OnInit {
  skills: any[] = [];

  ngOnInit() {
    const stored = localStorage.getItem('skillProfile');

    if (!stored) {
      console.log('No skill profile found in localStorage');
      return;
    }

    const profile = JSON.parse(stored);

    this.skills = Object.entries(profile)
      .map(([name, data]: [string, any]) => ({
        name,
        ...data
      }))
      .sort((a, b) => b.freshness_score - a.freshness_score);

    console.log('Skills loaded:', this.skills.length);
  }

  getStrengthColor(strength: string): string {
    switch (strength) {
      case 'Strong': return '#28a745';
      case 'Moderate': return '#2E75B6';
      case 'Weak': return '#ffc107';
      default: return '#dc3545';
    }
  }
}