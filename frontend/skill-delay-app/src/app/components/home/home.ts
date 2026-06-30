import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="text-align:center; padding:80px 20px;">
      <h1 style="color:#1F3864; font-size:40px;">
        🎯 Skill Decay Analyser
      </h1>
      <p style="font-size:18px; color:#555; max-width:600px; margin:20px auto;">
        Upload your CV and GitHub profile to get a 
        time-aware skill freshness score and personalised 
        job recommendations.
      </p>
      <a routerLink="/upload">
        <button style="background:#2E75B6; color:white; padding:15px 40px; 
                       font-size:18px; border:none; border-radius:8px; cursor:pointer;">
          Get Started →
        </button>
      </a>

      <div style="display:flex; justify-content:center; gap:40px; margin-top:60px;">
        <div style="background:#f5f5f5; padding:30px; border-radius:10px; width:200px;">
          <div style="font-size:40px;">📄</div>
          <h3>CV Parser</h3>
          <p style="color:#777;">Extracts skills and dates from your CV</p>
        </div>
        <div style="background:#f5f5f5; padding:30px; border-radius:10px; width:200px;">
          <div style="font-size:40px;">⏳</div>
          <h3>Decay Model</h3>
          <p style="color:#777;">Calculates how fresh each skill is</p>
        </div>
        <div style="background:#f5f5f5; padding:30px; border-radius:10px; width:200px;">
          <div style="font-size:40px;">💼</div>
          <h3>Job Matching</h3>
          <p style="color:#777;">Matches you to the right jobs</p>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {}