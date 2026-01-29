export interface Beneficiary {
  id: string;
  userId: string;
  name: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  branchName?: string;
  nickname?: string;
  type: BeneficiaryType;
  email?: string;
  phoneNumber?: string;
  maxTransferLimit?: number;
  dailyLimit?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BeneficiaryType = 'Internal' | 'Domestic' | 'International';

export interface BeneficiaryCreationRequest {
  name: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  branchName?: string;
  nickname?: string;
  type: BeneficiaryType;
  email?: string;
  phoneNumber?: string;
  maxTransferLimit?: number;
}

export interface TransferToBeneficiaryRequest {
  beneficiaryId: string;
  fromAccountId: string;
  amount: number;
  description: string;
  currency?: string;
}