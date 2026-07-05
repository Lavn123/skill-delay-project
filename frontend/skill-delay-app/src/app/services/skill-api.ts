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

  matchJobs(cvText: string, githubUsername: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/match-jobs`, {
      cv_text: cvText,
      github_username: githubUsername
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

  uploadCVFile(file: File, githubUsername: string): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('github_username', githubUsername);
  
  return this.http.post(`${this.apiUrl}/upload-cv-file`, formData);
}
}