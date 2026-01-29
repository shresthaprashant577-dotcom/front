import { Transaction } from "./transaction.model";

export interface Account {
  id: string;
  accountNumber: string;
  userId: string;
  branchId: string;
  type: AccountType;
  status: AccountStatus;
  balance: number;
  availableBalance: number;
  currency: string;
  interestRate: number;
  openingDate: Date;
  lastActivityDate: Date;
  minimumBalance: number;
  overdraftLimit: number;
  monthlyFee: number;
  transactions: Transaction[];
  createdAt: Date;
  updatedAt: Date;
}

export type AccountType = 'Checking' | 'Savings' | 'Business' | 'FixedDeposit' | 'Loan' | 'CreditCard';
export type AccountStatus = 'Active' | 'Inactive' | 'Closed' | 'Suspended' | 'Dormant';

export interface AccountSummary {
  totalAccounts: number;
  totalBalance: number;
  activeAccounts: number;
  accountsByType: Record<AccountType, number>;
}

export interface AccountCreationRequest {
  userId: string;
  branchId: string;
  type: AccountType;
  initialDeposit: number;
  currency?: string;
}

export interface AccountUpdateRequest {
  status?: AccountStatus;
  overdraftLimit?: number;
  monthlyFee?: number;
}