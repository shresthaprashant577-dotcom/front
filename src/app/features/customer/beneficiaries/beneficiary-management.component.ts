import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { MockAuthService } from '../../../core/services/implementations/mock-auth.service';
import { MockDataGenerator } from '../../../core/services/mock-data/mock-data-generator.service';
import { Beneficiary } from '../../../core/models/beneficiary.model';

@Component({
  selector: 'app-beneficiary-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardLayoutComponent,
    DataTableComponent
  ],
  templateUrl: './beneficiary-management.component.html',
})
export class BeneficiaryManagementComponent implements OnInit {
  private authService = inject(MockAuthService);
  private mockData = inject(MockDataGenerator);
  
  beneficiaries = signal<Beneficiary[]>([]);
  isLoading = signal(true);
  showAddForm = signal(false);
  
  // Form data
  beneficiaryData = signal({
    name: '',
    accountNumber: '',
    bankName: '',
    bankCode: '',
    branchName: '',
    nickname: '',
    type: 'Internal' as 'Internal' | 'Domestic' | 'International',
    email: '',
    phoneNumber: '',
    maxTransferLimit: ''
  });
  
  // Table columns
  beneficiaryColumns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'accountNumber', label: 'Account Number', sortable: true },
    { key: 'bankName', label: 'Bank', sortable: true },
    { key: 'type', label: 'Type', sortable: true, format: 'badge' },
    { key: 'maxTransferLimit', label: 'Max Limit', sortable: true, format: 'currency' },
    { key: 'isActive', label: 'Status', sortable: true, format: 'badge' }
  ];
  
  ngOnInit() {
    this.loadBeneficiaries();
  }
  
  loadBeneficiaries() {
    this.isLoading.set(true);
    
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        const beneficiaries = this.mockData.getBeneficiariesByUserId(user.id);
        this.beneficiaries.set(beneficiaries);
      }
      this.isLoading.set(false);
    });
  }
  
  addBeneficiary() {
    this.showAddForm.set(true);
  }
  
  saveBeneficiary() {
    // In real app, this would save to backend
    console.log('Saving beneficiary:', this.beneficiaryData());
    
    // Reset form and hide
    this.beneficiaryData.set({
      name: '',
      accountNumber: '',
      bankName: '',
      bankCode: '',
      branchName: '',
      nickname: '',
      type: 'Internal',
      email: '',
      phoneNumber: '',
      maxTransferLimit: ''
    });
    
    this.showAddForm.set(false);
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}