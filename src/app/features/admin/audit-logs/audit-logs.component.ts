import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout
      title="Audit Logs"
      subtitle="System activity and security audit trail"
      [breadcrumbItems]="[
        { label: 'Admin Dashboard', link: '/admin/dashboard' },
        { label: 'Audit Logs' }
      ]"
    >
      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (input)="applyFilters()"
            placeholder="Search logs..."
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
          <select
            [(ngModel)]="selectedAction"
            (change)="applyFilters()"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Actions</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
          <input
            type="date"
            [(ngModel)]="selectedDate"
            (change)="applyFilters()"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
          <button
            (click)="exportLogs()"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Export
          </button>
        </div>
      </div>

      <!-- Logs Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let log of filteredLogs" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ log.timestamp | date:'short' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ log.user }}</div>
                <div class="text-sm text-gray-500">{{ log.role }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [ngClass]="getActionColor(log.action)">
                  {{ log.action }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ log.resource }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ log.ipAddress }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [ngClass]="log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ log.success ? 'Success' : 'Failed' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </app-dashboard-layout>
  `
})
export class AuditLogsComponent implements OnInit {
  logs = [
    {
      id: '1',
      timestamp: new Date(),
      user: 'John Admin',
      role: 'Admin',
      action: 'login',
      resource: 'Admin Panel',
      ipAddress: '192.168.1.100',
      success: true
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000),
      user: 'Sarah Manager',
      role: 'Manager',
      action: 'update',
      resource: 'User Account',
      ipAddress: '192.168.1.101',
      success: true
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 600000),
      user: 'Unknown',
      role: 'Guest',
      action: 'login',
      resource: 'System',
      ipAddress: '10.0.0.1',
      success: false
    }
  ];

  filteredLogs = [...this.logs];
  searchTerm = '';
  selectedAction = 'all';
  selectedDate = '';

  ngOnInit(): void {}

  applyFilters(): void {
    this.filteredLogs = this.logs.filter(log => {
      const matchesSearch = !this.searchTerm || 
        log.user.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesAction = this.selectedAction === 'all' || log.action === this.selectedAction;
      
      const matchesDate = !this.selectedDate || 
        log.timestamp.toDateString() === new Date(this.selectedDate).toDateString();

      return matchesSearch && matchesAction && matchesDate;
    });
  }

  getActionColor(action: string): string {
    const colors = {
      'login': 'bg-blue-100 text-blue-800',
      'logout': 'bg-gray-100 text-gray-800',
      'create': 'bg-green-100 text-green-800',
      'update': 'bg-yellow-100 text-yellow-800',
      'delete': 'bg-red-100 text-red-800'
    };
    return colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }

  exportLogs(): void {
    console.log('Exporting logs...');
    alert('Logs exported successfully!');
  }
}