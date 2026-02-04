import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showDetails?: boolean;
  details?: Record<string, string>;
  warning?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="p-6 max-w-md">
      <!-- Header -->
      <div class="flex items-start gap-3 mb-4">
        <div class="w-10 h-10 rounded-full flex items-center justify-center"
             [ngClass]="data.warning ? 'bg-red-100' : 'bg-blue-100'">
          <mat-icon [class]="data.warning ? 'text-red-600' : 'text-blue-600'">
            {{ data.warning ? 'warning' : 'info' }}
          </mat-icon>
        </div>
        <div class="flex-grow">
          <h2 class="text-lg font-semibold text-gray-800">{{ data.title }}</h2>
          <p class="text-gray-600 mt-1">{{ data.message }}</p>
        </div>
      </div>

      <!-- Details -->
      <div *ngIf="data.showDetails && data.details" class="mb-6">
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="text-sm font-medium text-gray-700 mb-3">Transfer Details</h3>
          <div class="space-y-2">
            <div *ngFor="let item of getDetailsArray()" class="flex justify-between">
              <span class="text-sm text-gray-600">{{ item.key }}</span>
              <span class="text-sm font-medium text-gray-800">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-4 border-t">
        <button mat-button 
                (click)="onCancel()"
                class="text-gray-700 hover:bg-gray-100">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-raised-button 
                [color]="data.warning ? 'warn' : 'primary'"
                (click)="onConfirm()"
                class="min-w-24">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ConfirmDialogComponent {
  private dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  public data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getDetailsArray(): Array<{key: string; value: string}> {
    if (!this.data.details) return [];
    return Object.entries(this.data.details).map(([key, value]) => ({ key, value }));
  }
}