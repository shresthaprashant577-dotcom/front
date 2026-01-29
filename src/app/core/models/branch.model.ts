export interface Branch {
  id: string;
  branchCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  email: string;
  managerId: string;
  openingDate: Date;
  status: BranchStatus;
  operatingHours: OperatingHours;
  services: BranchService[];
  totalAccounts: number;
  totalBalance: number;
  employees: number;
  createdAt: Date;
  updatedAt: Date;
}

export type BranchStatus = 'Active' | 'Inactive' | 'Closed' | 'UnderConstruction';
export type BranchService = 'PersonalBanking' | 'BusinessBanking' | 'Loans' | 'Investments' | 'WealthManagement' | 'International';

export interface OperatingHours {
  monday: { open: string; close: string };
  tuesday: { open: string; close: string };
  wednesday: { open: string; close: string };
  thursday: { open: string; close: string };
  friday: { open: string; close: string };
  saturday: { open: string; close: string };
  sunday: { open: string; close: string };
}

export interface BranchCreationRequest {
  branchCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  email: string;
  managerId: string;
  services: BranchService[];
}