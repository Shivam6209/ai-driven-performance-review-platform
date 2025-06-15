export * from './auth';
export * from './review';
export * from './okr';
export * from './feedback';
export * from './api';

// User roles enum
export enum UserRole {
  ADMIN = 'admin',
  HR = 'hr',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  employeeId?: string;
  departmentId?: string;
  managerId?: string;
  profileImageUrl?: string;
  isActive: boolean;
  organizationId?: string;
}

// Employee interface (extends User with additional fields)
export interface Employee extends User {
  employeeCode: string;
  displayName?: string;
  jobTitle?: string;
  hireDate?: string;
  employmentStatus: 'active' | 'inactive' | 'terminated';
  timezone?: string;
  createdAt: string;
  updatedAt: string;
}

// Employee DTOs
export interface CreateEmployeeDto {
  employeeCode: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  jobTitle?: string;
  departmentId?: string;
  managerId?: string;
  hireDate?: string;
  role: UserRole;
  timezone?: string;
}

export interface UpdateEmployeeDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  jobTitle?: string;
  departmentId?: string;
  managerId?: string;
  hireDate?: string;
  role?: UserRole;
  employmentStatus?: 'active' | 'inactive' | 'terminated';
  timezone?: string;
  profileImageUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserRegistrationData {
  firstName: string;
  lastName: string;
  role: 'admin' | 'hr' | 'manager' | 'employee';
  email?: string;
  password?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'hr' | 'manager' | 'employee';
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
} 