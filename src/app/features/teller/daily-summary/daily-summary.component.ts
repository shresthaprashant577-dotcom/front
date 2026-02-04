import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-daily-summary',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    DatePipe,
    TitleCasePipe,
    CurrencyPipe
  ],
  templateUrl: './daily-summary.component.html',
})
export class DailySummaryComponent implements OnInit {
  // Your component properties
  summaryDate: Date = new Date();
  dailySummary: any = null;
  isLoading = false;
  isFinalizing = false;
  todaysTransactions: any[] = [];
  summaryStats: any = {
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalTransfers: 0
  };
  
  adjustmentForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
    this.loadDailySummary();
  }

  initializeForm() {
    this.adjustmentForm = this.fb.group({
      adjustmentAmount: ['', [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,2})?$/)]],
      adjustmentReason: ['', [Validators.required, Validators.maxLength(200)]]
    });
  }

  // Your other methods...
  loadDailySummary() {
    this.isLoading = true;
    // Load your data here
  }

  changeDate(days: number) {
    const newDate = new Date(this.summaryDate);
    newDate.setDate(newDate.getDate() + days);
    this.summaryDate = newDate;
    this.loadDailySummary();
  }

  printSummary() {
    // Print implementation
  }

  finalizeDay() {
    this.isFinalizing = true;
    // Finalize day implementation
  }

  submitAdjustment() {
    if (this.adjustmentForm.valid) {
      // Submit adjustment
    }
  }

  getVarianceClass(): string {
    if (!this.dailySummary) return '';
    return this.dailySummary.variance > 0 ? 'text-green-600' : 
           this.dailySummary.variance < 0 ? 'text-red-600' : 
           'text-gray-600';
  }

  getTransactionTypeClass(type: string): string {
    const classes: Record<string, string> = {
      'deposit': 'bg-green-100 text-green-800',
      'withdrawal': 'bg-red-100 text-red-800',
      'transfer': 'bg-blue-100 text-blue-800',
      'payment': 'bg-purple-100 text-purple-800'
    };
    return classes[type.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }
}