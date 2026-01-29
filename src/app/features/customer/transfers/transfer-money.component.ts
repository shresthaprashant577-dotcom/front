import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';
import { MockAuthService } from '../../../core/services/implementations/mock-auth.service';
import { MockDataGenerator } from '../../../core/services/mock-data/mock-data-generator.service';
import { Account } from '../../../core/models/account.model';
import { Beneficiary } from '../../../core/models/beneficiary.model';

@Component({
  selector: 'app-transfer-money',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardLayoutComponent
  ],
  templateUrl: './transfer-money.component.html',
})
export class TransferMoneyComponent implements OnInit {
  private authService = inject(MockAuthService);
  private mockData = inject(MockDataGenerator);
  private router = inject(Router);
  
  userAccounts = signal<Account[]>([]);
  beneficiaries = signal<Beneficiary[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);
  
  // Form data
  transferData = signal({
    fromAccountId: '',
    toAccountId: '',
    toBeneficiaryId: '',
    amount: '',
    description: '',
    scheduleDate: '',
    isScheduled: false,
    isRecurring: false,
    recurrence: 'none' // none, weekly, monthly, quarterly
  });
  
  // Transfer types
  transferType = signal<'internal' | 'beneficiary' | 'external'>('internal');
  
  // Errors and success
  errorMessage = signal('');
  successMessage = signal('');
  
  // Limits
  dailyLimit = signal(5000);
  dailyUsed = signal(1500);
  singleLimit = signal(2500);
  
  ngOnInit() {
    this.loadData();
  }
  
  loadData() {
    this.isLoading.set(true);
    
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        // Load user accounts
        const accounts = this.mockData.getAccountsByUserId(user.id)
          .filter(acc => acc.status === 'Active');
        this.userAccounts.set(accounts);
        
        // Load beneficiaries
        const beneficiaries = this.mockData.getBeneficiariesByUserId(user.id)
          .filter(b => b.isActive);
        this.beneficiaries.set(beneficiaries);
        
        // Set default from account
        if (accounts.length > 0) {
          this.transferData.update(data => ({
            ...data,
            fromAccountId: accounts[0].id
          }));
        }
      }
      
      this.isLoading.set(false);
    });
  }
  
  onTransferTypeChange(type: 'internal' | 'beneficiary' | 'external') {
    this.transferType.set(type);
    this.transferData.update(data => ({
      ...data,
      toAccountId: '',
      toBeneficiaryId: ''
    }));
  }
  
  onSubmit() {
    if (!this.validateForm()) {
      return;
    }
    
    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    
    // Simulate API call
    setTimeout(() => {
      this.isSubmitting.set(false);
      
      // Show success message
      this.successMessage.set(`Transfer of $${this.transferData().amount} initiated successfully!`);
      
      // Reset form (keep from account)
      const fromAccountId = this.transferData().fromAccountId;
      this.transferData.set({
        fromAccountId: fromAccountId,
        toAccountId: '',
        toBeneficiaryId: '',
        amount: '',
        description: '',
        scheduleDate: '',
        isScheduled: false,
        isRecurring: false,
        recurrence: 'none'
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        this.successMessage.set('');
      }, 5000);
    }, 1500);
  }
  
  validateForm(): boolean {
    const data = this.transferData();
    
    // Check required fields
    if (!data.fromAccountId || !data.amount || parseFloat(data.amount) <= 0) {
      this.errorMessage.set('Please select a source account and enter a valid amount.');
      return false;
    }
    
    // Check transfer type specific validations
    if (this.transferType() === 'internal' && !data.toAccountId) {
      this.errorMessage.set('Please select a destination account.');
      return false;
    }
    
    if (this.transferType() === 'beneficiary' && !data.toBeneficiaryId) {
      this.errorMessage.set('Please select a beneficiary.');
      return false;
    }
    
    if (this.transferType() === 'external' && !data.toAccountId) {
      this.errorMessage.set('Please enter destination account details.');
      return false;
    }
    
    // Check amount
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      this.errorMessage.set('Please enter a valid amount.');
      return false;
    }
    
    // Check single transaction limit
    if (amount > this.singleLimit()) {
      this.errorMessage.set(`Amount exceeds single transaction limit of $${this.singleLimit()}.`);
      return false;
    }
    
    // Check daily limit
    if (amount + this.dailyUsed() > this.dailyLimit()) {
      this.errorMessage.set(`This transfer would exceed your daily limit of $${this.dailyLimit()}.`);
      return false;
    }
    
    // Check source account balance
    const fromAccount = this.userAccounts().find(acc => acc.id === data.fromAccountId);
    if (fromAccount && amount > fromAccount.availableBalance) {
      this.errorMessage.set('Insufficient funds in source account.');
      return false;
    }
    
    return true;
  }
  
  getFromAccount(): Account | undefined {
    return this.userAccounts().find(acc => acc.id === this.transferData().fromAccountId);
  }
  
  getToAccount(): Account | undefined {
    return this.userAccounts().find(acc => acc.id === this.transferData().toAccountId);
  }
  
  getBeneficiary(): Beneficiary | undefined {
    return this.beneficiaries().find(b => b.id === this.transferData().toBeneficiaryId);
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
  
  getDailyLimitProgress(): number {
    return (this.dailyUsed() / this.dailyLimit()) * 100;
  }
  
  getDailyLimitColor(): string {
    const progress = this.getDailyLimitProgress();
    if (progress < 50) return 'bg-green-500';
    if (progress < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  }
  
  quickFillAmount(amount: number) {
    this.transferData.update(data => ({
      ...data,
      amount: amount.toString()
    }));
  }
}