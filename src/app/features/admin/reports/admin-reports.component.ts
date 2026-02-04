import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout
      title="System Reports"
      subtitle="Generate and view system-wide reports"
      [breadcrumbItems]="[
        { label: 'Admin Dashboard', link: '/admin/dashboard' },
        { label: 'Reports' }
      ]"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let report of reportTypes" 
             class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
             (click)="generateReport(report)">
          <div class="flex items-center mb-4">
            <div class="p-3 rounded-lg" [ngClass]="report.color">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" [innerHTML]="report.icon"></svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">{{ report.title }}</h3>
              <p class="text-sm text-gray-500">{{ report.description }}</p>
            </div>
          </div>
          <div class="text-sm text-gray-600">
            Last generated: {{ report.lastGenerated | date:'short' }}
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `
})
export class AdminReportsComponent implements OnInit {
  reportTypes = [
    {
      id: 'user-activity',
      title: 'User Activity Report',
      description: 'Detailed user login and activity statistics',
      color: 'bg-blue-100 text-blue-600',
      icon: '<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
      lastGenerated: new Date()
    },
    {
      id: 'security-summary',
      title: 'Security Summary',
      description: 'Security incidents and threat analysis',
      color: 'bg-red-100 text-red-600',
      icon: '<path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>',
      lastGenerated: new Date(Date.now() - 86400000)
    },
    {
      id: 'system-performance',
      title: 'System Performance',
      description: 'Server performance and resource usage',
      color: 'bg-green-100 text-green-600',
      icon: '<path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>',
      lastGenerated: new Date(Date.now() - 3600000)
    }
  ];

  ngOnInit(): void {}

  generateReport(report: any): void {
    console.log('Generating report:', report.title);
    alert(`Generating ${report.title}...`);
  }
}