import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { nonAuthGuard } from './core/guards/non-auth.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent),
    canActivate: [nonAuthGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component')
      .then(m => m.RegisterComponent),
    canActivate: [nonAuthGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component')
      .then(m => m.ForgotPasswordComponent),
    canActivate: [nonAuthGuard]
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component')
      .then(m => m.ResetPasswordComponent),
    canActivate: [nonAuthGuard]
  },
  
  // Role-based routes
  /*
  {
    path: 'manager',
    loadChildren: () => import('./features/manager/manager.routes')
      .then(m => m.MANAGER_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Manager', 'Admin'] }
  },
  {
    path: 'teller',
    loadChildren: () => import('./features/teller/teller.routes')
      .then(m => m.TELLER_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Teller'] }
  }, */
  {
    path: 'customer',
    loadChildren: () => import('./features/customer/customer.routes')
      .then(m => m.CUSTOMER_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Customer'] }
  }, 
  
  // Default redirect
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];