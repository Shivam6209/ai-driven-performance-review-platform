import { apiService } from './api';

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  hrPersonnel?: string[];
  employeeCount?: number;
}

export const departmentsService = {
  async getAll(): Promise<Department[]> {
    const response = await apiService.get<Department[]>('/departments');
    return response.data;
  },

  async getById(id: string): Promise<Department> {
    const response = await apiService.get<Department>(`/departments/${id}`);
    return response.data;
  },

  async create(data: Partial<Department>): Promise<Department> {
    const response = await apiService.post<Department>('/departments', data);
    return response.data;
  },

  async update(id: string, data: Partial<Department>): Promise<Department> {
    const response = await apiService.patch<Department>(`/departments/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiService.delete(`/departments/${id}`);
  },

  async assignRoles(id: string, data: { managerId?: string; hrPersonnelIds?: string[] }): Promise<Department> {
    const response = await apiService.post<Department>(`/departments/${id}/assign-roles`, data);
    return response.data;
  },
}; 