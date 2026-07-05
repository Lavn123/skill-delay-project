import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav style="background:linear-gradient(135deg, #1F3864, #2E75B6); 
                padding:15px 40px; display:flex; gap:30px; 
                align-items:center; box-shadow:0 2px 10px rgba(0,0,0,0.2);">
      <span style="color:white; font-size:22px; font-weight:bold; 
                   margin-right:20px;">
        🎯 Skill Decay
      </span>
      <a routerLink="/" routerLinkActive="active-link" 
         [routerLinkActiveOptions]="{exact:true}"
         style="color:rgba(255,255,255,0.8); text-decoration:none; 
                font-size:15px; padding:6px 14px; border-radius:20px;
                transition:all 0.3s;">
        Home
      </a>
      <a routerLink="/upload" routerLinkActive="active-link"
         style="color:rgba(255,255,255,0.8); text-decoration:none; 
                font-size:15px; padding:6px 14px; border-radius:20px;
                transition:all 0.3s;">
        Upload CV
      </a>
      <a routerLink="/dashboard" routerLinkActive="active-link"
         style="color:rgba(255,255,255,0.8); text-decoration:none; 
                font-size:15px; padding:6px 14px; border-radius:20px;
                transition:all 0.3s;">
        Dashboard
      </a>
      <a routerLink="/jobs" routerLinkActive="active-link"
         style="color:rgba(255,255,255,0.8); text-decoration:none; 
                font-size:15px; padding:6px 14px; border-radius:20px;
                transition:all 0.3s;">
        Job Matches
      </a>
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
export class App {}