import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-security-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout
      title="Security Management"
      subtitle="Monitor and manage system security"
      [breadcrumbItems]="[
        { label: 'Admin Dashboard', link: '/admin/dashboard' },
        { label: 'Security Management' }
      ]"
    >
      <div class="space-y-6">
        <!-- Security Overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-green-100 text-green-600">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Security Score</p>
                <p class="text-2xl font-semibold text-gray-900">{{ securityMetrics.score }}%</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Active Threats</p>
                <p class="text-2xl font-semibold text-gray-900">{{ securityMetrics.activeThreats }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-red-100 text-red-600">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Blocked Attempts</p>
                <p class="text-2xl font-semibold text-gray-900">{{ securityMetrics.blockedAttempts }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Policies -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Security Policies</h3>
          <div class="space-y-4">
            <div *ngFor="let policy of securityPolicies" class="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 class="text-sm font-medium text-gray-900">{{ policy.name }}</h4>
                <p class="text-sm text-gray-500">{{ policy.description }}</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="policy.enabled"
                  (change)="updatePolicy(policy)"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <!-- Recent Security Events -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Security Events</h3>
          <div class="space-y-3">
            <div *ngFor="let event of recentEvents" class="flex items-start space-x-3 p-3 border-l-4" 
                 [ngClass]="getEventBorderColor(event.severity)">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 rounded-full flex items-center justify-center" 
                     [ngClass]="getEventColor(event.severity)">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ event.title }}</p>
                <p class="text-sm text-gray-500">{{ event.description }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ event.timestamp | date:'short' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `
})
export class SecurityManagementComponent implements OnInit {
  securityMetrics = {
    score: 94,
    activeThreats: 2,
    blockedAttempts: 127
  };

  securityPolicies = [
    {
      id: '1',
      name: 'Password Complexity',
      description: 'Enforce strong password requirements',
      enabled: true
    },
    {
      id: '2',
      name: 'Account Lockout',
      description: 'Lock accounts after failed login attempts',
      enabled: true
    },
    {
      id: '3',
      name: 'Session Timeout',
      description: 'Automatically logout inactive users',
      enabled: true
    },
    {
      id: '4',
      name: 'IP Whitelist',
      description: 'Restrict access to approved IP addresses',
      enabled: false
    }
  ];

  recentEvents = [
    {
      id: '1',
      title: 'Failed Login Attempt',
      description: 'Multiple failed login attempts from IP 192.168.1.100',
      severity: 'medium',
      timestamp: new Date()
    },
    {
      id: '2',
      title: 'Suspicious Activity',
      description: 'Unusual access pattern detected for user admin',
      severity: 'high',
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: '3',
      title: 'Security Policy Updated',
      description: 'Password complexity policy has been modified',
      severity: 'low',
      timestamp: new Date(Date.now() - 600000)
    }
  ];

  ngOnInit(): void {}

  updatePolicy(policy: any): void {
    console.log('Policy updated:', policy);
  }

  getEventColor(severity: string): string {
    const colors = {
      'low': 'bg-blue-100 text-blue-600',
      'medium': 'bg-yellow-100 text-yellow-600',
      'high': 'bg-red-100 text-red-600'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  }

  getEventBorderColor(severity: string): string {
    const colors = {
      'low': 'border-blue-400',
      'medium': 'border-yellow-400',
      'high': 'border-red-400'
    };
    return colors[severity as keyof typeof colors] || 'border-gray-400';
  }
}