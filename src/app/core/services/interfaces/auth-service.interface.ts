import { Observable } from 'rxjs';
import { User, LoginCredentials, AuthResponse, RegisterRequest, PasswordChangeRequest } from '../../models/user.model';

export interface IAuthService {
  login(credentials: LoginCredentials): Observable<AuthResponse>;
  logout(): void;
  register(userData: RegisterRequest): Observable<User>;
  getCurrentUser(): Observable<User | null>;
  isAuthenticated(): Observable<boolean>;
  hasRole(role: string | string[]): Observable<boolean>;
  changePassword(request: PasswordChangeRequest): Observable<void>;
  forgotPassword(email: string): Observable<void>;
  resetPassword(token: string, newPassword: string): Observable<void>;
  updateProfile(user: Partial<User>): Observable<User>;
}

