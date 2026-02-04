import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';
import { environment } from '../../../../environments/environment';

interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'manager' | 'teller' | 'customer';
    department?: string;
    branch?: string;
    status: 'active' | 'inactive' | 'pending' | 'suspended';
    lastLogin?: Date;
    createdAt: Date;
    phone?: string;
    avatar?: string;
}

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        DashboardLayoutComponent
    ],
    templateUrl: './user-management.component.html',
})
export class UserManagementComponent implements OnInit {

    private http = inject(HttpClient);
    Math = Math;
    // Users data
    users: User[] = [];
    filteredUsers: User[] = [];

    // Search and filters
    searchTerm: string = '';
    selectedRole: string = 'all';
    selectedStatus: string = 'all';

    // Pagination
    currentPage: number = 1;
    itemsPerPage: number = 10;
    totalPages: number = 1;

    // Sorting
    sortColumn: string = 'createdAt';
    sortDirection: 'asc' | 'desc' = 'desc';

    // New user form
    showNewUserForm: boolean = false;
    newUser: Partial<User> = {
        role: 'teller',
        status: 'pending'
    };

    // Edit mode
    editingUser: User | null = null;

    // Roles and statuses for dropdowns
    roles: {
        value: User['role'];
        label: string;
        color: string;
    }[] = [
        { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-800' },
        { value: 'manager', label: 'Manager', color: 'bg-purple-100 text-purple-800' },
        { value: 'teller', label: 'Teller', color: 'bg-blue-100 text-blue-800' },
        { value: 'customer', label: 'Customer', color: 'bg-green-100 text-green-800' }
    ];

    statuses = [
        { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
        { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
        { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'suspended', label: 'Suspended', color: 'bg-red-100 text-red-800' }
    ];

    departments = [
        'Operations',
        'Customer Service',
        'Compliance',
        'IT',
        'HR',
        'Finance',
        'Marketing'
    ];

    branches = [
        'Downtown Branch',
        'Westside Branch',
        'North Branch',
        'East Branch',
        'South Branch'
    ];

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        // Load users from API
        this.http.get<any[]>(`${environment.apiUrl}/UserManagement`).subscribe({
            next: (users) => {
                this.users = users.map(u => ({
                    id: u.id.toString(),
                    username: u.username,
                    email: u.email,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    role: this.mapNumberToRole(u.role),
                    status: u.isActive ? 'active' : 'inactive',
                    phone: u.phoneNumber,
                    createdAt: new Date(u.createdAt),
                    lastLogin: u.lastLoginAt ? new Date(u.lastLoginAt) : undefined,
                    avatar: `https://ui-avatars.com/api/?name=${u.firstName}+${u.lastName}&background=random`
                }));
                this.applyFilters();
            },
            error: (error) => {
                console.error('Error loading users:', error);
                this.users = [];
                this.applyFilters();
            }
        });
    }

    private mapNumberToRole(roleNumber: number): User['role'] {
        switch (roleNumber) {
            case 1: return 'customer';
            case 2: return 'teller';
            case 3: return 'manager';
            default: return 'customer';
        }
    }

    applyFilters(): void {
        this.filteredUsers = this.users.filter(user => {
            // Search filter
            const searchMatch = !this.searchTerm ||
                user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                `${user.firstName} ${user.lastName}`.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                user.phone?.includes(this.searchTerm);

            // Role filter
            const roleMatch = this.selectedRole === 'all' || user.role === this.selectedRole;

            // Status filter
            const statusMatch = this.selectedStatus === 'all' || user.status === this.selectedStatus;

            return searchMatch && roleMatch && statusMatch;
        });

        // Sort
        this.sortUsers();

        // Update pagination
        this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
        this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    }

    sortUsers(): void {
        this.filteredUsers.sort((a, b) => {
            const aRaw = a[this.sortColumn as keyof User];
            const bRaw = b[this.sortColumn as keyof User];

            // Handle undefined values
            if (aRaw == null && bRaw == null) return 0;
            if (aRaw == null) return 1;
            if (bRaw == null) return -1;

            const aValue =
                aRaw instanceof Date ? aRaw.getTime() : aRaw.toString().toLowerCase();
            const bValue =
                bRaw instanceof Date ? bRaw.getTime() : bRaw.toString().toLowerCase();

            if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    onSort(column: string): void {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        this.sortUsers();
    }

    get paginatedUsers(): User[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
    }

    changePage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    getPageNumbers(): number[] {
        const pages: number[] = [];
        const maxPages = 5;

        if (this.totalPages <= maxPages) {
            for (let i = 1; i <= this.totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, this.currentPage - 2);
            let end = Math.min(this.totalPages, start + maxPages - 1);

            if (end - start + 1 < maxPages) {
                start = end - maxPages + 1;
            }

            for (let i = start; i <= end; i++) pages.push(i);
        }

        return pages;
    }

    getRoleLabel(role: string): string {
        return this.roles.find(r => r.value === role)?.label || role;
    }

    getRoleColor(role: string): string {
        return this.roles.find(r => r.value === role)?.color || 'bg-gray-100 text-gray-800';
    }

    getStatusLabel(status: string): string {
        return this.statuses.find(s => s.value === status)?.label || status;
    }

    getStatusColor(status: string): string {
        return this.statuses.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
    }

    getUserCountByRole(role: User['role']): number {
        return this.filteredUsers.filter(user => user.role === role).length;
    }

    formatDate(date: Date): string {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatLastLogin(date?: Date): string {
        if (!date) return 'Never';

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 30) return `${diffDays}d ago`;

        return this.formatDate(date);
    }

    addUser(): void {
        if (!this.newUser.username || !this.newUser.email || !this.newUser.firstName || !this.newUser.lastName) {
            alert('Please fill in all required fields');
            return;
        }

        const createUserRequest = {
            username: this.newUser.username!,
            email: this.newUser.email!,
            firstName: this.newUser.firstName!,
            lastName: this.newUser.lastName!,
            role: this.mapRoleToNumber(this.newUser.role!),
            phoneNumber: this.newUser.phone,
            dateOfBirth: new Date().toISOString(),
            address: 'Default Address'
        };

        // Make real API call to create user
        this.http.post(`${environment.apiUrl}/UserManagement`, createUserRequest).subscribe({
            next: (response: any) => {
                alert(`User created successfully! Temporary password: Bank@123#\nEmail: ${createUserRequest.email}`);
                this.loadUsers(); // Reload users from API
                this.resetNewUserForm();
                this.showNewUserForm = false;
            },
            error: (error) => {
                console.error('Error creating user:', error);
                alert(error.error?.message || 'Failed to create user');
            }
        });
    }

    private mapRoleToNumber(role: string): number {
        switch (role) {
            case 'customer': return 1;
            case 'teller': return 2;
            case 'manager': return 3;
            default: return 1;
        }
    }

    editUser(user: User): void {
        this.editingUser = { ...user };
    }

    updateUser(): void {
        if (!this.editingUser) return;

        const index = this.users.findIndex(u => u.id === this.editingUser!.id);
        if (index !== -1) {
            this.users[index] = { ...this.editingUser };
        }

        this.applyFilters();
        this.editingUser = null;

        // In real app, this would be an API call
        console.log('User updated:', this.editingUser);
    }

    deleteUser(user: User): void {
        if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
            this.http.delete(`${environment.apiUrl}/UserManagement/${user.id}`).subscribe({
                next: () => {
                    alert('User deleted successfully');
                    this.loadUsers(); // Reload users from API
                },
                error: (error) => {
                    console.error('Error deleting user:', error);
                    alert(error.error?.message || 'Failed to delete user');
                }
            });
        }
    }

    toggleUserStatus(user: User): void {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        const index = this.users.findIndex(u => u.id === user.id);

        if (index !== -1) {
            this.users[index] = { ...user, status: newStatus };
            this.applyFilters();

            // In real app, this would be an API call
            console.log(`User ${user.username} status changed to ${newStatus}`);
        }
    }

    resetNewUserForm(): void {
        this.newUser = {
            role: 'teller',
            status: 'pending'
        };
    }

    cancelEdit(): void {
        this.editingUser = null;
    }

    exportUsers(): void {
        // In real app, this would generate and download a CSV/Excel file
        console.log('Exporting users:', this.filteredUsers);
        alert('Export functionality would download a CSV file in a real application');
    }

    // Statistics getters
    get totalUsers(): number {
        return this.filteredUsers.length;
    }

    get activeUsers(): number {
        return this.filteredUsers.filter(user => user.status === 'active').length;
    }

    get pendingUsers(): number {
        return this.filteredUsers.filter(user => user.status === 'pending').length;
    }

    get adminUsers(): number {
        return this.filteredUsers.filter(user => user.role === 'admin').length;
    }

    get totalCustomers(): number {
        return this.filteredUsers.filter(user => user.role === 'customer').length;
    }

    get totalManagers(): number {
        return this.filteredUsers.filter(user => user.role === 'manager').length;
    }

    get totalTellers(): number {
        return this.filteredUsers.filter(user => user.role === 'teller').length;
    }

    get inactiveUsers(): number {
        return this.filteredUsers.filter(user => user.status === 'inactive').length;
    }

    get suspendedUsers(): number {
        return this.filteredUsers.filter(user => user.status === 'suspended').length;
    }
}