import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,CommonModule,RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm;
  errorMessage = '';

  // ✅ Toast & state
  showToast = false;
  toastMessage = '';
  isProcessing = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid || this.isProcessing) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isProcessing = true;

    this.authService
      .login(this.loginForm.value as { email: string; password: string })
      .subscribe({
        next: (res) => {
          this.authService.saveToken(res.token);

          // ✅ Show success message
          this.toastMessage = 'Logged in successfully';
          this.showToast = true;

          // ✅ Wait 2 seconds, then redirect
          setTimeout(() => {
            this.showToast = false;
            this.router.navigate(['/']);
          }, 1000);
        },
        error: () => {
          this.errorMessage = 'Invalid email or password';
          this.isProcessing = false;
        },
      });
  }

  
}