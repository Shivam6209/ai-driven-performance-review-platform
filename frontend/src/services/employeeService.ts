import { apiService } from './api';
import { Employee, Department } from '../types/employee';

export const employeeService = {
  /**
   * Get all employees
   */
  getAllEmployees: async () => {
    const response = await apiService.get<Employee[]>('/employees');
    return response.data;
  },

  /**
   * Get employee by ID
   */
  getEmployeeById: async (id: string) => {
    const response = await apiService.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  /**
   * Get employees by department
   */
  getEmployeesByDepartment: async (departmentId: string) => {
    const response = await apiService.get<Employee[]>(`/employees/department/${departmentId}`);
    return response.data;
  },

  /**
   * Get employees by manager
   */
  getEmployeesByManager: async (managerId: string) => {
    const response = await apiService.get<Employee[]>(`/employees/manager/${managerId}`);
    return response.data;
  },

  /**
   * Create a new employee
   */
  createEmployee: async (employeeData: Omit<Employee, 'id'>) => {
    const response = await apiService.post<Employee>('/employees', employeeData);
    return response.data;
  },

  /**
   * Update an employee
   */
  updateEmployee: async (id: string, employeeData: Partial<Employee>) => {
    const response = await apiService.put<Employee>(`/employees/${id}`, employeeData);
    return response.data;
  },

  /**
   * Delete an employee
   */
  deleteEmployee: async (id: string) => {
    const response = await apiService.delete<void>(`/employees/${id}`);
    return response.data;
  },

  /**
   * Get all departments
   */
  getAllDepartments: async () => {
    const response = await apiService.get<Department[]>('/departments');
    return response.data;
  },

  /**
   * Get department by ID
   */
  getDepartmentById: async (id: string) => {
    const response = await apiService.get<Department>(`/departments/${id}`);
    return response.data;
  },

  /**
   * Create a new department
   */
  createDepartment: async (departmentData: Omit<Department, 'id'>) => {
    const response = await apiService.post<Department>('/departments', departmentData);
    return response.data;
  },

  /**
   * Update a department
   */
  updateDepartment: async (id: string, departmentData: Partial<Department>) => {
    const response = await apiService.put<Department>(`/departments/${id}`, departmentData);
    return response.data;
  },

  /**
   * Delete a department
   */
  deleteDepartment: async (id: string) => {
    const response = await apiService.delete<void>(`/departments/${id}`);
    return response.data;
  },

  /**
   * Get available peers for review
   */
  getAvailablePeersForReview: async (employeeId: string) => {
    const response = await apiService.get<Employee[]>(`/employees/${employeeId}/available-peers`);
    return response.data;
  },

  /**
   * Get organization chart
   */
  getOrganizationChart: async () => {
    const response = await apiService.get('/employees/org-chart');
    return response.data;
  },

  /**
   * Get employee reporting structure
   */
  getEmployeeReportingStructure: async (employeeId: string) => {
    const response = await apiService.get(`/employees/${employeeId}/reporting-structure`);
    return response.data;
  },
}; 