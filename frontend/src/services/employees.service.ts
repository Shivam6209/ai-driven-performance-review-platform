import { apiService } from './api';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department?: {
    id: string;
    name: string;
  };
  isActive: boolean;
}

export interface AssignDepartmentDto {
  employeeId: string;
  departmentId?: string;
}

export const employeesService = {
  async getAll(): Promise<Employee[]> {
    const response = await apiService.get<Employee[]>('/employees');
    return response.data;
  },

  async getUnassigned(): Promise<Employee[]> {
    const response = await apiService.get<Employee[]>('/employees/unassigned');
    return response.data;
  },

  async getById(id: string): Promise<Employee> {
    const response = await apiService.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  async assignDepartment(data: AssignDepartmentDto): Promise<Employee> {
    const response = await apiService.post<Employee>('/employees/assign-department', data);
    return response.data;
  },

  async removeFromDepartment(employeeId: string): Promise<Employee> {
    const response = await apiService.post<Employee>(`/employees/${employeeId}/remove-from-department`, {});
    return response.data;
  },

  async create(data: Partial<Employee>): Promise<Employee> {
    const response = await apiService.post<Employee>('/employees', data);
    return response.data;
  },

  async update(id: string, data: Partial<Employee>): Promise<Employee> {
    const response = await apiService.patch<Employee>(`/employees/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiService.delete(`/employees/${id}`);
  },
}; 