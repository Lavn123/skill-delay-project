import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav style="background:#1F3864; padding:15px 30px; display:flex; gap:20px; align-items:center;">
      <span style="color:white; font-size:20px; font-weight:bold;">
        🎯 Skill Decay
      </span>
      <a routerLink="/" style="color:white; text-decoration:none;">Home</a>
      <a routerLink="/upload" style="color:white; text-decoration:none;">Upload CV</a>
      <a routerLink="/jobs" style="color:white; text-decoration:none;">Job Matches</a>
    </nav>
    <router-outlet />
  `
})
export class App {}