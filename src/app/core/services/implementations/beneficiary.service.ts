// core/services/implementations/beneficiary.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  nickname?: string;
  email?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryService {
  constructor(private http: HttpClient) {}

  getBeneficiaries(): Observable<Beneficiary[]> {
    return this.http.get<Beneficiary[]>('/beneficiaries');
  }

  getBeneficiaryById(id: string): Observable<Beneficiary> {
    return this.http.get<Beneficiary>(`/beneficiaries/${id}`);
  }

  createBeneficiary(data: any): Observable<Beneficiary> {
    return this.http.post<Beneficiary>('/beneficiaries', data);
  }

  updateBeneficiary(id: string, data: Partial<Beneficiary>): Observable<Beneficiary> {
    return this.http.put<Beneficiary>(`/beneficiaries/${id}`, data);
  }

  deleteBeneficiary(id: string): Observable<void> {
    return this.http.delete<void>(`/beneficiaries/${id}`);
  }

  getMyBeneficiaries(): Observable<Beneficiary[]> {
    return this.http.get<Beneficiary[]>('/beneficiaries/my-beneficiaries');
  }
}