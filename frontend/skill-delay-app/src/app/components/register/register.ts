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
  templateUrl: './register.html'
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