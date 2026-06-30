import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SkillApiService } from '../../services/skill-api';

@Component({
  selector: 'app-cv-upload',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div style="max-width:700px; margin:50px auto; padding:20px;">
      <h2 style="color:#1F3864;">📄 Upload Your CV</h2>
      
      <div style="margin-bottom:20px;">
        <label style="display:block; margin-bottom:8px; font-weight:bold;">
          Paste your CV text:
        </label>
        <textarea 
          [(ngModel)]="cvText"
          rows="12"
          style="width:100%; padding:10px; border:1px solid #ccc; 
                 border-radius:8px; font-size:14px;"
          placeholder="Paste your CV content here...">
        </textarea>
      </div>

      <div style="margin-bottom:20px;">
        <label style="display:block; margin-bottom:8px; font-weight:bold;">
          GitHub Username (optional):
        </label>
        <input 
          [(ngModel)]="githubUsername"
          type="text"
          style="width:100%; padding:10px; border:1px solid #ccc; 
                 border-radius:8px; font-size:14px;"
          placeholder="e.g. torvalds" />
      </div>

      <button 
        (click)="analyse()"
        [disabled]="loading"
        style="background:#2E75B6; color:white; padding:12px 30px; 
               font-size:16px; border:none; border-radius:8px; cursor:pointer;">
        {{ loading ? 'Analysing...' : 'Analyse My Skills →' }}
      </button>

      <div *ngIf="error" style="color:red; margin-top:10px;">
        {{ error }}
      </div>
    </div>
  `
})
export class CvUploadComponent {
  cvText = '';
  githubUsername = '';
  loading = false;
  error = '';

  constructor(
    private apiService: SkillApiService,
    private router: Router
  ) {}

  analyse() {
    if (!this.cvText.trim()) {
      this.error = 'Please paste your CV text first!';
      return;
    }

    this.loading = true;
    this.error = '';

    this.apiService.matchJobs(this.cvText, this.githubUsername).subscribe({
      next: (result: any) => {
        localStorage.setItem('cvText', this.cvText);
        localStorage.setItem('githubUsername', this.githubUsername);
        localStorage.setItem('jobMatches', JSON.stringify(result));
        this.loading = false;
        this.router.navigate(['/jobs']);
      },
      error: (err: any) => {
        this.error = 'Error connecting to server. Make sure backend is running!';
        this.loading = false;
      }
    });
  }
}