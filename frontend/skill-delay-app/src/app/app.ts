import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav style="background:linear-gradient(135deg, #1F3864, #2E75B6);
                padding:15px 40px; display:flex; gap:20px;
                align-items:center; box-shadow:0 2px 10px rgba(0,0,0,0.2);">
      <span style="color:white; font-size:22px; font-weight:bold;
                   margin-right:20px;">
        ⏳ SkillTempus
      </span>
      <a routerLink="/" routerLinkActive="active-link"
         [routerLinkActiveOptions]="{exact:true}"
         style="color:rgba(255,255,255,0.8); text-decoration:none;
                font-size:15px; padding:6px 14px; border-radius:20px;">
        Home
      </a>
      <a routerLink="/upload" routerLinkActive="active-link"
         style="color:rgba(255,255,255,0.8); text-decoration:none;
                font-size:15px; padding:6px 14px; border-radius:20px;">
        Upload CV
      </a>
      <a routerLink="/dashboard" routerLinkActive="active-link"
         style="color:rgba(255,255,255,0.8); text-decoration:none;
                font-size:15px; padding:6px 14px; border-radius:20px;">
        Dashboard
      </a>
      <a routerLink="/jobs" routerLinkActive="active-link"
         style="color:rgba(255,255,255,0.8); text-decoration:none;
                font-size:15px; padding:6px 14px; border-radius:20px;">
        Job Matches
      </a>

      <!-- Spacer -->
      <span style="flex:1"></span>

      <!-- Not logged in -->
      <div *ngIf="!isLoggedIn()">
        <a routerLink="/login"
           style="color:rgba(255,255,255,0.8); text-decoration:none;
                  font-size:15px; padding:6px 14px; border-radius:20px;
                  margin-right:8px;">
          Sign In
        </a>
        <a routerLink="/register"
           style="background:white; color:#1F3864; text-decoration:none;
                  font-size:14px; padding:8px 18px; border-radius:20px;
                  font-weight:600;">
          Sign Up
        </a>
      </div>

      <!-- Logged in -->
      <div *ngIf="isLoggedIn()" style="display:flex; align-items:center; gap:12px;">
        <span style="color:white; font-size:14px;">
          👋 {{ getUser()?.name }}
        </span>
        <button (click)="logout()"
                style="background:rgba(255,255,255,0.2); color:white;
                       border:none; padding:8px 16px; border-radius:20px;
                       cursor:pointer; font-size:14px;">
          Logout
        </button>
      </div>

    </nav>
    <router-outlet />
  `,
  styles: [`
    .active-link {
      background: rgba(255,255,255,0.2) !important;
      color: white !important;
    }
  `]
})
export class App {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getUser(): any {
    return this.authService.getUser();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}