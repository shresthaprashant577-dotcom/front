import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/implementations/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  // Form data
  passwordData = signal({
    password: '',
    confirmPassword: ''
  });
  
  // UI State
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  
  // Token from URL
  token = signal('');
  
  // Validation
  passwordStrength = signal(0);
  passwordRequirements = signal({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  
  ngOnInit() {
    // Get token from URL query params
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.token.set(token);
      } else {
        this.errorMessage.set('Invalid or missing reset token.');
      }
    });
  }
  
  onSubmit() {
    if (!this.validateForm()) {
      return;
    }
    
    if (!this.token()) {
      this.errorMessage.set('Invalid reset token. Please request a new reset link.');
      return;
    }
    
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    this.authService.resetPassword(this.token(), this.passwordData().password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Password reset successful! Redirecting to login...');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Failed to reset password. The token may have expired.');
      }
    });
  }
  
  validateForm(): boolean {
    const data = this.passwordData();
    
    if (!data.password || !data.confirmPassword) {
      this.errorMessage.set('Please fill in both password fields.');
      return false;
    }
    
    if (data.password !== data.confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return false;
    }
    
    if (this.passwordStrength() < 3) {
      this.errorMessage.set('Password is too weak. Please use a stronger password.');
      return false;
    }
    
    return true;
  }
  
  onPasswordChange() {
    const password = this.passwordData().password;
    
    // Calculate password strength
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
    
    this.passwordRequirements.set(requirements);
    
    // Calculate strength score (0-5)
    const score = Object.values(requirements).filter(Boolean).length;
    this.passwordStrength.set(score);
  }
  
  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }
  
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.update(value => !value);
  }
  
  getPasswordStrengthColor(): string {
    const strength = this.passwordStrength();
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength === 4) return 'bg-green-500';
    return 'bg-green-600';
  }
  
  getPasswordStrengthText(): string {
    const strength = this.passwordStrength();
    if (strength <= 1) return 'Very Weak';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength === 4) return 'Good';
    return 'Strong';
  }
}