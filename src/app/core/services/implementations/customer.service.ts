// core/services/implementations/customer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { Account } from '../../models/account.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private http: HttpClient) {}

  // ========== CUSTOMER OPERATIONS ==========

  /**
   * Get all customers with optional pagination
   */
  getCustomers(page: number = 1, pageSize: number = 10): Observable<{ data: User[]; total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<{ data: User[]; total: number }>('/customers', { params });
  }

  /**
   * Get a single customer by ID
   */
  getCustomerById(id: string): Observable<User> {
    return this.http.get<User>(`/customers/${id}`);
  }

  /**
   * Get a customer by email or phone (optional search endpoint)
   */
  getCustomerByQuery(query: string): Observable<User[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<User[]>(`/customers/search`, { params });
  }

  // ========== CUSTOMER MANAGEMENT ==========

  /**
   * Create a new customer
   */
  createCustomer(customerData: Partial<User>): Observable<User> {
    return this.http.post<User>('/customers', customerData);
  }

  /**
   * Update existing customer
   */
  updateCustomer(id: string, customerData: Partial<User>): Observable<User> {
    return this.http.put<User>(`/customers/${id}`, customerData);
  }

  /**
   * Delete a customer
   */
  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`/customers/${id}`);
  }

  // ========== CUSTOMER STATUS ACTIONS ==========

  /**
   * Activate a customer
   */
  activateCustomer(id: string): Observable<User> {
    return this.http.post<User>(`/customers/${id}/activate`, {});
  }

  /**
   * Deactivate a customer
   */
  deactivateCustomer(id: string): Observable<User> {
    return this.http.post<User>(`/customers/${id}/deactivate`, {});
  }

  // ========== CUSTOMER ACCOUNTS ==========

  /**
   * Get all accounts of a specific customer
   */
  getCustomerAccounts(customerId: string): Observable<Account[]> {
    return this.http.get<Account[]>(`/customers/${customerId}/accounts`);
  }
}
