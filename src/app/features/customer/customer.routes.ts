import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../shared/layouts/main-layout/main-layout.component';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/customer-dashboard.component')
          .then(m => m.CustomerDashboardComponent)
      },
      {
        path: 'accounts',
        children: [
          {
            path: '',
            loadComponent: () => import('./accounts/account-list.component')
              .then(m => m.AccountListComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./accounts/account-detail.component')
              .then(m => m.AccountDetailComponent)
          }
        ]
      },
      {
        path: 'transactions',
        loadComponent: () => import('./transactions/transaction-history.component')
          .then(m => m.TransactionHistoryComponent)
      },
      {
        path: 'transfers',
        loadComponent: () => import('./transfers/transfer-money.component')
          .then(m => m.TransferMoneyComponent)
      },
      {
        path: 'beneficiaries',
        loadComponent: () => import('./beneficiaries/beneficiary-management.component')
          .then(m => m.BeneficiaryManagementComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile.component')
          .then(m => m.ProfileComponent)
      },
      {
        path: 'statements',
        loadComponent: () => import('./statements/statement-viewer.component')
          .then(m => m.StatementViewerComponent)
      },
      // Default redirect
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];