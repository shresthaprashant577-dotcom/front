import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';
import { DashboardCardComponent } from '../../../shared/components/dashboard-card/dashboard-card.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';

import { AccountService } from '../../../core/services/implementations/account.service';
import { TransactionService } from '../../../core/services/implementations/transaction.service';

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
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);

  account = signal<Account | null>(null);
  transactions = signal<Transaction[]>([]);
  isLoading = signal(true);

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
      if (accountId) {
        this.loadAccount(accountId);
      }
    });
  }

  private loadAccount(accountId: string): void {
    this.isLoading.set(true);

    // Load account details
    this.accountService.getAccountById(accountId).subscribe({
      next: (account: Account) => {
        this.account.set(account);

        // ✅ Load transactions using getAccountTransactions
        this.transactionService.getAccountTransactions(accountId).subscribe({
          next: (res: { data: Transaction[]; total: number }) => {
            const sorted = res.data.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            this.transactions.set(sorted);
            this.isLoading.set(false);
          },
          error: (err: unknown) => {
            console.error('Failed to load transactions', err);
            this.isLoading.set(false);
          }
        });
      },
      error: (err: unknown) => {
        console.error('Failed to load account', err);
        this.isLoading.set(false);
      }
    });
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
