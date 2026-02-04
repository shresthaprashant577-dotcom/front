import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';

type TransferType = 'internal' | 'external';

interface TransferData {
  fromAccount: string;
  toAccount: string;
  toBank: string;
  routingNumber: string;
  amount: number;
  description: string;
  customerVerified: boolean;
}

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

  // -----------------------------
  // UI State
  // -----------------------------
  transferType = signal<TransferType>('internal');
  isLoading = signal<boolean>(false);

  // -----------------------------
  // Form State (Signal Store)
  // -----------------------------
  transferData = signal<TransferData>({
    fromAccount: '',
    toAccount: '',
    toBank: '',
    routingNumber: '',
    amount: 0,
    description: '',
    customerVerified: false
  });

  // -----------------------------
  // Computed Values
  // -----------------------------
  readonly TRANSFER_FEE = 25;

  totalAmount = computed<number>(() => {
    const amount = this.transferData().amount || 0;

    if (this.transferType() === 'internal') {
      return amount;
    }

    return amount + this.TRANSFER_FEE;
  });

  isExternal = computed(() => this.transferType() === 'external');
  isInternal = computed(() => this.transferType() === 'internal');

  // -----------------------------
  // Handlers
  // -----------------------------

  setTransferType(type: TransferType) {
    this.transferType.set(type);

    // Reset destination fields when switching type
    this.transferData.update(data => ({
      ...data,
      toAccount: '',
      toBank: '',
      routingNumber: ''
    }));
  }

  updateAmount(value: number) {
    this.transferData.update(data => ({
      ...data,
      amount: Number(value) || 0
    }));
  }

  updateField<K extends keyof TransferData>(key: K, value: TransferData[K]) {
    this.transferData.update(data => ({
      ...data,
      [key]: value
    }));
  }

  // -----------------------------
  // Submit Logic
  // -----------------------------
  processTransfer() {
    if (!this.transferData().customerVerified) {
      alert('Customer verification is required.');
      return;
    }

    if (this.transferData().amount <= 0) {
      alert('Transfer amount must be greater than 0.');
      return;
    }

    this.isLoading.set(true);

    const payload = {
      type: this.transferType(),
      ...this.transferData(),
      fee: this.transferType() === 'external' ? this.TRANSFER_FEE : 0,
      total: this.totalAmount()
    };

    console.log('TRANSFER PAYLOAD:', payload);

    // Simulated API call
    setTimeout(() => {
      this.isLoading.set(false);
      alert('Transfer processed successfully ✅');

      // Reset form
      this.transferData.set({
        fromAccount: '',
        toAccount: '',
        toBank: '',
        routingNumber: '',
        amount: 0,
        description: '',
        customerVerified: false
      });
    }, 1200);
  }
}
