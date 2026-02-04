import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/implementations/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  // Form data
  userData = signal({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: ''
  });
  
  // UI State
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
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
    // Validate form
    if (!this.validateForm()) {
      return;
    }
    
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    const registerData = {
      username: this.userData().username,
      email: this.userData().email,
      password: this.userData().password,
      confirmPassword: this.userData().confirmPassword,
      firstName: this.userData().firstName,
      lastName: this.userData().lastName,
      phoneNumber: this.userData().phoneNumber,
      dateOfBirth: this.userData().dateOfBirth,
      address: this.userData().address
    };
    
    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        // Registration successful, redirect to customer dashboard
        this.router.navigate(['/customer/dashboard']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Registration failed. Please try again.');
      }
    });
  }
  
  validateForm(): boolean {
    const data = this.userData();
    
    // Check required fields
    if (!data.username || !data.email || !data.password || !data.confirmPassword || 
        !data.firstName || !data.lastName || !data.dateOfBirth || !data.address) {
      this.errorMessage.set('Please fill in all required fields.');
      return false;
    }
    
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      this.errorMessage.set('Please enter a valid email address.');
      return false;
    }
    
    // Check password match
    if (data.password !== data.confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return false;
    }
    
    // Check password strength
    if (this.passwordStrength() < 3) {
      this.errorMessage.set('Password is too weak. Please use a stronger password.');
      return false;
    }
    
    // Check phone number format (optional field)
    if (data.phoneNumber) {
      const phoneRegex = /^\d{10}$|^\d{3}-\d{3}-\d{4}$/;
      const cleanPhone = data.phoneNumber.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        this.errorMessage.set('Please enter a valid 10-digit phone number.');
        return false;
      }
    }
    
    // Check date of birth (must be at least 18 years old)
    const dob = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (age < 18 || (age === 18 && monthDiff < 0)) {
      this.errorMessage.set('You must be at least 18 years old to register.');
      return false;
    }
    
    return true;
  }
  
  onPasswordChange() {
    const password = this.userData().password;
    
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
  
  fillDemoData() {
    this.userData.set({
      username: 'john.doe' + Math.floor(Math.random() * 1000),
      email: 'john.doe@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '555-123-4567',
      dateOfBirth: '1990-01-15',
      address: '123 Main Street, New York, NY 10001'
    });
    
    this.onPasswordChange();
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