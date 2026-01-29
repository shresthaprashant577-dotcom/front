import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MockAuthService } from '../services/implementations/mock-auth.service';

export const authGuard = () => {
  const authService = inject(MockAuthService);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    authService.isAuthenticated().subscribe({
      next: (isAuthenticated) => {
        if (isAuthenticated) {
          resolve(true);
        } else {
          router.navigate(['/login']);
          resolve(false);
        }
      },
      error: () => {
        router.navigate(['/login']);
        resolve(false);
      }
    });
  });
};