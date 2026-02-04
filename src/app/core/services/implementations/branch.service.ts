// core/services/implementations/branch.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Branch } from '../../models/branch.model';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  constructor(private http: HttpClient) {}

  // ========== BRANCH OPERATIONS ==========

  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>('/branches');
  }

  getBranchById(id: string): Observable<Branch> {
    return this.http.get<Branch>(`/branches/${id}`);
  }

  getBranchByCode(branchCode: string): Observable<Branch> {
    return this.http.get<Branch>(`/branches/code/${branchCode}`);
  }

  // ========== BRANCH MANAGEMENT ==========

  createBranch(data: any): Observable<Branch> {
    return this.http.post<Branch>('/branches', data);
  }

  updateBranch(id: string, data: Partial<Branch>): Observable<Branch> {
    return this.http.put<Branch>(`/branches/${id}`, data);
  }

  deactivateBranch(id: string): Observable<Branch> {
    return this.http.post<Branch>(`/branches/${id}/deactivate`, {});
  }

  activateBranch(id: string): Observable<Branch> {
    return this.http.post<Branch>(`/branches/${id}/activate`, {});
  }

  // ========== BRANCH STATISTICS ==========

  getBranchStats(branchId: string): Observable<any> {
    return this.http.get<any>(`/branches/${branchId}/stats`);
  }

  getTodaysTransactions(branchId: string): Observable<any> {
    return this.http.get<any>(`/branches/${branchId}/transactions/today`);
  }
}
