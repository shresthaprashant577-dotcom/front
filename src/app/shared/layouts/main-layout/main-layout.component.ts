import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/implementations/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  isSidebarCollapsed = signal(false);

  ngOnInit() {
    // ✅ Treat getCurrentUser as synchronous
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);
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

  getNavigationItems() {
    const user = this.currentUser();
    if (!user) return [];

    if (user.role === 'Admin') {
      return [
        { label: 'Dashboard', link: '/admin/dashboard', icon: 'dashboard' },
        { label: 'User Management', link: '/admin/users', icon: 'users' },
        { label: 'System Settings', link: '/admin/system-settings', icon: 'settings' },
        { label: 'Security', link: '/admin/security', icon: 'security' },
        { label: 'Audit Logs', link: '/admin/audit-logs', icon: 'audit' },
        { label: 'Reports', link: '/admin/reports', icon: 'reports' }
      ];
    }

    if (user.role === 'Teller') {
      return [
        { label: 'Dashboard', link: '/teller/dashboard', icon: 'dashboard' },
        { label: 'Transactions', link: '/teller/transactions', icon: 'transactions' },
        { label: 'Transfers', link: '/teller/transfers', icon: 'transfer' },
        { label: 'Customer Lookup', link: '/teller/customer-lookup', icon: 'search' },
        { label: 'Account Opening', link: '/teller/account-opening', icon: 'account' },
        { label: 'Daily Summary', link: '/teller/daily-summary', icon: 'summary' }
      ];
    }

    // Default customer navigation
    return [
      { label: 'Dashboard', link: '/customer/dashboard', icon: 'dashboard' },
      { label: 'Accounts', link: '/customer/accounts', icon: 'accounts' },
      { label: 'Transactions', link: '/customer/transactions', icon: 'transactions' },
      { label: 'Transfers', link: '/customer/transfers', icon: 'transfers' },
      { label: 'Beneficiaries', link: '/customer/beneficiaries', icon: 'beneficiaries' },
      { label: 'Statements', link: '/customer/statements', icon: 'statements' },
      { label: 'Profile', link: '/customer/profile', icon: 'profile' }
    ];
  }

  getProfileLink(): string {
    const user = this.currentUser();
    if (user?.role === 'Admin') return '/admin/users';
    if (user?.role === 'Teller') return '/teller/profile';
    return '/customer/profile';
  }
}
