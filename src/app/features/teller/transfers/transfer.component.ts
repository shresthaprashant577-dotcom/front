import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardLayoutComponent
  ],
  templateUrl: './transfer.component.html',
})
export class TransferComponent {
  transferType = signal<'internal' | 'external'>('internal');
  isLoading = signal(false);
  
  // Form data
  transferData = signal({
    fromAccount: '',
    toAccount: '',
    toBank: '',
    routingNumber: '',
    amount: '',
    description: '',
    customerVerified: false
  });
  
  processTransfer() {
    this.isLoading.set(true);
    // Process transfer logic
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1000);
  }
}