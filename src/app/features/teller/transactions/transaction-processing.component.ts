import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';
import { AuthService } from '../../../core/services/implementations/auth.service';
import { Account } from '../../../core/models/account.model';
import { User } from '../../../core/models/user.model';
import { AccountService } from '../../../core/services/implementations/account.service';
import { UserService } from '../../../core/services/implementations/user.service';



@Component({
  selector: 'app-transaction-processing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardLayoutComponent
  ],
  templateUrl: './transaction-processing.component.html',
})
export class TransactionProcessingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  private accountService = inject(AccountService);
  private userService = inject(UserService);

  currentUser = signal<User | null>(null);
  transactionType = signal<'deposit' | 'withdrawal' | 'check' | 'transfer'>('deposit');
  isLoading = signal(false);
  isProcessing = signal(false);

  // Form data
  transactionData = signal({
    accountNumber: '',
    customerId: '',
    amount: '',
    description: '',
    checkNumber: '',
    currency: 'USD',
    paymentMethod: 'cash',
    customerVerified: false
  });

  // Found data
  foundAccount = signal<Account | null>(null);
  foundCustomer = signal<User | null>(null);
  validationErrors = signal<string[]>([]);
  transactionResult = signal<any>(null);

  // Quick amount buttons
  quickAmounts = [20, 50, 100, 200, 500, 1000];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const type = params['type'] as 'deposit' | 'withdrawal' | 'check' | 'transfer';
      if (type) {
        this.transactionType.set(type);
      }
    });

    this.loadUserData();
  }

  loadUserData() {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser.set(user);
    });
  }

  searchAccount() {
    const accountNumber = this.transactionData().accountNumber.trim();
    if (!accountNumber) return;

    this.isLoading.set(true);

    this.accountService.getAccountByNumber(accountNumber).subscribe({
      next: (account: Account) => {
        this.foundAccount.set(account);

        // Fetch customer details
        this.userService.getUserById(account.userId).subscribe({
          next: (customer: User) => {
            this.foundCustomer.set(customer);
            this.transactionData.update(d => ({ ...d, customerId: customer.customerId || '' }));
            this.validationErrors.set([]);
            this.isLoading.set(false);
          },
          error: () => {
            this.validationErrors.set(['Failed to fetch customer']);
            this.isLoading.set(false);
          }
        });
      },
      error: () => {
        this.validationErrors.set(['Account not found']);
        this.foundAccount.set(null);
        this.foundCustomer.set(null);
        this.isLoading.set(false);
      }
    });
  }


  searchByCustomerId() {
    const customerId = this.transactionData().customerId.trim();
    if (!customerId) return;

    this.isLoading.set(true);

    this.userService.getUserByCustomerId(customerId).subscribe({
      next: (customer: User) => {
        this.foundCustomer.set(customer);

        this.accountService.getCustomerAccounts(customer.id).subscribe({
          next: (accounts: Account[]) => {
            const activeAccount = accounts.find((acc: Account) => acc.status === 'Active');
            if (activeAccount) {
              this.foundAccount.set(activeAccount);
              this.transactionData.update(d => ({ ...d, accountNumber: activeAccount.accountNumber }));
            }
            this.validationErrors.set([]);
            this.isLoading.set(false);
          },
          error: () => {
            this.validationErrors.set(['Failed to fetch accounts']);
            this.isLoading.set(false);
          }
        });
      },
      error: () => {
        this.validationErrors.set(['Customer not found']);
        this.foundCustomer.set(null);
        this.foundAccount.set(null);
        this.isLoading.set(false);
      }
    });
  }

  quickFillAmount(amount: number) {
    this.transactionData.update(data => ({
      ...data,
      amount: amount.toString()
    }));
  }

  validateTransaction(): boolean {
    const errors: string[] = [];
    const data = this.transactionData();

    if (!this.foundAccount()) {
      errors.push('Account not found or not selected');
    }

    if (!this.foundCustomer()) {
      errors.push('Customer not found or not selected');
    }

    if (!data.amount || parseFloat(data.amount) <= 0) {
      errors.push('Invalid amount');
    }

    if (this.transactionType() === 'withdrawal') {
      const account = this.foundAccount();
      const amount = parseFloat(data.amount);

      if (account && amount > account.availableBalance) {
        errors.push('Insufficient funds');
      }
    }

    if (this.transactionType() === 'check' && !data.checkNumber) {
      errors.push('Check number required for check deposits');
    }

    if (!data.customerVerified) {
      errors.push('Customer must be verified');
    }

    this.validationErrors.set(errors);
    return errors.length === 0;
  }

  processTransaction() {
    if (!this.validateTransaction()) {
      return;
    }

    this.isProcessing.set(true);

    // Simulate transaction processing
    setTimeout(() => {
      const amount = parseFloat(this.transactionData().amount);
      const account = this.foundAccount()!;
      const customer = this.foundCustomer()!;

      // Create transaction result
      this.transactionResult.set({
        transactionId: `TXN-${Date.now()}`,
        timestamp: new Date().toISOString(),
        accountNumber: account.accountNumber,
        customerName: `${customer.firstName} ${customer.lastName}`,
        type: this.transactionType(),
        amount: amount,
        description: this.transactionData().description || `${this.transactionType().charAt(0).toUpperCase() + this.transactionType().slice(1)} Transaction`,
        status: 'Completed',
        tellerId: this.currentUser()?.employeeId,
        balanceAfter: this.transactionType() === 'deposit'
          ? account.balance + amount
          : account.balance - amount,
        receiptNumber: `RCPT-${Math.floor(Math.random() * 1000000)}`
      });

      this.isProcessing.set(false);

      // Reset form after 5 seconds
      setTimeout(() => {
        this.resetForm();
      }, 5000);
    }, 1500);
  }

  resetForm() {
    this.transactionData.set({
      accountNumber: '',
      customerId: '',
      amount: '',
      description: '',
      checkNumber: '',
      currency: 'USD',
      paymentMethod: 'cash',
      customerVerified: false
    });

    this.foundAccount.set(null);
    this.foundCustomer.set(null);
    this.validationErrors.set([]);
    this.transactionResult.set(null);
  }

  printReceipt() {
    const result = this.transactionResult();
    if (!result) return;

    const receiptContent = `
      SecureBank - Transaction Receipt
      ================================
      Receipt #: ${result.receiptNumber}
      Date: ${new Date(result.timestamp).toLocaleString()}
      
      Account: ${result.accountNumber}
      Customer: ${result.customerName}
      Transaction: ${result.type.toUpperCase()}
      Amount: ${this.formatCurrency(result.amount)}
      Description: ${result.description}
      
      Status: Rs.{result.status}
      Teller ID: Rs.{result.tellerId}
      Transaction ID: Rs.{result.transactionId}
      
      Thank you for banking with SecureBank!
      ================================
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<pre>Rs.{receiptContent}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
  }

formatCurrency(amount: number): string {
  const x = amount.toFixed(2); // 2 decimal points
  const parts = x.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Format integer part in lakh/crore style
  const lastThree = integerPart.slice(-3);
  const otherNumbers = integerPart.slice(0, -3);
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const formattedInteger = formattedOther ? formattedOther + ',' + lastThree : lastThree;

  return `NPR Rs.{formattedInteger}.Rs.{decimalPart}`;
}
  getTransactionTitle(): string {
    const titles = {
      'deposit': 'Cash Deposit',
      'withdrawal': 'Cash Withdrawal',
      'check': 'Check Deposit',
      'transfer': 'Fund Transfer'
    };
    return titles[this.transactionType()] || 'Transaction Processing';
  }

  setTransactionType(type: 'deposit' | 'withdrawal' | 'check' | 'transfer') {
    this.transactionType.set(type);
    this.resetForm();
  }
}