import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule,RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  registerForm;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.authService.register(this.registerForm.value as { email: string; password: string }).subscribe({
      next: () => {
        this.successMessage = 'Registration successful. Please login.';
        this.errorMessage = '';

        // Redirect after short delay
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        if (typeof err?.error === 'string') {
          this.errorMessage = err.error;
        } else if (err?.error?.errors?.length) {
          this.errorMessage = err.error.errors[0].description;
        } else {
          this.errorMessage = 'Registration failed. Try again.';
        }

        this.successMessage = '';
      }

    });
  }
}