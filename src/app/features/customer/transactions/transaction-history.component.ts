import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { AuthService } from '../../../core/services/implementations/auth.service';
import { Transaction, TransactionType, TransactionStatus } from '../../../core/models/transaction.model';
import { Account } from '../../../core/models/account.model';
import { AccountService } from '../../../core/services/implementations/account.service';
import { TransactionService } from '../../../core/services/implementations/transaction.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardLayoutComponent,
    DataTableComponent
  ],
  templateUrl: './transaction-history.component.html',
})
export class TransactionHistoryComponent implements OnInit {
  private authService = inject(AuthService);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // =======================
  // CORE STATE
  // =======================
  allTransactions = signal<Transaction[]>([]);
  userAccounts = signal<Account[]>([]);
  isLoading = signal(true);

  // =======================
  // FILTER STATE
  // =======================
  selectedAccount = signal<string>('all');
  selectedType = signal<string>('all');
  selectedStatus = signal<string>('all');
  startDate = signal<string>('');
  endDate = signal<string>('');
  searchTerm = signal<string>('');

  transactionTypes = [
  { label: 'All', value: 'all' },
  { label: 'Deposit', value: 'Deposit' },
  { label: 'Withdrawal', value: 'Withdrawal' },
  { label: 'Transfer', value: 'Transfer' },
  { label: 'Payment', value: 'Payment' },
  { label: 'Fee', value: 'Fee' },
  { label: 'Interest', value: 'Interest' },
  { label: 'Reversal', value: 'Reversal' }
];

statusTypes = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Failed', value: 'Failed' },
  { label: 'Cancelled', value: 'Cancelled' },
  { label: 'Reversed', value: 'Reversed' }
];


  // =======================
  // PAGINATION
  // =======================
  currentPage = signal(1);
  pageSize = signal(20);

  // =======================
  // TABLE CONFIG
  // =======================
  transactionColumns: TableColumn[] = [
    { key: 'date', label: 'Date', sortable: true, format: 'date' },
    { key: 'transactionId', label: 'Transaction ID', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'type', label: 'Type', sortable: true, format: 'badge' },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, format: 'currency' },
    { key: 'status', label: 'Status', sortable: true, format: 'badge' }
  ];

  // =======================
  // COMPUTED: FILTERED
  // =======================
  filteredAll = computed(() => {
    let filtered = [...this.allTransactions()];

    if (this.selectedAccount() !== 'all') {
      filtered = filtered.filter(t => t.accountId === this.selectedAccount());
    }

    if (this.selectedType() !== 'all') {
      filtered = filtered.filter(t => t.type === this.selectedType());
    }

    if (this.selectedStatus() !== 'all') {
      filtered = filtered.filter(t => t.status === this.selectedStatus());
    }

    if (this.startDate()) {
      const start = new Date(this.startDate());
      filtered = filtered.filter(t => new Date(t.date) >= start);
    }

    if (this.endDate()) {
      const end = new Date(this.endDate());
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => new Date(t.date) <= end);
    }

    if (this.searchTerm().trim()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(term) ||
        t.transactionId.toLowerCase().includes(term) ||
        t.type.toLowerCase().includes(term)
      );
    }

    return filtered;
  });

  filteredTransactions = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return this.filteredAll().slice(startIndex, endIndex);
  });

  totalItems = computed(() => this.filteredAll().length);

  creditsTotal = computed(() =>
    this.filteredAll()
      .filter(t => t.type === 'Deposit' || t.type === 'Interest')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  debitsTotal = computed(() =>
    this.filteredAll()
      .filter(t => t.type === 'Withdrawal' || t.type === 'Payment' || t.type === 'Fee')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  netTotal = computed(() => this.creditsTotal() - this.debitsTotal());

  // =======================
  // LIFECYCLE
  // =======================
  ngOnInit() {
    this.setDefaultDateRange();
    this.loadTransactions();
  }

  setDefaultDateRange() {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 3);

    this.startDate.set(start.toISOString().split('T')[0]);
    this.endDate.set(end.toISOString().split('T')[0]);
  }

  // =======================
  // DATA LOADING
  // =======================
  loadTransactions() {
    this.isLoading.set(true);

    const user = this.authService.getCurrentUser();
    if (!user?.customerId) {
      this.isLoading.set(false);
      return;
    }

    // Load user accounts
    this.accountService.getCustomerAccounts(user.customerId).subscribe({
      next: (accounts: Account[]) => {
        this.userAccounts.set(accounts);

        if (accounts.length === 0) {
          this.isLoading.set(false);
          return;
        }

        // Load transactions for all accounts using forkJoin
        const txnsObservables = accounts.map(acc =>
          this.transactionService.getAccountTransactions(acc.id).pipe()
        );

        forkJoin(txnsObservables).subscribe({
          next: (results) => {
            let allTxns: Transaction[] = [];
            results.forEach(r => {
              allTxns = [...allTxns, ...r.data];
            });

            allTxns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            this.allTransactions.set(allTxns);

            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Failed to load transactions', err);
            this.isLoading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Failed to load accounts', err);
        this.isLoading.set(false);
      }
    });
  }

  // =======================
  // EVENTS
  // =======================
  onFilterChange() {
    this.currentPage.set(1);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  clearFilters() {
    this.selectedAccount.set('all');
    this.selectedType.set('all');
    this.selectedStatus.set('all');
    this.searchTerm.set('');
    this.setDefaultDateRange();
    this.currentPage.set(1);
  }

  exportTransactions() {
    console.log('Exporting', this.filteredAll());
    alert('Export would generate CSV/PDF');
  }

  // =======================
  // UI HELPERS
  // =======================
  getTransactionTypeColor(type: TransactionType | string): string {
    const colors: Record<string, string> = {
      Deposit: 'bg-green-100 text-green-800',
      Withdrawal: 'bg-red-100 text-red-800',
      Transfer: 'bg-blue-100 text-blue-800',
      Payment: 'bg-purple-100 text-purple-800',
      Fee: 'bg-yellow-100 text-yellow-800',
      Interest: 'bg-emerald-100 text-emerald-800',
      Reversal: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  getStatusColor(status: TransactionStatus): string {
    const colors: Record<TransactionStatus, string> = {
      Completed: 'bg-green-100 text-green-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      Failed: 'bg-red-100 text-red-800',
      Cancelled: 'bg-gray-100 text-gray-800',
      Reversed: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR'
    }).format(amount);
  }

  trackByTransactionId = (i: number, t: Transaction) => t.transactionId;
}
