import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';

interface Report {
  id: string;
  title: string;
  type: 'financial' | 'operational' | 'compliance' | 'performance' | 'risk';
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  lastGenerated: Date;
  nextSchedule: Date;
  status: 'scheduled' | 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
  generatedBy: string;
  fileSize?: string;
  format: 'pdf' | 'excel' | 'csv' | 'html';
}

interface ReportParameter {
  id: string;
  label: string;
  type: 'date' | 'select' | 'text' | 'number' | 'range';
  value: any;
  options?: string[];
  required: boolean;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: ReportParameter[];
}

interface ReportDataPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  customers: number;
  transactions: number;
}

interface PerformanceMetric {
  category: string;
  current: number;
  previous: number;
  change: number;
  target: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DashboardLayoutComponent
  ],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit {

    Math = Math
  // Chart instances
  revenueChart: any;
  performanceChart: any;
  categoryChart: any;
  
  // Reports data
  reports: Report[] = [];
  filteredReports: Report[] = [];
  reportTemplates: ReportTemplate[] = [];
  selectedTemplate: ReportTemplate | null = null;
  
  // Report data
  reportData: ReportDataPoint[] = [];
  performanceMetrics: PerformanceMetric[] = [];
  
  // Filters
  searchTerm: string = '';
  selectedType: string = 'all';
  selectedFrequency: string = 'all';
  selectedStatus: string = 'all';
  
  // Date range
  startDate: string = '';
  endDate: string = '';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  
  // Sorting
  sortColumn: string = 'lastGenerated';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Report generation
  showReportGenerator: boolean = false;
  generatingReport: boolean = false;
  customReportParams: any = {};
  
  // Report types
  reportTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'financial', label: 'Financial Reports', color: 'bg-green-100 text-green-800' },
    { value: 'operational', label: 'Operational Reports', color: 'bg-blue-100 text-blue-800' },
    { value: 'compliance', label: 'Compliance Reports', color: 'bg-purple-100 text-purple-800' },
    { value: 'performance', label: 'Performance Reports', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'risk', label: 'Risk Reports', color: 'bg-red-100 text-red-800' }
  ];
  
  // Frequencies
  frequencies = [
    { value: 'all', label: 'All Frequencies' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annual', label: 'Annual' }
  ];
  
  // Statuses
  statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
    { value: 'generating', label: 'Generating', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' }
  ];
  
  // Formats
  formats = [
    { value: 'pdf', label: 'PDF', icon: '📄' },
    { value: 'excel', label: 'Excel', icon: '📊' },
    { value: 'csv', label: 'CSV', icon: '📋' },
    { value: 'html', label: 'HTML', icon: '🌐' }
  ];
  
  // Months for selection
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Years for selection
  years: string[] = Array.from(
    { length: 10 },
    (_, i) => String(new Date().getFullYear() - i)
  );
  
  constructor() {
    Chart.register(...registerables);
  }
  
  ngOnInit(): void {
    this.loadReports();
    this.loadTemplates();
    this.loadReportData();
    this.loadPerformanceMetrics();
    this.initializeCharts();
  }
  
  loadReports(): void {
    // Mock reports data
    this.applyFilters();
  }
  
  loadTemplates(): void {
    this.reportTemplates = [
      {
        id: '1',
        name: 'Financial Summary',
        description: 'Comprehensive financial performance summary',
        category: 'financial',
        parameters: [
          { id: 'date_range', label: 'Date Range', type: 'range', value: { start: '', end: '' }, required: true },
          { id: 'branches', label: 'Branches', type: 'select', value: 'all', options: ['All', 'Main', 'Downtown', 'Uptown'], required: false }
        ]
      },


{
  id: '2',
  name: 'Customer Analysis',
  description: 'Customer demographics and behavior analysis',
  category: 'performance',
  parameters: [
    {
      id: 'month',
      label: 'Month',
      type: 'select',
      value: 'January',
      options: this.months,
      required: true
    },
    {
      id: 'year',
      label: 'Year',
      type: 'select',
      value: '2024',
      options: this.years,
      required: true
    }
  ]
},

      {
        id: '3',
        name: 'Transaction Log',
        description: 'Detailed transaction history report',
        category: 'operational',
        parameters: [
          { id: 'date', label: 'Date', type: 'date', value: '', required: true },
          { id: 'transaction_type', label: 'Transaction Type', type: 'select', value: 'all', options: ['All', 'Deposit', 'Withdrawal', 'Transfer'], required: false }
        ]
      }
    ];
  }
  
  loadReportData(): void {
    this.reportData = [
      { month: 'Jan', revenue: 4500000, expenses: 3200000, profit: 1300000, customers: 12500, transactions: 45000 },
      { month: 'Feb', revenue: 4200000, expenses: 3100000, profit: 1100000, customers: 11800, transactions: 42000 },
      { month: 'Mar', revenue: 4800000, expenses: 3300000, profit: 1500000, customers: 13200, transactions: 48000 },
      { month: 'Apr', revenue: 4600000, expenses: 3250000, profit: 1350000, customers: 12700, transactions: 46000 },
      { month: 'May', revenue: 4900000, expenses: 3400000, profit: 1500000, customers: 13500, transactions: 49000 },
      { month: 'Jun', revenue: 5100000, expenses: 3500000, profit: 1600000, customers: 14200, transactions: 51000 }
    ];
  }
  
  loadPerformanceMetrics(): void {
    this.performanceMetrics = [
      { category: 'Revenue Growth', current: 12.5, previous: 10.2, change: 2.3, target: 15.0 },
      { category: 'Customer Satisfaction', current: 92.3, previous: 89.7, change: 2.6, target: 95.0 },
      { category: 'Operational Efficiency', current: 87.5, previous: 85.2, change: 2.3, target: 90.0 },
      { category: 'Risk Compliance', current: 98.7, previous: 97.2, change: 1.5, target: 100.0 },
      { category: 'Employee Productivity', current: 84.6, previous: 82.1, change: 2.5, target: 85.0 },
      { category: 'Cost Management', current: 91.2, previous: 88.7, change: 2.5, target: 90.0 }
    ];
  }
  
  initializeCharts(): void {
    this.createRevenueChart();
    this.createPerformanceChart();
    this.createCategoryChart();
  }
  
  createRevenueChart(): void {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    this.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.reportData.map(d => d.month),
        datasets: [
          {
            label: 'Revenue',
            data: this.reportData.map(d => d.revenue / 1000000),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Profit',
            data: this.reportData.map(d => d.profit / 1000000),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Revenue vs Profit Trend (in millions)'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Amount ($M)'
            }
          }
        }
      }
    });
  }
  
  createPerformanceChart(): void {
    const ctx = document.getElementById('performanceChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    this.performanceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.reportData.map(d => d.month),
        datasets: [
          {
            label: 'Transactions',
            data: this.reportData.map(d => d.transactions / 1000),
            backgroundColor: 'rgba(139, 92, 246, 0.7)',
            borderColor: '#8b5cf6',
            borderWidth: 1
          },
          {
            label: 'New Customers',
            data: this.reportData.map(d => d.customers / 100),
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            borderColor: '#ef4444',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Monthly Performance Metrics'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Transactions (K) / Customers (x100)'
            }
          }
        }
      }
    });
  }
  
  createCategoryChart(): void {
    const ctx = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    const categoryData = {
      financial: this.reports.filter(r => r.type === 'financial').length,
      operational: this.reports.filter(r => r.type === 'operational').length,
      compliance: this.reports.filter(r => r.type === 'compliance').length,
      performance: this.reports.filter(r => r.type === 'performance').length,
      risk: this.reports.filter(r => r.type === 'risk').length
    };
    
    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Financial', 'Operational', 'Compliance', 'Performance', 'Risk'],
        datasets: [{
          data: [
            categoryData.financial,
            categoryData.operational,
            categoryData.compliance,
            categoryData.performance,
            categoryData.risk
          ],
          backgroundColor: [
            '#10b981',
            '#3b82f6',
            '#8b5cf6',
            '#f59e0b',
            '#ef4444'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Report Distribution by Category'
          }
        }
      }
    });
  }
  
  applyFilters(): void {
    this.filteredReports = this.reports.filter(report => {
      // Search filter
      const searchMatch = !this.searchTerm || 
        report.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Type filter
      const typeMatch = this.selectedType === 'all' || report.type === this.selectedType;
      
      // Frequency filter
      const frequencyMatch = this.selectedFrequency === 'all' || report.frequency === this.selectedFrequency;
      
      // Status filter
      const statusMatch = this.selectedStatus === 'all' || report.status === this.selectedStatus;
      
      return searchMatch && typeMatch && frequencyMatch && statusMatch;
    });
    
    // Sort
    this.sortReports();
    
    // Update pagination
    this.totalPages = Math.ceil(this.filteredReports.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }
  sortReports(): void {
  this.filteredReports.sort((a, b) => {
    const aValue = this.normalizeSortValue(
      a[this.sortColumn as keyof Report]
    );
    const bValue = this.normalizeSortValue(
      b[this.sortColumn as keyof Report]
    );

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

  
  
  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortReports();
  }
  
  get paginatedReports(): Report[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredReports.slice(startIndex, startIndex + this.itemsPerPage);
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
  
  getTypeLabel(type: string): string {
    return this.reportTypes.find(t => t.value === type)?.label || type;
  }
  
  getTypeColor(type: string): string {
    return this.reportTypes.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-800';
  }
  
  getStatusLabel(status: string): string {
    return this.statuses.find(s => s.value === status)?.label || status;
  }
  
  getStatusColor(status: string): string {
    return this.statuses.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  }
  
  getFormatIcon(format: string): string {
    return this.formats.find(f => f.value === format)?.icon || '📄';
  }
  
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  formatFileSize(size: string): string {
    return size || 'N/A';
  }
  
  openReportGenerator(template: ReportTemplate): void {
    this.selectedTemplate = template;
    this.showReportGenerator = true;
    this.customReportParams = {};
    
    // Initialize parameters
    template.parameters.forEach(param => {
      this.customReportParams[param.id] = param.value;
    });
  }
  
  generateReport(): void {
    if (!this.selectedTemplate) return;
    
    this.generatingReport = true;
    
    // Simulate report generation
    setTimeout(() => {
      const newReport: Report = {
        id: (this.reports.length + 1).toString(),
        title: `Custom ${this.selectedTemplate!.name} - ${new Date().toLocaleDateString()}`,
        type: this.selectedTemplate!.category as any,
        description: this.selectedTemplate!.description,
        frequency: 'daily',
        lastGenerated: new Date(),
        nextSchedule: new Date(),
        status: 'completed',
        generatedBy: 'Current User',
        format: 'pdf',
        fileSize: Math.floor(Math.random() * 3000) + 1000 + ' KB'
      };
      
      this.reports.unshift(newReport);
      this.applyFilters();
      
      this.generatingReport = false;
      this.showReportGenerator = false;
      this.selectedTemplate = null;
      this.customReportParams = {};
      
      alert('Report generated successfully!');
    }, 2000);
  }
  
  downloadReport(report: Report): void {
    if (!report.downloadUrl) {
      alert('Download link not available');
      return;
    }
    
    console.log('Downloading report:', report.downloadUrl);
    alert('Download started: ' + report.title);
  }
  
  scheduleReport(report: Report): void {
    const newDate = new Date();
    newDate.setMonth(newDate.getMonth() + 1);
    report.nextSchedule = newDate;
    alert(`Report scheduled for ${this.formatDate(newDate)}`);
  }
  
  deleteReport(report: Report): void {
    if (confirm(`Delete report "${report.title}"?`)) {
      const index = this.reports.findIndex(r => r.id === report.id);
      if (index !== -1) {
        this.reports.splice(index, 1);
        this.applyFilters();
      }
    }
  }
  
  // Statistics
  get totalReports(): number {
    return this.filteredReports.length;
  }
  
  get completedReports(): number {
    return this.filteredReports.filter(r => r.status === 'completed').length;
  }
  
  get pendingReports(): number {
    return this.filteredReports.filter(r => r.status === 'scheduled' || r.status === 'generating').length;
  }
  
  get totalFileSize(): string {
    const totalKB = this.reports
      .filter(r => r.fileSize)
      .reduce((sum, r) => {
        const size = parseInt(r.fileSize?.split(' ')[0] || '0');
        return sum + size;
      }, 0);
    
    if (totalKB >= 1000000) return (totalKB / 1000000).toFixed(1) + ' GB';
    if (totalKB >= 1000) return (totalKB / 1000).toFixed(1) + ' MB';
    return totalKB + ' KB';
  }
}