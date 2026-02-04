import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';

import { AuthService } from '../../../core/services/implementations/auth.service';
import { AccountService } from '../../../core/services/implementations/account.service';
import { CustomerService } from '../../../core/services/implementations/customer.service';
import { NotificationService } from '../../../core/services/implementations/notification.service';

import { User } from '../../../core/models/user.model';
import { Account } from '../../../core/models/account.model';

@Component({
  selector: 'app-customer-lookup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DashboardLayoutComponent,
    DataTableComponent
  ],
  templateUrl: './customer-lookup.component.html',
})
export class CustomerLookupComponent implements OnInit {
  private authService = inject(AuthService);
  private accountService = inject(AccountService);
  private customerService = inject(CustomerService);
  private notificationService = inject(NotificationService);

  currentUser = signal<User | null>(null);
  allCustomers = signal<User[]>([]);
  filteredCustomers = signal<User[]>([]);
  selectedCustomer = signal<User | null>(null);
  customerAccounts = signal<Account[]>([]);
  isLoading = signal(false);

  // Search filters
  searchType = signal<'id' | 'name' | 'account' | 'phone' | 'email'>('id');
  searchQuery = signal('');

  // Customer table columns
  customerColumns: TableColumn[] = [
    { key: 'customerId', label: 'Customer ID', sortable: true },
    { key: 'firstName', label: 'First Name', sortable: true },
    { key: 'lastName', label: 'Last Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phoneNumber', label: 'Phone', sortable: true },
    { key: 'status', label: 'Status', sortable: true, format: 'badge' }
  ];

  // Account table columns
  accountColumns: TableColumn[] = [
    { key: 'accountNumber', label: 'Account Number', sortable: true },
    { key: 'type', label: 'Type', sortable: true, format: 'badge' },
    { key: 'balance', label: 'Balance', sortable: true, format: 'currency' },
    { key: 'status', label: 'Status', sortable: true, format: 'badge' },
    { key: 'openingDate', label: 'Opened', sortable: true, format: 'date' }
  ];

  searchTypes = [
    { value: 'id', label: 'Customer ID' },
    { value: 'name', label: 'Customer Name' },
    { value: 'account', label: 'Account Number' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'email', label: 'Email Address' }
  ];

  readonly Math = Math;

  ngOnInit() {
    this.loadCurrentUser();
    this.loadCustomers();
  }

  // =====================
  // LOAD CURRENT USER
  // =====================
  loadCurrentUser() {
    this.authService.currentUser$.subscribe({
      next: (user: User | null) => this.currentUser.set(user),
      error: () => this.notificationService.error('Error', 'Failed to fetch current user')
    });
  }

  // =====================
  // LOAD CUSTOMERS
  // =====================
  loadCustomers() {
    this.isLoading.set(true);
    this.customerService.getCustomers().subscribe({
      next: ({ data, total }) => {
        const filtered = data.filter(c => c.role === 'Customer').slice(0, 50);
        this.allCustomers.set(filtered);
        this.filteredCustomers.set(filtered);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.error('Error', 'Failed to load customers');
        this.isLoading.set(false);
      }
    });


  }

  // =====================
  // SEARCH
  // =====================
  searchCustomers() {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      this.filteredCustomers.set(this.allCustomers());
      return;
    }

    this.isLoading.set(true);

    switch (this.searchType()) {
      case 'id':
        this.filteredCustomers.set(
          this.allCustomers().filter(c =>
            c.customerId?.toLowerCase().includes(query) ||
            c.id.toLowerCase().includes(query)
          )
        );
        this.isLoading.set(false);
        break;

      case 'name':
        this.filteredCustomers.set(
          this.allCustomers().filter(c =>
            c.firstName.toLowerCase().includes(query) ||
            c.lastName.toLowerCase().includes(query) ||
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(query)
          )
        );
        this.isLoading.set(false);
        break;

      case 'account':
        this.accountService.getAccounts().subscribe({
          next: ({ data: accounts }) => {
            const matchingUserIds = accounts
              .filter(acc => acc.accountNumber.toLowerCase().includes(query))
              .map(acc => acc.userId);
            const results = this.allCustomers().filter(c => matchingUserIds.includes(c.id));
            this.filteredCustomers.set(results);
            this.isLoading.set(false);
          },
          error: () => {
            this.notificationService.error('Error', 'Failed to fetch accounts');
            this.isLoading.set(false);
          }
        });
        break;

      case 'phone':
        this.filteredCustomers.set(
          this.allCustomers().filter(c => c.phoneNumber?.toLowerCase().includes(query))
        );
        this.isLoading.set(false);
        break;

      case 'email':
        this.filteredCustomers.set(
          this.allCustomers().filter(c => c.email?.toLowerCase().includes(query))
        );
        this.isLoading.set(false);
        break;
    }
  }

  // =====================
  // SELECT CUSTOMER
  // =====================
  selectCustomer(customer: User) {
    this.selectedCustomer.set(customer);
    this.loadCustomerAccounts(customer.id);
  }

  loadCustomerAccounts(customerId: string) {
    this.accountService.getCustomerAccounts(customerId).subscribe({
      next: (accounts: Account[]) => this.customerAccounts.set(accounts),
      error: () => this.notificationService.error('Error', 'Failed to load accounts')
    });
  }

  clearSearch() {
    this.searchQuery.set('');
    this.searchType.set('id');
    this.filteredCustomers.set(this.allCustomers());
    this.selectedCustomer.set(null);
    this.customerAccounts.set([]);
  }

  // =====================
  // HELPERS
  // =====================
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR'
    }).format(amount);
  }

  getCustomerStatus(customer: User): string {
    return customer.isActive ? 'Active' : 'Inactive';
  }

  getCustomerStatusColor(customer: User): string {
    return customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getAccountTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'Checking': 'bg-blue-100 text-blue-800',
      'Savings': 'bg-green-100 text-green-800',
      'Business': 'bg-purple-100 text-purple-800',
      'FixedDeposit': 'bg-yellow-100 text-yellow-800',
      'Loan': 'bg-red-100 text-red-800',
      'CreditCard': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  getAccountStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Closed': 'bg-red-100 text-red-800',
      'Suspended': 'bg-yellow-100 text-yellow-800',
      'Dormant': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getCustomerSummary(): any {
    const customer = this.selectedCustomer();
    if (!customer) return null;

    const accounts = this.customerAccounts();
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const activeAccounts = accounts.filter(acc => acc.status === 'Active').length;

    return {
      totalBalance,
      activeAccounts,
      totalAccounts: accounts.length,
      memberSince: this.formatDate(customer.createdAt),
      lastLogin: this.formatDate(customer.lastLogin)
    };
  }

  getActiveCustomersCount(): number {
    return this.allCustomers().filter(c => c.isActive).length;
  }
}
