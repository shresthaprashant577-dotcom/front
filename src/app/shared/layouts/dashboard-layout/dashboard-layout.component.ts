import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, BreadcrumbComponent],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
            @if (subtitle) {
              <p class="mt-1 text-gray-600">{{ subtitle }}</p>
            }
          </div>
          @if (actionText) {
            <button
              (click)="onAction.emit()"
              class="btn-primary"
            >
              {{ actionText }}
            </button>
          }
        </div>
        
        <!-- Breadcrumb -->
        <app-breadcrumb [items]="breadcrumbItems" class="mt-4" />
      </div>

      <!-- Content -->
      <div class="space-y-6">
        <ng-content />
        <router-outlet />
      </div>
    </div>
  `,
})
export class DashboardLayoutComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() actionText = '';
  @Input() onAction: any;
  @Input() breadcrumbItems: Array<{ label: string; link?: string }> = [];
}