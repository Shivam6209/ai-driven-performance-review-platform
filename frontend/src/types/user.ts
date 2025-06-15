export interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'hr_admin' | 'executive';
  departmentId?: string;
  teamId?: string;
  position?: string;
  hireDate?: string;
  profileImage?: string;
  managerId?: string;
  directReports?: string[];
} 