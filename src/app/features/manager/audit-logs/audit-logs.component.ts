import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';

interface AuditLog {
  id: string;
  timestamp: Date;
  action: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'view' | 'export' | 'import';
  category: 'user' | 'account' | 'transaction' | 'branch' | 'system' | 'security' | 'compliance';
  description: string;
  userId: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'warning' | 'pending_approval' | 'approved' | 'rejected';
  details?: any;
  resourceId?: string;
  resourceType?: string;
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  approvalNotes?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ApprovalRequest {
  id: string;
  auditLogId: string;
  requesterId: string;
  requesterName: string;
  action: string;
  description: string;
  requestedAt: Date;
  resourceType: string;
  resourceId: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DashboardLayoutComponent
  ],
  templateUrl: './audit-logs.component.html',
})
export class AuditLogsComponent implements OnInit {
  Math = Math;
  
  // Audit logs data
  auditLogs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];
  
  // Approval requests
  approvalRequests: ApprovalRequest[] = [];
  pendingRequests: ApprovalRequest[] = [];
  
  // Filters
  searchTerm: string = '';
  selectedAction: string = 'all';
  selectedCategory: string = 'all';
  selectedStatus: string = 'all';
  selectedSeverity: string = 'all';
  dateRange: { start: string, end: string } = { start: '', end: '' };
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalPages: number = 1;
  
  // Sorting
  sortColumn: string = 'timestamp';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Selected log for details
  selectedLog: AuditLog | null = null;
  showLogDetails: boolean = false;
  
  // Approval modal
  showApprovalModal: boolean = false;
  selectedRequest: ApprovalRequest | null = null;
  approvalDecision: 'approve' | 'reject' = 'approve';
  approvalNotes: string = '';
  
  // Export options
  showExportOptions: boolean = false;
  exportFormat: 'csv' | 'json' | 'pdf' = 'csv';
  
  // Statistics
  statistics = {
    totalLogs: 0,
    todayLogs: 0,
    pendingApprovals: 0,
    securityEvents: 0,
    failedActions: 0,
    successRate: 0
  };
  
  // Actions
  actions = [
    { value: 'all', label: 'All Actions' },
    { value: 'login', label: 'Login', icon: '🔑' },
    { value: 'logout', label: 'Logout', icon: '🚪' },
    { value: 'create', label: 'Create', icon: '➕' },
    { value: 'update', label: 'Update', icon: '✏️' },
    { value: 'delete', label: 'Delete', icon: '🗑️' },
    { value: 'approve', label: 'Approve', icon: '✅' },
    { value: 'reject', label: 'Reject', icon: '❌' },
    { value: 'view', label: 'View', icon: '👁️' },
    { value: 'export', label: 'Export', icon: '📤' },
    { value: 'import', label: 'Import', icon: '📥' }
  ];
  
  // Categories
  categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'user', label: 'User Management', color: 'bg-blue-100 text-blue-800' },
    { value: 'account', label: 'Account Management', color: 'bg-green-100 text-green-800' },
    { value: 'transaction', label: 'Transactions', color: 'bg-purple-100 text-purple-800' },
    { value: 'branch', label: 'Branch Operations', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'system', label: 'System Operations', color: 'bg-gray-100 text-gray-800' },
    { value: 'security', label: 'Security', color: 'bg-red-100 text-red-800' },
    { value: 'compliance', label: 'Compliance', color: 'bg-indigo-100 text-indigo-800' }
  ];
  
  // Severities
  severities = [
    { value: 'all', label: 'All Severities' },
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];
  
  // Statuses
  statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'success', label: 'Success', color: 'bg-green-100 text-green-800' },
    { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
    { value: 'warning', label: 'Warning', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'pending_approval', label: 'Pending Approval', color: 'bg-blue-100 text-blue-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' }
  ];
  
  // Current user (mock)
  currentUser = {
    id: 'M001',
    name: 'Manager User',
    role: 'manager'
  };
  
  ngOnInit(): void {
    this.loadAuditLogs();
    this.loadApprovalRequests();
    this.calculateStatistics();
  }
  
  loadAuditLogs(): void {
    // Mock audit logs data
    
    this.applyFilters();
  }
  
  loadApprovalRequests(): void {
    // Mock approval requests
    this.approvalRequests = [
      {
        id: '1',
        auditLogId: '3',
        requesterId: 'U002',
        requesterName: 'Robert Brown',
        action: 'Update Account Limit',
        description: 'Increase account balance limit from $10,000 to $25,000',
        requestedAt: new Date('2024-01-15T10:00:00'),
        resourceType: 'account',
        resourceId: 'AC00123456',
        status: 'pending',
        priority: 'high'
      },
      {
        id: '2',
        auditLogId: '4',
        requesterId: 'U003',
        requesterName: 'Mike Davis',
        action: 'Delete Transaction',
        description: 'Delete transaction record TRX001 due to duplicate entry',
        requestedAt: new Date('2024-01-15T10:30:00'),
        resourceType: 'transaction',
        resourceId: 'TRX001',
        status: 'pending',
        priority: 'urgent'
      },
      {
        id: '3',
        auditLogId: '8',
        requesterId: 'U002',
        requesterName: 'Robert Brown',
        action: 'Create Branch',
        description: 'Create new branch configuration for upcoming location',
        requestedAt: new Date('2024-01-15T12:30:00'),
        resourceType: 'branch',
        resourceId: 'BR006',
        status: 'pending',
        priority: 'high'
      },
      {
        id: '4',
        auditLogId: '12',
        requesterId: 'U002',
        requesterName: 'Robert Brown',
        action: 'Import Accounts',
        description: 'Bulk import of 50 customer accounts from legacy system',
        requestedAt: new Date('2024-01-15T14:30:00'),
        resourceType: 'account',
        resourceId: 'BATCH001',
        status: 'pending',
        priority: 'high'
      }
    ];
    
    this.updatePendingRequests();
  }
  
  updatePendingRequests(): void {
    this.pendingRequests = this.approvalRequests.filter(
      request => request.status === 'pending'
    );
  }
  
  calculateStatistics(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.statistics.totalLogs = this.auditLogs.length;
    this.statistics.todayLogs = this.auditLogs.filter(
      log => new Date(log.timestamp) >= today
    ).length;
    this.statistics.pendingApprovals = this.approvalRequests.filter(
      req => req.status === 'pending'
    ).length;
    this.statistics.securityEvents = this.auditLogs.filter(
      log => log.category === 'security' && (log.status === 'failed' || log.status === 'warning')
    ).length;
    this.statistics.failedActions = this.auditLogs.filter(
      log => log.status === 'failed'
    ).length;
    
    const successLogs = this.auditLogs.filter(
      log => log.status === 'success' || log.status === 'approved'
    ).length;
    this.statistics.successRate = this.auditLogs.length > 0 
      ? Math.round((successLogs / this.auditLogs.length) * 100) 
      : 0;
  }
  
  applyFilters(): void {
    this.filteredLogs = this.auditLogs.filter(log => {
      // Search filter
      const searchMatch = !this.searchTerm || 
        log.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        log.userRole.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Action filter
      const actionMatch = this.selectedAction === 'all' || log.action === this.selectedAction;
      
      // Category filter
      const categoryMatch = this.selectedCategory === 'all' || log.category === this.selectedCategory;
      
      // Status filter
      const statusMatch = this.selectedStatus === 'all' || log.status === this.selectedStatus;
      
      // Severity filter
      const severityMatch = this.selectedSeverity === 'all' || log.severity === this.selectedSeverity;
      
      // Date range filter
      let dateMatch = true;
      if (this.dateRange.start || this.dateRange.end) {
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        if (this.dateRange.start && logDate < this.dateRange.start) dateMatch = false;
        if (this.dateRange.end && logDate > this.dateRange.end) dateMatch = false;
      }
      
      return searchMatch && actionMatch && categoryMatch && statusMatch && severityMatch && dateMatch;
    });
    
    // Sort
    this.sortLogs();
    
    // Update pagination
    this.totalPages = Math.ceil(this.filteredLogs.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    
    // Update statistics
    this.calculateStatistics();
  }
  
  sortLogs(): void {
    this.filteredLogs.sort((a, b) => {
      const aRaw = a[this.sortColumn as keyof AuditLog];
      const bRaw = b[this.sortColumn as keyof AuditLog];
      
      // Handle undefined values
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
    this.sortLogs();
  }
  
  get paginatedLogs(): AuditLog[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredLogs.slice(startIndex, startIndex + this.itemsPerPage);
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
  
  // Helper methods
  getActionLabel(action: string): string {
    return this.actions.find(a => a.value === action)?.label || action;
  }
  
  getActionIcon(action: string): string {
    return this.actions.find(a => a.value === action)?.icon || '📋';
  }
  
  getCategoryLabel(category: string): string {
    return this.categories.find(c => c.value === category)?.label || category;
  }
  
  getCategoryColor(category: string): string {
    return this.categories.find(c => c.value === category)?.color || 'bg-gray-100 text-gray-800';
  }
  
  getStatusLabel(status: string): string {
    return this.statuses.find(s => s.value === status)?.label || status;
  }
  
  getStatusColor(status: string): string {
    return this.statuses.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  }
  
  getSeverityLabel(severity: string): string {
    return this.severities.find(s => s.value === severity)?.label || severity;
  }
  
  getSeverityColor(severity: string): string {
    return this.severities.find(s => s.value === severity)?.color || 'bg-gray-100 text-gray-800';
  }

  getApprovalRequest(logId: string) {
  return this.approvalRequests.find(
    req => req.auditLogId === logId
  );
}

  


  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  formatDateTime(date: Date): string {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  
  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return this.formatDate(date);
  }
  
  // View log details
  viewLogDetails(log: AuditLog): void {
    this.selectedLog = log;
    this.showLogDetails = true;
  }
  
  closeLogDetails(): void {
    this.selectedLog = null;
    this.showLogDetails = false;
  }
  
  // Approval functionality
openApprovalModal(request?: ApprovalRequest): void {
  if (!request) {
    console.error('ApprovalRequest not found for this audit log');
    return;
  }

  this.selectedRequest = request;
  this.showApprovalModal = true;
  this.approvalDecision = 'approve';
  this.approvalNotes = '';
}

  
  closeApprovalModal(): void {
    this.showApprovalModal = false;
    this.selectedRequest = null;
    this.approvalNotes = '';
  }
  
  processApproval(): void {
    if (!this.selectedRequest) return;
    
    // Update approval request
    const requestIndex = this.approvalRequests.findIndex(
      req => req.id === this.selectedRequest!.id
    );
    
    if (requestIndex !== -1) {
      this.approvalRequests[requestIndex].status = this.approvalDecision === 'approve' ? 'approved' : 'rejected';
      this.approvalRequests[requestIndex].reviewedBy = this.currentUser.name;
      this.approvalRequests[requestIndex].reviewedAt = new Date();
      this.approvalRequests[requestIndex].reviewNotes = this.approvalNotes;
      
      // Update corresponding audit log
      const logIndex = this.auditLogs.findIndex(
        log => log.id === this.selectedRequest!.auditLogId
      );
      
      if (logIndex !== -1) {
        this.auditLogs[logIndex].status = this.approvalDecision === 'approve' ? 'approved' : 'rejected';
        this.auditLogs[logIndex].approvedBy = this.currentUser.name;
        this.auditLogs[logIndex].approvedAt = new Date();
        this.auditLogs[logIndex].approvalNotes = this.approvalNotes;
      }
      
      // Update pending requests
      this.updatePendingRequests();
      this.applyFilters();
      
      this.closeApprovalModal();
      
      alert(`Request ${this.approvalDecision === 'approve' ? 'approved' : 'rejected'} successfully`);
    }
  }
  
  // Export functionality
  exportLogs(): void {
    const data = this.filteredLogs.map(log => ({
      Timestamp: this.formatDateTime(log.timestamp),
      Action: this.getActionLabel(log.action),
      Category: this.getCategoryLabel(log.category),
      Description: log.description,
      User: log.userName,
      Role: log.userRole,
      IP: log.ipAddress,
      Status: this.getStatusLabel(log.status),
      Severity: this.getSeverityLabel(log.severity),
      Resource: log.resourceId || 'N/A'
    }));
    
    if (this.exportFormat === 'csv') {
      this.exportToCSV(data);
    } else if (this.exportFormat === 'json') {
      this.exportToJSON(data);
    } else {
      this.exportToPDF(data);
    }
    
    this.showExportOptions = false;
  }
  
  exportToCSV(data: any[]): void {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  
  exportToJSON(data: any[]): void {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  
  exportToPDF(data: any[]): void {
    // In real app, this would use a PDF library
    alert('PDF export functionality would be implemented with a PDF library');
  }
  
  // Quick actions
  filterByRequiresApproval(): void {
    this.selectedStatus = 'pending_approval';
    this.applyFilters();
  }
  
  filterBySeverity(severity: string): void {
    this.selectedSeverity = severity;
    this.applyFilters();
  }
  
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedAction = 'all';
    this.selectedCategory = 'all';
    this.selectedStatus = 'all';
    this.selectedSeverity = 'all';
    this.dateRange = { start: '', end: '' };
    this.applyFilters();
  }
}