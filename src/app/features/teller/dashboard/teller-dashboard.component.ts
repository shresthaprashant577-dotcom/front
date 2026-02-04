// features/teller/dashboard/teller-dashboard.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';
import { DashboardCardComponent } from '../../../shared/components/dashboard-card/dashboard-card.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { AuthService } from '../../../core/services/implementations/auth.service';
import { User } from '../../../core/models/user.model';
import { TransactionService } from '../../../core/services/implementations/transaction.service';
import { BranchService } from '../../../core/services/implementations/branch.service';
import { Transaction, TransactionType } from '../../../core/models/transaction.model';
import { Branch } from '../../../core/models/branch.model';

type WeekDayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

interface DayItem {
  label: string;
  key: WeekDayKey;
}

@Component({
  selector: 'app-teller-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DashboardLayoutComponent,
    DashboardCardComponent,
    DataTableComponent
  ],
  templateUrl: './teller-dashboard.component.html',
})
export class TellerDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private transactionService = inject(TransactionService);
  private branchService = inject(BranchService);
  
  currentUser = signal<User | null>(null);
  currentBranch = signal<Branch | null>(null);
  recentTransactions = signal<Transaction[]>([]);
  
  // Dashboard stats
  dailyTransactions = signal(0);
  dailyAmount = signal(0);
  cashInDrawer = signal(5000);
  customersServed = signal(0);
  isLoading = signal(true);

  getDays(): DayItem[] {
    return [
      { label: 'Monday', key: 'monday' },
      { label: 'Tuesday', key: 'tuesday' },
      { label: 'Wednesday', key: 'wednesday' },
      { label: 'Thursday', key: 'thursday' },
      { label: 'Friday', key: 'friday' },
      { label: 'Saturday', key: 'saturday' },
      { label: 'Sunday', key: 'sunday' }
    ];
  }

  getServiceLabel(service: string): string {
    const labels: Record<string, string> = {
      cashDeposit: 'Cash Deposit',
      cashWithdrawal: 'Cash Withdrawal',
      checkDeposit: 'Check Deposit',
      accountOpening: 'Account Opening',
      balanceInquiry: 'Balance Inquiry',
      fundTransfer: 'Fund Transfer'
    };

    return labels[service] ?? service;
  }
  

  // Quick actions
  quickActions = [
    { 
      title: 'Cash Deposit', 
      icon: '💵', 
      color: 'bg-green-100 text-green-600',
      route: '/teller/transactions',
      action: 'deposit'
    },
    { 
      title: 'Cash Withdrawal', 
      icon: '💰', 
      color: 'bg-blue-100 text-blue-600',
      route: '/teller/transactions',
      action: 'withdrawal'
    },
    { 
      title: 'Check Deposit', 
      icon: '📄', 
      color: 'bg-purple-100 text-purple-600',
      route: '/teller/transactions',
      action: 'check'
    },
    { 
      title: 'Account Opening', 
      icon: '🏦', 
      color: 'bg-yellow-100 text-yellow-600',
      route: '/teller/account-opening'
    },
    { 
      title: 'Customer Lookup', 
      icon: '🔍', 
      color: 'bg-red-100 text-red-600',
      route: '/teller/customer-lookup'
    },
    { 
      title: 'Daily Summary', 
      icon: '📊', 
      color: 'bg-indigo-100 text-indigo-600',
      route: '/teller/daily-summary'
    }
  ];
  
  // Table columns for recent transactions
  transactionColumns: TableColumn[] = [
    { key: 'timestamp', label: 'Time', sortable: true },
    { key: 'transactionId', label: 'Transaction ID', sortable: true },
    { key: 'type', label: 'Type', sortable: true, format: 'badge' },
    { key: 'amount', label: 'Amount', sortable: true, format: 'currency' },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'status', label: 'Status', sortable: true, format: 'badge' }
  ];
  
  ngOnInit() {
    this.loadDashboardData();
  }
  
  loadDashboardData() {
    this.isLoading.set(true);
    
    // Load user data
    this.authService.currentUser$.subscribe({
      next: (user : User | null) => {
        if (!user) {
          this.isLoading.set(false);
          return;
        }
        this.currentUser.set(user);
        
        // Load branch data
        if (user.branchId) {
          this.loadBranchData(user.branchId);
        }
        
        // Load today's transactions
        this.loadTodaysTransactions();
      },
      error: (error) => {
        console.error('Failed to load user data:', error);
        this.isLoading.set(false);
      }
    });
  }
  
  loadBranchData(branchId: string) {
    this.branchService.getBranchById(branchId).subscribe({
      next: (branch) => {
        this.currentBranch.set(branch);
      },
      error: (error) => {
        console.error('Failed to load branch data:', error);
      }
    });
  }
  
loadTodaysTransactions() {
  const today = new Date();

  const startDate = new Date(today);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  this.transactionService
    .getTransactions(
      1, // page
      10, // pageSize
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'Completed'
      }
    )
    .subscribe({
      next: (response) => {
        this.recentTransactions.set(response.data);
        this.calculateDashboardStats(response.data);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load transactions:', error);
        this.isLoading.set(false);
      }
    });
}

  
  calculateDashboardStats(transactions: Transaction[]) {
    // Filter only deposit and withdrawal transactions
    const tellerTransactions = transactions.filter(t => 
      t.type === 'Deposit' || t.type === 'Withdrawal'
    );
    
    this.dailyTransactions.set(tellerTransactions.length);
    
    // Calculate total amount
    const totalAmount = tellerTransactions.reduce((sum, t) => {
      if (t.type === 'Deposit') {
        return sum + t.amount;
      } else {
        return sum - t.amount;
      }
    }, 0);
    
    this.dailyAmount.set(Math.abs(totalAmount));
    
    // Estimate customers served (simplified)
    this.customersServed.set(Math.floor(tellerTransactions.length * 1.5));
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

  return `NPR ${formattedInteger}.${decimalPart}`;
}
  
  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  getTransactionTypeColor(type: TransactionType): string {
    const colors: Record<TransactionType, string> = {
      'Deposit': 'bg-green-100 text-green-800',
      'Withdrawal': 'bg-red-100 text-red-800',
      'Transfer': 'bg-blue-100 text-blue-800',
      'Payment': 'bg-purple-100 text-purple-800',
      'Fee': 'bg-yellow-100 text-yellow-800',
      'Interest': 'bg-emerald-100 text-emerald-800',
      'Reversal': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }
  
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }
  
  // Helper function for quick action clicks
  onQuickActionClick(action: any) {
    if (action.action === 'deposit') {
      this.initiateDeposit();
    } else if (action.action === 'withdrawal') {
      this.initiateWithdrawal();
    } else if (action.action === 'check') {
      this.initiateCheckDeposit();
    }
    // Navigation will be handled by router link in template
  }
  
  private initiateDeposit() {
    // You can add specific logic for deposit initiation
    console.log('Initiate deposit workflow');
  }
  
  private initiateWithdrawal() {
    // You can add specific logic for withdrawal initiation
    console.log('Initiate withdrawal workflow');
  }
  
  private initiateCheckDeposit() {
    // You can add specific logic for check deposit initiation
    console.log('Initiate check deposit workflow');
  }
}