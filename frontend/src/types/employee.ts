export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  phoneNumber?: string;
  profileImage?: string;
  bio?: string;
  departmentId: string;
  managerId?: string;
  isActive: boolean;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
  // Computed properties for backward compatibility
  role?: 'admin' | 'hr' | 'manager' | 'employee';
  department?: string;
  name?: string;
  avatar_url?: string;
  profileImageUrl?: string;
  lastLoginAt?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId: string;
  parentDepartmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  departmentBreakdown: {
    departmentId: string;
    departmentName: string;
    employeeCount: number;
  }[];
  roleDistribution: {
    role: string;
    count: number;
  }[];
  recentActivity: {
    type: 'login' | 'review' | 'feedback' | 'goal';
    employeeId: string;
    timestamp: string;
    details: string;
  }[];
} 
 