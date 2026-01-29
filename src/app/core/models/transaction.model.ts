export interface Transaction {
  id: string;
  transactionId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  status: TransactionStatus;
  category: TransactionCategory;
  date: Date;
  timestamp: Date;
  sourceAccount?: string;
  destinationAccount?: string;
  beneficiaryId?: string;
  tellerId?: string;
  referenceNumber: string;
  balanceAfter: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export type TransactionType = 'Deposit' | 'Withdrawal' | 'Transfer' | 'Payment' | 'Fee' | 'Interest' | 'Reversal';
export type TransactionStatus = 'Pending' | 'Completed' | 'Failed' | 'Cancelled' | 'Reversed';
export type TransactionCategory = 'ATM' | 'POS' | 'Online' | 'Branch' | 'Check' | 'AutoPay' | 'Manual';

export interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
  currency?: string;
}

export interface DepositRequest {
  accountId: string;
  amount: number;
  description: string;
  method: 'Cash' | 'Check' | 'Transfer';
  tellerId?: string;
}

export interface WithdrawalRequest {
  accountId: string;
  amount: number;
  description: string;
  method: 'Cash' | 'Check';
  tellerId?: string;
}

export interface TransactionFilter {
  startDate?: Date;
  endDate?: Date;
  type?: TransactionType;
  status?: TransactionStatus;
  minAmount?: number;
  maxAmount?: number;
  accountId?: string;
}