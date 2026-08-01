// register.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
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
            Create your account
          </h1>
          <p style="color:var(--text-muted); font-size:14px; margin:0;">
            Start analysing your skill freshness today
          </p>
        </div>

        <!-- Card -->
        <div class="glass-card animate-fade-up-delay-1" style="padding:32px;">

          <div style="margin-bottom:20px;">
            <label style="display:block; margin-bottom:7px; font-size:13px;
                          font-weight:600; color:var(--text-primary);">
              Full Name
            </label>
            <input [(ngModel)]="name" type="text"
                   placeholder="John Smith" />
          </div>

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
                   placeholder="Min 6 characters" />
          </div>

          <button (click)="register()" [disabled]="loading"
                  class="btn-primary"
                  style="width:100%; padding:13px; font-size:15px;
                         justify-content:center;"
                  [style.opacity]="loading ? '0.7' : '1'">
            {{ loading ? 'Creating account...' : 'Create account →' }}
          </button>

          <div *ngIf="error"
               style="margin-top:16px; padding:12px 16px;
                      background:var(--color-danger-bg);
                      border:0.5px solid var(--color-danger);
                      border-radius:var(--radius-md);
                      color:var(--color-danger); font-size:13px;">
            ⚠️ {{ error }}
          </div>

          <div *ngIf="success"
               style="margin-top:16px; padding:12px 16px;
                      background:var(--color-success-bg);
                      border:0.5px solid var(--color-success);
                      border-radius:var(--radius-md);
                      color:var(--color-success); font-size:13px;">
            ✅ {{ success }}
          </div>

          <p style="text-align:center; margin-top:20px; font-size:13px;
                    color:var(--text-muted);">
            Already have an account?
            <a routerLink="/login"
               style="color:var(--color-primary); font-weight:600;
                      text-decoration:none;">
              Sign in
            </a>
          </p>

        </div>

        <!-- Trust signals -->
        <div class="animate-fade-up-delay-2"
             style="display:flex; gap:16px; justify-content:center;
                    margin-top:20px; flex-wrap:wrap;">
          <span style="font-size:12px; color:var(--text-muted);
                       display:flex; align-items:center; gap:4px;">
            🔒 Secure JWT auth
          </span>
          <span style="font-size:12px; color:var(--text-muted);
                       display:flex; align-items:center; gap:4px;">
            🎓 MSc research project
          </span>
          <span style="font-size:12px; color:var(--text-muted);
                       display:flex; align-items:center; gap:4px;">
            🆓 Free to use
          </span>
        </div>

      </div>
    </div>
  `
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  loading = false;
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register() {
    if (!this.name || !this.email || !this.password) {
      this.error = 'Please fill in all fields!';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters!';
      return;
    }
    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService.register(this.name, this.email, this.password).subscribe({
      next: (result: any) => {
        if (result.success) {
          this.authService.saveToken(result.token, result.user);
          this.success = 'Account created! Redirecting...';
          this.loading = false;
          setTimeout(() => this.router.navigate(['/upload']), 1500);
        } else {
          this.error = result.error || 'Registration failed!';
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