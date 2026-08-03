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
  templateUrl: './cv-upload.html',
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