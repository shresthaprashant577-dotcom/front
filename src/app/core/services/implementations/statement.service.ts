// core/services/implementations/statement.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { 
  Statement, 
  StatementRequest, 
  StatementFilter, 
  StatementListResponse,
  GenerateStatementResponse,
  StatementStats,
  StatementSummary
} from '../../models/statement.model';
import { StatementFormat } from '../../models/statement.model';

@Injectable({
  providedIn: 'root'
})
export class StatementService {
  constructor(private http: HttpClient) {}

  // ========== STATEMENT GENERATION ==========

  generateStatement(request: StatementRequest): Observable<GenerateStatementResponse> {
    return this.http.post<GenerateStatementResponse>('/statements/generate', request);
  }
  

generateQuickStatement(
  accountId: string,
  format: StatementFormat = StatementFormat.PDF
): Observable<GenerateStatementResponse> {

  const request: StatementRequest = {
    accountId,
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    format, // ✅ now correct
    includeTransactions: true,
    emailCopy: false
  };

  return this.generateStatement(request);
}


  // ========== STATEMENT RETRIEVAL ==========

  getStatements(filter?: StatementFilter): Observable<StatementListResponse> {
    let params = new HttpParams();
    
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = filter[key as keyof StatementFilter];
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            params = params.set(key, value.toISOString());
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }

    return this.http.get<StatementListResponse>('/statements', { params });
  }

  getStatementById(id: string): Observable<Statement> {
    return this.http.get<Statement>(`/statements/${id}`);
  }

  getStatementByAccount(accountId: string, page: number = 1, pageSize: number = 10): Observable<StatementListResponse> {
    const params = new HttpParams()
      .set('accountId', accountId)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<StatementListResponse>('/statements/by-account', { params });
  }

  getCustomerStatements(customerId: string): Observable<Statement[]> {
    return this.http.get<Statement[]>(`/statements/customer/${customerId}`);
  }

  getMyStatements(): Observable<Statement[]> {
    return this.http.get<Statement[]>('/statements/my-statements');
  }

  // ========== STATEMENT DOWNLOAD ==========

  downloadStatement(id: string, format: string = 'PDF'): Observable<Blob> {
    const params = new HttpParams().set('format', format);
    return this.http.get(`/statements/${id}/download`, { 
      params, 
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => response.body!)
    );
  }

  downloadStatementByPeriod(accountId: string, startDate: Date, endDate: Date): Observable<Blob> {
    const params = new HttpParams()
      .set('accountId', accountId)
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.get('/statements/download-by-period', { 
      params, 
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => response.body!)
    );
  }

  // ========== STATEMENT PERIODS ==========

  getStatementPeriods(): Observable<{ 
    monthly: string[], 
    quarterly: string[], 
    yearly: string[] 
  }> {
    return this.http.get<{ monthly: string[], quarterly: string[], yearly: string[] }>('/statements/periods');
  }

  getAvailablePeriods(accountId: string): Observable<{ period: string; startDate: Date; endDate: Date }[]> {
    return this.http.get<{ period: string; startDate: Date; endDate: Date }[]>(
      `/statements/${accountId}/available-periods`
    );
  }

  // ========== STATEMENT SUMMARY & STATS ==========

  getStatementSummary(accountId: string, period: string): Observable<StatementSummary> {
    const params = new HttpParams()
      .set('accountId', accountId)
      .set('period', period);

    return this.http.get<StatementSummary>('/statements/summary', { params });
  }

  getAccountStatementSummary(accountId: string): Observable<{
    lastStatementDate: Date;
    totalStatements: number;
    averageBalance: number;
    totalFees: number;
    totalInterest: number;
  }> {
    return this.http.get<{
      lastStatementDate: Date;
      totalStatements: number;
      averageBalance: number;
      totalFees: number;
      totalInterest: number;
    }>(`/statements/account/${accountId}/summary`);
  }

  getStatementStats(): Observable<StatementStats> {
    return this.http.get<StatementStats>('/statements/stats');
  }

  // ========== EMAIL & NOTIFICATION ==========

  emailStatement(id: string, email?: string): Observable<{ success: boolean; message: string }> {
    const body = email ? { email } : {};
    return this.http.post<{ success: boolean; message: string }>(`/statements/${id}/email`, body);
  }

  // ========== MANAGEMENT ==========

  regenerateStatement(id: string): Observable<Statement> {
    return this.http.post<Statement>(`/statements/${id}/regenerate`, {});
  }

  finalizeStatement(id: string): Observable<Statement> {
    return this.http.put<Statement>(`/statements/${id}/finalize`, {});
  }

  deleteStatement(id: string): Observable<void> {
    return this.http.delete<void>(`/statements/${id}`);
  }

  // ========== UTILITY METHODS ==========

  previewStatement(request: StatementRequest): Observable<Statement> {
    return this.http.post<Statement>('/statements/preview', request);
  }

  validateStatementDates(accountId: string, startDate: Date, endDate: Date): Observable<{
    isValid: boolean;
    message?: string;
    overlappingStatements?: Statement[];
  }> {
    const params = new HttpParams()
      .set('accountId', accountId)
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.get<{
      isValid: boolean;
      message?: string;
      overlappingStatements?: Statement[];
    }>('/statements/validate-dates', { params });
  }

  // ========== FORMAT CONVERSION ==========

  convertStatementFormat(id: string, fromFormat: string, toFormat: string): Observable<Blob> {
    const params = new HttpParams()
      .set('fromFormat', fromFormat)
      .set('toFormat', toFormat);

    return this.http.get(`/statements/${id}/convert`, { 
      params, 
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => response.body!)
    );
  }

  // ========== BULK OPERATIONS ==========

  generateBulkStatements(accountIds: string[], period: string): Observable<{ 
    success: number; 
    failed: number; 
    results: { accountId: string; success: boolean; message?: string }[] 
  }> {
    return this.http.post<{ 
      success: number; 
      failed: number; 
      results: { accountId: string; success: boolean; message?: string }[] 
    }>('/statements/bulk-generate', { accountIds, period });
  }

  // ========== HELPER METHODS ==========

  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  getStatementFilename(statement: Statement, format: string): string {
    const accountNumber = statement.accountNumber.replace(/\s+/g, '');
    const period = `${statement.periodStart.toISOString().split('T')[0]}_to_${statement.periodEnd.toISOString().split('T')[0]}`;
    return `Statement_${accountNumber}_${period}.${format.toLowerCase()}`;
  }

  formatStatementPeriod(statement: Statement): string {
    const start = new Date(statement.periodStart).toLocaleDateString();
    const end = new Date(statement.periodEnd).toLocaleDateString();
    return `${start} - ${end}`;
  }

  calculateNetAmount(statement: Statement): number {
    return statement.totalCredits - statement.totalDebits;
  }

  filterTransactionsByType(statement: Statement, type: string): Statement['transactions'] {
    return statement.transactions.filter(tx => tx.type === type);
  }

  getTransactionSummary(statement: Statement): {
    deposits: number;
    withdrawals: number;
    transfers: number;
    fees: number;
    interest: number;
  } {
    return {
      deposits: statement.transactions.filter(t => t.type === 'DEPOSIT').length,
      withdrawals: statement.transactions.filter(t => t.type === 'WITHDRAWAL').length,
      transfers: statement.transactions.filter(t => t.type.includes('TRANSFER')).length,
      fees: statement.transactions.filter(t => t.type === 'FEE').length,
      interest: statement.transactions.filter(t => t.type === 'INTEREST').length
    };
  }
}