import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MockAuthService } from '../../../core/services/implementations/mock-auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private authService = inject(MockAuthService);
  private router = inject(Router);

  // 🔴 ngModel must bind to a normal property
  emailValue = '';

  // Signals for UI state
  isLoading = signal(false);
  submitted = signal(false);
  errorMessage = signal('');

  onSubmit(): void {
    if (!this.emailValue) {
      this.errorMessage.set('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.emailValue)) {
      this.errorMessage.set('Please enter a valid email address.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.forgotPassword(this.emailValue).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.submitted.set(true);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error?.message || 'Failed to send reset email. Please try again.'
        );
      }
    });
  }

  fillDemoEmail(): void {
    this.emailValue = 'demo@example.com';
  }
}
