import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  format?: 'currency' | 'date' | 'percentage' | 'badge';
  width?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto rounded-lg border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            @for (column of columns; track column.key) {
              <th 
                [class.cursor-pointer]="column.sortable"
                (click)="column.sortable ? onSort(column.key) : null"
                class="table-header"
                [style.width]="column.width"
              >
                <div class="flex items-center space-x-1">
                  <span>{{ column.label }}</span>
                  @if (column.sortable) {
                    <span class="text-gray-400">
                      @if (sortColumn === column.key) {
                        {{ sortDirection === 'asc' ? '↑' : '↓' }}
                      }
                    </span>
                  }
                </div>
              </th>
            }
            @if (actions) {
              <th class="table-header">Actions</th>
            }
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          @for (item of data; track trackBy ? item[trackBy] : $index) {
            <tr class="hover:bg-gray-50 transition-colors duration-150">
              @for (column of columns; track column.key) {
                <td class="table-cell">
                  @switch (column.format) {
                    @case ('currency') {
                      <span class="font-medium">
                        {{ item[column.key] | currency:'USD':'symbol':'1.2-2' }}
                      </span>
                    }
                    @case ('date') {
                      <span class="text-gray-600">
                        {{ item[column.key] | date:'MMM d, yyyy' }}
                      </span>
                    }
                    @case ('percentage') {
                      <span class="font-medium">
                        {{ item[column.key] }}%
                      </span>
                    }
                    @case ('badge') {
                      <span 
                        class="badge"
                        [ngClass]="getBadgeClass(item[column.key])"
                      >
                        {{ item[column.key] }}
                      </span>
                    }
                    @default {
                      <span class="text-gray-900">{{ item[column.key] }}</span>
                    }
                  }
                </td>
              }
              @if (actions) {
                <td class="table-cell">
                  <div class="flex items-center space-x-2">
                    @if (actions.includes('view')) {
                      <button 
                        (click)="onView.emit(item)"
                        class="text-primary-600 hover:text-primary-900 p-1"
                      >
                        View
                      </button>
                    }
                    @if (actions.includes('edit')) {
                      <button 
                        (click)="onEdit.emit(item)"
                        class="text-blue-600 hover:text-blue-900 p-1"
                      >
                        Edit
                      </button>
                    }
                    @if (actions.includes('delete')) {
                      <button 
                        (click)="onDelete.emit(item)"
                        class="text-danger hover:text-red-900 p-1"
                      >
                        Delete
                      </button>
                    }
                  </div>
                </td>
              }
            </tr>
          }
          @empty {
            <tr>
              <td [attr.colspan]="columns.length + (actions ? 1 : 0)" class="px-6 py-12 text-center">
                <div class="text-gray-500">No data available</div>
              </td>
            </tr>
          }
        </tbody>
      </table>
      
      @if (pagination) {
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Showing {{ (currentPage - 1) * pageSize + 1 }} to 
              {{ Math.min(currentPage * pageSize, totalItems) }} of {{ totalItems }} results
            </div>
            <div class="flex items-center space-x-2">
              <button
                (click)="goToPage(currentPage - 1)"
                [disabled]="currentPage === 1"
                class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              @for (page of getPageNumbers(); track page) {
                <button
                  (click)="goToPage(page)"
                  [class.bg-primary-600]="page === currentPage"
                  [class.text-white]="page === currentPage"
                  class="px-3 py-1 border rounded hover:bg-gray-100"
                >
                  {{ page }}
                </button>
              }
              <button
                (click)="goToPage(currentPage + 1)"
                [disabled]="currentPage === totalPages"
                class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() trackBy?: string;
  @Input() actions: string[] = [];
  @Input() pagination = false;
  @Input() pageSize = 10;
  @Input() currentPage = 1;
  @Input() totalItems = 0;
  
  @Output() onView = new EventEmitter<any>();
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onSortChange = new EventEmitter<{column: string; direction: 'asc' | 'desc'}>();
  @Output() onPageChange = new EventEmitter<number>();
  
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
Math: any;
  
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }
  
  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.onSortChange.emit({ column: this.sortColumn, direction: this.sortDirection });
  }
  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.onPageChange.emit(page);
    }
  }
  
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
  
  getBadgeClass(value: string): string {
    const badgeClasses: Record<string, string> = {
      'Active': 'badge-success',
      'Pending': 'badge-warning',
      'Completed': 'badge-success',
      'Failed': 'badge-danger',
      'Inactive': 'badge-danger',
      'Closed': 'badge-danger',
      'High': 'badge-danger',
      'Medium': 'badge-warning',
      'Low': 'badge-success',
    };
    
    return badgeClasses[value] || 'badge-info';
  }
}