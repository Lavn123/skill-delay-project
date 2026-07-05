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
          Upload your CV as PDF or DOCX to get your personalised skill freshness analysis
        </p>

        <div style="background:white; border-radius:16px; padding:35px;
                    box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- Upload Method Toggle -->
          <div style="display:flex; gap:10px; margin-bottom:24px;">
            <button (click)="uploadMode='file'"
                    [style.background]="uploadMode==='file' ? 'linear-gradient(135deg, #2E75B6, #1F3864)' : '#f0f4ff'"
                    [style.color]="uploadMode==='file' ? 'white' : '#2E75B6'"
                    style="flex:1; padding:10px; border:none; border-radius:8px; 
                           cursor:pointer; font-size:14px; font-weight:600;">
              📁 Upload File
            </button>
            <button (click)="uploadMode='text'"
                    [style.background]="uploadMode==='text' ? 'linear-gradient(135deg, #2E75B6, #1F3864)' : '#f0f4ff'"
                    [style.color]="uploadMode==='text' ? 'white' : '#2E75B6'"
                    style="flex:1; padding:10px; border:none; border-radius:8px; 
                           cursor:pointer; font-size:14px; font-weight:600;">
              ✏️ Paste Text
            </button>
          </div>

          <!-- File Upload Mode -->
          <div *ngIf="uploadMode==='file'" style="margin-bottom:24px;">
            <div (dragover)="onDragOver($event)"
                 (dragleave)="onDragLeave($event)"
                 (drop)="onDrop($event)"
                 [style.borderColor]="isDragging ? '#2E75B6' : '#ddd'"
                 [style.background]="isDragging ? '#f0f4ff' : '#fafafa'"
                 style="border:2px dashed #ddd; border-radius:12px; 
                        padding:40px; text-align:center; cursor:pointer;
                        transition:all 0.3s;"
                 (click)="fileInput.click()">
              <input #fileInput type="file" 
                     accept=".pdf,.docx"
                     style="display:none"
                     (change)="onFileSelected($event)">
              
              <div *ngIf="!selectedFile">
                <div style="font-size:48px; margin-bottom:12px;">📂</div>
                <p style="color:#555; font-size:16px; margin:0 0 8px; font-weight:600;">
                  Drop your CV here or click to browse
                </p>
                <p style="color:#999; font-size:13px; margin:0;">
                  Supports PDF and DOCX files
                </p>
              </div>

              <div *ngIf="selectedFile">
                <div style="font-size:48px; margin-bottom:12px;">
                  {{ selectedFile.name.endsWith('.pdf') ? '📕' : '📘' }}
                </div>
                <p style="color:#1F3864; font-size:16px; margin:0 0 4px; font-weight:600;">
                  {{ selectedFile.name }}
                </p>
                <p style="color:#999; font-size:13px; margin:0;">
                  {{ (selectedFile.size / 1024).toFixed(0) }} KB · Click to change
                </p>
              </div>
            </div>
          </div>

          <!-- Text Paste Mode -->
          <div *ngIf="uploadMode==='text'" style="margin-bottom:24px;">
            <textarea 
              [(ngModel)]="cvText"
              rows="14"
              style="width:100%; padding:14px; border:2px solid #e0e0e0; 
                     border-radius:10px; font-size:14px; line-height:1.6;
                     resize:vertical; outline:none; font-family:inherit; 
                     box-sizing:border-box;"
              placeholder="Paste your CV here...

Example:
John Smith - Software Engineer

Senior Developer at Google 2022 - 2024
Python, TensorFlow, MongoDB, Machine Learning

Full Stack Developer at Startup 2020 - 2022
Angular, Node.js, JavaScript, MongoDB">
            </textarea>
          </div>

          <!-- GitHub Username -->
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
          </div>

          <!-- Submit Button -->
          <button 
            (click)="analyse()"
            [disabled]="loading"
            style="width:100%; background:linear-gradient(135deg, #2E75B6, #1F3864); 
                   color:white; padding:16px; font-size:17px; border:none; 
                   border-radius:10px; cursor:pointer;"
            [style.opacity]="loading ? '0.7' : '1'">
            {{ loading ? '⏳ Analysing your skills...' : '🔍 Analyse My Skills →' }}
          </button>

          <div *ngIf="error" 
               style="margin-top:15px; padding:12px 16px; background:#fee; 
                      border:1px solid #fcc; border-radius:8px; color:#c00;">
            ⚠️ {{ error }}
          </div>

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
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  analyse() {
    this.error = '';

    if (this.uploadMode === 'file') {
      if (!this.selectedFile) {
        this.error = 'Please select a PDF or DOCX file!';
        return;
      }

      // Check file type
      const allowedTypes = ['.pdf', '.docx'];
      const fileName = this.selectedFile.name.toLowerCase();
      const isValidType = allowedTypes.some(t => fileName.endsWith(t));
      if (!isValidType) {
        this.error = 'Only PDF and DOCX files are supported!';
        return;
      }

      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (this.selectedFile.size > maxSize) {
        this.error = 'File is too large. Maximum size is 5MB!';
        return;
      }

      this.analyseFile();
    } else {
      if (!this.cvText.trim()) {
        this.error = 'Please paste your CV text!';
        return;
      }

      // Check minimum length
      if (this.cvText.trim().length < 100) {
        this.error = 'CV text is too short. Please paste your full CV!';
        return;
      }

      this.analyseText();
    }
  }

  analyseFile() {
    this.loading = true;

    this.apiService.uploadCVFile(
      this.selectedFile!,
      this.githubUsername
    ).subscribe({
      next: (result: any) => {
        if (result.data?.error) {
          this.error = `Error: ${result.data.error}`;
          this.loading = false;
          return;
        }

        const data = result.data;

        if (!data.skill_profile || 
            Object.keys(data.skill_profile).length === 0) {
          this.error = 'No skills found in your CV. Try adding more technical details!';
          this.loading = false;
          return;
        }

        if (!data.matches || data.matches.length === 0) {
          this.error = 'No job matches found. Try adding more skills to your CV!';
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
        if (err.status === 0) {
          this.error = 'Cannot connect to server. Make sure all services are running!';
        } else if (err.status === 500) {
          this.error = 'Server error. Please try again!';
        } else {
          this.error = 'Error uploading file. Please try again!';
        }
        this.loading = false;
      }
    });
  }

  analyseText() {
    this.loading = true;

    this.apiService.parseCV(this.cvText).subscribe({
      next: (parseResult: any) => {
        const skillProfile = parseResult.data?.skill_profile;

        if (!skillProfile || Object.keys(skillProfile).length === 0) {
          this.error = 'No skills found in your CV. Try adding more technical details!';
          this.loading = false;
          return;
        }

        localStorage.setItem('cvText', this.cvText);
        localStorage.setItem('githubUsername', this.githubUsername);
        localStorage.setItem('skillProfile', JSON.stringify(skillProfile));

        this.apiService.matchJobs(this.cvText, this.githubUsername).subscribe({
          next: (matchResult: any) => {
            const matches = matchResult?.data?.matches || 
                           matchResult?.matches || [];

            if (matches.length === 0) {
              this.error = 'No job matches found. Try adding more skills!';
              this.loading = false;
              return;
            }

            localStorage.setItem('jobMatches', JSON.stringify(matchResult));
            this.loading = false;
            this.router.navigate(['/jobs']);
          },
          error: (err: any) => {
            if (err.status === 0) {
              this.error = 'Cannot connect to server!';
            } else {
              this.error = 'Error getting job matches. Please try again!';
            }
            this.loading = false;
          }
        });
      },
      error: (err: any) => {
        if (err.status === 0) {
          this.error = 'Cannot connect to server. Make sure backend is running!';
        } else {
          this.error = 'Error analysing CV. Please try again!';
        }
        this.loading = false;
      }
    });
  }
}