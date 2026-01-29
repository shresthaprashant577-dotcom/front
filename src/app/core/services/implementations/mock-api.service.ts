import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MockDataGenerator } from '../mock-data/mock-data-generator.service';
import { 
  User, 
  LoginCredentials, 
  AuthResponse, 
  RegisterRequest 
} from '../../models/user.model';
import { 
  Account, 
  AccountCreationRequest 
} from '../../models/account.model';
import { 
  Transaction, 
  TransferRequest 
} from '../../models/transaction.model';
import { Beneficiary } from '../../models/beneficiary.model';
import { Report } from '../../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class MockApiService {
  private mockData: MockDataGenerator;
  
  constructor() {
    this.mockData = new MockDataGenerator();
  }
  
  // Auth endpoints
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    const user = this.mockData.getUserByUsername(credentials.username);
    
    if (!user) {
      return throwError(() => new Error('Invalid credentials'));
    }
    
    const response: AuthResponse = {
      user,
      token: 'mock-jwt-token-' + Date.now(),
      expiresIn: 3600
    };
    
    return of(response).pipe(delay(800));
  }
  
  register(userData: RegisterRequest): Observable<User> {
    // Check if user exists
    const existingUser = this.mockData.getUsers().find(u => 
      u.username === userData.username || u.email === userData.email
    );
    
    if (existingUser) {
      return throwError(() => new Error('User already exists'));
    }
    
    const newUser: User = {
      id: crypto.randomUUID(),
      ...userData,
      role: 'Customer',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      customerId: `CUST${Date.now().toString().slice(-8)}`
    };
    
    return of(newUser).pipe(delay(1000));
  }
  
  // Account endpoints
  getAccounts(): Observable<Account[]> {
    return of(this.mockData.getAccounts()).pipe(delay(600));
  }
  
  getAccountById(id: string): Observable<Account> {
    const account = this.mockData.getAccounts().find(a => a.id === id);
    
    if (!account) {
      return throwError(() => new Error('Account not found'));
    }
    
    return of(account).pipe(delay(400));
  }
  
  createAccount(request: AccountCreationRequest): Observable<Account> {
    const newAccount: Account = {
      id: crypto.randomUUID(),
      accountNumber: `ACC${Date.now().toString().slice(-10)}`,
      ...request,
      status: 'Active',
      balance: request.initialDeposit,
      availableBalance: request.initialDeposit,
      currency: request.currency || 'USD',
      interestRate: 0,
      openingDate: new Date(),
      lastActivityDate: new Date(),
      minimumBalance: 0,
      overdraftLimit: 0,
      monthlyFee: 0,
      transactions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return of(newAccount).pipe(delay(800));
  }
  
  // Transaction endpoints
  getTransactions(): Observable<Transaction[]> {
    return of(this.mockData.getTransactions()).pipe(delay(600));
  }
  
  transfer(request: TransferRequest): Observable<Transaction> {
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      transactionId: `TXN${Date.now().toString().slice(-10)}`,
      accountId: request.fromAccountId,
      type: 'Transfer',
      amount: request.amount,
      currency: request.currency || 'USD',
      description: request.description,
      status: 'Completed',
      category: 'Online',
      date: new Date(),
      timestamp: new Date(),
      sourceAccount: request.fromAccountId,
      destinationAccount: request.toAccountId,
      referenceNumber: `REF${Date.now().toString().slice(-8)}`,
      balanceAfter: 0, // Would be calculated in real implementation
      createdAt: new Date()
    };
    
    return of(newTransaction).pipe(delay(1200));
  }
  
  // Beneficiary endpoints
  getBeneficiaries(): Observable<Beneficiary[]> {
    return of(this.mockData.getBeneficiaries()).pipe(delay(600));
  }
  
  // Report endpoints
  getReports(): Observable<Report[]> {
    return of(this.mockData.getReports()).pipe(delay(800));
  }
  
  // Utility method to simulate errors
  simulateError<T>(message: string, status: number = 500): Observable<T> {
    return throwError(() => ({
      status,
      message,
      timestamp: new Date().toISOString()
    })).pipe(delay(500));
  }
}