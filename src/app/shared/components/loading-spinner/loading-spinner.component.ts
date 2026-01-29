import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center p-8" [class.min-h-screen]="fullScreen">
      <div class="text-center">
        <div class="inline-block animate-spin-slow rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        @if (message) {
          <p class="mt-4 text-gray-600">{{ message }}</p>
        } @else {
          <p class="mt-4 text-gray-600">Loading...</p>
        }
      </div>
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() message?: string;
  @Input() fullScreen = false;
}