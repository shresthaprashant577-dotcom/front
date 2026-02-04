// core/models/statement.model.ts
export interface Statement {
  id: string;
  statementId: string;
  accountId: string;
  accountNumber: string;
  accountType: string;
  customerId: string;
  customerName: string;
  periodStart: Date;
  periodEnd: Date;
  openingBalance: number;
  closingBalance: number;
  totalCredits: number;
  totalDebits: number;
  interestEarned: number;
  feesCharged: number;
  transactions: StatementTransaction[];
  generatedAt: Date;
  isFinalized: boolean;
  branchId?: string;
  branchName?: string;
}

export interface StatementTransaction {
  id: string;
  date: Date;
  description: string;
  referenceNumber: string;
  type: StatementTransactionType;
  amount: number;
  runningBalance: number;
  status: string;
  category?: string;
}

export type StatementTransactionType = 
  | 'DEPOSIT' 
  | 'WITHDRAWAL' 
  | 'TRANSFER_IN' 
  | 'TRANSFER_OUT' 
  | 'INTEREST' 
  | 'FEE' 
  | 'PAYMENT' 
  | 'REVERSAL' 
  | 'ADJUSTMENT';

export interface StatementPeriod {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isClosed: boolean;
}

export interface StatementRequest {
  accountId: string;
  startDate: Date;
  endDate: Date;
  format: StatementFormat;
  includeTransactions: boolean;
  emailCopy?: boolean;
}

export enum StatementFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  HTML = 'HTML'
}



export interface StatementSummary {
  period: string;
  totalTransactions: number;
  netAmount: number;
  openingBalance: number;
  closingBalance: number;
}

export interface GenerateStatementResponse {
  statementId: string;
  downloadUrl: string;
  expiresAt: Date;
  message: string;
}

export interface StatementFilter {
  accountId?: string;
  customerId?: string;
  startDate?: Date;
  endDate?: Date;
  period?: string; // 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  format?: StatementFormat;
  page?: number;
  pageSize?: number;
}

export interface StatementListResponse {
  data: Statement[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// For statement statistics
export interface StatementStats {
  totalStatements: number;
  currentMonthStatements: number;
  pendingStatements: number;
  totalTransactionsInStatements: number;
  averageTransactionsPerStatement: number;



}


