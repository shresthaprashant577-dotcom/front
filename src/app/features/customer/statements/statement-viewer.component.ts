import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { MockAuthService } from '../../../core/services/implementations/mock-auth.service';
import { MockDataGenerator } from '../../../core/services/mock-data/mock-data-generator.service';
import { Account } from '../../../core/models/account.model';

@Component({
  selector: 'app-statement-viewer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardLayoutComponent,
    DataTableComponent
  ],
  templateUrl: './statement-viewer.component.html',
})
export class StatementViewerComponent implements OnInit {
  private authService = inject(MockAuthService);
  private mockData = inject(MockDataGenerator);
  
  userAccounts = signal<Account[]>([]);
  statements = signal<any[]>([]);
  isLoading = signal(true);
  
  // Filters
  selectedAccount = signal<string>('');
  selectedMonth = signal<string>('');
  selectedYear = signal<string>(new Date().getFullYear().toString());
  
  // Table columns
  statementColumns: TableColumn[] = [
    { key: 'period', label: 'Period', sortable: true },
    { key: 'account', label: 'Account', sortable: true },
    { key: 'openingBalance', label: 'Opening Balance', sortable: true, format: 'currency' },
    { key: 'closingBalance', label: 'Closing Balance', sortable: true, format: 'currency' },
    { key: 'transactions', label: 'Transactions', sortable: true },
    { key: 'status', label: 'Status', sortable: true, format: 'badge' }
  ];
  
  months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];
  
  years = Array.from({ length: 5 }, (_, i) => 
    (new Date().getFullYear() - i).toString()
  );
  
  ngOnInit() {
    this.loadData();
  }
  
  loadData() {
    this.isLoading.set(true);
    
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        // Load user accounts
        const accounts = this.mockData.getAccountsByUserId(user.id);
        this.userAccounts.set(accounts);
        
        if (accounts.length > 0) {
          this.selectedAccount.set(accounts[0].id);
          this.loadStatements();
        }
      }
      this.isLoading.set(false);
    });
  }
  
  loadStatements() {
    // Generate mock statements
    const account = this.userAccounts().find(acc => acc.id === this.selectedAccount());
    if (!account) return;
    
    const mockStatements = Array.from({ length: 12 }, (_, i) => {
      const month = (12 - i) % 12 || 12;
      const year = new Date().getFullYear() - Math.floor(i / 12);
      
      return {
        id: `STMT-${account.accountNumber}-${year}-${month.toString().padStart(2, '0')}`,
        period: `${this.months[month - 1].label} ${year}`,
        account: account.accountNumber,
        openingBalance: account.balance * 0.9,
        closingBalance: account.balance,
        transactions: Math.floor(Math.random() * 50) + 10,
        status: 'Available',
        downloadUrl: '#'
      };
    });
    
    this.statements.set(mockStatements);
  }
  
  onAccountChange() {
    this.loadStatements();
  }
  
  downloadStatement(statement: any) {
    console.log('Downloading statement:', statement.id);
    alert('Statement download would start for: ' + statement.period);
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}