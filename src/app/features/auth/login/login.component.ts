import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/implementations/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  credentials = signal({
    email: '',
    password: ''
  });
  
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  
  async onSubmit() {
    if (!this.credentials().email || !this.credentials().password) {
      this.errorMessage.set('Please enter email and password');
      return;
    }
    
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    this.authService.login(this.credentials()).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        this.isLoading.set(false);
        
        // Check for first-time login BEFORE role-based navigation
        console.log('Is first time login:', response.isFirstTimeLogin);
        if (response.isFirstTimeLogin) {
          console.log('Redirecting to first-time password change');
          this.router.navigate(['/auth/first-time-password-change']);
          return;
        }
        
        // Redirect based on role
        console.log('User role:', response.role);
        const roleNumber = Number(response.role);
        switch (roleNumber) {
          case 3: // Manager
            console.log('Navigating to manager dashboard');
            this.router.navigate(['/manager/dashboard']);
            break;
          case 2: // Teller
            console.log('Navigating to teller dashboard');
            this.router.navigate(['/teller/dashboard']);
            break;
          case 1: // Customer
          default:
            console.log('Navigating to customer dashboard');
            this.router.navigate(['/customer/dashboard']);
            break;
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Invalid credentials. Please try again.');
      }
    });
  }
  
  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

}