import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../shared/layouts/main-layout/main-layout.component';

export const TELLER_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/teller-dashboard.component')
          .then(m => m.TellerDashboardComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./transactions/transaction-processing.component')
          .then(m => m.TransactionProcessingComponent)
      },
      {
        path: 'transfers',
        loadComponent: () => import('./transfers/transfer.component')
          .then(m => m.TransferComponent)
      },
      {
        path: 'customer-lookup',
        loadComponent: () => import('./customer-lookup/customer-lookup.component')
          .then(m => m.CustomerLookupComponent)
      },
      {
        path: 'daily-summary',
        loadComponent: () => import('./daily-summary/daily-summary.component')
          .then(m => m.DailySummaryComponent)
      },
      {
        path: 'account-opening',
        loadComponent: () => import('./account-opening/account-opening.component')
          .then(m => m.AccountOpeningComponent)
      },
      // Default redirect
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];