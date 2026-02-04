import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';
import { AuthService } from '../../../core/services/implementations/auth.service';
import { AccountService } from '../../../core/services/implementations/account.service';
import { TransactionService } from '../../../core/services/implementations/transaction.service';
import { BeneficiaryService, Beneficiary } from '../../../core/services/implementations/beneficiary.service';
import { Account } from '../../../core/models/account.model';

@Component({
  selector: 'app-transfer-money',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent],
  templateUrl: './transfer-money.component.html',
})
export class TransferMoneyComponent implements OnInit {
  private authService = inject(AuthService);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private beneficiaryService = inject(BeneficiaryService);
  private router = inject(Router);

  userAccounts = signal<Account[]>([]);
  beneficiaries = signal<Beneficiary[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);

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

  transferType = signal<'internal' | 'beneficiary' | 'external'>('internal');

  errorMessage = signal('');
  successMessage = signal('');

  dailyLimit = signal(5000);
  dailyUsed = signal(1500);
  singleLimit = signal(2500);

  ngOnInit() {
    this.loadData();
  }
loadData() {
  this.isLoading.set(true);

  const user = this.authService.getCurrentUser(); // returns User | null

  if (!user?.customerId) {
    this.isLoading.set(false);
    return;
  }

  // Load user accounts
  this.accountService.getCustomerAccounts(user.customerId).subscribe({
    next: accounts => {
      this.userAccounts.set(accounts.filter(acc => acc.status === 'Active'));

      if (accounts.length > 0) {
        this.transferData.update(data => ({
          ...data,
          fromAccountId: accounts[0].id
        }));
      }

      // Load beneficiaries from backend
      this.beneficiaryService.getMyBeneficiaries().subscribe({
        next: data => {
          this.beneficiaries.set(data.filter(b => b.isActive));
          this.isLoading.set(false);
        },
        error: () => {
          this.beneficiaries.set([]);
          this.isLoading.set(false);
        }
      });
    },
    error: err => {
      console.error('Failed to load accounts', err);
      this.isLoading.set(false);
    }
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
    if (!this.validateForm()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const data = this.transferData();
    const payload: any = {
      fromAccountNumber: this.getFromAccount()?.accountNumber,
      amount: parseFloat(data.amount),
      description: data.description
    };

    if (this.transferType() === 'internal') {
      payload.toAccountNumber = this.getToAccount()?.accountNumber;
    } else if (this.transferType() === 'beneficiary') {
      payload.toAccountNumber = this.getBeneficiary()?.accountNumber;
    } else {
      payload.toAccountNumber = data.toAccountId; // external
    }

    this.transactionService.transfer(payload).subscribe({
      next: txn => {
        this.isSubmitting.set(false);
        this.successMessage.set(`Transfer of $${payload.amount} initiated successfully!`);

        const fromAccountId = this.transferData().fromAccountId;
        this.transferData.set({
          fromAccountId,
          toAccountId: '',
          toBeneficiaryId: '',
          amount: '',
          description: '',
          scheduleDate: '',
          isScheduled: false,
          isRecurring: false,
          recurrence: 'none'
        });

        setTimeout(() => this.successMessage.set(''), 5000);
      },
      error: err => {
        this.isSubmitting.set(false);
        console.error(err);
        this.errorMessage.set('Transfer failed. Please try again.');
      }
    });
  }

  validateForm(): boolean {
    const data = this.transferData();
    const amount = parseFloat(data.amount);

    if (!data.fromAccountId || isNaN(amount) || amount <= 0) {
      this.errorMessage.set('Please select a source account and enter a valid amount.');
      return false;
    }

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

    if (amount > this.singleLimit()) {
      this.errorMessage.set(`Amount exceeds single transaction limit of $${this.singleLimit()}.`);
      return false;
    }

    if (amount + this.dailyUsed() > this.dailyLimit()) {
      this.errorMessage.set(`This transfer would exceed your daily limit of $${this.dailyLimit()}.`);
      return false;
    }

    const fromAccount = this.getFromAccount();
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
    this.transferData.update(data => ({ ...data, amount: amount.toString() }));
  }
}
