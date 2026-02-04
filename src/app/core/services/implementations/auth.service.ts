// core/services/implementations/auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import {
  LoginRequest,
  LoginResponse,
  User,
  UserRole,
  RegisterRequest
} from '../../models/auth.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadUserFromStorage();
  }

  // ========== AUTHENTICATION METHODS ==========

login(credentials: LoginRequest): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${environment.apiUrl}/Auth/login`, credentials).pipe(
    tap(response => {
      console.log('Auth service received response:', response);
      this.storeAuthData(response);
      // Create user object for currentUserSubject
      const user: User = {
        id: response.id.toString(),
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: this.mapRoleNumberToString(response.role),
        phoneNumber: '',
        address: '',
        dateOfBirth: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
        isActive: true
      };
      console.log('Setting current user:', user);
      this.currentUserSubject.next(user);
      console.log('Token stored:', this.getToken());
    })
  );
}


  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/Auth/register`, userData).pipe(
      tap(response => {
        this.storeAuthData(response);
        // Create user object for currentUserSubject
        const user: User = {
          id: response.id.toString(),
          username: response.username,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: this.mapRoleNumberToString(response.role),
          phoneNumber: '',
          address: '',
          dateOfBirth: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: new Date(),
          isActive: true
        };
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    // Don't make HTTP call on logout to avoid 401 loop
    this.clearAuthData();
    this.currentUserSubject.next(null);
    if (this.isBrowser) this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<{ accessToken: string; refreshToken: string }> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh-token',
      { refreshToken }
    ).pipe(
      tap(tokens => {
        this.setToken(tokens.accessToken);
        this.setRefreshToken(tokens.refreshToken);
      })
    );
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.post('/auth/change-password', data);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post('/auth/forgot-password', { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post('/auth/reset-password', { token, newPassword });
  }

  firstTimePasswordChange(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Auth/first-time-password-change`, {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    });
  }

  // ========== USER MANAGEMENT ==========

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateUserProfile(data: Partial<User>): Observable<User> {
    return this.http.put<User>('/users/profile', data).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        if (this.isBrowser) {
          localStorage.setItem(environment.userKey, JSON.stringify(user));
        }
      })
    );
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(roles: string | string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (Array.isArray(roles)) return roles.includes(user.role);
    return user.role === roles;
  }

  // ========== TOKEN MANAGEMENT ==========

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem(environment.tokenKey) : null;
  }

  setToken(token: string): void {
    if (this.isBrowser) localStorage.setItem(environment.tokenKey, token);
  }

  getRefreshToken(): string | null {
    return this.isBrowser ? localStorage.getItem(environment.refreshTokenKey) : null;
  }

  setRefreshToken(refreshToken: string): void {
    if (this.isBrowser) localStorage.setItem(environment.refreshTokenKey, refreshToken);
  }

  // ========== PRIVATE METHODS ==========

  private mapRoleNumberToString(roleNumber: any): UserRole {
    const numRole = Number(roleNumber);
    switch (numRole) {
      case 1: return 'Customer';
      case 2: return 'Teller';
      case 3: return 'Manager';
      default: return 'Customer';
    }
  }

  private storeAuthData(response: LoginResponse): void {
    if (!this.isBrowser) return;
    localStorage.setItem(environment.tokenKey, response.token);
    localStorage.setItem(environment.refreshTokenKey, response.refreshToken);
    
    // Create user object from response
    const user: User = {
      id: response.id.toString(),
      username: response.username,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      role: this.mapRoleNumberToString(response.role),
      phoneNumber: '',
      address: '',
      dateOfBirth: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
      isActive: true
    };
    
    localStorage.setItem(environment.userKey, JSON.stringify(user));
  }

  private clearAuthData(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.refreshTokenKey);
    localStorage.removeItem(environment.userKey);
  }

  private loadUserFromStorage(): void {
    if (!this.isBrowser) return;
    const userData = localStorage.getItem(environment.userKey);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch {
        this.clearAuthData();
      }
    }
  }
}
