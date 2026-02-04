// core/services/implementations/account.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Account, 
  AccountType, 
  AccountStatus 
} from '../../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  constructor(private http: HttpClient) {}

  // ========== ACCOUNT OPERATIONS ==========

  getAccounts(page: number = 1, pageSize: number = 10): Observable<{ data: Account[]; total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<{ data: Account[]; total: number }>('/accounts', { params });
  }

  getAccountById(id: string): Observable<Account> {
    return this.http.get<Account>(`/accounts/${id}`);
  }

  getAccountByNumber(accountNumber: string): Observable<Account> {
    return this.http.get<Account>(`/accounts/number/${accountNumber}`);
  }

  createAccount(accountData: any): Observable<Account> {
    return this.http.post<Account>('/accounts', accountData);
  }

  updateAccount(id: string, accountData: Partial<Account>): Observable<Account> {
    return this.http.put<Account>(`/accounts/${id}`, accountData);
  }

  deleteAccount(id: string): Observable<void> {
    return this.http.delete<void>(`/accounts/${id}`);
  }

  // ========== CUSTOMER ACCOUNTS ==========

  getCustomerAccounts(customerId: string): Observable<Account[]> {
    return this.http.get<Account[]>(`/customers/${customerId}/accounts`);
  }

  getMyAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>('/accounts/my-accounts');
  }

  // ========== ACCOUNT ACTIONS ==========

  activateAccount(id: string): Observable<Account> {
    return this.http.post<Account>(`/accounts/${id}/activate`, {});
  }

  deactivateAccount(id: string): Observable<Account> {
    return this.http.post<Account>(`/accounts/${id}/deactivate`, {});
  }

  closeAccount(id: string, reason: string): Observable<Account> {
    return this.http.post<Account>(`/accounts/${id}/close`, { reason });
  }

  // ========== BALANCE OPERATIONS ==========

  checkBalance(accountNumber: string): Observable<{ balance: number; availableBalance: number }> {
    return this.http.get<{ balance: number; availableBalance: number }>(
      `/accounts/${accountNumber}/balance`
    );
  }

  getAccountStatement(
    accountId: string, 
    fromDate: Date, 
    toDate: Date
  ): Observable<any> {
    const params = new HttpParams()
      .set('fromDate', fromDate.toISOString())
      .set('toDate', toDate.toISOString());

    return this.http.get(`/accounts/${accountId}/statement`, { params });
  }
}


