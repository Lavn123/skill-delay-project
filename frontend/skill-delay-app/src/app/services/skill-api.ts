import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SkillApiService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  parseCV(cvText: string) {
    return this.http.post(`${this.apiUrl}/parse-cv`, { cv_text: cvText });
  }

  matchJobs(cvText: string, githubUsername: string = '', userId: string = '') {
    return this.http.post(`${this.apiUrl}/match-jobs`, {
      cv_text: cvText,
      github_username: githubUsername,
      user_id: userId
    });
  }

  uploadCVFile(file: File, githubUsername: string = '', userId: string = '') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('github_username', githubUsername);
    formData.append('user_id', userId);
    return this.http.post(`${this.apiUrl}/upload-cv-file`, formData);
  }

  getGithubSignal(username: string) {
    return this.http.post(`${this.apiUrl}/github-signal`, {
      github_username: username
    });
  }

  evaluate(cvText: string, githubUsername: string = '') {
    return this.http.post(`${this.apiUrl}/evaluate`, {
      cv_text: cvText,
      github_username: githubUsername
    });
  }

  getUserHistory(userId: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.apiUrl}/user/history/${userId}`, { headers });
  }
}