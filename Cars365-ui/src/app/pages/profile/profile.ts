import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { TestDriveService } from '../../services/test-drive.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {

  email: string | null;
  message = '';
  error = '';

  showChangePassword = false;

  profileForm;
  passwordForm;

  testDrives: any[] = [];
  loadingTestDrives = true;

  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private http: HttpClient,
    private profileService: ProfileService,
    private testDriveService: TestDriveService
  ) {
    this.email = this.authService.getUserEmail();

    this.profileForm = this.fb.group({
      fullName: [
        '',
        [Validators.required, Validators.minLength(3)]
      ],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]
      ],
      address: [
        '',
        [Validators.maxLength(300)]
      ]
    });


    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadTestDrives();
  }

  loadTestDrives() {
    this.testDriveService.getMyRequests().subscribe({
      next: (res: any) => {
        this.testDrives = res;
        this.loadingTestDrives = false;
      },
      error: () => {
        this.loadingTestDrives = false;
      }
    });
  }

  /* ---------- PROFILE ---------- */

  loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        if (!profile) return;

        this.profileForm.patchValue({
          fullName: profile.fullName,
          phoneNumber: profile.phoneNumber,
          address: profile.address
        });
      },
      error: () => {
        this.error = 'Failed to load profile';
      }
    });
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.profileService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.message = 'Profile updated successfully';
        this.error = '';

        const name = this.profileForm.value.fullName;
        if (name) {
          this.authService.updateDisplayName(name);
        }
      },
      error: () => {
        this.error = 'Failed to update profile';
        this.message = '';
      }
    });
  }


  /* ---------- PASSWORD ---------- */

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
        this.error = err?.error?.[0] || 'Failed to update password';
        this.message = '';
      }
    });
  }
}