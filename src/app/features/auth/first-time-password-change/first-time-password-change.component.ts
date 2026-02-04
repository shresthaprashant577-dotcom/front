import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/implementations/auth.service';

@Component({
  selector: 'app-first-time-password-change',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <div class="mx-auto h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <span class="text-white text-xl font-bold">🔒</span>
          </div>
          <h2 class="text-3xl font-extrabold text-gray-900">Change Your Password</h2>
          <p class="mt-2 text-sm text-gray-600">
            For security reasons, you must change your temporary password before accessing the application.
          </p>
        </div>

        <div class="card">
          <form class="space-y-6" (ngSubmit)="onSubmit()" #passwordForm="ngForm">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Current Password (Bank&#64;123#)
              </label>
              <div class="relative">
                <input
                  [type]="showCurrentPassword() ? 'text' : 'password'"
                  required
                  [(ngModel)]="passwordData().currentPassword"
                  name="currentPassword"
                  class="input-field pr-10"
                  placeholder="Enter temporary password"
                  [disabled]="isLoading()"
                />
                <button
                  type="button"
                  (click)="toggleCurrentPasswordVisibility()"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span class="text-gray-500 hover:text-gray-700 text-sm">
                    {{ showCurrentPassword() ? 'Hide' : 'Show' }}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div class="relative">
                <input
                  [type]="showNewPassword() ? 'text' : 'password'"
                  required
                  [(ngModel)]="passwordData().newPassword"
                  name="newPassword"
                  (input)="validatePassword()"
                  class="input-field pr-10"
                  placeholder="Enter new password"
                  [disabled]="isLoading()"
                />
                <button
                  type="button"
                  (click)="toggleNewPasswordVisibility()"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span class="text-gray-500 hover:text-gray-700 text-sm">
                    {{ showNewPassword() ? 'Hide' : 'Show' }}
                  </span>
                </button>
              </div>
              
              <!-- Password Requirements -->
              @if (passwordData().newPassword) {
                <div class="mt-2 space-y-1">
                  <div class="flex items-center text-xs" [class]="getValidationClass(hasMinLength())">
                    <span class="mr-2">{{ hasMinLength() ? '✓' : '✗' }}</span>
                    At least 8 characters
                  </div>
                  <div class="flex items-center text-xs" [class]="getValidationClass(hasUppercase())">
                    <span class="mr-2">{{ hasUppercase() ? '✓' : '✗' }}</span>
                    One uppercase letter
                  </div>
                  <div class="flex items-center text-xs" [class]="getValidationClass(hasLowercase())">
                    <span class="mr-2">{{ hasLowercase() ? '✓' : '✗' }}</span>
                    One lowercase letter
                  </div>
                  <div class="flex items-center text-xs" [class]="getValidationClass(hasNumber())">
                    <span class="mr-2">{{ hasNumber() ? '✓' : '✗' }}</span>
                    One number
                  </div>
                  <div class="flex items-center text-xs" [class]="getValidationClass(hasSpecialChar())">
                    <span class="mr-2">{{ hasSpecialChar() ? '✓' : '✗' }}</span>
                    One special character
                  </div>
                </div>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div class="relative">
                <input
                  [type]="showConfirmPassword() ? 'text' : 'password'"
                  required
                  [(ngModel)]="passwordData().confirmPassword"
                  name="confirmPassword"
                  class="input-field pr-10"
                  placeholder="Confirm new password"
                  [disabled]="isLoading()"
                />
                <button
                  type="button"
                  (click)="toggleConfirmPasswordVisibility()"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span class="text-gray-500 hover:text-gray-700 text-sm">
                    {{ showConfirmPassword() ? 'Hide' : 'Show' }}
                  </span>
                </button>
              </div>
              @if (passwordData().confirmPassword && !passwordsMatch()) {
                <p class="mt-1 text-xs text-red-600">Passwords do not match</p>
              }
            </div>

            @if (errorMessage()) {
              <div class="rounded-md bg-red-50 p-4 border border-red-200">
                <p class="text-sm font-medium text-red-800">{{ errorMessage() }}</p>
              </div>
            }

            <button
              type="submit"
              [disabled]="isLoading() || !isFormValid()"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              @if (isLoading()) {
                <span>Changing Password...</span>
              } @else {
                <span>Change Password</span>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class FirstTimePasswordChangeComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  passwordData = signal({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  isLoading = signal(false);
  errorMessage = signal('');
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  toggleCurrentPasswordVisibility() {
    this.showCurrentPassword.update(value => !value);
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword.update(value => !value);
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.update(value => !value);
  }

  validatePassword() {
    // Trigger validation on password change
  }

  hasMinLength(): boolean {
    return this.passwordData().newPassword.length >= 8;
  }

  hasUppercase(): boolean {
    return /[A-Z]/.test(this.passwordData().newPassword);
  }

  hasLowercase(): boolean {
    return /[a-z]/.test(this.passwordData().newPassword);
  }

  hasNumber(): boolean {
    return /\d/.test(this.passwordData().newPassword);
  }

  hasSpecialChar(): boolean {
    return /[!@#$%^&*(),.?":{}|<>]/.test(this.passwordData().newPassword);
  }

  passwordsMatch(): boolean {
    return this.passwordData().newPassword === this.passwordData().confirmPassword;
  }

  getValidationClass(isValid: boolean): string {
    return isValid ? 'text-green-600' : 'text-red-600';
  }

  isFormValid(): boolean {
    const data = this.passwordData();
    return data.currentPassword !== '' &&
           data.newPassword !== '' &&
           data.confirmPassword !== '' &&
           this.hasMinLength() &&
           this.hasUppercase() &&
           this.hasLowercase() &&
           this.hasNumber() &&
           this.hasSpecialChar() &&
           this.passwordsMatch();
  }

  onSubmit() {
    if (!this.isFormValid()) {
      this.errorMessage.set('Please fill all fields correctly');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.firstTimePasswordChange(this.passwordData()).subscribe({
      next: () => {
        this.isLoading.set(false);
        const user = this.authService.getCurrentUser();
        if (user) {
          switch (user.role) {
            case 'Manager':
              this.router.navigate(['/manager/dashboard']);
              break;
            case 'Teller':
              this.router.navigate(['/teller/dashboard']);
              break;
            default:
              this.router.navigate(['/customer/dashboard']);
              break;
          }
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Failed to change password');
      }
    });
  }
}