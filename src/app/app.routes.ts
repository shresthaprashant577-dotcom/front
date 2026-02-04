// app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Auth routes (no guard)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  
  // Admin routes
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },
  
  // Manager routes
  {
    path: 'manager',
    loadChildren: () => import('./features/manager/manager.routes').then(m => m.MANAGER_ROUTES),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Manager'] }
  },
  
  // Teller routes
  {
    path: 'teller',
    loadChildren: () => import('./features/teller/teller.routes').then(m => m.TELLER_ROUTES),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Teller'] }
  },
  
  // Customer routes
  {
    path: 'customer',
    loadChildren: () => import('./features/customer/customer.routes').then(m => m.CUSTOMER_ROUTES),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Customer'] }
  },
  
  // Default route
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  
  // Fallback route
  { path: '**', redirectTo: '/auth/login' }
];