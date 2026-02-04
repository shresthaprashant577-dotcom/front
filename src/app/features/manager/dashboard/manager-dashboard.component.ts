import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';

interface StatCard {
  title: string;
  value: number;
  change: number;
  icon: string;
  color: string;
  suffix?: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  user: string;
  timestamp: Date;
  status: string;
}

interface QuickLink {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DashboardLayoutComponent
  ],
  templateUrl: './manager-dashboard.component.html'
})
export class ManagerDashboardComponent implements OnInit {

    Math = Math
  // Statistics
  statCards: StatCard[] = [
    {
      title: 'Total Customers',
      value: 1452,
      change: 5.2,
      icon: 'people',
      color: 'bg-blue-500'
    },
    {
      title: 'Total Accounts',
      value: 2187,
      change: 3.8,
      icon: 'account_balance',
      color: 'bg-green-500'
    },
    {
      title: 'Monthly Revenue',
      value: 125000,
      change: 12.5,
      icon: 'attach_money',
      color: 'bg-purple-500',
      suffix: '$'
    },
    {
      title: 'Active Tellers',
      value: 18,
      change: -2.1,
      icon: 'badge',
      color: 'bg-orange-500'
    },
    {
      title: 'Pending Approvals',
      value: 23,
      change: 8.3,
      icon: 'pending_actions',
      color: 'bg-yellow-500'
    },
    {
      title: 'Branch Performance',
      value: 94.5,
      change: 2.4,
      icon: 'trending_up',
      color: 'bg-teal-500',
      suffix: '%'
    }
  ];

  // Quick Links
  quickLinks: QuickLink[] = [
    {
      title: 'User Management',
      description: 'Manage staff and user permissions',
      icon: 'manage_accounts',
      route: '/manager/users',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Customer Management',
      description: 'View and manage customer accounts',
      icon: 'people_alt',
      route: '/manager/customer-management',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Branch Management',
      description: 'Manage branch locations and settings',
      icon: 'location_on',
      route: '/manager/branches',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Reports',
      description: 'View financial and operational reports',
      icon: 'assessment',
      route: '/manager/reports',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      title: 'Audit Logs',
      description: 'Monitor system activities and logs',
      icon: 'history',
      route: '/manager/audit-logs',
      color: 'bg-red-100 text-red-600'
    },
    {
      title: 'Approvals',
      description: 'Review pending approvals and requests',
      icon: 'check_circle',
      route: '/manager/approval',
      color: 'bg-teal-100 text-teal-600'
    }
  ];

  // Recent Activities
  recentActivities: RecentActivity[] = [
    {
      id: 'ACT001',
      type: 'Account Opening',
      description: 'New business account approved',
      user: 'John Smith',
      timestamp: new Date('2024-01-15T09:30:00'),
      status: 'approved'
    },
    {
      id: 'ACT002',
      type: 'Loan Application',
      description: 'Personal loan application submitted',
      user: 'Sarah Johnson',
      timestamp: new Date('2024-01-15T11:15:00'),
      status: 'pending'
    },
    {
      id: 'ACT003',
      type: 'Transaction',
      description: 'Large withdrawal flagged for review',
      user: 'Robert Davis',
      timestamp: new Date('2024-01-15T14:45:00'),
      status: 'review'
    },
    {
      id: 'ACT004',
      type: 'User Management',
      description: 'New teller account created',
      user: 'Manager',
      timestamp: new Date('2024-01-14T16:20:00'),
      status: 'completed'
    },
    {
      id: 'ACT005',
      type: 'Compliance',
      description: 'Monthly compliance report generated',
      user: 'System',
      timestamp: new Date('2024-01-14T18:00:00'),
      status: 'completed'
    }
  ];

  // Branch Performance
  branchPerformance = [
    { name: 'Downtown Branch', customers: 450, revenue: 45000, growth: 12.5 },
    { name: 'Westside Branch', customers: 380, revenue: 38000, growth: 8.2 },
    { name: 'North Branch', customers: 320, revenue: 32000, growth: 15.7 },
    { name: 'East Branch', customers: 280, revenue: 28000, growth: 5.4 },
    { name: 'South Branch', customers: 220, revenue: 22000, growth: 3.8 }
  ];

  // Chart data (simplified for now)
  revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [65000, 72000, 85000, 92000, 105000, 125000],
        backgroundColor: '#3B82F6'
      }
    ]
  };

  ngOnInit(): void {
    // Initialize any data fetching here
  }

  getChangeClass(change: number): string {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }
}