import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

// Import models and services
import { DailySummary, Transaction } from '../../../core/models';
import { MockTellerService } from '../../../core/services/implementations/mock-teller.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-daily-summary',
  templateUrl: './daily-summary.component.html',
})
export class DailySummaryComponent implements OnInit, OnDestroy {
  // Component state properties
  isLoading = false;
  isFinalizing = false;
  summaryDate: Date = new Date();
  
  // Data properties
  dailySummary: DailySummary | null = null;
  todaysTransactions: Transaction[] = [];
  
  // Form for cash drawer adjustment
  adjustmentForm: FormGroup;
  
  // Subscriptions manager
  private subscriptions = new Subscription();
  
  // Table display
  displayedColumns: string[] = ['time', 'type', 'account', 'amount', 'reference', 'actions'];
  
  // Summary statistics
  summaryStats = {
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalTransfers: 0,
    transactionCount: 0
  };

  constructor(
    private fb: FormBuilder,
    private tellerService: MockTellerService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.adjustmentForm = this.fb.group({
      adjustmentAmount: ['0.00', [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,2})?$/)]],
      adjustmentReason: ['', [Validators.required, Validators.maxLength(200)]]
    });
  }

  ngOnInit(): void {
    this.loadDailySummary();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Load the current day's summary and transactions
   */
  loadDailySummary(): void {
    this.isLoading = true;
    const summarySub = this.tellerService.getDailySummary(this.summaryDate)
      .pipe(
        tap(summary => {
          this.dailySummary = summary;
          this.todaysTransactions = summary.transactions || [];
          this.calculateSummaryStats();
        }),
        catchError(error => {
          console.error('Error loading daily summary:', error);
          this.snackBar.open('Failed to load daily summary', 'Close', { duration: 5000 });
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe();
    
    this.subscriptions.add(summarySub);
  }

  /**
   * Calculate summary statistics
   */
  calculateSummaryStats(): void {
    if (!this.todaysTransactions.length) return;

    this.summaryStats = {
      totalDeposits: this.todaysTransactions
        .filter(t => t.type === 'Deposit' && t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0),
      totalWithdrawals: Math.abs(this.todaysTransactions
        .filter(t => t.type === 'Withdrawal' && t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)),
      totalTransfers: Math.abs(this.todaysTransactions
        .filter(t => t.type === 'Transfer')
        .reduce((sum, t) => sum + t.amount, 0)),
      transactionCount: this.todaysTransactions.length
    };
  }

  /**
   * Finalize the day and close the cash drawer
   */
  finalizeDay(): void {
    if (!this.dailySummary) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Finalize Day',
        message: `Are you sure you want to finalize the day? This will close your cash drawer and lock all transactions for ${this.summaryDate.toLocaleDateString()}.`,
        confirmText: 'Finalize',
        cancelText: 'Cancel'
      }
    });
    
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.isFinalizing = true;
        const finalizeSub = this.tellerService.finalizeDailySummary(this.dailySummary!.id)
          .pipe(
            tap(() => {
              this.snackBar.open('Day finalized successfully!', 'Close', { duration: 5000 });
              this.loadDailySummary(); // Refresh data
            }),
            catchError(error => {
              console.error('Error finalizing day:', error);
              this.snackBar.open('Failed to finalize day', 'Close', { duration: 5000 });
              return of(null);
            }),
            finalize(() => this.isFinalizing = false)
          )
          .subscribe();
        
        this.subscriptions.add(finalizeSub);
      }
    });
  }

  /**
   * Submit cash drawer adjustment
   */
  submitAdjustment(): void {
    if (this.adjustmentForm.invalid || !this.dailySummary) return;
    
    const adjustment = {
      amount: parseFloat(this.adjustmentForm.get('adjustmentAmount')?.value),
      reason: this.adjustmentForm.get('adjustmentReason')?.value
    };
    
    this.isLoading = true;
    const adjustSub = this.tellerService.adjustCashDrawer(this.dailySummary.id, adjustment)
      .pipe(
        tap(() => {
          this.snackBar.open('Cash drawer adjusted successfully', 'Close', { duration: 3000 });
          this.adjustmentForm.reset({ adjustmentAmount: '0.00', adjustmentReason: '' });
          this.loadDailySummary();
        }),
        catchError(error => {
          console.error('Error adjusting cash drawer:', error);
          this.snackBar.open('Failed to adjust cash drawer', 'Close', { duration: 5000 });
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe();
    
    this.subscriptions.add(adjustSub);
  }

  /**
   * Change date (previous/next day)
   */
  changeDate(days: number): void {
    this.summaryDate = new Date(this.summaryDate);
    this.summaryDate.setDate(this.summaryDate.getDate() + days);
    this.loadDailySummary();
  }

  /**
   * Get transaction type color class
   */
  getTransactionTypeClass(type: string): string {
    switch (type.toLowerCase()) {
      case 'deposit': return 'bg-green-100 text-green-800';
      case 'withdrawal': return 'bg-red-100 text-red-800';
      case 'transfer': return 'bg-blue-100 text-blue-800';
      case 'payment': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get variance color class
   */
  getVarianceClass(): string {
    if (!this.dailySummary) return '';
    if (this.dailySummary.variance > 0) return 'text-green-600';
    if (this.dailySummary.variance < 0) return 'text-red-600';
    return 'text-gray-600';
  }

  /**
   * Print daily summary report
   */
  printSummary(): void {
    window.print();
  }
}