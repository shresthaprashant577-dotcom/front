import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';

interface Teller {
  id: string;
  tellerId: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  branchCode: string;
  status: 'active' | 'inactive' | 'on_break' | 'training';
  shift: 'morning' | 'afternoon' | 'evening' | 'night';
  cashLimit: number;
  currentCash: number;
  transactionsToday: number;
  lastTransaction?: Date;
  performanceScore: number;
  supervisor: string;
  createdAt: Date;
}

interface TellerTransaction {
  id: string;
  tellerId: string;
  tellerName: string;
  transactionType: 'deposit' | 'withdrawal' | 'transfer' | 'bill_payment' | 'check_cashing';
  amount: number;
  customerName: string;
  customerAccount: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed' | 'reversed';
  referenceNumber: string;
  branch: string;
}

@Component({
  selector: 'app-teller-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DashboardLayoutComponent
  ],
  templateUrl: './teller-management.component.html',
})
export class TellerManagementComponent implements OnInit {
  Math = Math;
  
  // Tellers data
  tellers: Teller[] = [];
  filteredTellers: Teller[] = [];
  
  // Transactions data
  transactions: TellerTransaction[] = [];
  filteredTransactions: TellerTransaction[] = [];
  
  // Filters
  searchTerm: string = '';
  selectedBranch: string = 'all';
  selectedStatus: string = 'all';
  selectedShift: string = 'all';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  
  // Current teller for details
  selectedTeller: Teller | null = null;
  showTellerDetails: boolean = false;
  tellerTransactions: TellerTransaction[] = [];
  
  // Cash management
  showCashAdjustment: boolean = false;
  adjustmentAmount: number = 0;
  adjustmentType: 'add' | 'remove' = 'add';
  adjustmentReason: string = '';
  
  // Branches
  branches = [
    'Downtown Branch',
    'Westside Branch',
    'North Branch',
    'East Branch',
    'South Branch',
    'Central Branch'
  ];
  
  // Statuses
  statuses = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
    { value: 'on_break', label: 'On Break', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'training', label: 'Training', color: 'bg-blue-100 text-blue-800' }
  ];
  
  // Shifts
  shifts = [
    { value: 'morning', label: 'Morning (8 AM - 4 PM)' },
    { value: 'afternoon', label: 'Afternoon (12 PM - 8 PM)' },
    { value: 'evening', label: 'Evening (4 PM - 12 AM)' },
    { value: 'night', label: 'Night (12 AM - 8 AM)' }
  ];
  
  // Transaction types
  transactionTypes = [
    'deposit',
    'withdrawal',
    'transfer',
    'bill_payment',
    'check_cashing'
  ];
  
  ngOnInit(): void {
    this.loadTellers();
    this.loadTransactions();
  }
  
  loadTellers(): void {
    // Mock tellers data
  
    this.applyFilters();
  }
  
  loadTransactions(): void {
    // Mock transactions data
    this.transactions = [
      {
        id: '1',
        tellerId: 'T001',
        tellerName: 'Sarah Johnson',
        transactionType: 'deposit',
        amount: 5000,
        customerName: 'John Smith',
        customerAccount: 'AC00123456',
        timestamp: new Date('2024-01-15T14:30:00'),
        status: 'completed',
        referenceNumber: 'TRX202401150001',
        branch: 'Downtown Branch'
      },
      {
        id: '2',
        tellerId: 'T001',
        tellerName: 'Sarah Johnson',
        transactionType: 'withdrawal',
        amount: 2500,
        customerName: 'Emma Wilson',
        customerAccount: 'AC00123457',
        timestamp: new Date('2024-01-15T14:15:00'),
        status: 'completed',
        referenceNumber: 'TRX202401150002',
        branch: 'Downtown Branch'
      },
      {
        id: '3',
        tellerId: 'T002',
        tellerName: 'Mike Davis',
        transactionType: 'transfer',
        amount: 10000,
        customerName: 'Robert Brown',
        customerAccount: 'AC00123458',
        timestamp: new Date('2024-01-15T15:45:00'),
        status: 'completed',
        referenceNumber: 'TRX202401150003',
        branch: 'Westside Branch'
      },
      {
        id: '4',
        tellerId: 'T002',
        tellerName: 'Mike Davis',
        transactionType: 'bill_payment',
        amount: 750,
        customerName: 'Lisa Anderson',
        customerAccount: 'AC00123459',
        timestamp: new Date('2024-01-15T15:30:00'),
        status: 'completed',
        referenceNumber: 'TRX202401150004',
        branch: 'Westside Branch'
      },
      {
        id: '5',
        tellerId: 'T003',
        tellerName: 'Anna Williams',
        transactionType: 'check_cashing',
        amount: 3000,
        customerName: 'Michael Chen',
        customerAccount: 'AC00123460',
        timestamp: new Date('2024-01-15T12:15:00'),
        status: 'completed',
        referenceNumber: 'TRX202401150005',
        branch: 'North Branch'
      },
      {
        id: '6',
        tellerId: 'T003',
        tellerName: 'Anna Williams',
        transactionType: 'deposit',
        amount: 12000,
        customerName: 'Jennifer Taylor',
        customerAccount: 'AC00123461',
        timestamp: new Date('2024-01-15T12:00:00'),
        status: 'failed',
        referenceNumber: 'TRX202401150006',
        branch: 'North Branch'
      },
      {
        id: '7',
        tellerId: 'T004',
        tellerName: 'David Miller',
        transactionType: 'withdrawal',
        amount: 500,
        customerName: 'James Wilson',
        customerAccount: 'AC00123462',
        timestamp: new Date('2024-01-15T18:30:00'),
        status: 'completed',
        referenceNumber: 'TRX202401150007',
        branch: 'East Branch'
      },
      {
        id: '8',
        tellerId: 'T005',
        tellerName: 'Jennifer Taylor',
        transactionType: 'transfer',
        amount: 8000,
        customerName: 'Sarah Johnson',
        customerAccount: 'AC00123463',
        timestamp: new Date('2024-01-15T03:15:00'),
        status: 'pending',
        referenceNumber: 'TRX202401150008',
        branch: 'South Branch'
      }
    ];
    
    this.filteredTransactions = [...this.transactions];
  }
  
  applyFilters(): void {
    this.filteredTellers = this.tellers.filter(teller => {
      // Search filter
      const searchMatch = !this.searchTerm || 
        teller.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        teller.tellerId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        teller.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Branch filter
      const branchMatch = this.selectedBranch === 'all' || teller.branch === this.selectedBranch;
      
      // Status filter
      const statusMatch = this.selectedStatus === 'all' || teller.status === this.selectedStatus;
      
      // Shift filter
      const shiftMatch = this.selectedShift === 'all' || teller.shift === this.selectedShift;
      
      return searchMatch && branchMatch && statusMatch && shiftMatch;
    });

    
    
    // Update pagination
    this.totalPages = Math.ceil(this.filteredTellers.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }
  
  get paginatedTellers(): Teller[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTellers.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    
    if (this.totalPages <= maxPages) {
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.totalPages, start + maxPages - 1);
      
      if (end - start + 1 < maxPages) {
        start = end - maxPages + 1;
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    
    return pages;
  }
  
  getStatusLabel(status: string): string {
    return this.statuses.find(s => s.value === status)?.label || status;
  }
  
  getStatusColor(status: string): string {
    return this.statuses.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  }
  
  getShiftLabel(shift: string): string {
    return this.shifts.find(s => s.value === shift)?.label || shift;
  }
  
  formatCurrency(amount: number): string {
    return '$' + amount.toLocaleString('en-US');
  }
  
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  formatDateTime(date: Date): string {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTimeAgo(date: Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

  
  viewTellerDetails(teller: Teller): void {
    this.selectedTeller = teller;
    this.showTellerDetails = true;
    
    // Load teller's transactions
    this.tellerTransactions = this.transactions.filter(
      t => t.tellerId === teller.tellerId
    );
  }
  
  closeTellerDetails(): void {
    this.selectedTeller = null;
    this.showTellerDetails = false;
    this.tellerTransactions = [];
  }
  
  openCashAdjustment(teller: Teller): void {
    this.selectedTeller = teller;
    this.showCashAdjustment = true;
    this.adjustmentAmount = 0;
    this.adjustmentType = 'add';
    this.adjustmentReason = '';
  }
  
  adjustCash(): void {
    if (!this.selectedTeller || this.adjustmentAmount <= 0 || !this.adjustmentReason) {
      alert('Please fill in all fields with valid values');
      return;
    }
    
    const index = this.tellers.findIndex(t => t.id === this.selectedTeller!.id);
    if (index !== -1) {
      if (this.adjustmentType === 'add') {
        this.tellers[index].currentCash += this.adjustmentAmount;
      } else {
        this.tellers[index].currentCash -= this.adjustmentAmount;
        if (this.tellers[index].currentCash < 0) {
          this.tellers[index].currentCash = 0;
        }
      }
      
      // Record adjustment in transactions
      this.transactions.unshift({
        id: (this.transactions.length + 1).toString(),
        tellerId: this.selectedTeller.tellerId,
        tellerName: this.selectedTeller.name,
        transactionType: 'deposit',
        amount: this.adjustmentAmount,
        customerName: 'System Adjustment',
        customerAccount: 'SYSTEM',
        timestamp: new Date(),
        status: 'completed',
        referenceNumber: `ADJ${Date.now()}`,
        branch: this.selectedTeller.branch
      });
      
      this.applyFilters();
      this.showCashAdjustment = false;
      this.selectedTeller = null;
      
      alert(`Cash ${this.adjustmentType === 'add' ? 'added' : 'removed'} successfully`);
    }
  }
  
  changeTellerStatus(teller: Teller, status: Teller['status']): void {
    const index = this.tellers.findIndex(t => t.id === teller.id);
    if (index !== -1) {
      this.tellers[index].status = status;
      this.applyFilters();
      alert(`Teller status updated to ${this.getStatusLabel(status)}`);
    }
  }
  
  assignShift(teller: Teller, shift: Teller['shift']): void {
    const index = this.tellers.findIndex(t => t.id === teller.id);
    if (index !== -1) {
      this.tellers[index].shift = shift;
      this.applyFilters();
      alert(`Teller assigned to ${this.getShiftLabel(shift)} shift`);
    }
  }
  
  // Statistics
  get totalTellers(): number {
    return this.filteredTellers.length;
  }
  
  get activeTellers(): number {
    return this.filteredTellers.filter(t => t.status === 'active').length;
  }
  
  get totalCash(): number {
    return this.filteredTellers.reduce((sum, teller) => sum + teller.currentCash, 0);
  }
  
  get totalTransactions(): number {
    return this.filteredTellers.reduce((sum, teller) => sum + teller.transactionsToday, 0);
  }
  
  get averagePerformance(): number {
    if (this.filteredTellers.length === 0) return 0;
    const total = this.filteredTellers.reduce((sum, teller) => sum + teller.performanceScore, 0);
    return Math.round(total / this.filteredTellers.length);
  }
  
  // Transaction filters
  filterTransactionsByTeller(tellerId: string): void {
    this.filteredTransactions = this.transactions.filter(t => t.tellerId === tellerId);
  }
  
  resetTransactionFilters(): void {
    this.filteredTransactions = [...this.transactions];
  }
  
  getTransactionStatusColor(status: string): string {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'reversed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}