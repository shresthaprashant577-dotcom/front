import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../shared/layouts/main-layout/main-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/admin-dashboard.component')
          .then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./users/user-management.component')
          .then(m => m.UserManagementComponent)
      },
      {
        path: 'system-settings',
        loadComponent: () => import('./system-settings/system-settings.component')
          .then(m => m.SystemSettingsComponent)
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./audit-logs/audit-logs.component')
          .then(m => m.AuditLogsComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./reports/admin-reports.component')
          .then(m => m.AdminReportsComponent)
      },
      {
        path: 'security',
        loadComponent: () => import('./security/security-management.component')
          .then(m => m.SecurityManagementComponent)
      },
      // Default redirect
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];