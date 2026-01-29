import { TransactionType } from "./transaction.model";

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  format: ReportFormat;
  generatedBy: string;
  generatedAt: Date;
  periodStart: Date;
  periodEnd: Date;
  parameters: Record<string, any>;
  fileUrl?: string;
  status: ReportStatus;
  data: any;
  createdAt: Date;
}

export type ReportType = 'Financial' | 'Transaction' | 'Customer' | 'Account' | 'Audit' | 'Performance';
export type ReportFormat = 'PDF' | 'Excel' | 'CSV' | 'HTML';
export type ReportStatus = 'Generating' | 'Completed' | 'Failed';

export interface FinancialReport extends Report {
  type: 'Financial';
  data: {
    totalAssets: number;
    totalLiabilities: number;
    netIncome: number;
    revenue: number;
    expenses: number;
    profitMargin: number;
    growthRate: number;
    monthOverMonth: Record<string, number>;
  };
}

export interface TransactionReport extends Report {
  type: 'Transaction';
  data: {
    totalTransactions: number;
    totalAmount: number;
    transactionTypes: Record<TransactionType, number>;
    topAccounts: Array<{ accountId: string; transactionCount: number; totalAmount: number }>;
    dailyVolume: Array<{ date: string; count: number; amount: number }>;
  };
}

export interface ReportRequest {
  type: ReportType;
  format: ReportFormat;
  periodStart: Date;
  periodEnd: Date;
  parameters?: Record<string, any>;
}