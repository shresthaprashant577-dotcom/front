import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="flex" aria-label="Breadcrumb">
      <ol class="flex items-center space-x-2">
        @for (item of items; track item.label; let last = $last) {
          <li>
            <div class="flex items-center">
              @if (!$first) {
                <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
              }
              @if (last) {
                <span class="text-sm font-medium text-gray-500" [class.ml-2]="!$first">{{ item.label }}</span>
              } @else {
                <a [routerLink]="item.link" class="text-sm font-medium text-gray-500 hover:text-gray-700" [class.ml-2]="!$first">
                  {{ item.label }}
                </a>
              }
            </div>
          </li>
        }
      </ol>
    </nav>
  `,
})
export class BreadcrumbComponent {
  @Input() items: Array<{ label: string; link?: string }> = [];
}