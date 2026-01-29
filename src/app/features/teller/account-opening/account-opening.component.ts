import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-account-opening',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardLayoutComponent
  ],
  templateUrl: './account-opening.component.html',
})
export class AccountOpeningComponent {
  currentStep = signal(1);
  accountType = signal('checking');
  isLoading = signal(false);
  
  customerData = signal({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    ssn: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    initialDeposit: ''
  });
  
  nextStep() {
    if (this.currentStep() < 4) {
      this.currentStep.update(step => step + 1);
    }
  }
  
  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
    }
  }
  
  submitApplication() {
    this.isLoading.set(true);
    // Submit account opening
    setTimeout(() => {
      this.isLoading.set(false);
      this.currentStep.set(5); // Success step
    }, 1500);
  }
}