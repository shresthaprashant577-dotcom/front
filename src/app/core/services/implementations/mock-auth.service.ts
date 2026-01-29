import { Injectable, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, delay, throwError } from 'rxjs';
import { IAuthService } from '../interfaces/auth-service.interface';
import { 
  User,
  LoginCredentials,
  AuthResponse,
  RegisterRequest,
  PasswordChangeRequest
} from '../../models/user.model';
import { MOCK_LOGINS } from '../mock-data/mock-data-constants';
import { MockDataGenerator } from '../mock-data/mock-data-generator.service';

@Injectable({
  providedIn: 'root'
})
export class MockAuthService implements IAuthService {
  private currentUser = signal<User | null>(null);
  private isLoggedIn = signal(false);
  private isBrowser: boolean;
  
  private mockData: MockDataGenerator;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.mockData = new MockDataGenerator();
    
    // Check for stored user only in browser
    if (this.isBrowser) {
      const storedUser = localStorage.getItem('banking_user');
      if (storedUser) {
        this.currentUser.set(JSON.parse(storedUser));
        this.isLoggedIn.set(true);
      }
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return new Observable<AuthResponse>(observer => {
      setTimeout(() => {
        const mockLogin = MOCK_LOGINS.find(
          login => login.username === credentials.username && login.password === credentials.password
        );

        if (mockLogin) {
          const users = this.mockData.getUsers();
          const user = users.find(u => u.username === credentials.username) || 
                      this.createMockUser(credentials.username, mockLogin.role);
          
          const authResponse: AuthResponse = {
            user,
            token: this.generateMockToken(),
            expiresIn: 3600
          };

          // Store only in browser
          if (this.isBrowser) {
            localStorage.setItem('banking_user', JSON.stringify(user));
            localStorage.setItem('banking_token', authResponse.token);
          }
          
          this.currentUser.set(user);
          this.isLoggedIn.set(true);
          
          observer.next(authResponse);
          observer.complete();
        } else {
          observer.error(new Error('Invalid username or password'));
        }
      }, 800);
    });
  }

  logout(): void {
    // Clear storage only in browser
    if (this.isBrowser) {
      localStorage.removeItem('banking_user');
      localStorage.removeItem('banking_token');
    }
    
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
  }

  register(userData: RegisterRequest): Observable<User> {
    return new Observable<User>(observer => {
      setTimeout(() => {
        const existingUser = this.mockData.getUsers().find(u => u.username === userData.username);
        if (existingUser) {
          observer.error(new Error('Username already exists'));
          return;
        }

        const existingEmail = this.mockData.getUsers().find(u => u.email === userData.email);
        if (existingEmail) {
          observer.error(new Error('Email already registered'));
          return;
        }

        const newUser: User = {
          id: crypto.randomUUID(),
          ...userData,
          role: 'Customer',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: null,
        };

        observer.next(newUser);
        observer.complete();
      }, 1000);
    });
  }

  getCurrentUser(): Observable<User | null> {
    return of(this.currentUser()).pipe(delay(200));
  }

  isAuthenticated(): Observable<boolean> {
    return of(this.isLoggedIn()).pipe(delay(100));
  }

  hasRole(role: string | string[]): Observable<boolean> {
    const user = this.currentUser();
    if (!user) {
      return of(false).pipe(delay(100));
    }
    
    const roles = Array.isArray(role) ? role : [role];
    const hasRole = roles.includes(user.role);
    return of(hasRole).pipe(delay(100));
  }

  changePassword(request: PasswordChangeRequest): Observable<void> {
    return new Observable<void>(observer => {
      setTimeout(() => {
        if (request.newPassword !== request.confirmPassword) {
          observer.error(new Error('New passwords do not match'));
          return;
        }

        const hasUpperCase = /[A-Z]/.test(request.newPassword);
        const hasLowerCase = /[a-z]/.test(request.newPassword);
        const hasNumbers = /\d/.test(request.newPassword);
        const hasSpecialChar = /[^A-Za-z0-9]/.test(request.newPassword);
        
        if (request.newPassword.length < 8 || 
            !hasUpperCase || 
            !hasLowerCase || 
            !hasNumbers || 
            !hasSpecialChar) {
          observer.error(new Error('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters'));
          return;
        }

        observer.next();
        observer.complete();
      }, 800);
    });
  }

  forgotPassword(email: string): Observable<void> {
    return new Observable<void>(observer => {
      setTimeout(() => {
        const userExists = this.mockData.getUsers().some(u => u.email === email);
        
        if (!userExists) {
          console.log(`Password reset email would be sent to ${email} (email not in mock data)`);
        } else {
          console.log(`Password reset email sent to ${email}`);
        }
        
        observer.next();
        observer.complete();
      }, 800);
    });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return new Observable<void>(observer => {
      setTimeout(() => {
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumbers = /\d/.test(newPassword);
        const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword);
        
        if (newPassword.length < 8 || 
            !hasUpperCase || 
            !hasLowerCase || 
            !hasNumbers || 
            !hasSpecialChar) {
          observer.error(new Error('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters'));
          return;
        }

        console.log(`Password reset with token ${token}`);
        observer.next();
        observer.complete();
      }, 800);
    });
  }

  updateProfile(user: Partial<User>): Observable<User> {
    return new Observable<User>(observer => {
      setTimeout(() => {
        const currentUser = this.currentUser();
        if (!currentUser) {
          observer.error(new Error('No user logged in'));
          return;
        }

        const updatedUser: User = {
          ...currentUser,
          ...user,
          updatedAt: new Date(),
        };

        // Update storage only in browser
        if (this.isBrowser) {
          localStorage.setItem('banking_user', JSON.stringify(updatedUser));
        }
        
        this.currentUser.set(updatedUser);

        observer.next(updatedUser);
        observer.complete();
      }, 800);
    });
  }

  private createMockUser(username: string, role: string): User {
    return {
      id: crypto.randomUUID(),
      username,
      email: `${username}@example.com`,
      firstName: username.split('.')[0] || 'John',
      lastName: username.split('.')[1] || 'Doe',
      role: role as any,
      phoneNumber: '555-0100',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      dateOfBirth: new Date('1990-01-01'),
      ssn: '123-45-6789',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
      isActive: true,
      profileImage: `https://ui-avatars.com/api/?name=${username}&background=random`,
    };
  }

  private generateMockToken(): string {
    return 'mock-jwt-token-' + Date.now();
  }
}