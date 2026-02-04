// core/services/implementations/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  // ========== GET USER BY ID ==========
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`/users/${id}`);
  }

  // ========== GET USER BY CUSTOMER ID ==========
  getUserByCustomerId(customerId: string): Observable<User> {
    return this.http.get<User>(`/users/customer/${customerId}`);
  }

  // ========== LIST USERS ==========
  getUsers(page: number = 1, pageSize: number = 10, role?: string): Observable<{ data: User[]; total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (role) {
      params = params.set('role', role);
    }

    return this.http.get<{ data: User[]; total: number }>('/users', { params });
  }

  // ========== UPDATE USER ==========
  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`/users/${id}`, data);
  }

  // ========== DELETE USER ==========
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`/users/${id}`);
  }
}
