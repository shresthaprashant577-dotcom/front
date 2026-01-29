import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { MockAuthService } from '../services/implementations/mock-auth.service';

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(MockAuthService);
  const router = inject(Router);
  
  const requiredRoles = route.data['roles'] as string[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  return new Promise<boolean>((resolve) => {
    authService.hasRole(requiredRoles).subscribe({
      next: (hasRole) => {
        if (hasRole) {
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