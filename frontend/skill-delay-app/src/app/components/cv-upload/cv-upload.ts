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
    <div style="min-height:100vh; background:linear-gradient(135deg, #f5f7fa, #e8f0fe); 
                padding:50px 20px;">
      <div style="max-width:750px; margin:0 auto;">
        
        <h2 style="color:#1F3864; font-size:32px; margin-bottom:8px;">
          📄 Upload Your CV
        </h2>
        <p style="color:#777; margin-bottom:30px;">
          Paste your CV text below to get your personalised skill freshness analysis
        </p>

        <div style="background:white; border-radius:16px; padding:35px;
                    box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <div style="margin-bottom:24px;">
            <label style="display:block; margin-bottom:8px; font-weight:600;
                          color:#1F3864;">
              CV Text
            </label>
            <textarea #cvTextarea
              [(ngModel)]="cvText"
              rows="14"
              style="width:100%; padding:14px; border:2px solid #e0e0e0; 
                     border-radius:10px; font-size:14px; line-height:1.6;
                     resize:vertical; outline:none; transition:border 0.3s;
                     font-family:inherit; box-sizing:border-box;"
              placeholder="Paste your CV here...

Example:
John Smith - Software Engineer

Senior Developer at Google 2022 - 2024
Python, TensorFlow, MongoDB, Machine Learning

Full Stack Developer at Startup 2020 - 2022
Angular, Node.js, JavaScript, MongoDB"
              (focus)="cvTextarea.style.borderColor='#2E75B6'"
              (blur)="cvTextarea.style.borderColor='#e0e0e0'">
            </textarea>
          </div>

          <div style="margin-bottom:30px;">
            <label style="display:block; margin-bottom:8px; font-weight:600;
                          color:#1F3864;">
              GitHub Username 
              <span style="font-weight:400; color:#999;">(optional)</span>
            </label>
            <div style="position:relative;">
              <span style="position:absolute; left:14px; top:50%; 
                           transform:translateY(-50%); color:#999;">
                github.com/
              </span>
              <input 
                [(ngModel)]="githubUsername"
                type="text"
                style="width:100%; padding:12px 14px 12px 100px; 
                       border:2px solid #e0e0e0; border-radius:10px; 
                       font-size:14px; outline:none; box-sizing:border-box;"
                placeholder="your-username" />
            </div>
            <p style="color:#999; font-size:13px; margin-top:6px;">
              Adding GitHub improves accuracy by detecting skills used in personal projects
            </p>
          </div>

          <button 
            (click)="analyse()"
            [disabled]="loading"
            style="width:100%; background:linear-gradient(135deg, #2E75B6, #1F3864); 
                   color:white; padding:16px; font-size:17px; border:none; 
                   border-radius:10px; cursor:pointer;
                   box-shadow:0 4px 15px rgba(46,117,182,0.3);
                   transition:opacity 0.3s;"
            [style.opacity]="loading ? '0.7' : '1'">
            {{ loading ? '⏳ Analysing your skills...' : '🔍 Analyse My Skills →' }}
          </button>

          <div *ngIf="error" 
               style="margin-top:15px; padding:12px 16px; background:#fee; 
                      border:1px solid #fcc; border-radius:8px; color:#c00;">
            ⚠️ {{ error }}
          </div>

        </div>

        <!-- Tips -->
        <div style="margin-top:24px; background:white; border-radius:16px; 
                    padding:24px 30px; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <h4 style="color:#1F3864; margin:0 0 12px;">💡 Tips for best results</h4>
          <ul style="color:#666; font-size:14px; line-height:1.8; 
                     margin:0; padding-left:20px;">
            <li>Include dates for each job role (e.g. 2020 - 2022)</li>
            <li>List the technologies you used in each role</li>
            <li>The more detail you provide, the better the analysis</li>
          </ul>
        </div>

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

    this.apiService.parseCV(this.cvText).subscribe({
      next: (parseResult: any) => {
        const skillProfile = parseResult.data?.skill_profile;
        localStorage.setItem('cvText', this.cvText);
        localStorage.setItem('githubUsername', this.githubUsername);
        localStorage.setItem('skillProfile', JSON.stringify(skillProfile));

        this.apiService.matchJobs(this.cvText, this.githubUsername).subscribe({
          next: (matchResult: any) => {
            localStorage.setItem('jobMatches', JSON.stringify(matchResult));
            this.loading = false;
            this.router.navigate(['/jobs']);
          },
          error: (err: any) => {
            this.error = 'Error getting job matches. Make sure all services are running!';
            this.loading = false;
          }
        });
      },
      error: (err: any) => {
        this.error = 'Error connecting to server. Make sure backend is running!';
        this.loading = false;
      }
    });
  }
}