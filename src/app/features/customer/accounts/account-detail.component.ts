import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';
import { DashboardCardComponent } from '../../../shared/components/dashboard-card/dashboard-card.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { MockDataGenerator } from '../../../core/services/mock-data/mock-data-generator.service';
import { Account } from '../../../core/models/account.model';
import { Transaction } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DashboardLayoutComponent,
    DashboardCardComponent,
    DataTableComponent
  ],
  templateUrl: './account-detail.component.html',
})
export class AccountDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private mockData = inject(MockDataGenerator);
  
  account = signal<Account | null>(null);
  transactions = signal<Transaction[]>([]);
  isLoading = signal(true);
  
  // Transaction table columns
  transactionColumns: TableColumn[] = [
    { key: 'date', label: 'Date', sortable: true, format: 'date' },
    { key: 'transactionId', label: 'Transaction ID', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'type', label: 'Type', sortable: true, format: 'badge' },
    { key: 'amount', label: 'Amount', sortable: true, format: 'currency' },
    { key: 'balanceAfter', label: 'Balance After', sortable: true, format: 'currency' }
  ];
  
  ngOnInit() {
    this.route.params.subscribe(params => {
      const accountId = params['id'];
      this.loadAccount(accountId);
    });
  }
  
  loadAccount(accountId: string) {
    this.isLoading.set(true);
    
    // Simulate API delay
    setTimeout(() => {
      const account = this.mockData.getAccounts().find(a => a.id === accountId);
      
      if (account) {
        this.account.set(account);
        
        // Load transactions for this account
        const accountTransactions = this.mockData.getTransactionsByAccountId(accountId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        this.transactions.set(accountTransactions);
        
        // Update breadcrumb
        this.updateBreadcrumb(account);
      }
      
      this.isLoading.set(false);
    }, 500);
  }
  
  updateBreadcrumb(account: Account) {
    // This would be dynamic based on the account
    // For now, we'll use a static approach
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
  
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Closed': 'bg-red-100 text-red-800',
      'Suspended': 'bg-yellow-100 text-yellow-800',
      'Dormant': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
  
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  calculateDaysSinceActivity(): number {
    const account = this.account();
    if (!account || !account.lastActivityDate) return 0;
    
    const lastActivity = new Date(account.lastActivityDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastActivity.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}