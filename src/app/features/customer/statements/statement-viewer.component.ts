// features/customer/statements/statement-viewer.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/implementations/auth.service';
import { StatementService } from '../../../core/services/implementations/statement.service';
import { AccountService } from '../../../core/services/implementations/account.service';
import { NotificationService } from '../../../core/services/implementations/notification.service';

import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';

import { User } from '../../../core/models/user.model';
import { Account } from '../../../core/models/account.model';
import {
  Statement,
  StatementFilter,
  StatementFormat
} from '../../../core/models/statement.model';
import { DashboardLayoutComponent, LoadingSpinnerComponent } from '../../../shared/shared.routes';


@Component({
  selector: 'app-statement-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, DashboardLayoutComponent, LoadingSpinnerComponent],
  templateUrl: './statement-viewer.component.html'
})
export class StatementViewerComponent implements OnInit {

  // ---------------------------------------------------------------------------
  // Services
  // ---------------------------------------------------------------------------
  private authService = inject(AuthService);
  public statementService = inject(StatementService);
  private accountService = inject(AccountService);
  private notificationService = inject(NotificationService);

  // ---------------------------------------------------------------------------
  // State (Signals)
  // ---------------------------------------------------------------------------
  currentUser = signal<User | null>(null);
  accounts = signal<Account[]>([]);
  statements = signal<Statement[]>([]);
  selectedStatement = signal<Statement | null>(null);

  isLoading = signal(false);
  isGenerating = signal(false);
  isDownloading = signal(false);

  // Filters
  selectedAccountId = signal<string | null>(null);
  selectedPeriod = signal('last-30-days');
  startDate = signal('');
  endDate = signal('');
  statementFormat = signal<StatementFormat>(StatementFormat.PDF);

  // ---------------------------------------------------------------------------
  // Static UI Data
  // ---------------------------------------------------------------------------
  periods = [
    { value: 'last-7-days', label: 'Last 7 Days' },
    { value: 'last-30-days', label: 'Last 30 Days' },
    { value: 'last-90-days', label: 'Last 90 Days' },
    { value: 'current-month', label: 'Current Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'current-quarter', label: 'Current Quarter' },
    { value: 'last-quarter', label: 'Last Quarter' },
    { value: 'current-year', label: 'Current Year' },
    { value: 'last-year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  formats = [
    { value: StatementFormat.PDF, label: 'PDF' },
    { value: StatementFormat.EXCEL, label: 'Excel' },
    { value: StatementFormat.CSV, label: 'CSV' },
    { value: StatementFormat.HTML, label: 'HTML' }
  ];

  // ---------------------------------------------------------------------------
  // Table Columns
  // ---------------------------------------------------------------------------
  statementColumns: TableColumn[] = [
    { key: 'periodStart', label: 'Start Date', sortable: true, format: 'date' },
    { key: 'periodEnd', label: 'End Date', sortable: true, format: 'date' },
    { key: 'accountNumber', label: 'Account Number', sortable: true },
    { key: 'openingBalance', label: 'Opening Balance', sortable: true, format: 'currency' },
    { key: 'closingBalance', label: 'Closing Balance', sortable: true, format: 'currency' },
    { key: 'totalTransactions', label: 'Transactions', sortable: true },
    { key: 'actions', label: 'Actions' }
  ];

  transactionColumns: TableColumn[] = [
    { key: 'date', label: 'Date', sortable: true, format: 'date' },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'referenceNumber', label: 'Reference', sortable: true },
    { key: 'type', label: 'Type', sortable: true, format: 'badge' },
    { key: 'amount', label: 'Amount', sortable: true, format: 'currency' },
    { key: 'runningBalance', label: 'Balance', sortable: true, format: 'currency' },
    { key: 'status', label: 'Status', sortable: true }
  ];

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  ngOnInit(): void {
    this.setDefaultDates();
    this.loadCurrentUser();
  }

  // ---------------------------------------------------------------------------
  // Auth / Data Loading
  // ---------------------------------------------------------------------------
  private loadCurrentUser(): void {
    this.isLoading.set(true);

    const user = this.authService.getCurrentUser(); // ✅ NOT observable

    if (!user) {
      this.notificationService.error('Unauthorized', 'User not logged in');
      this.isLoading.set(false);
      return;
    }

    this.currentUser.set(user);
    this.loadAccounts();
  }

  private loadAccounts(): void {
    this.accountService.getMyAccounts().subscribe({
      next: (accounts) => {
        this.accounts.set(accounts);

        if (accounts.length) {
          this.selectedAccountId.set(accounts[0].id);
          this.loadStatements();
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.notificationService.error('Error', 'Failed to load accounts');
        this.isLoading.set(false);
      }
    });
  }

  loadStatements(): void {
    const accountId = this.selectedAccountId();
    if (!accountId) {
      this.statements.set([]);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);

    const filter: StatementFilter = { accountId };
    this.applyDateFilter(filter);

    this.statementService.getStatements(filter).subscribe({
      next: res => {
        this.statements.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.error('Error', 'Failed to load statements');
        this.isLoading.set(false);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Date Filters
  // ---------------------------------------------------------------------------
  private applyDateFilter(filter: StatementFilter): void {
    const now = new Date();

    if (this.selectedPeriod() === 'custom') {
      if (this.startDate() && this.endDate()) {
        filter.startDate = new Date(this.startDate());
        filter.endDate = new Date(this.endDate());
      }
      return;
    }

    const daysMap: Record<string, number> = {
      'last-7-days': 7,
      'last-30-days': 30,
      'last-90-days': 90
    };

    if (daysMap[this.selectedPeriod()]) {
      const start = new Date();
      start.setDate(start.getDate() - daysMap[this.selectedPeriod()]);
      filter.startDate = start;
      filter.endDate = now;
    }
  }

  private setDefaultDates(): void {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    this.startDate.set(lastMonth.toISOString().split('T')[0]);
    this.endDate.set(today.toISOString().split('T')[0]);
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  generateStatement(): void {
    const accountId = this.selectedAccountId();
    if (!accountId) {
      this.notificationService.warning('Account Required', 'Please select an account');
      return;
    }

    this.isGenerating.set(true);

    const filter: StatementFilter = { accountId };
    this.applyDateFilter(filter);

    this.statementService.generateStatement({
      accountId,
      startDate: filter.startDate!,
      endDate: filter.endDate!,
      format: this.statementFormat(),
      includeTransactions: true,
      emailCopy: false
    }).subscribe({
      next: res => {
        this.notificationService.success('Success', 'Statement generated');
        this.downloadStatementById(res.statementId);
        this.loadStatements();
      },
      error: () => {
        this.notificationService.error('Error', 'Failed to generate statement');
        this.isGenerating.set(false);
      }
    });
  }

  downloadStatementById(statementId: string): void {
    this.isDownloading.set(true);

    this.statementService.downloadStatement(statementId, this.statementFormat()).subscribe({
      next: blob => {
        const filename = `Statement_${new Date().toISOString().split('T')[0]}.${this.statementFormat().toLowerCase()}`;
        this.statementService.downloadBlob(blob, filename);
        this.isGenerating.set(false);
        this.isDownloading.set(false);
      },
      error: () => {
        this.notificationService.error('Error', 'Failed to download statement');
        this.isDownloading.set(false);
      }
    });
  }

  viewStatementDetails(statement: Statement): void {
    this.selectedStatement.set(statement);
  }

  closeStatementDetails(): void {
    this.selectedStatement.set(null);
  }

  calculateNetChange(statement: Statement): number {
    return statement.totalCredits - statement.totalDebits;
  }
  onAccountChange(): void {
  this.loadStatements();
}

onPeriodChange(): void {
  if (this.selectedPeriod() !== 'custom') {
    this.loadStatements();
  }
}

emailStatement(statement: Statement): void {
  this.statementService.emailStatement(statement.id).subscribe({
    next: () => this.notificationService.success('Success', 'Statement emailed successfully'),
    error: () => this.notificationService.error('Error', 'Failed to email statement')
  });
}

}
