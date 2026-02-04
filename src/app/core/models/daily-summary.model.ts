export interface DailySummary {
  id: string;
  date: Date;
  tellerId: string;
  tellerName: string;

  // Opening and closing balances
  openingBalance: number;
  closingBalance: number;
  expectedBalance: number;
  actualBalance: number;
  variance: number;

  // Transaction totals
  totalDeposits: number;
  totalWithdrawals: number;
  totalTransfers: number;
  totalCashIn: number;
  totalCashOut: number;
  totalChecks: number;

  // Transaction counts
  depositCount: number;
  withdrawalCount: number;
  transferCount: number;
  checkCount: number;

  // Status
  status: 'open' | 'finalized' | 'reconciled' | 'discrepancy';

  // Timestamps
  openedAt: Date;
  finalizedAt?: Date;
  reconciledAt?: Date;

  // Transactions
  transactions: Transaction[];

  // Adjustments
  adjustments: Adjustment[];

  // Notes
  notes?: string;
}

export interface Adjustment {
  id: string;
  amount: number;
  reason: string;
  type: 'add' | 'subtract';
  createdAt: Date;
  createdBy: string;
}

/**
 * All supported transaction types
 */
export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'transfer'
  | 'check'
  | 'payment'
  | 'fee'
  | 'adjustment'; // ✅ REQUIRED

/**
 * Base transaction model
 */
export interface Transaction {
  id: string;
  timestamp: Date;
  type: TransactionType;
  amount: number;
  accountNumber: string;
  accountHolder: string;
  reference: string;
  tellerId: string;
  tellerName: string;
  status: 'completed' | 'pending' | 'cancelled';
  description?: string;

  /**
   * Transaction-specific data
   * (deposit method, transfer details, etc.)
   */
  metadata?: {
    depositMethod?: 'cash' | 'check' | 'transfer';
    withdrawalMethod?: 'cash' | 'check';
    transferType?: 'internal' | 'external';
    toAccountNumber?: string;
    toAccountHolder?: string;
    checkNumber?: string;
    [key: string]: any;
  };
}
