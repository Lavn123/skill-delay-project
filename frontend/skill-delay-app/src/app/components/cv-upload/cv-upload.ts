import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SkillApiService } from '../../services/skill-api';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-cv-upload',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div style="min-height:100vh; background:var(--gradient-bg); padding:50px 20px;">
      <div style="max-width:750px; margin:0 auto;">

        <!-- Header -->
        <div class="animate-fade-up" style="margin-bottom:32px;">
          <h2 style="font-size:32px; font-weight:700; letter-spacing:-0.5px;
                     color:var(--text-primary); margin-bottom:8px;">
            Upload Your CV
          </h2>
          <p style="color:var(--text-secondary); font-size:15px;">
            We'll extract your skills, calculate freshness scores and
            match you to real jobs
          </p>
        </div>

        <!-- Upload Mode Toggle -->
        <div class="animate-fade-up-delay-1 glass-card"
             style="padding:32px; margin-bottom:20px;">

          <div style="display:flex; gap:8px; margin-bottom:28px;
                      background:rgba(0,0,0,0.04); border-radius:var(--radius-md);
                      padding:4px;">
            <button (click)="uploadMode='file'"
                    [style.background]="uploadMode==='file' ?
                      'var(--gradient-primary)' : 'transparent'"
                    [style.color]="uploadMode==='file' ?
                      'white' : 'var(--text-secondary)'"
                    style="flex:1; padding:10px; border:none;
                           border-radius:var(--radius-md); cursor:pointer;
                           font-size:14px; font-weight:500; transition:all 0.2s;">
              📁 Upload File
            </button>
            <button (click)="uploadMode='text'"
                    [style.background]="uploadMode==='text' ?
                      'var(--gradient-primary)' : 'transparent'"
                    [style.color]="uploadMode==='text' ?
                      'white' : 'var(--text-secondary)'"
                    style="flex:1; padding:10px; border:none;
                           border-radius:var(--radius-md); cursor:pointer;
                           font-size:14px; font-weight:500; transition:all 0.2s;">
              ✏️ Paste Text
            </button>
          </div>

          <!-- File Upload -->
          <div *ngIf="uploadMode==='file'" style="margin-bottom:24px;">
            <div (dragover)="onDragOver($event)"
                 (dragleave)="onDragLeave($event)"
                 (drop)="onDrop($event)"
                 (click)="fileInput.click()"
                 [style.borderColor]="isDragging ?
                   'var(--color-primary)' : 'var(--border-strong)'"
                 [style.background]="isDragging ?
                   'var(--color-primary-light)' : 'rgba(255,255,255,0.5)'"
                 style="border:2px dashed var(--border-strong);
                        border-radius:var(--radius-lg); padding:48px 24px;
                        text-align:center; cursor:pointer; transition:all 0.3s;">
              <input #fileInput type="file" accept=".pdf,.docx"
                     style="display:none" (change)="onFileSelected($event)">

              <div *ngIf="!selectedFile">
                <div style="font-size:48px; margin-bottom:16px;">📂</div>
                <p style="color:var(--text-primary); font-size:16px;
                           font-weight:600; margin:0 0 8px;">
                  Drop your CV here or click to browse
                </p>
                <p style="color:var(--text-muted); font-size:13px; margin:0;">
                  PDF and DOCX supported · Max 5MB
                </p>
              </div>

              <div *ngIf="selectedFile">
                <div style="font-size:48px; margin-bottom:12px;">
                  {{ selectedFile.name.endsWith('.pdf') ? '📕' : '📘' }}
                </div>
                <p style="color:var(--text-primary); font-size:16px;
                           font-weight:600; margin:0 0 4px;">
                  {{ selectedFile.name }}
                </p>
                <p style="color:var(--text-muted); font-size:13px; margin:0;">
                  {{ (selectedFile.size / 1024).toFixed(0) }} KB · Click to change
                </p>
              </div>
            </div>
          </div>

          <!-- Text Paste -->
          <div *ngIf="uploadMode==='text'" style="margin-bottom:24px;">
            <textarea [(ngModel)]="cvText" rows="12"
                      placeholder="Paste your CV here...

Example:
John Smith — Software Engineer

Senior Developer at Google 2022 - 2024
Python, TensorFlow, MongoDB, Machine Learning

Full Stack Developer at Startup 2020 - 2022
Angular, Node.js, JavaScript, MongoDB"
                      style="width:100%; padding:14px; line-height:1.7;
                             resize:vertical; font-family:inherit; font-size:14px;
                             box-sizing:border-box;">
            </textarea>
          </div>

          <!-- GitHub Username -->
          <div style="margin-bottom:28px;">
            <label style="display:block; margin-bottom:8px; font-weight:600;
                          color:var(--text-primary); font-size:14px;">
              GitHub Username
              <span style="font-weight:400; color:var(--text-muted);
                           font-size:13px;"> — optional but improves accuracy</span>
            </label>
            <div style="position:relative;">
              <span style="position:absolute; left:14px; top:50%;
                           transform:translateY(-50%); color:var(--text-muted);
                           font-size:13px;">
                github.com/
              </span>
              <input [(ngModel)]="githubUsername" type="text"
                     placeholder="your-username"
                     style="padding-left:100px;" />
            </div>
            <p style="color:var(--text-muted); font-size:12px; margin-top:6px;">
              🐙 Detects skills maintained through personal projects and
              open-source contributions
            </p>
          </div>

          <!-- Submit -->
          <button (click)="analyse()" [disabled]="loading"
                  class="btn-primary"
                  style="width:100%; padding:16px; font-size:16px;
                         justify-content:center;"
                  [style.opacity]="loading ? '0.7' : '1'">
            <span *ngIf="!loading">🔍 Analyse My Skills →</span>
            <span *ngIf="loading">⏳ Analysing your skills...</span>
          </button>

          <!-- Error -->
          <div *ngIf="error"
               style="margin-top:16px; padding:14px 16px;
                      background:var(--color-danger-bg);
                      border:0.5px solid var(--color-danger);
                      border-radius:var(--radius-md); color:var(--color-danger);
                      font-size:14px;">
            ⚠️ {{ error }}
          </div>

        </div>

        <!-- Tips -->
        <div class="animate-fade-up-delay-2 glass-card" style="padding:24px;">
          <h4 style="color:var(--text-primary); margin:0 0 12px;
                     font-size:14px; font-weight:600;">
            💡 Tips for best results
          </h4>
          <ul style="color:var(--text-secondary); font-size:13px;
                     line-height:2; margin:0; padding-left:20px;">
            <li>Include dates for each role (e.g. 2020 - 2022)</li>
            <li>List technologies used in each position</li>
            <li>Add your GitHub username to detect skills from personal projects</li>
            <li>The more detail you provide, the more accurate the matching</li>
          </ul>
        </div>

      </div>
    </div>
  `
})
export class CvUploadComponent {
  uploadMode = 'file';
  cvText = '';
  githubUsername = '';
  loading = false;
  error = '';
  selectedFile: File | null = null;
  isDragging = false;

  constructor(
    private apiService: SkillApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) this.selectedFile = files[0];
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  getUserId(): string {
    const user = this.authService.getUser();
    return user?.id || user?._id || '';
  }

  analyse() {
    this.error = '';

    if (this.uploadMode === 'file') {
      if (!this.selectedFile) {
        this.error = 'Please select a PDF or DOCX file!';
        return;
      }
      const fileName = this.selectedFile.name.toLowerCase();
      if (!fileName.endsWith('.pdf') && !fileName.endsWith('.docx')) {
        this.error = 'Only PDF and DOCX files are supported!';
        return;
      }
      if (this.selectedFile.size > 5 * 1024 * 1024) {
        this.error = 'File is too large. Maximum size is 5MB!';
        return;
      }
      this.analyseFile();
    } else {
      if (!this.cvText.trim()) {
        this.error = 'Please paste your CV text!';
        return;
      }
      if (this.cvText.trim().length < 100) {
        this.error = 'CV text is too short. Please paste your full CV!';
        return;
      }
      this.analyseText();
    }
  }

  analyseFile() {
    this.loading = true;
    const userId = this.getUserId();

    this.apiService.uploadCVFile(
      this.selectedFile!,
      this.githubUsername,
      userId
    ).subscribe({
      next: (result: any) => {
        if (result.data?.error) {
          this.error = result.data.error;
          this.loading = false;
          return;
        }
        const data = result.data;
        if (!data.skill_profile ||
            Object.keys(data.skill_profile).length === 0) {
          this.error = 'No skills found in your CV!';
          this.loading = false;
          return;
        }
        localStorage.setItem('cvText', data.cv_text || '');
        localStorage.setItem('githubUsername', this.githubUsername);
        localStorage.setItem('skillProfile',
          JSON.stringify(data.skill_profile));
        localStorage.setItem('jobMatches',
          JSON.stringify({ data: { matches: data.matches } }));
        this.loading = false;
        this.router.navigate(['/jobs']);
      },
      error: (err: any) => {
        this.error = err.status === 0
          ? 'Cannot connect to server. Make sure all services are running!'
          : 'Error uploading file. Please try again!';
        this.loading = false;
      }
    });
  }

  analyseText() {
    this.loading = true;
    const userId = this.getUserId();

    this.apiService.parseCV(this.cvText).subscribe({
      next: (parseResult: any) => {
        const skillProfile = parseResult.data?.skill_profile;
        if (!skillProfile || Object.keys(skillProfile).length === 0) {
          this.error = 'No skills found in your CV!';
          this.loading = false;
          return;
        }
        localStorage.setItem('cvText', this.cvText);
        localStorage.setItem('githubUsername', this.githubUsername);
        localStorage.setItem('skillProfile', JSON.stringify(skillProfile));

        this.apiService.matchJobs(
          this.cvText, this.githubUsername, userId
        ).subscribe({
          next: (matchResult: any) => {
            const matches = matchResult?.data?.matches ||
                           matchResult?.matches || [];
            if (matches.length === 0) {
              this.error = 'No job matches found!';
              this.loading = false;
              return;
            }
            localStorage.setItem('jobMatches', JSON.stringify(matchResult));
            this.loading = false;
            this.router.navigate(['/jobs']);
          },
          error: () => {
            this.error = 'Error getting job matches!';
            this.loading = false;
          }
        });
      },
      error: (err: any) => {
        this.error = err.status === 0
          ? 'Cannot connect to server!'
          : 'Error analysing CV. Please try again!';
        this.loading = false;
      }
    });
  }
}