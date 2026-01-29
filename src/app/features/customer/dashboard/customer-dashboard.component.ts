import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';
import { DashboardCardComponent } from '../../../shared/components/dashboard-card/dashboard-card.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { MockAuthService } from '../../../core/services/implementations/mock-auth.service';
import { MockDataGenerator } from '../../../core/services/mock-data/mock-data-generator.service';
import { User } from '../../../core/models/user.model';
import { Account } from '../../../core/models/account.model';
import { Transaction } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DashboardLayoutComponent,
    DashboardCardComponent,
    DataTableComponent
  ],
  templateUrl: './customer-dashboard.component.html',
})
export class CustomerDashboardComponent implements OnInit {
  private authService = inject(MockAuthService);
  private mockData = inject(MockDataGenerator);
  
  currentUser = signal<User | null>(null);
  accounts = signal<Account[]>([]);
  recentTransactions = signal<Transaction[]>([]);
  
  // Dashboard stats
  totalBalance = signal(0);
  activeAccounts = signal(0);
  monthlyTransactions = signal(0);
  monthlySpending = signal(0);
  
  // Table columns for recent transactions
  transactionColumns: TableColumn[] = [
    { key: 'date', label: 'Date', sortable: true, format: 'date' },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'type', label: 'Type', sortable: true, format: 'badge' },
    { key: 'amount', label: 'Amount', sortable: true, format: 'currency' },
    { key: 'status', label: 'Status', sortable: true, format: 'badge' }
  ];
  
  ngOnInit() {
    this.loadUserData();
    this.loadAccounts();
    this.loadTransactions();
  }
  
  loadUserData() {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser.set(user);
    });
  }
  
  loadAccounts() {
    const user = this.currentUser();
    if (!user) return;
    
    const userAccounts = this.mockData.getAccountsByUserId(user.id);
    this.accounts.set(userAccounts);
    
    // Calculate stats
    const total = userAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const active = userAccounts.filter(acc => acc.status === 'Active').length;
    
    this.totalBalance.set(total);
    this.activeAccounts.set(active);
  }
  
  loadTransactions() {
    const user = this.currentUser();
    if (!user) return;
    
    const userAccounts = this.mockData.getAccountsByUserId(user.id);
    let allTransactions: Transaction[] = [];
    
    // Get transactions for all user accounts
    userAccounts.forEach(account => {
      const accountTransactions = this.mockData.getTransactionsByAccountId(account.id);
      allTransactions = [...allTransactions, ...accountTransactions];
    });
    
    // Sort by date (newest first) and take 10
    const recent = allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
    
    this.recentTransactions.set(recent);
    
    // Calculate monthly stats
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const monthlyTransactions = allTransactions.filter(t => 
      new Date(t.date) >= oneMonthAgo
    );
    
    this.monthlyTransactions.set(monthlyTransactions.length);
    
    const monthlySpending = monthlyTransactions
      .filter(t => t.type === 'Withdrawal' || t.type === 'Transfer' || t.type === 'Payment')
      .reduce((sum, t) => sum + t.amount, 0);
    
    this.monthlySpending.set(monthlySpending);
  }
  
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}