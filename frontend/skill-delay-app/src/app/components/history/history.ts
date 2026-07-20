import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="min-height:100vh; background:linear-gradient(135deg, #f5f7fa, #e8f0fe);
                padding:50px 20px;">
      <div style="max-width:800px; margin:0 auto;">

        <h2 style="color:#1F3864; font-size:32px; margin-bottom:8px;">
          📋 Analysis History
        </h2>
        <p style="color:#777; margin-bottom:30px;">
          Total analyses: {{ history.length }}
        </p>

        <div *ngIf="history.length === 0 && !loading"
             style="text-align:center; padding:60px; background:white;
                    border-radius:16px;">
          <div style="font-size:50px;">📭</div>
          <p style="color:#777; margin-top:16px;">No analyses yet!</p>
          <a routerLink="/upload">
            <button style="background:linear-gradient(135deg, #2E75B6, #1F3864);
                           color:white; padding:12px 30px; border:none;
                           border-radius:25px; cursor:pointer; margin-top:10px;">
              Upload CV →
            </button>
          </a>
        </div>

        <div *ngIf="loading"
             style="text-align:center; padding:40px; background:white;
                    border-radius:16px;">
          <p style="color:#777;">⏳ Loading...</p>
        </div>

        <div style="background:white; border-radius:16px; padding:24px;
                    margin-bottom:16px; box-shadow:0 4px 20px rgba(0,0,0,0.08);"
             *ngFor="let item of history; index as i">

          <div style="display:flex; justify-content:space-between;
                      align-items:center; margin-bottom:12px;">
            <div>
              <h3 style="color:#1F3864; margin:0 0 4px;">
                Analysis #{{ history.length - i }}
              </h3>
              <p style="color:#999; font-size:13px; margin:0;">
                {{ formatDate(item.created_at) }}
              </p>
            </div>
            <div style="text-align:right;">
              <div style="font-size:20px; font-weight:800; color:#2E75B6;">
                {{ item.total_skills }} skills
              </div>
              <div style="font-size:13px; color:#999;">detected</div>
            </div>
          </div>

          <div style="background:#f0f4ff; border-radius:10px; padding:12px 16px;
                      margin-bottom:12px;">
            <p style="margin:0; font-size:14px; color:#555;">
              🏆 <strong>Best Match:</strong> {{ item.top_match || 'N/A' }}
              ({{ item.top_score || 0 }}%)
            </p>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            <span *ngFor="let skill of getTopSkills(item.skill_timeline)"
                  style="background:#f0f4ff; color:#2E75B6; padding:4px 12px;
                         border-radius:12px; font-size:13px;">
              {{ skill }}
            </span>
          </div>

        </div>

      </div>
    </div>
  `
})
export class HistoryComponent implements OnInit {
  history: any[] = [];
  loading = false;
  isLoggedIn = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.loadHistory();
    }
  }

  loadHistory() {
    this.loading = true;
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get('http://localhost:3000/api/user/history', { headers })
   // this.http.get('https://skilltempus-backend.onrender.com/api/user/history', { headers })
      .subscribe({
        next: (result: any) => {
          const data = result?.data?.history || [];
          this.history = [...data];
          this.loading = false;
          this.cdr.detectChanges();
          console.log('History rendered:', this.history.length);
        },
        error: (err: any) => {
          console.error('Error:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  getTopSkills(timeline: any): string[] {
    if (!timeline) return [];
    return Object.keys(timeline).slice(0, 5);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }
}