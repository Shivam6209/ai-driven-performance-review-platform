import { apiService } from './api';

export interface Organization {
  id: string;
  name: string;
  domain: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationStats {
  totalEmployees: number;
  totalInvitations: number;
  pendingInvitations: number;
  totalDepartments: number;
}

export interface UpdateOrganizationRequest {
  name: string;
  domain: string;
}

export const organizationsService = {
  /**
   * Get current user's organization
   */
  getCurrentOrganization: async (): Promise<Organization> => {
    const response = await apiService.get<Organization>('/organizations/current');
    return response.data;
  },

  /**
   * Get current organization statistics
   */
  getCurrentOrganizationStats: async (): Promise<OrganizationStats> => {
    const response = await apiService.get<OrganizationStats>('/organizations/current/stats');
    return response.data;
  },

  /**
   * Update current organization
   */
  updateCurrentOrganization: async (data: UpdateOrganizationRequest): Promise<Organization> => {
    const response = await apiService.patch<Organization>('/organizations/current', data);
    return response.data;
  },

  /**
   * Get organization by ID
   */
  getOrganizationById: async (id: string): Promise<Organization> => {
    const response = await apiService.get<Organization>(`/organizations/${id}`);
    return response.data;
  }
}; 