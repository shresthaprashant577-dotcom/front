// core/models/auth.model.ts
import { User, UserRole } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth: string;   // ISO string (IMPORTANT)
  address: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  token: string;
  refreshToken: string;
  tokenExpiry: string;
  isFirstTimeLogin: boolean;
}

export type { User, UserRole };
