import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';
import { MockAuthService } from '../../../core/services/implementations/mock-auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardLayoutComponent
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private authService = inject(MockAuthService);
  
  currentUser = signal<User | null>(null);
  isEditing = signal(false);
  isLoading = signal(true);
  isSaving = signal(false);
  
  // Form data
  profileData = signal({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: ''
  });
  
  ngOnInit() {
    this.loadProfile();
  }
  
  loadProfile() {
    this.isLoading.set(true);
    
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser.set(user);
      if (user) {
        this.profileData.set({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
          city: user.city,
          state: user.state,
          zipCode: user.zipCode,
          dateOfBirth: user.dateOfBirth.toISOString().split('T')[0]
        });
      }
      this.isLoading.set(false);
    });
  }
  
  startEditing() {
    this.isEditing.set(true);
  }
  
saveProfile() {
  this.isSaving.set(true);

  const payload = {
    ...this.profileData(),
    dateOfBirth: new Date(this.profileData().dateOfBirth)
  };

  // In real app, this would update via API
  setTimeout(() => {
    this.authService.updateProfile(payload).subscribe({
      next: (updatedUser) => {
        this.currentUser.set(updatedUser);
        this.isEditing.set(false);
        this.isSaving.set(false);
      },
      error: () => {
        this.isSaving.set(false);
      }
    });
  }, 1000);
}

  
  cancelEditing() {
    this.isEditing.set(false);
    this.loadProfile(); // Reload original data
  }
  
 formatDate(date: Date | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}

}