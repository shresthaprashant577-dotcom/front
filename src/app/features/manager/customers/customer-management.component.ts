import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';

interface Customer {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  accountType: 'checking' | 'savings' | 'business' | 'joint';
  accountNumber: string;
  balance: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  createdAt: Date;
  lastTransaction?: Date;
  totalTransactions: number;
  kycStatus: 'verified' | 'pending' | 'expired';
  riskLevel: 'low' | 'medium' | 'high';
  branch: string;
  accountManager?: string;
}

@Component({
  selector: 'app-customer-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DashboardLayoutComponent
  ],
  templateUrl: './customer-management.component.html'

})
export class CustomerManagementComponent implements OnInit {

    Math = Math
  // Customers data
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  
  // Search and filters
  searchTerm: string = '';
  selectedAccountType: string = 'all';
  selectedStatus: string = 'all';
  selectedKycStatus: string = 'all';
  selectedRiskLevel: string = 'all';
  selectedBranch: string = 'all';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  
  // Sorting
  sortColumn: string = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // View mode
  viewMode: 'list' | 'grid' = 'list';
  
  // Selected customer for details
  selectedCustomer: Customer | null = null;
  showCustomerDetails: boolean = false;
  
  // Account types
  accountTypes = [
    { value: 'checking', label: 'Checking', color: 'bg-blue-100 text-blue-800' },
    { value: 'savings', label: 'Savings', color: 'bg-green-100 text-green-800' },
    { value: 'business', label: 'Business', color: 'bg-purple-100 text-purple-800' },
    { value: 'joint', label: 'Joint', color: 'bg-orange-100 text-orange-800' }
  ];
  
  // Statuses
  statuses = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'suspended', label: 'Suspended', color: 'bg-red-100 text-red-800' }
  ];
  
  // KYC Statuses
  kycStatuses = [
    { value: 'verified', label: 'Verified', color: 'bg-green-100 text-green-800' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800' }
  ];
  
  // Risk Levels
  riskLevels = [
    { value: 'low', label: 'Low Risk', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium Risk', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High Risk', color: 'bg-red-100 text-red-800' }
  ];
  
  // Branches
  branches = [
    'Downtown Branch',
    'Westside Branch',
    'North Branch',
    'East Branch',
    'South Branch'
  ];

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    // Mock data
    
    
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredCustomers = this.customers.filter(customer => {
      // Search filter
      const searchMatch = !this.searchTerm || 
        customer.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customer.customerId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customer.accountNumber.includes(this.searchTerm) ||
        customer.phone.includes(this.searchTerm);
      
      // Account type filter
      const accountTypeMatch = this.selectedAccountType === 'all' || customer.accountType === this.selectedAccountType;
      
      // Status filter
      const statusMatch = this.selectedStatus === 'all' || customer.status === this.selectedStatus;
      
      // KYC status filter
      const kycMatch = this.selectedKycStatus === 'all' || customer.kycStatus === this.selectedKycStatus;
      
      // Risk level filter
      const riskMatch = this.selectedRiskLevel === 'all' || customer.riskLevel === this.selectedRiskLevel;
      
      // Branch filter
      const branchMatch = this.selectedBranch === 'all' || customer.branch === this.selectedBranch;
      
      return searchMatch && accountTypeMatch && statusMatch && kycMatch && riskMatch && branchMatch;
    });
    
    // Sort
    this.sortCustomers();
    
    // Update pagination
    this.totalPages = Math.ceil(this.filteredCustomers.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }

sortCustomers(): void {
  this.filteredCustomers.sort((a, b) => {
    const aRaw = a[this.sortColumn as keyof Customer];
    const bRaw = b[this.sortColumn as keyof Customer];

    // Handle undefined/null first
    if (aRaw == null && bRaw == null) return 0;
    if (aRaw == null) return 1;
    if (bRaw == null) return -1;

    const aValue =
      aRaw instanceof Date ? aRaw.getTime() : aRaw.toString().toLowerCase();
    const bValue =
      bRaw instanceof Date ? bRaw.getTime() : bRaw.toString().toLowerCase();

    if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}


  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortCustomers();
  }

  get paginatedCustomers(): Customer[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCustomers.slice(startIndex, startIndex + this.itemsPerPage);
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

  getAccountTypeLabel(type: string): string {
    return this.accountTypes.find(t => t.value === type)?.label || type;
  }

  getAccountTypeColor(type: string): string {
    return this.accountTypes.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: string): string {
    return this.statuses.find(s => s.value === status)?.label || status;
  }

  getStatusColor(status: string): string {
    return this.statuses.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  }

  getKycStatusLabel(kycStatus: string): string {
    return this.kycStatuses.find(k => k.value === kycStatus)?.label || kycStatus;
  }

  getKycStatusColor(kycStatus: string): string {
    return this.kycStatuses.find(k => k.value === kycStatus)?.color || 'bg-gray-100 text-gray-800';
  }

  getRiskLevelLabel(riskLevel: string): string {
    return this.riskLevels.find(r => r.value === riskLevel)?.label || riskLevel;
  }

  getRiskLevelColor(riskLevel: string): string {
    return this.riskLevels.find(r => r.value === riskLevel)?.color || 'bg-gray-100 text-gray-800';
  }


  getCustomerSinceMonths(createdAt: Date): number {
  const now = Date.now();
  const created = new Date(createdAt).getTime();

  const diffInMs = now - created;
  const months = diffInMs / (1000 * 60 * 60 * 24 * 30);

  return Math.floor(months);
}


  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatLastTransaction(date?: Date): string {
    if (!date) return 'No transactions';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return this.formatDate(date);
  }

  viewCustomerDetails(customer: Customer): void {
    this.selectedCustomer = customer;
    this.showCustomerDetails = true;
  }

  closeCustomerDetails(): void {
    this.selectedCustomer = null;
    this.showCustomerDetails = false;
  }

  updateCustomerStatus(customer: Customer, status: Customer['status']): void {
    const index = this.customers.findIndex(c => c.id === customer.id);
    if (index !== -1) {
      this.customers[index].status = status;
      this.applyFilters();
    }
  }

  exportCustomers(): void {
    console.log('Exporting customers:', this.filteredCustomers);
    alert('Export functionality would download a CSV file in a real application');
  }

  // Statistics
  get totalCustomers(): number {
    return this.filteredCustomers.length;
  }

  get totalBalance(): number {
    return this.filteredCustomers.reduce((sum, customer) => sum + customer.balance, 0);
  }

  get activeCustomers(): number {
    return this.filteredCustomers.filter(c => c.status === 'active').length;
  }

  get pendingKyc(): number {
    return this.filteredCustomers.filter(c => c.kycStatus === 'pending').length;
  }
}