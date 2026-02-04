import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card hover:shadow-card-lg transition-shadow duration-300">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          <p class="text-sm text-gray-500">{{ description }}</p>
        </div>
        <div class="p-3 rounded-lg" [ngClass]="iconColor">
          <span class="text-2xl" [innerHTML]="icon"></span>
        </div>
      </div>
      
      <div class="mb-2">
        <div class="text-3xl font-bold text-gray-900">{{ value }}</div>
        @if (trend) {
          <div class="flex items-center mt-1">
            <span [ngClass]="trend > 0 ? 'text-success' : 'text-danger'">
              {{ trend > 0 ? '↑' : '↓' }} {{ Math.abs(trend) }}%
            </span>
            <span class="text-sm text-gray-500 ml-2">from last month</span>
          </div>
        }
      </div>
      
      @if (actionText) {
        <button 
          (click)="onAction.emit()"
          class="mt-4 w-full btn-secondary text-sm"
        >
          {{ actionText }}
        </button>
      }
    </div>
  `,
})
export class DashboardCardComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() value: string | number = '';
  @Input() icon = '💰';
  @Input() iconColor = 'bg-primary-100 text-primary-600';
  @Input() trend?: number;
  @Input() actionText = '';
  @Input() onAction: any;
  
  Math = Math;
}