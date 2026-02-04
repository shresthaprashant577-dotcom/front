import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout
      title="User Management"
      subtitle="Manage system users and permissions"
      [breadcrumbItems]="[
        { label: 'Admin Dashboard', link: '/admin/dashboard' },
        { label: 'User Management' }
      ]"
    >
      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (input)="applyFilters()"
            placeholder="Search users..."
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
          <select
            [(ngModel)]="selectedRole"
            (change)="applyFilters()"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Teller">Teller</option>
            <option value="Customer">Customer</option>
          </select>
          <select
            [(ngModel)]="selectedStatus"
            (change)="applyFilters()"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            (click)="showCreateModal = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add User
          </button>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let user of filteredUsers" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {{ getUserInitials(user) }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [ngClass]="getRoleColor(user.role)">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [ngClass]="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.lastLogin | date:'short' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button (click)="editUser(user)" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                <button (click)="toggleUserStatus(user)" 
                        [class]="user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'">
                  {{ user.isActive ? 'Deactivate' : 'Activate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </app-dashboard-layout>
  `
})
export class UserManagementComponent implements OnInit {
  users = [
    { id: '1', firstName: 'John', lastName: 'Admin', email: 'admin@bank.com', role: 'Admin', isActive: true, lastLogin: new Date() },
    { id: '2', firstName: 'Sarah', lastName: 'Manager', email: 'sarah@bank.com', role: 'Manager', isActive: true, lastLogin: new Date() },
    { id: '3', firstName: 'Mike', lastName: 'Teller', email: 'mike@bank.com', role: 'Teller', isActive: true, lastLogin: new Date() },
    { id: '4', firstName: 'Jane', lastName: 'Customer', email: 'jane@bank.com', role: 'Customer', isActive: false, lastLogin: new Date() }
  ];

  filteredUsers = [...this.users];
  searchTerm = '';
  selectedRole = 'all';
  selectedStatus = 'all';
  showCreateModal = false;

  ngOnInit(): void {}

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRole = this.selectedRole === 'all' || user.role === this.selectedRole;
      const matchesStatus = this.selectedStatus === 'all' || 
        (this.selectedStatus === 'active' && user.isActive) ||
        (this.selectedStatus === 'inactive' && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  getUserInitials(user: any): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  getRoleColor(role: string): string {
    const colors = {
      'Admin': 'bg-red-100 text-red-800',
      'Manager': 'bg-purple-100 text-purple-800',
      'Teller': 'bg-blue-100 text-blue-800',
      'Customer': 'bg-green-100 text-green-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }

  editUser(user: any): void {
    console.log('Edit user:', user);
  }

  toggleUserStatus(user: any): void {
    user.isActive = !user.isActive;
    this.applyFilters();
  }
}