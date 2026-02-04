import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';
import { DashboardCardComponent } from '../../../shared/components/dashboard-card/dashboard-card.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';

import { AuthService } from '../../../core/services/implementations/auth.service';
import { AccountService } from '../../../core/services/implementations/account.service';
import { TransactionService } from '../../../core/services/implementations/transaction.service';

import { User } from '../../../core/models/user.model';
import { Account } from '../../../core/models/account.model';
import { Transaction, TransactionType } from '../../../core/models/transaction.model';

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
  private authService = inject(AuthService);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);

  currentUser = signal<User | null>(null);
  accounts = signal<Account[]>([]);
  recentTransactions = signal<Transaction[]>([]);

  // Dashboard stats
  totalBalance = signal(0);
  activeAccounts = signal(0);
  monthlyTransactions = signal(0);
  monthlySpending = signal(0);

  // Table columns
  transactionColumns: TableColumn[] = [
    { key: 'date', label: 'Date', sortable: true, format: 'date' },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'type', label: 'Type', sortable: true, format: 'badge' },
    { key: 'amount', label: 'Amount', sortable: true, format: 'currency' },
    { key: 'status', label: 'Status', sortable: true, format: 'badge' }
  ];

  ngOnInit() {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    const user = this.authService.getCurrentUser();
    if (!user || !user.customerId) return;

    this.currentUser.set(user);

    // Load accounts
    this.accountService.getCustomerAccounts(user.customerId).subscribe({
      next: (accounts: Account[]) => {
        this.accounts.set(accounts);

        const total = accounts.reduce((sum, acc) => sum + acc.balance, 0);
        const active = accounts.filter(acc => acc.status === 'Active').length;

        this.totalBalance.set(total);
        this.activeAccounts.set(active);

        // Load transactions after accounts are loaded
        this.loadTransactions(accounts);
      },
      error: (err : any) => console.error('Failed to load accounts', err)
    });
  }

  private loadTransactions(accounts: Account[]): void {
    if (accounts.length === 0) return;

    let allTransactions: Transaction[] = [];

    // For each account, load transactions
    const transactionObservables = accounts.map(acc =>
      this.transactionService.getAccountTransactions(acc.id)
    );

    // Wait for all observables to complete
  Promise.all(transactionObservables.map(obs => obs.toPromise()))
    .then((results) => {
      // Filter out any undefined results
      const validResults = results.filter(
        (res): res is { data: Transaction[]; total: number } => res !== undefined
      );
        // Sort by date descending and take 10
        const recent = allTransactions
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10);

        this.recentTransactions.set(recent);

        // Monthly stats
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const monthly = allTransactions.filter(t => new Date(t.date) >= oneMonthAgo);
        this.monthlyTransactions.set(monthly.length);

        const spending = monthly
          .filter(t => t.type === 'Withdrawal' || t.type === 'Transfer' || t.type === 'Payment')
          .reduce((sum, t) => sum + t.amount, 0);

        this.monthlySpending.set(spending);
      })
      .catch(err => console.error('Failed to load transactions', err));
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

 formatCurrency(amount: number): string {
    const x = amount.toFixed(2);
    const parts = x.split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1];

    const lastThree = integerPart.slice(-3);
    const otherNumbers = integerPart.slice(0, -3);
    const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    const formattedInteger = formattedOther ? formattedOther + ',' + lastThree : lastThree;

    return `NPR ${formattedInteger}.${decimalPart}`;
  }

}
