import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MockAuthService } from '../../../core/services/implementations/mock-auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  private authService = inject(MockAuthService);
  
  currentUser = signal<User | null>(null);
  isSidebarCollapsed = signal(false);
  
  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser.set(user);
    });
  }
  
  toggleSidebar() {
    this.isSidebarCollapsed.update(value => !value);
  }
  
  logout() {
    this.authService.logout();
  }
  
  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return 'U';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
  getTellerNavigation() {
  return [
    { label: 'Dashboard', link: '/teller/dashboard', icon: 'dashboard' },
    { label: 'Transactions', link: '/teller/transactions', icon: 'transactions' },
    { label: 'Transfers', link: '/teller/transfers', icon: 'transfer' },
    { label: 'Customer Lookup', link: '/teller/customer-lookup', icon: 'search' },
    { label: 'Account Opening', link: '/teller/account-opening', icon: 'account' },
    { label: 'Daily Summary', link: '/teller/daily-summary', icon: 'summary' }
  ];
}
}