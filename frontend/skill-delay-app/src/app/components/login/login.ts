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
  templateUrl: './login.html'
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