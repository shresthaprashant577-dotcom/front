import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MockAuthService } from '../../../core/services/implementations/mock-auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private authService = inject(MockAuthService);
  private router = inject(Router);
  
  credentials = signal({
    username: '',
    password: ''
  });
  
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  
  async onSubmit() {
    if (!this.credentials().username || !this.credentials().password) {
      this.errorMessage.set('Please enter username and password');
      return;
    }
    
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    this.authService.login(this.credentials()).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        
        // Redirect based on role
        switch (response.user.role) {
          case 'Admin':
          case 'Manager':
            this.router.navigate(['/manager/dashboard']);
            break;
          case 'Teller':
            this.router.navigate(['/teller/dashboard']);
            break;
          case 'Customer':
            this.router.navigate(['/customer/dashboard']);
            break;
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Invalid credentials. Please try again.');
      }
    });
  }
  
  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }
  
  fillDemoCredentials(role: 'admin' | 'manager' | 'teller' | 'customer') {
    const credentials = {
      admin: { username: 'admin', password: 'Admin123!' },
      manager: { username: 'manager1', password: 'Manager123!' },
      teller: { username: 'teller1', password: 'Teller123!' },
      customer: { username: 'customer1', password: 'Customer123!' }
    };
    
    this.credentials.set(credentials[role]);
  }
}