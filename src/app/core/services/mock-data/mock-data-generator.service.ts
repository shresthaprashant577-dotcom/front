import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { User, UserRole } from '../../models/user.model';
import { Account, AccountType, AccountStatus } from '../../models/account.model';
import { Transaction, TransactionType, TransactionStatus, TransactionCategory } from '../../models/transaction.model';
import { Branch, BranchStatus, BranchService } from '../../models/branch.model';
import { Beneficiary, BeneficiaryType } from '../../models/beneficiary.model';
import { AuditLog, AuditAction, EntityType } from '../../models/audit-model.model';
import { Report, ReportType, ReportFormat, ReportStatus } from '../../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataGenerator {
  private users: User[] = [];
  private accounts: Account[] = [];
  private transactions: Transaction[] = [];
  private branches: Branch[] = [];
  private beneficiaries: Beneficiary[] = [];
  private auditLogs: AuditLog[] = [];
  private reports: Report[] = [];

  constructor() {
    this.generateMockData();
  }

  private generateMockData(): void {
    this.generateBranches(10);
    this.generateUsers(150);
    this.generateAccounts(300);
    this.generateTransactions(2000);
    this.generateBeneficiaries(200);
    this.generateAuditLogs(1000);
    this.generateReports(50);
  }

  private generateBranches(count: number): void {
    for (let i = 0; i < count; i++) {
      const branch: Branch = {
        id: faker.string.uuid(),
        branchCode: `BR${faker.string.numeric(5)}`,
        name: `${faker.location.city()} Branch`,
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        phoneNumber: faker.phone.number(),
        email: faker.internet.email(),
        managerId: '', // Will be set after users are generated
        openingDate: faker.date.past({ years: 5 }),
        status: faker.helpers.arrayElement(['Active', 'Active', 'Active', 'Inactive'] as BranchStatus[]),
        operatingHours: {
          monday: { open: '09:00', close: '17:00' },
          tuesday: { open: '09:00', close: '17:00' },
          wednesday: { open: '09:00', close: '17:00' },
          thursday: { open: '09:00', close: '17:00' },
          friday: { open: '09:00', close: '17:00' },
          saturday: { open: '09:00', close: '13:00' },
          sunday: { open: '00:00', close: '00:00' },
        },
        services: faker.helpers.arrayElements(
          ['PersonalBanking', 'BusinessBanking', 'Loans', 'Investments', 'WealthManagement', 'International'] as BranchService[],
          faker.number.int({ min: 3, max: 6 })
        ),
        totalAccounts: 0,
        totalBalance: 0,
        employees: faker.number.int({ min: 5, max: 50 }),
        createdAt: faker.date.past({ years: 3 }),
        updatedAt: faker.date.recent({ days: 30 }),
      };
      this.branches.push(branch);
    }
  }

  private generateUsers(count: number): void {
    const roles: UserRole[] = ['Customer', 'Customer', 'Customer', 'Teller', 'Manager', 'Admin'];
    
    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const role = i === 0 ? 'Admin' : 
                   i === 1 ? 'Manager' : 
                   i === 2 ? 'Teller' : 
                   faker.helpers.arrayElement(roles);
      
      const user: User = {
        id: faker.string.uuid(),
        username: faker.internet.username({ firstName, lastName }),
        email: faker.internet.email({ firstName, lastName }),
        firstName,
        lastName,
        role,
        phoneNumber: faker.phone.number(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        dateOfBirth: faker.date.birthdate({ min: 18, max: 70, mode: 'age' }),
        ssn: faker.string.numeric(9), // In real app, this would be masked
        createdAt: faker.date.past({ years: 3 }),
        updatedAt: faker.date.recent({ days: 30 }),
        lastLogin: faker.date.recent({ days: 7 }),
        isActive: faker.datatype.boolean(0.9),
        profileImage: faker.image.avatar(),
        branchId: role !== 'Customer' ? faker.helpers.arrayElement(this.branches).id : undefined,
        employeeId: role !== 'Customer' ? `EMP${faker.string.numeric(6)}` : undefined,
        customerId: role === 'Customer' ? `CUST${faker.string.numeric(8)}` : undefined,
      };
      
      this.users.push(user);
      
      // Assign managers to branches
      if (role === 'Manager' && this.branches.length > 0) {
        const availableBranch = this.branches.find(b => !b.managerId);
        if (availableBranch) {
          availableBranch.managerId = user.id;
        }
      }
    }
  }

  private generateAccounts(count: number): void {
    const customers = this.users.filter(u => u.role === 'Customer');
    const accountTypes: AccountType[] = ['Checking', 'Savings', 'Business', 'FixedDeposit', 'Loan', 'CreditCard'];
    
    for (let i = 0; i < count; i++) {
      const customer = faker.helpers.arrayElement(customers);
      const branch = faker.helpers.arrayElement(this.branches);
      const type = faker.helpers.arrayElement(accountTypes);
      const balance = faker.number.float({ min: 100, max: 1000000, fractionDigits: 2 });
      
      const account: Account = {
        id: faker.string.uuid(),
        accountNumber: faker.finance.accountNumber(12),
        userId: customer.id,
        branchId: branch.id,
        type,
        status: faker.helpers.arrayElement(['Active', 'Active', 'Active', 'Inactive', 'Closed'] as AccountStatus[]),
        balance,
        availableBalance: balance - faker.number.float({ min: 0, max: 1000, fractionDigits: 2 }),
        currency: 'USD',
        interestRate: type === 'Savings' ? faker.number.float({ min: 0.5, max: 3, fractionDigits: 2 }) : 
                     type === 'FixedDeposit' ? faker.number.float({ min: 3, max: 7, fractionDigits: 2 }) : 0,
        openingDate: faker.date.past({ years: 3 }),
        lastActivityDate: faker.date.recent({ days: 30 }),
        minimumBalance: type === 'Checking' ? 100 : type === 'Savings' ? 50 : 0,
        overdraftLimit: type === 'Checking' ? faker.number.float({ min: 0, max: 5000, fractionDigits: 2 }) : 0,
        monthlyFee: type === 'Checking' ? 12 : type === 'Business' ? 25 : 0,
        transactions: [],
        createdAt: faker.date.past({ years: 2 }),
        updatedAt: faker.date.recent({ days: 30 }),
      };
      
      this.accounts.push(account);
      
      // Update branch totals
      const branchIndex = this.branches.findIndex(b => b.id === branch.id);
      if (branchIndex > -1) {
        this.branches[branchIndex].totalAccounts++;
        this.branches[branchIndex].totalBalance += balance;
      }
    }
  }

  private generateTransactions(count: number): void {
    const transactionTypes: TransactionType[] = ['Deposit', 'Withdrawal', 'Transfer', 'Payment', 'Fee', 'Interest'];
    const categories: TransactionCategory[] = ['ATM', 'POS', 'Online', 'Branch', 'Check', 'AutoPay', 'Manual'];
    
    for (let i = 0; i < count; i++) {
      const account = faker.helpers.arrayElement(this.accounts);
      const type = faker.helpers.arrayElement(transactionTypes);
      const amount = faker.number.float({ min: 1, max: 10000, fractionDigits: 2 });
      const date = faker.date.recent({ days: 90 });
      
      const transaction: Transaction = {
        id: faker.string.uuid(),
        transactionId: `TXN${faker.string.numeric(10)}`,
        accountId: account.id,
        type,
        amount,
        currency: 'USD',
        description: this.generateTransactionDescription(type),
        status: faker.helpers.arrayElement(['Completed', 'Completed', 'Completed', 'Pending', 'Failed'] as TransactionStatus[]),
        category: faker.helpers.arrayElement(categories),
        date,
        timestamp: date,
        sourceAccount: type === 'Transfer' ? faker.helpers.arrayElement(this.accounts).accountNumber : undefined,
        destinationAccount: type === 'Transfer' ? faker.helpers.arrayElement(this.accounts).accountNumber : undefined,
        referenceNumber: `REF${faker.string.alphanumeric(8)}`,
        balanceAfter: faker.number.float({ min: 100, max: 100000, fractionDigits: 2 }),
        metadata: {
          location: faker.location.city(),
          device: faker.helpers.arrayElement(['ATM', 'Mobile App', 'Web', 'Branch Terminal']),
          tellerId: type === 'Deposit' || type === 'Withdrawal' ? faker.helpers.arrayElement(this.users.filter(u => u.role === 'Teller')).id : undefined,
        },
        createdAt: date,
      };
      
      this.transactions.push(transaction);
    }
  }

  private generateTransactionDescription(type: TransactionType): string {
    const descriptions: Record<TransactionType, string[]> = {
      Deposit: ['Salary deposit', 'Cash deposit', 'Check deposit', 'Transfer from savings', 'Gift deposit'],
      Withdrawal: ['ATM withdrawal', 'Cash withdrawal', 'Check withdrawal', 'Branch withdrawal'],
      Transfer: ['Transfer to savings', 'Bill payment', 'Rent payment', 'Family support', 'Loan repayment'],
      Payment: ['Credit card payment', 'Utility bill', 'Mortgage payment', 'Car loan payment', 'Insurance premium'],
      Fee: ['Monthly maintenance fee', 'ATM fee', 'Overdraft fee', 'Late payment fee', 'Wire transfer fee'],
      Interest: ['Interest earned', 'Dividend payment', 'CD interest', 'Savings interest'],
      Reversal: ['Transaction reversal', 'Failed transaction refund', 'Chargeback'],
    };
    
    return faker.helpers.arrayElement(descriptions[type]);
  }

  private generateBeneficiaries(count: number): void {
    const customers = this.users.filter(u => u.role === 'Customer');
    const beneficiaryTypes: BeneficiaryType[] = ['Internal', 'Domestic', 'International'];
    
    for (let i = 0; i < count; i++) {
      const customer = faker.helpers.arrayElement(customers);
      const type = faker.helpers.arrayElement(beneficiaryTypes);
      
      const beneficiary: Beneficiary = {
        id: faker.string.uuid(),
        userId: customer.id,
        name: faker.person.fullName(),
        accountNumber: faker.finance.accountNumber(12),
        bankName: faker.company.name(),
        bankCode: faker.finance.routingNumber(),
        branchName: type !== 'Internal' ? `${faker.location.city()} Branch` : undefined,
        nickname: faker.datatype.boolean(0.3) ? faker.word.noun() : undefined,
        type,
        email: faker.datatype.boolean(0.5) ? faker.internet.email() : undefined,
        phoneNumber: faker.datatype.boolean(0.4) ? faker.phone.number() : undefined,
        maxTransferLimit: faker.number.float({ min: 1000, max: 100000, fractionDigits: 2 }),
        dailyLimit: faker.number.float({ min: 100, max: 5000, fractionDigits: 2 }),
        isActive: faker.datatype.boolean(0.9),
        createdAt: faker.date.past({ years: 2 }),
        updatedAt: faker.date.recent({ days: 60 }),
      };
      
      this.beneficiaries.push(beneficiary);
    }
  }

  private generateAuditLogs(count: number): void {
    const actions: AuditAction[] = ['Create', 'Read', 'Update', 'Delete', 'Login', 'Logout', 'Export', 'Import'];
    const entityTypes: EntityType[] = ['User', 'Account', 'Transaction', 'Branch', 'Beneficiary', 'Report'];
    
    for (let i = 0; i < count; i++) {
      const user = faker.helpers.arrayElement(this.users);
      const action = faker.helpers.arrayElement(actions);
      const entityType = faker.helpers.arrayElement(entityTypes);
      
      const auditLog: AuditLog = {
        id: faker.string.uuid(),
        userId: user.id,
        userRole: user.role,
        action,
        entityType,
        entityId: faker.string.uuid(),
        details: {
          action,
          entity: entityType,
          timestamp: new Date().toISOString(),
          changes: faker.datatype.boolean(0.3) ? { field: 'status', oldValue: 'Active', newValue: 'Inactive' } : undefined,
        },
        ipAddress: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        timestamp: faker.date.recent({ days: 30 }),
        status: faker.helpers.arrayElement(['Success', 'Success', 'Success', 'Failed']),
        errorMessage: faker.datatype.boolean(0.1) ? faker.lorem.sentence() : undefined,
      };
      
      this.auditLogs.push(auditLog);
    }
  }

  private generateReports(count: number): void {
    const reportTypes: ReportType[] = ['Financial', 'Transaction', 'Customer', 'Account', 'Audit', 'Performance'];
    const formats: ReportFormat[] = ['PDF', 'Excel', 'CSV'];
    
    for (let i = 0; i < count; i++) {
      const generatedBy = faker.helpers.arrayElement(this.users.filter(u => u.role === 'Manager' || u.role === 'Admin')).id;
      const type = faker.helpers.arrayElement(reportTypes);
      const periodStart = faker.date.past({ years: 1 });
      const periodEnd = faker.date.recent({ days: 1 });
      
      const report: Report = {
        id: faker.string.uuid(),
        title: `${type} Report ${faker.date.recent().toISOString().split('T')[0]}`,
        type,
        format: faker.helpers.arrayElement(formats),
        generatedBy,
        generatedAt: faker.date.recent({ days: 7 }),
        periodStart,
        periodEnd,
        parameters: {
          branchId: faker.datatype.boolean(0.3) ? faker.helpers.arrayElement(this.branches).id : undefined,
          accountType: faker.datatype.boolean(0.4) ? faker.helpers.arrayElement(['Checking', 'Savings']) : undefined,
        },
        fileUrl: faker.datatype.boolean(0.7) ? faker.internet.url() : undefined,
        status: faker.helpers.arrayElement(['Completed', 'Completed', 'Generating', 'Failed'] as ReportStatus[]),
        data: this.generateReportData(type, periodStart, periodEnd),
        createdAt: faker.date.recent({ days: 7 }),
      };
      
      this.reports.push(report);
    }
  }

  private generateReportData(type: ReportType, startDate: Date, endDate: Date): any {
    switch (type) {
      case 'Financial':
        return {
          totalAssets: faker.number.float({ min: 1000000, max: 10000000, fractionDigits: 2 }),
          totalLiabilities: faker.number.float({ min: 500000, max: 5000000, fractionDigits: 2 }),
          netIncome: faker.number.float({ min: 100000, max: 1000000, fractionDigits: 2 }),
          revenue: faker.number.float({ min: 200000, max: 2000000, fractionDigits: 2 }),
          expenses: faker.number.float({ min: 100000, max: 1000000, fractionDigits: 2 }),
          profitMargin: faker.number.float({ min: 0.1, max: 0.4, fractionDigits: 3 }),
          growthRate: faker.number.float({ min: 0.01, max: 0.2, fractionDigits: 3 }),
          monthOverMonth: Array.from({ length: 12 }, (_, i) => ({
            month: new Date(startDate.getFullYear(), startDate.getMonth() - i, 1).toLocaleString('default', { month: 'short' }),
            value: faker.number.float({ min: 50000, max: 200000, fractionDigits: 2 }),
          })).reverse(),
        };
        
      case 'Transaction':
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return {
          totalTransactions: faker.number.int({ min: 1000, max: 10000 }),
          totalAmount: faker.number.float({ min: 500000, max: 5000000, fractionDigits: 2 }),
          transactionTypes: {
            Deposit: faker.number.int({ min: 200, max: 2000 }),
            Withdrawal: faker.number.int({ min: 150, max: 1500 }),
            Transfer: faker.number.int({ min: 300, max: 3000 }),
            Payment: faker.number.int({ min: 100, max: 1000 }),
            Fee: faker.number.int({ min: 50, max: 500 }),
            Interest: faker.number.int({ min: 10, max: 100 }),
          },
          topAccounts: Array.from({ length: 10 }, (_, i) => ({
            accountId: faker.helpers.arrayElement(this.accounts).accountNumber,
            transactionCount: faker.number.int({ min: 10, max: 100 }),
            totalAmount: faker.number.float({ min: 10000, max: 100000, fractionDigits: 2 }),
          })),
          dailyVolume: Array.from({ length: Math.min(days, 30) }, (_, i) => ({
            date: new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: faker.number.int({ min: 10, max: 100 }),
            amount: faker.number.float({ min: 5000, max: 50000, fractionDigits: 2 }),
          })).reverse(),
        };
        
      default:
        return {};
    }
  }

  // Getters for mock data
  getUsers(): User[] {
    return [...this.users];
  }

  getAccounts(): Account[] {
    return [...this.accounts];
  }

  getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  getBranches(): Branch[] {
    return [...this.branches];
  }

  getBeneficiaries(): Beneficiary[] {
    return [...this.beneficiaries];
  }

  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  getReports(): Report[] {
    return [...this.reports];
  }

  // Get specific data
  getUserByUsername(username: string): User | undefined {
    return this.users.find(u => u.username === username);
  }

  getAccountsByUserId(userId: string): Account[] {
    return this.accounts.filter(a => a.userId === userId);
  }

  getTransactionsByAccountId(accountId: string): Transaction[] {
    return this.transactions.filter(t => t.accountId === accountId);
  }

  getBeneficiariesByUserId(userId: string): Beneficiary[] {
    return this.beneficiaries.filter(b => b.userId === userId);
  }

  getBranchById(branchId: string): Branch | undefined {
    return this.branches.find(b => b.id === branchId);
  }

  getUsersByBranchId(branchId: string): User[] {
    return this.users.filter(u => u.branchId === branchId && u.role !== 'Customer');
  }
}