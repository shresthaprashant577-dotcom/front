import { Observable } from 'rxjs';
import { AuditLog, AuditLogFilter } from '../../models/audit-model.model';

export interface IAuditService {
  getAuditLogs(filter?: AuditLogFilter): Observable<AuditLog[]>;
  logAction(action: string, entityType: string, entityId: string, details?: any): Observable<void>;
  getAuditStats(): Observable<{
    totalLogs: number;
    todayLogs: number;
    byAction: Record<string, number>;
    byEntity: Record<string, number>;
  }>;
  exportAuditLogs(filter?: AuditLogFilter): Observable<Blob>;
}