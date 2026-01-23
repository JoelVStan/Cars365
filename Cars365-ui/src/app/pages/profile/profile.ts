import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  email: string | null;
  message = '';
  error = '';

  passwordForm;

  showChangePassword = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.email = this.authService.getUserEmail();

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  toggleChangePassword() {
    this.showChangePassword = !this.showChangePassword;
    this.message = '';
    this.error = '';
    this.passwordForm.reset();
  }


  changePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.http.post(
      'https://localhost:7193/api/auth/change-password',
      this.passwordForm.value
    ).subscribe({
      next: () => {
        this.message = 'Password updated successfully';
        this.error = '';
        this.passwordForm.reset();
      },
      error: (err) => {
        this.error =
          err?.error?.[0] || 'Failed to update password';
        this.message = '';
      }
    });
  }
}