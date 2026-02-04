// core/services/implementations/transaction.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Transaction, 
  TransactionType, 
  TransactionStatus 
} from '../../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  constructor(private http: HttpClient) {}

  // ========== TRANSACTION OPERATIONS ==========

  getTransactions(
    page: number = 1, 
    pageSize: number = 10,
    filters?: any
  ): Observable<{ data: Transaction[]; total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }

    return this.http.get<{ data: Transaction[]; total: number }>('/transactions', { params });
  }

  getTransactionById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`/transactions/${id}`);
  }

  // ========== CREATE TRANSACTIONS ==========

  deposit(data: { accountNumber: string; amount: number; description?: string }): Observable<Transaction> {
    return this.http.post<Transaction>('/transactions/deposit', data);
  }

  withdraw(data: { accountNumber: string; amount: number; description?: string }): Observable<Transaction> {
    return this.http.post<Transaction>('/transactions/withdraw', data);
  }

  transfer(data: {
    fromAccountNumber: string;
    toAccountNumber: string;
    amount: number;
    description?: string;
  }): Observable<Transaction> {
    return this.http.post<Transaction>('/transactions/transfer', data);
  }

  // ========== ACCOUNT TRANSACTIONS ==========

  getAccountTransactions(
    accountId: string, 
    page: number = 1, 
    pageSize: number = 10
  ): Observable<{ data: Transaction[]; total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<{ data: Transaction[]; total: number }>(
      `/accounts/${accountId}/transactions`,
      { params }
    );
  }

  // ========== TRANSACTION MANAGEMENT ==========

  approveTransaction(id: string): Observable<Transaction> {
    return this.http.post<Transaction>(`/transactions/${id}/approve`, {});
  }

  rejectTransaction(id: string, reason: string): Observable<Transaction> {
    return this.http.post<Transaction>(`/transactions/${id}/reject`, { reason });
  }

  cancelTransaction(id: string): Observable<Transaction> {
    return this.http.post<Transaction>(`/transactions/${id}/cancel`, {});
  }

  // ========== REPORTS ==========

  getTransactionReport(
    startDate: Date, 
    endDate: Date, 
    transactionType?: TransactionType
  ): Observable<any> {
    let params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    if (transactionType) {
      params = params.set('transactionType', transactionType);
    }

    return this.http.get('/transactions/report', { params });
  }

  // Add this method to your existing transaction.service.ts
getTodaysTransactions(): Observable<Transaction[]> {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
  const params = new HttpParams()
    .set('startDate', startOfDay.toISOString())
    .set('endDate', endOfDay.toISOString())
    .set('page', '1')
    .set('pageSize', '10');
    
  return this.http.get<Transaction[]>('/transactions/today', { params });
}
}