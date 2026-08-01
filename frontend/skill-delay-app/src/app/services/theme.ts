import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private isDark = false;

  constructor() {
    const saved = localStorage.getItem('skilltempus-theme');
    if (saved === 'dark') {
      this.setDark();
    }
  }

  toggle() {
    if (this.isDark) {
      this.setLight();
    } else {
      this.setDark();
    }
  }

  setDark() {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('skilltempus-theme', 'dark');
    this.isDark = true;
  }

  setLight() {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('skilltempus-theme', 'light');
    this.isDark = false;
  }

  get darkMode(): boolean {
    return this.isDark;
  }
}