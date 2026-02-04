// features/customer/accounts/account-list.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';
import { DashboardCardComponent } from '../../../shared/components/dashboard-card/dashboard-card.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';

import { AuthService } from '../../../core/services/implementations/auth.service';
import { AccountService } from '../../../core/services/implementations/account.service';
import { NotificationService } from '../../../core/services/implementations/notification.service';

import { Account, AccountType } from '../../../core/models/account.model';

type AccountTypeFilter = AccountType | 'all';
type AccountStatusFilter = Account['status'] | 'all';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    DashboardCardComponent,
    DataTableComponent
  ],
  templateUrl: './account-list.component.html',
})
export class AccountListComponent implements OnInit {
  // ---------------------------------------------------------------------------
  // Services
  // ---------------------------------------------------------------------------
  private authService = inject(AuthService);
  private accountService = inject(AccountService);
  private notificationService = inject(NotificationService);

  // ---------------------------------------------------------------------------
  // State (Signals)
  // ---------------------------------------------------------------------------
  accounts = signal<Account[]>([]);
  filteredAccounts = signal<Account[]>([]);
  isLoading = signal(true);

  // Filters
  selectedType = signal<AccountTypeFilter>('all');
  selectedStatus = signal<AccountStatusFilter>('all');

  // Stats
  totalBalance = signal(0);
  activeAccounts = signal(0);
  monthlyFees = signal(0);

  // ---------------------------------------------------------------------------
  // Table Columns
  // ---------------------------------------------------------------------------
  accountColumns: TableColumn[] = [
    { key: 'accountNumber', label: 'Account Number', sortable: true },
    { key: 'type', label: 'Type', sortable: true, format: 'badge' },
    { key: 'balance', label: 'Balance', sortable: true, format: 'currency' },
    { key: 'status', label: 'Status', sortable: true, format: 'badge' },
    { key: 'openingDate', label: 'Opened', sortable: true, format: 'date' }
  ];

  // ---------------------------------------------------------------------------
  // Static UI Data
  // ---------------------------------------------------------------------------
  accountTypes: { value: AccountTypeFilter; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'Checking', label: 'Checking' },
    { value: 'Savings', label: 'Savings' },
    { value: 'Business', label: 'Business' },
    { value: 'FixedDeposit', label: 'Fixed Deposit' },
    { value: 'Loan', label: 'Loan' },
    { value: 'CreditCard', label: 'Credit Card' }
  ];

  statusTypes: { value: AccountStatusFilter; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Suspended', label: 'Suspended' },
    { value: 'Dormant', label: 'Dormant' }
  ];

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  ngOnInit() {
    this.loadAccounts();
  }

  // ---------------------------------------------------------------------------
  // Load Accounts from Backend
  // ---------------------------------------------------------------------------
  loadAccounts(): void {
    this.isLoading.set(true);

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.notificationService.error('Unauthorized', 'User not logged in');
      this.isLoading.set(false);
      return;
    }

    this.accountService.getMyAccounts().subscribe({
      next: (accounts: Account[]) => {
        this.accounts.set(accounts);
        this.filteredAccounts.set(accounts);
        this.updateStats(accounts);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.notificationService.error('Error', 'Failed to load accounts');
        this.isLoading.set(false);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Filters
  // ---------------------------------------------------------------------------
  applyFilters(): void {
    let filtered = this.accounts();

    const typeFilter = this.selectedType();
    if (typeFilter !== 'all') {
      filtered = filtered.filter(acc => acc.type === typeFilter);
    }

    const statusFilter = this.selectedStatus();
    if (statusFilter !== 'all') {
      filtered = filtered.filter(acc => acc.status === statusFilter);
    }

    this.filteredAccounts.set(filtered);
    this.updateStats(filtered);
  }

  onTypeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedType.set(select.value as AccountTypeFilter);
    this.applyFilters();
  }

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus.set(select.value as AccountStatusFilter);
    this.applyFilters();
  }

  // ---------------------------------------------------------------------------
  // Stats Calculation
  // ---------------------------------------------------------------------------
  private updateStats(accounts: Account[]): void {
    const total = accounts.reduce((sum: number, acc: Account) => sum + acc.balance, 0);
    const active = accounts.filter(acc => acc.status === 'Active').length;
    const fees = accounts.reduce((sum: number, acc: Account) => sum + acc.monthlyFee, 0);

    this.totalBalance.set(total);
    this.activeAccounts.set(active);
    this.monthlyFees.set(fees);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  getAccountTypeColor(type: AccountTypeFilter): string {
    const colors: Record<AccountType, string> = {
      Checking: 'bg-blue-100 text-blue-800',
      Savings: 'bg-green-100 text-green-800',
      Business: 'bg-purple-100 text-purple-800',
      FixedDeposit: 'bg-yellow-100 text-yellow-800',
      Loan: 'bg-red-100 text-red-800',
      CreditCard: 'bg-indigo-100 text-indigo-800'
    };

    if (type === 'all') return 'bg-gray-100 text-gray-800';
    return colors[type];
  }

formatCurrency(amount: number): string {
  const x = amount.toFixed(2); // 2 decimal points
  const parts = x.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Format integer part in lakh/crore style
  const lastThree = integerPart.slice(-3);
  const otherNumbers = integerPart.slice(0, -3);
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const formattedInteger = formattedOther ? formattedOther + ',' + lastThree : lastThree;

  return `NPR ${formattedInteger}.${decimalPart}`;
}
}