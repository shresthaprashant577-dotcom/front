import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/implementations/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip auth header for auth endpoints to prevent loops
  const isAuthEndpoint = request.url.includes('/Auth/login') || 
                        request.url.includes('/Auth/register') ||
                        request.url.includes('/Auth/refresh-token') ||
                        request.url.includes('/Auth/logout') ||
                        request.url.includes('/Auth/forgot-password') ||
                        request.url.includes('/Auth/reset-password');

  // Add base URL if not already present
  if (!request.url.startsWith('http')) {
    request = request.clone({
      url: `${environment.apiUrl}${request.url}`
    });
  }

  // Add auth token if available and not auth endpoint
  if (!isAuthEndpoint) {
    const token = authService.getToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  return next(request).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthEndpoint) {
        // Clear auth data and redirect to login without making HTTP call
        localStorage.removeItem('banking_auth_token');
        localStorage.removeItem('banking_refresh_token');
        localStorage.removeItem('banking_user_data');
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};