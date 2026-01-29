import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';
import { MockAuthService } from '../../../core/services/implementations/mock-auth.service';
import { MockDataGenerator } from '../../../core/services/mock-data/mock-data-generator.service';
import { Account } from '../../../core/models/account.model';
import { User } from '../../../core/models/user.model';

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
  private authService = inject(MockAuthService);
  private mockData = inject(MockDataGenerator);
  
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
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser.set(user);
    });
  }
  
  searchAccount() {
    const accountNumber = this.transactionData().accountNumber.trim();
    if (!accountNumber) return;
    
    this.isLoading.set(true);
    
    // Simulate API search
    setTimeout(() => {
      const account = this.mockData.getAccounts().find(
        acc => acc.accountNumber.includes(accountNumber) || 
               acc.accountNumber === accountNumber
      );
      
      if (account) {
        this.foundAccount.set(account);
        
        // Find customer
        const customer = this.mockData.getUsers().find(
          u => u.id === account.userId && u.role === 'Customer'
        );
        
        if (customer) {
          this.foundCustomer.set(customer);
          this.transactionData.update(data => ({
            ...data,
            customerId: customer.customerId || ''
          }));
        }
        
        this.validationErrors.set([]);
      } else {
        this.foundAccount.set(null);
        this.foundCustomer.set(null);
        this.validationErrors.set(['Account not found']);
      }
      
      this.isLoading.set(false);
    }, 500);
  }
  
  searchByCustomerId() {
    const customerId = this.transactionData().customerId.trim();
    if (!customerId) return;
    
    this.isLoading.set(true);
    
    setTimeout(() => {
      const customer = this.mockData.getUsers().find(
        u => (u.customerId === customerId || u.id === customerId) && u.role === 'Customer'
      );
      
      if (customer) {
        this.foundCustomer.set(customer);
        
        // Find first active account
        const account = this.mockData.getAccountsByUserId(customer.id)
          .find(acc => acc.status === 'Active');
        
        if (account) {
          this.foundAccount.set(account);
          this.transactionData.update(data => ({
            ...data,
            accountNumber: account.accountNumber
          }));
        }
        
        this.validationErrors.set([]);
      } else {
        this.foundCustomer.set(null);
        this.foundAccount.set(null);
        this.validationErrors.set(['Customer not found']);
      }
      
      this.isLoading.set(false);
    }, 500);
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
      
      Status: ${result.status}
      Teller ID: ${result.tellerId}
      Transaction ID: ${result.transactionId}
      
      Thank you for banking with SecureBank!
      ================================
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<pre>${receiptContent}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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