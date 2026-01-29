import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/implementations/loading.service';

@Component({
  selector: 'app-global-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25 backdrop-blur-sm">
        <div class="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4">
          <div class="text-center">
            <!-- Spinner -->
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
            
            <!-- Loading Text -->
            <div class="mt-4">
              <p class="text-lg font-semibold text-gray-900">Loading...</p>
              <p class="mt-2 text-sm text-gray-600">
                Please wait while we process your request
              </p>
            </div>
            
            <!-- Optional Progress -->
            @if (loadingService.loadingCount() > 1) {
              <div class="mt-4">
                <div class="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Requests in progress:</span>
                  <span>{{ loadingService.loadingCount() }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    class="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                    [style.width]="'100%'"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class GlobalLoadingComponent {
  loadingService = inject(LoadingService);
}