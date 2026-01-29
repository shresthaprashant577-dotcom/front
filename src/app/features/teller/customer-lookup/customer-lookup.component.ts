import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { MockAuthService } from '../../../core/services/implementations/mock-auth.service';
import { MockDataGenerator } from '../../../core/services/mock-data/mock-data-generator.service';
import { User } from '../../../core/models/user.model';
import { Account } from '../../../core/models/account.model';

@Component({
  selector: 'app-customer-lookup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardLayoutComponent,
    DataTableComponent
  ],
  templateUrl: './customer-lookup.component.html',
})
export class CustomerLookupComponent implements OnInit {
  private authService = inject(MockAuthService);
  private mockData = inject(MockDataGenerator);
  
  currentUser = signal<User | null>(null);
  allCustomers = signal<User[]>([]);
  filteredCustomers = signal<User[]>([]);
  selectedCustomer = signal<User | null>(null);
  customerAccounts = signal<Account[]>([]);
  isLoading = signal(false);
  
  // Search filters
  searchType = signal<'id' | 'name' | 'account' | 'phone' | 'email'>('id');
  searchQuery = signal('');
  searchResults = signal<any[]>([]);
  
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
  
  ngOnInit() {
    this.loadUserData();
    this.loadCustomers();
  }
  
  loadUserData() {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser.set(user);
    });
  }
  
  loadCustomers() {
    this.isLoading.set(true);
    
    // Get all customers from mock data
    const customers = this.mockData.getUsers()
      .filter(user => user.role === 'Customer')
      .slice(0, 50); // Limit for performance
    
    this.allCustomers.set(customers);
    this.filteredCustomers.set(customers);
    
    this.isLoading.set(false);
  }
  
  searchCustomers() {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      this.filteredCustomers.set(this.allCustomers());
      return;
    }
    
    this.isLoading.set(true);
    
    setTimeout(() => {
      let results: User[] = [];
      
      switch (this.searchType()) {
        case 'id':
          results = this.allCustomers().filter(customer =>
            customer.customerId?.toLowerCase().includes(query) ||
            customer.id.toLowerCase().includes(query)
          );
          break;
          
        case 'name':
          results = this.allCustomers().filter(customer =>
            customer.firstName.toLowerCase().includes(query) ||
            customer.lastName.toLowerCase().includes(query) ||
            `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(query)
          );
          break;
          
        case 'account':
          // Search by account number
          const accountResults = this.mockData.getAccounts()
            .filter(account => account.accountNumber.toLowerCase().includes(query))
            .map(account => account.userId);
          
          results = this.allCustomers().filter(customer =>
            accountResults.includes(customer.id)
          );
          break;
          
        case 'phone':
          results = this.allCustomers().filter(customer =>
            customer.phoneNumber.toLowerCase().includes(query)
          );
          break;
          
        case 'email':
          results = this.allCustomers().filter(customer =>
            customer.email.toLowerCase().includes(query)
          );
          break;
      }
      
      this.filteredCustomers.set(results);
      this.isLoading.set(false);
    }, 300);
  }
  
  selectCustomer(customer: User) {
    this.selectedCustomer.set(customer);
    
    // Load customer accounts
    const accounts = this.mockData.getAccountsByUserId(customer.id);
    this.customerAccounts.set(accounts);
  }
  
  clearSearch() {
    this.searchQuery.set('');
    this.searchType.set('id');
    this.filteredCustomers.set(this.allCustomers());
    this.selectedCustomer.set(null);
    this.customerAccounts.set([]);
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
  
  formatDate(date: Date): string {
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
      lastLogin: customer.lastLogin ? this.formatDate(customer.lastLogin) : 'Never'
    };
  }
}