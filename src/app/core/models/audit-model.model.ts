import { UserRole } from "./user.model";

export interface AuditLog {
  id: string;
  userId: string;
  userRole: UserRole;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  status: 'Success' | 'Failed';
  errorMessage?: string;
}

export type AuditAction = 'Create' | 'Read' | 'Update' | 'Delete' | 'Login' | 'Logout' | 'Export' | 'Import' | 'Approve' | 'Reject';
export type EntityType = 'User' | 'Account' | 'Transaction' | 'Branch' | 'Beneficiary' | 'Report' | 'AuditLog';

export interface AuditLogFilter {
  userId?: string;
  action?: AuditAction;
  entityType?: EntityType;
  startDate?: Date;
  endDate?: Date;
  status?: 'Success' | 'Failed';
}