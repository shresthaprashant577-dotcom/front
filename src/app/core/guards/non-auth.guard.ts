import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MockAuthService } from '../services/implementations/mock-auth.service';

export const nonAuthGuard = () => {
  const authService = inject(MockAuthService);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    authService.isAuthenticated().subscribe({
      next: (isAuthenticated) => {
        if (isAuthenticated) {
          // User is already logged in, redirect to appropriate dashboard
          authService.getCurrentUser().subscribe(user => {
            if (user) {
              switch (user.role) {
                case 'Admin':
                case 'Manager':
                  router.navigate(['/manager/dashboard']);
                  break;
                case 'Teller':
                  router.navigate(['/teller/dashboard']);
                  break;
                case 'Customer':
                  router.navigate(['/customer/dashboard']);
                  break;
              }
            }
            resolve(false);
          });
        } else {
          resolve(true);
        }
      },
      error: () => {
        resolve(true);
      }
    });
  });
};