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
    <div style="min-height:100vh; background:var(--gradient-bg); padding:50px 20px;">
      <div style="max-width:800px; margin:0 auto;">

        <!-- Header -->
        <div class="animate-fade-up" style="margin-bottom:32px;">
          <h2 style="font-size:32px; font-weight:700; letter-spacing:-0.5px;
                     color:var(--text-primary); margin-bottom:8px;">
            📋 Analysis History
          </h2>
          <p style="color:var(--text-secondary); font-size:15px;">
            Your past CV analyses — {{ history.length }} total
          </p>
        </div>

        <!-- Not logged in -->
        <div *ngIf="!isLoggedIn"
             class="glass-card animate-fade-up"
             style="padding:60px; text-align:center;">
          <div style="font-size:50px; margin-bottom:16px;">🔒</div>
          <p style="color:var(--text-secondary); font-size:16px; margin-bottom:20px;">
            Please sign in to view your history
          </p>
          <a routerLink="/login" class="btn-primary" style="text-decoration:none;">
            Sign In →
          </a>
        </div>

        <!-- Loading -->
        <div *ngIf="isLoggedIn && loading"
             class="glass-card animate-fade-up"
             style="padding:60px; text-align:center;">
          <div style="font-size:40px; margin-bottom:16px;">⏳</div>
          <p style="color:var(--text-secondary);">Loading your history...</p>
        </div>

        <!-- Empty -->
        <div *ngIf="isLoggedIn && !loading && history.length === 0"
             class="glass-card animate-fade-up"
             style="padding:60px; text-align:center;">
          <div style="font-size:50px; margin-bottom:16px;">📭</div>
          <p style="color:var(--text-secondary); font-size:16px; margin-bottom:20px;">
            No analyses yet. Upload your CV to get started!
          </p>
          <a routerLink="/upload" class="btn-primary" style="text-decoration:none;">
            Upload CV →
          </a>
        </div>

        <!-- History Cards -->
        <div *ngFor="let item of history; let i = index"
             class="glass-card animate-fade-up"
             style="padding:24px; margin-bottom:16px;"
             [style.animation-delay]="i * 0.05 + 's'">

          <div style="display:flex; justify-content:space-between;
                      align-items:flex-start; margin-bottom:16px;">
            <div>
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <span style="background:var(--color-primary-light);
                             color:var(--color-primary); font-size:11px;
                             padding:3px 10px; border-radius:var(--radius-full);
                             font-weight:600;">
                  Analysis #{{ history.length - i }}
                </span>
              </div>
              <p style="color:var(--text-muted); font-size:13px; margin:0;">
                {{ formatDate(item.created_at) }}
              </p>
            </div>
            <div style="text-align:right;">
              <div style="font-size:24px; font-weight:700;
                          color:var(--color-primary);">
                {{ item.total_skills }}
              </div>
              <div style="font-size:11px; color:var(--text-muted);
                          text-transform:uppercase; letter-spacing:0.5px;">
                Skills
              </div>
            </div>
          </div>

          <!-- Best Match -->
          <div *ngIf="item.top_match"
               style="background:var(--color-primary-light);
                      border-radius:var(--radius-md); padding:12px 16px;
                      margin-bottom:16px; display:flex;
                      justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:11px; font-weight:600;
                          color:var(--color-primary); text-transform:uppercase;
                          letter-spacing:0.5px; margin-bottom:2px;">
                Best Match
              </div>
              <div style="font-size:14px; font-weight:600;
                          color:var(--text-primary);">
                {{ item.top_match }}
              </div>
            </div>
            <div style="font-size:20px; font-weight:700;
                        color:var(--color-primary);">
              {{ item.top_score }}%
            </div>
          </div>

          <!-- Skill Tags -->
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            <span *ngFor="let skill of getTopSkills(item.skill_timeline)"
                  style="background:rgba(255,255,255,0.7);
                         border:0.5px solid var(--border-strong);
                         color:var(--text-secondary); padding:4px 10px;
                         border-radius:var(--radius-full); font-size:12px;">
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
    if (this.isLoggedIn) this.loadHistory();
  }

  loadHistory() {
    this.loading = true;
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get('http://localhost:3000/api/user/history', { headers })
      .subscribe({
        next: (result: any) => {
          this.history = [...(result?.data?.history || [])];
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  getTopSkills(timeline: any): string[] {
    if (!timeline) return [];
    return Object.keys(timeline).slice(0, 6);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return dateStr; }
  }
}