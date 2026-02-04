import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { Location } from '@angular/common';
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
          <div class="flex items-center space-x-4">
            @if (showBackButton) {
              <button
                (click)="handleBackClick()"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg class="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {{ backButtonText }}
              </button>
            }
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
              @if (subtitle) {
                <p class="mt-1 text-gray-600">{{ subtitle }}</p>
              }
            </div>
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
  private location = inject(Location);
  private router = inject(Router);
  
  @Input() title = '';
  @Input() subtitle = '';
  @Input() actionText = '';
  @Input() showBackButton = true;
  @Input() backButtonText = 'Back';
  @Input() backRoute = '';
  @Output() onAction = new EventEmitter<void>();
  @Output() onBack = new EventEmitter<void>();
  @Input() breadcrumbItems: Array<{ label: string; link?: string }> = [];
  
  handleBackClick(): void {
    if (this.onBack.observed) {
      this.onBack.emit();
    } else if (this.backRoute) {
      this.router.navigate([this.backRoute]);
    } else {
      this.location.back();
    }
  }
}