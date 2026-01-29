export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: Date;
  ssn: string; // Social Security Number (masked)
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
  isActive: boolean;
  profileImage?: string;
  branchId?: string;
  employeeId?: string;
  customerId?: string;
}

export type UserRole = 'Admin' | 'Manager' | 'Teller' | 'Customer';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: Date;
  ssn: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}