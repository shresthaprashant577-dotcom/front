import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';
import { DashboardCardComponent } from '../../../shared/components/dashboard-card/dashboard-card.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { MockAuthService } from '../../../core/services/implementations/mock-auth.service';
import { MockDataGenerator } from '../../../core/services/mock-data/mock-data-generator.service';
import { Account, AccountType } from '../../../core/models/account.model';

type AccountTypeFilter = AccountType | 'all';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DashboardLayoutComponent,
    DashboardCardComponent,
    DataTableComponent
  ],
  templateUrl: './account-list.component.html',
})
export class AccountListComponent implements OnInit {
  private authService = inject(MockAuthService);
  private mockData = inject(MockDataGenerator);
  
  accounts = signal<Account[]>([]);
  filteredAccounts = signal<Account[]>([]);
  isLoading = signal(true);
  
  // ✅ STRONGLY TYPED FILTERS
  selectedType = signal<AccountTypeFilter>('all');
  selectedStatus = signal<'all' | Account['status']>('all');
  
  // Stats
  totalBalance = signal(0);
  activeAccounts = signal(0);
  monthlyFees = signal(0);
  
  // Table columns
  accountColumns: TableColumn[] = [
    { key: 'accountNumber', label: 'Account Number', sortable: true },
    { key: 'type', label: 'Type', sortable: true, format: 'badge' },
    { key: 'balance', label: 'Balance', sortable: true, format: 'currency' },
    { key: 'status', label: 'Status', sortable: true, format: 'badge' },
    { key: 'openingDate', label: 'Opened', sortable: true, format: 'date' }
  ];
  
  // ✅ STRONGLY TYPED ACCOUNT TYPES
  accountTypes: { value: AccountTypeFilter; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'Checking', label: 'Checking' },
    { value: 'Savings', label: 'Savings' },
    { value: 'Business', label: 'Business' },
    { value: 'FixedDeposit', label: 'Fixed Deposit' },
    { value: 'Loan', label: 'Loan' },
    { value: 'CreditCard', label: 'Credit Card' }
  ];
  
  statusTypes: { value: 'all' | Account['status']; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Suspended', label: 'Suspended' },
    { value: 'Dormant', label: 'Dormant' }
  ];
  
  ngOnInit() {
    this.loadAccounts();
  }
  
  loadAccounts() {
    this.isLoading.set(true);
    
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        const userAccounts = this.mockData.getAccountsByUserId(user.id);
        this.accounts.set(userAccounts);
        this.filteredAccounts.set(userAccounts);
        
        const total = userAccounts.reduce((sum, acc) => sum + acc.balance, 0);
        const active = userAccounts.filter(acc => acc.status === 'Active').length;
        const fees = userAccounts.reduce((sum, acc) => sum + acc.monthlyFee, 0);
        
        this.totalBalance.set(total);
        this.activeAccounts.set(active);
        this.monthlyFees.set(fees);
      }
      
      this.isLoading.set(false);
    });
  }
  
  applyFilters() {
    let filtered = this.accounts();
    
    const typeFilter = this.selectedType();
    if (typeFilter !== 'all') {
      filtered = filtered.filter(account => account.type === typeFilter);
    }
    
    const statusFilter = this.selectedStatus();
    if (statusFilter !== 'all') {
      filtered = filtered.filter(account => account.status === statusFilter);
    }
    
    this.filteredAccounts.set(filtered);
  }
  
  onTypeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedType.set(select.value as AccountTypeFilter);
    this.applyFilters();
  }
  
  onStatusChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus.set(select.value as 'all' | Account['status']);
    this.applyFilters();
  }
  
  // ✅ NOW TEMPLATE MATCHES PERFECTLY
  getAccountTypeColor(type: AccountTypeFilter): string {
    const colors: Record<AccountType, string> = {
      Checking: 'bg-blue-100 text-blue-800',
      Savings: 'bg-green-100 text-green-800',
      Business: 'bg-purple-100 text-purple-800',
      FixedDeposit: 'bg-yellow-100 text-yellow-800',
      Loan: 'bg-red-100 text-red-800',
      CreditCard: 'bg-indigo-100 text-indigo-800'
    };

    if (type === 'all') {
      return 'bg-gray-100 text-gray-800';
    }

    return colors[type];
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
