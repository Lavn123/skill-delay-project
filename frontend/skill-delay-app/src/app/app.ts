import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth';
import { ThemeService } from './services/theme';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
})
export class App {
  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router,
  ) {}

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  getUser(): any {
    return this.authService.getUser();
  }
  isDark(): boolean {
    return this.themeService.darkMode;
  }
  toggleTheme() {
    this.themeService.toggle();
  }

  getInitials(): string {
    const name = this.authService.getUser()?.name || '';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
