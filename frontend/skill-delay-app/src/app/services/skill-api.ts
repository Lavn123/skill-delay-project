import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SkillApiService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  parseCV(cvText: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/parse-cv`, {
      cv_text: cvText
    });
  }

  matchJobs(cvText: string, githubUsername: string, userId: string = ''): Observable<any> {
    return this.http.post(`${this.apiUrl}/match-jobs`, {
      cv_text: cvText,
      github_username: githubUsername,
      user_id: userId
    });
  }

  getGithubSignal(githubUsername: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/github-signal`, {
      github_username: githubUsername
    });
  }

  evaluate(cvText: string, githubUsername: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/evaluate`, {
      cv_text: cvText,
      github_username: githubUsername
    });
  }

  uploadCVFile(file: File, githubUsername: string, userId: string = ''): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('github_username', githubUsername);
    formData.append('user_id', userId);
    return this.http.post(`${this.apiUrl}/upload-cv-file`, formData);
  }

  getUserHistory(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.get(`${this.apiUrl}/user/history`, { headers });
  }
}