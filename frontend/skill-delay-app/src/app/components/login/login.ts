// login.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div style="min-height:100vh; background:var(--gradient-bg);
                display:flex; align-items:center; justify-content:center;
                padding:20px;">
      <div style="width:100%; max-width:420px;">

        <!-- Logo -->
        <div class="animate-fade-up" style="text-align:center; margin-bottom:32px;">
          <div style="width:52px; height:52px; background:var(--gradient-primary);
                      border-radius:14px; display:flex; align-items:center;
                      justify-content:center; font-size:24px; margin:0 auto 12px;">
            ⏳
          </div>
          <h1 style="font-size:22px; font-weight:700; color:var(--text-primary);
                     margin:0 0 4px; letter-spacing:-0.3px;">
            Welcome back
          </h1>
          <p style="color:var(--text-muted); font-size:14px; margin:0;">
            Sign in to your SkillTempus account
          </p>
        </div>

        <!-- Card -->
        <div class="glass-card animate-fade-up-delay-1" style="padding:32px;">

          <div style="margin-bottom:20px;">
            <label style="display:block; margin-bottom:7px; font-size:13px;
                          font-weight:600; color:var(--text-primary);">
              Email address
            </label>
            <input [(ngModel)]="email" type="email"
                   placeholder="you@example.com" />
          </div>

          <div style="margin-bottom:24px;">
            <label style="display:block; margin-bottom:7px; font-size:13px;
                          font-weight:600; color:var(--text-primary);">
              Password
            </label>
            <input [(ngModel)]="password" type="password"
                   placeholder="••••••••" />
          </div>

          <button (click)="login()" [disabled]="loading"
                  class="btn-primary"
                  style="width:100%; padding:13px; font-size:15px;
                         justify-content:center;"
                  [style.opacity]="loading ? '0.7' : '1'">
            {{ loading ? 'Signing in...' : 'Sign in →' }}
          </button>

          <div *ngIf="error"
               style="margin-top:16px; padding:12px 16px;
                      background:var(--color-danger-bg);
                      border:0.5px solid var(--color-danger);
                      border-radius:var(--radius-md);
                      color:var(--color-danger); font-size:13px;">
            ⚠️ {{ error }}
          </div>

          <p style="text-align:center; margin-top:20px; font-size:13px;
                    color:var(--text-muted);">
            Don't have an account?
            <a routerLink="/register"
               style="color:var(--color-primary); font-weight:600;
                      text-decoration:none;">
              Sign up free
            </a>
          </p>

        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  login() {
    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields!';
      return;
    }
    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (result: any) => {
        if (result.success) {
          this.authService.saveToken(result.token, result.user);
          this.loading = false;
          const returnUrl =
            this.route.snapshot.queryParams['returnUrl'] || '/upload';
          this.router.navigate([returnUrl]);
        } else {
          this.error = result.error || 'Login failed!';
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'Cannot connect to server!';
        this.loading = false;
      }
    });
  }
}