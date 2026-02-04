
// core/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { AuthService } from '../services/implementations/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const expectedRoles = route.data['roles'] as string[];
    const currentUser = this.authService.getCurrentUser();
    
    console.log('RoleGuard - Expected roles:', expectedRoles);
    console.log('RoleGuard - Current user:', currentUser);
    console.log('RoleGuard - Current user role:', currentUser?.role);
    
    if (!expectedRoles || !expectedRoles.length) {
      return true;
    }

    if (this.authService.hasRole(expectedRoles)) {
      console.log('RoleGuard - Access granted');
      return true;
    }

    console.log('RoleGuard - Access denied, redirecting to login');
    this.router.navigate(['/auth/login']);
    return false;
  }
}