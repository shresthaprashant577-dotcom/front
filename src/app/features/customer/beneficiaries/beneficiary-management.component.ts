// features/customer/beneficiaries/beneficiary-management.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/implementations/auth.service';
import { BeneficiaryService, Beneficiary } from '../../../core/services/implementations/beneficiary.service';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { NotificationService } from '../../../core/services/implementations/notification.service';
import { DashboardLayoutComponent } from '../../../shared/shared.routes';

@Component({
  selector: 'app-beneficiary-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent, DataTableComponent],
  templateUrl: './beneficiary-management.component.html',

})
export class BeneficiaryManagementComponent implements OnInit {
  isLoading = signal(true);
  beneficiaries = signal<Beneficiary[]>([]);

  showAddForm = signal(false);
  beneficiaryColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'accountNumber', label: 'Account Number', sortable: true },
    { key: 'bankName', label: 'Bank Name', sortable: true },
    { key: 'ifscCode', label: 'IFSC Code', sortable: true },
    { key: 'nickname', label: 'Nickname', sortable: true },
    { key: 'isActive', label: 'Status', sortable: true, format: 'badge' as const}
  ];

  saveBeneficiary(): void {
  console.log('Saving beneficiary...');
  this.showAddForm.set(false);
}

  constructor(
    private authService: AuthService,
    private beneficiaryService: BeneficiaryService,
    private notificationService : NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadBeneficiaries();
  }

  loadBeneficiaries(): void {
    this.isLoading.set(true);
    this.beneficiaryService.getMyBeneficiaries().subscribe({
      next: (data) => {
        this.beneficiaries.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.notificationService.error('Error', 'Failed to load beneficiaries');
        this.isLoading.set(false);
      }
    });
  }

  addBeneficiary(): void {
    // Implement add beneficiary logic
    console.log('Add beneficiary clicked');
  }

  onEdit(beneficiary: Beneficiary): void {
    // Implement edit logic
    console.log('Edit beneficiary:', beneficiary);
  }

  onDelete(beneficiary: Beneficiary): void {
    if (confirm(`Are you sure you want to delete ${beneficiary.name}?`)) {
      this.beneficiaryService.deleteBeneficiary(beneficiary.id).subscribe({
        next: () => {
          this.notificationService.success('Success', 'Beneficiary deleted successfully');
          this.loadBeneficiaries();
        },
        error: () => {
          this.notificationService.error('Error', 'Failed to delete beneficiary');
        }
      });
    }
  }
}
