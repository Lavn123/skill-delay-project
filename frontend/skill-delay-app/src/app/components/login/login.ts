import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div style="min-height:100vh; background:linear-gradient(135deg, #f5f7fa, #e8f0fe);
                display:flex; align-items:center; justify-content:center; padding:20px;">
      <div style="background:white; border-radius:16px; padding:40px;
                  width:100%; max-width:420px;
                  box-shadow:0 4px 20px rgba(0,0,0,0.08);">

        <div style="text-align:center; margin-bottom:30px;">
          <div style="font-size:40px; margin-bottom:10px;">⏳</div>
          <h2 style="color:#1F3864; margin:0 0 8px;">Welcome Back</h2>
          <p style="color:#777; margin:0;">Sign in to your SkillTempus account</p>
        </div>

        <div style="margin-bottom:20px;">
          <label style="display:block; margin-bottom:6px; font-weight:600;
                        color:#1F3864; font-size:14px;">Email</label>
          <input [(ngModel)]="email" type="email"
                 style="width:100%; padding:12px 14px; border:2px solid #e0e0e0;
                        border-radius:10px; font-size:14px; outline:none;
                        box-sizing:border-box;"
                 placeholder="your@email.com" />
        </div>

        <div style="margin-bottom:24px;">
          <label style="display:block; margin-bottom:6px; font-weight:600;
                        color:#1F3864; font-size:14px;">Password</label>
          <input [(ngModel)]="password" type="password"
                 style="width:100%; padding:12px 14px; border:2px solid #e0e0e0;
                        border-radius:10px; font-size:14px; outline:none;
                        box-sizing:border-box;"
                 placeholder="••••••••" />
        </div>

        <button (click)="login()"
                [disabled]="loading"
                style="width:100%; background:linear-gradient(135deg, #2E75B6, #1F3864);
                       color:white; padding:14px; font-size:16px; border:none;
                       border-radius:10px; cursor:pointer; font-weight:600;"
                [style.opacity]="loading ? '0.7' : '1'">
          {{ loading ? 'Signing in...' : 'Sign In →' }}
        </button>

        <div *ngIf="error"
             style="margin-top:15px; padding:12px; background:#fee;
                    border-radius:8px; color:#c00; font-size:14px; text-align:center;">
          ⚠️ {{ error }}
        </div>

        <p style="text-align:center; margin-top:20px; color:#777; font-size:14px;">
          Don't have an account?
          <a routerLink="/register" style="color:#2E75B6; font-weight:600;
                                           text-decoration:none;">
            Sign Up
          </a>
        </p>

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
    private router: Router
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
          this.router.navigate(['/upload']);
        } else {
          this.error = result.error || 'Login failed!';
          this.loading = false;
        }
      },
      error: (err: any) => {
        this.error = 'Cannot connect to server!';
        this.loading = false;
      }
    });
  }
}