import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';

interface Branch {
  id: string;
  name: string;
  branchCode: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  manager: string;
  managerId: string;
  totalCustomers: number;
  totalAccounts: number;
  totalBalance: number;
  monthlyRevenue: number;
  monthlyGrowth: number;
  status: 'active' | 'inactive' | 'under_maintenance' | 'pending';
  openingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  services: string[];
  employees: number;
  established: Date;
  lastAudit?: Date;
  securityLevel: 'high' | 'medium' | 'low';
}

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: 'active' | 'on_leave' | 'training';
}

interface BranchPerformance {
  month: string;
  revenue: number;
  customers: number;
  transactions: number;
  growth: number;
}

type SortableBranchKey =
  | 'name'
  | 'branchCode'
  | 'city'
  | 'state'
  | 'totalCustomers'
  | 'totalAccounts'
  | 'totalBalance'
  | 'monthlyRevenue'
  | 'monthlyGrowth'
  | 'employees'
  | 'established';

@Component({
  selector: 'app-branch-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DashboardLayoutComponent
  ],
  templateUrl: './branch-management.component.html',
  
})
// 🔹 Types specific to Branch Management



export class BranchManagementComponent implements OnInit {
toggleServiceEdit(_t530: string) {
throw new Error('Method not implemented.');
}

  Math = Math

  // Branches data
  branches: Branch[] = [];
  filteredBranches: Branch[] = [];
  
  // Search and filters
  searchTerm: string = '';
  selectedStatus: string = 'all';
  selectedState: string = 'all';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  
  // Sorting
  sortColumn: SortableBranchKey = 'totalBalance';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Selected branch for details
  selectedBranch: Branch | null = null;
  showBranchDetails: boolean = false;
  selectedBranchEmployees: Employee[] = [];
  selectedBranchPerformance: BranchPerformance[] = [];
  
  // New branch form
  showNewBranchForm: boolean = false;
  newBranch: Partial<Branch> = {
    status: 'active',
    services: [],
    openingHours: {
      weekdays: '9:00 AM - 5:00 PM',
      saturday: '9:00 AM - 1:00 PM',
      sunday: 'Closed'
    }
  };
  
  // Edit mode
  editingBranch: Branch | null = null;
  
  // States list
  states = [
    'All States', 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI',
    'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
    'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA',
    'WA', 'WV', 'WI', 'WY'
  ];
  
  // Statuses
  statuses = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
    { value: 'under_maintenance', label: 'Under Maintenance', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'pending', label: 'Pending', color: 'bg-blue-100 text-blue-800' }
  ];
  
  // Security levels
  securityLevels = [
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' }
  ];
  
  // Available services
  availableServices = [
    'Personal Banking',
    'Business Banking',
    'Loan Services',
    'Investment Services',
    'Wealth Management',
    'Online Banking',
    'Mobile Banking',
    'ATM Services',
    'Safe Deposit Boxes',
    'Foreign Exchange',
    'Notary Services',
    'Financial Planning'
  ];
  
  // Managers list
  managers = [
    { id: 'M001', name: 'Sarah Johnson', email: 'sarah.johnson@bank.com' },
    { id: 'M002', name: 'Robert Brown', email: 'robert.brown@bank.com' },
    { id: 'M003', name: 'Lisa Anderson', email: 'lisa.anderson@bank.com' },
    { id: 'M004', name: 'Michael Chen', email: 'michael.chen@bank.com' },
    { id: 'M005', name: 'Jennifer Taylor', email: 'jennifer.taylor@bank.com' }
  ];

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    // Mock data
   
    
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredBranches = this.branches.filter(branch => {
      // Search filter
      const searchMatch = !this.searchTerm || 
        branch.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        branch.branchCode.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        branch.city.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        branch.manager.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Status filter
      const statusMatch = this.selectedStatus === 'all' || branch.status === this.selectedStatus;
      
      // State filter
      const stateMatch = this.selectedState === 'All States' || branch.state === this.selectedState;
      
      return searchMatch && statusMatch && stateMatch;
    });
    
    // Sort
    this.sortBranches();
    
    // Update pagination
    this.totalPages = Math.ceil(this.filteredBranches.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }

sortBranches(): void {
  this.filteredBranches.sort((a, b) => {
    const aValue = this.normalizeSortValue(a[this.sortColumn]);
    const bValue = this.normalizeSortValue(b[this.sortColumn]);

    if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}


private normalizeSortValue(
  value: string | number | Date | undefined | null
): string | number {
  if (value == null) return '';

  if (value instanceof Date) {
    return value.getTime();
  }

  return value;
}

onSort(column: SortableBranchKey): void {
  if (this.sortColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }
  this.sortBranches();
}



  get paginatedBranches(): Branch[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredBranches.slice(startIndex, startIndex + this.itemsPerPage);
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

  getSecurityLevelLabel(level: string): string {
    return this.securityLevels.find(l => l.value === level)?.label || level;
  }

  getSecurityLevelColor(level: string): string {
    return this.securityLevels.find(l => l.value === level)?.color || 'bg-gray-100 text-gray-800';
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return '$' + (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
      return '$' + (amount / 1000).toFixed(0) + 'K';
    }
    return '$' + amount.toFixed(0);
  }

  viewBranchDetails(branch: Branch): void {
    this.selectedBranch = branch;
    this.showBranchDetails = true;
    
    // Load mock employees for the branch
    this.selectedBranchEmployees = this.generateMockEmployees(branch.id);
    
    // Load mock performance data
    this.selectedBranchPerformance = this.generateMockPerformance();
  }

  closeBranchDetails(): void {
    this.selectedBranch = null;
    this.showBranchDetails = false;
    this.selectedBranchEmployees = [];
    this.selectedBranchPerformance = [];
  }

  addBranch(): void {
    if (!this.newBranch.name || !this.newBranch.branchCode || !this.newBranch.address || !this.newBranch.city || !this.newBranch.state) {
      alert('Please fill in all required fields');
      return;
    }
    
    const newBranch: Branch = {
      id: (this.branches.length + 1).toString(),
      name: this.newBranch.name!,
      branchCode: this.newBranch.branchCode!,
      address: this.newBranch.address!,
      city: this.newBranch.city!,
      state: this.newBranch.state!,
      zipCode: this.newBranch.zipCode || '00000',
      phone: this.newBranch.phone || '',
      email: this.newBranch.email || '',
      manager: this.newBranch.manager || 'Not assigned',
      managerId: this.newBranch.managerId || '',
      totalCustomers: 0,
      totalAccounts: 0,
      totalBalance: 0,
      monthlyRevenue: 0,
      monthlyGrowth: 0,
      status: this.newBranch.status!,
      openingHours: this.newBranch.openingHours!,
      services: this.newBranch.services!,
      employees: 0,
      established: new Date(),
      securityLevel: this.newBranch.securityLevel || 'medium'
    };
    
    this.branches.unshift(newBranch);
    this.applyFilters();
    this.resetNewBranchForm();
    this.showNewBranchForm = false;
    
    console.log('Branch added:', newBranch);
  }

  editBranch(branch: Branch): void {
    this.editingBranch = { ...branch };
  }

  updateBranch(): void {
    if (!this.editingBranch) return;
    
    const index = this.branches.findIndex(b => b.id === this.editingBranch!.id);
    if (index !== -1) {
      this.branches[index] = { ...this.editingBranch };
    }
    
    this.applyFilters();
    this.editingBranch = null;
    
    console.log('Branch updated:', this.editingBranch);
  }

  deleteBranch(branch: Branch): void {
    if (confirm(`Are you sure you want to delete branch ${branch.name}?`)) {
      const index = this.branches.findIndex(b => b.id === branch.id);
      if (index !== -1) {
        this.branches.splice(index, 1);
        this.applyFilters();
        console.log('Branch deleted:', branch);
      }
    }
  }

  updateBranchStatus(branch: Branch, status: Branch['status']): void {
    const index = this.branches.findIndex(b => b.id === branch.id);
    if (index !== -1) {
      this.branches[index].status = status;
      this.applyFilters();
    }
  }

  resetNewBranchForm(): void {
    this.newBranch = {
      status: 'active',
      services: [],
      openingHours: {
        weekdays: '9:00 AM - 5:00 PM',
        saturday: '9:00 AM - 1:00 PM',
        sunday: 'Closed'
      }
    };
  }

  cancelEdit(): void {
    this.editingBranch = null;
  }

  toggleService(service: string): void {
    const services = this.newBranch.services || [];
    const index = services.indexOf(service);
    
    if (index === -1) {
      services.push(service);
    } else {
      services.splice(index, 1);
    }
    
    this.newBranch.services = services;
  }

  // Statistics
  get totalBranches(): number {
    return this.filteredBranches.length;
  }

  get totalCustomers(): number {
    return this.filteredBranches.reduce((sum, branch) => sum + branch.totalCustomers, 0);
  }

  get totalEmployees(): number {
    return this.filteredBranches.reduce((sum, branch) => sum + branch.employees, 0);
  }

  get totalRevenue(): number {
    return this.filteredBranches.reduce((sum, branch) => sum + branch.monthlyRevenue, 0);
  }

  // Helper methods for mock data
  private generateMockEmployees(branchId: string): Employee[] {
    return [
      { id: 'E001', name: 'John Smith', role: 'Branch Manager', department: 'Management', email: 'john.smith@bank.com', phone: '+1 (555) 111-2222', status: 'active' },
      { id: 'E002', name: 'Emma Wilson', role: 'Assistant Manager', department: 'Management', email: 'emma.wilson@bank.com', phone: '+1 (555) 222-3333', status: 'active' },
      { id: 'E003', name: 'David Lee', role: 'Senior Teller', department: 'Operations', email: 'david.lee@bank.com', phone: '+1 (555) 333-4444', status: 'active' },
      { id: 'E004', name: 'Maria Garcia', role: 'Teller', department: 'Operations', email: 'maria.garcia@bank.com', phone: '+1 (555) 444-5555', status: 'active' },
      { id: 'E005', name: 'James Brown', role: 'Customer Service', department: 'Customer Service', email: 'james.brown@bank.com', phone: '+1 (555) 555-6666', status: 'on_leave' },
      { id: 'E006', name: 'Sarah Miller', role: 'Loan Officer', department: 'Loan Department', email: 'sarah.miller@bank.com', phone: '+1 (555) 666-7777', status: 'active' },
      { id: 'E007', name: 'Michael Davis', role: 'Teller', department: 'Operations', email: 'michael.davis@bank.com', phone: '+1 (555) 777-8888', status: 'training' }
    ];
  }

  private generateMockPerformance(): BranchPerformance[] {
    return [
      { month: 'Jan', revenue: 1200000, customers: 1250, transactions: 3450, growth: 12.5 },
      { month: 'Feb', revenue: 1150000, customers: 1220, transactions: 3320, growth: 8.2 },
      { month: 'Mar', revenue: 1250000, customers: 1250, transactions: 3450, growth: 12.5 },
      { month: 'Apr', revenue: 1300000, customers: 1280, transactions: 3580, growth: 15.7 },
      { month: 'May', revenue: 1280000, customers: 1270, transactions: 3520, growth: 5.4 },
      { month: 'Jun', revenue: 1250000, customers: 1250, transactions: 3450, growth: 3.8 }
    ];
  }
}