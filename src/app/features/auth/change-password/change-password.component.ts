import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockAuthService } from '../../../core/services/implementations/mock-auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';



@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {
  private authService = inject(MockAuthService);
  private router = inject(Router);
  
  // Form data
  passwordData = signal({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI State
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);
  
  // Validation
  passwordStrength = signal(0);
  passwordRequirements = signal({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  
  onSubmit() {
    if (!this.validateForm()) {
      return;
    }
    
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    const request = {
      currentPassword: this.passwordData().currentPassword,
      newPassword: this.passwordData().newPassword,
      confirmPassword: this.passwordData().confirmPassword
    };
    
    this.authService.changePassword(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Password changed successfully!');
        
        // Clear form
        this.passwordData.set({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          this.successMessage.set('');
        }, 5000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Failed to change password. Please check your current password.');
      }
    });
  }
  
  validateForm(): boolean {
    const data = this.passwordData();
    
    if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
      this.errorMessage.set('Please fill in all password fields.');
      return false;
    }
    
    if (data.newPassword !== data.confirmPassword) {
      this.errorMessage.set('New passwords do not match.');
      return false;
    }
    
    if (data.currentPassword === data.newPassword) {
      this.errorMessage.set('New password must be different from current password.');
      return false;
    }
    
    if (this.passwordStrength() < 3) {
      this.errorMessage.set('New password is too weak. Please use a stronger password.');
      return false;
    }
    
    return true;
  }
  
  onPasswordChange() {
    const password = this.passwordData().newPassword;
    
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
  
  toggleCurrentPasswordVisibility() {
    this.showCurrentPassword.update(value => !value);
  }
  
  toggleNewPasswordVisibility() {
    this.showNewPassword.update(value => !value);
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