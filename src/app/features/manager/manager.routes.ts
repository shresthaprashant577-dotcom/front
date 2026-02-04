import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../shared/layouts/main-layout/main-layout.component';

export const MANAGER_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/manager-dashboard.component')
          .then(m => m.ManagerDashboardComponent)
      },
      {
        path: 'customer-management',
        loadComponent: () => import('./customers/customer-management.component')
          .then(m => m.CustomerManagementComponent)
      },
      {
        path: 'branches',
        loadComponent: () => import('./branches/branch-management.component')
          .then(m => m.BranchManagementComponent)
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./audit-logs/audit-logs.component')
          .then(m => m.AuditLogsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./users/user-management.component')
          .then(m => m.UserManagementComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./reports/reports.component')
          .then(m => m.ReportsComponent)
      },
        {
        path: 'approval',
        loadComponent: () => import('./approval/approvals-management.component')
          .then(m => m.ApprovalsManagementComponent)
      },
      // Default redirect
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];