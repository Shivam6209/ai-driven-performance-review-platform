import { apiService } from './api';
import {
  Role,
  Permission,
  RoleAssignment,
  CreateRoleDto,
  UpdateRoleDto,
  AssignRoleDto,
  DelegateRoleDto,
  CreatePermissionDto,
} from '../types/rbac';

const API_ENDPOINT = '/rbac';

export const RbacService = {
  // Role methods
  async createRole(roleData: CreateRoleDto): Promise<Role> {
    const response = await apiService.post<Role>(`${API_ENDPOINT}/roles`, roleData);
    return response.data;
  },

  async getAllRoles(): Promise<Role[]> {
    const response = await apiService.get<Role[]>(`${API_ENDPOINT}/roles`);
    return response.data;
  },

  async getRoleById(id: string): Promise<Role> {
    const response = await apiService.get<Role>(`${API_ENDPOINT}/roles/${id}`);
    return response.data;
  },

  async updateRole(id: string, roleData: UpdateRoleDto): Promise<Role> {
    const response = await apiService.patch<Role>(`${API_ENDPOINT}/roles/${id}`, roleData);
    return response.data;
  },

  async deleteRole(id: string): Promise<void> {
    await apiService.delete(`${API_ENDPOINT}/roles/${id}`);
  },

  async getRoleHierarchy(id: string): Promise<Role[]> {
    const response = await apiService.get<Role[]>(`${API_ENDPOINT}/roles/${id}/hierarchy`);
    return response.data;
  },

  // Permission methods
  async createPermission(permissionData: CreatePermissionDto): Promise<Permission> {
    const response = await apiService.post<Permission>(`${API_ENDPOINT}/permissions`, permissionData);
    return response.data;
  },

  async getAllPermissions(): Promise<Permission[]> {
    const response = await apiService.get<Permission[]>(`${API_ENDPOINT}/permissions`);
    return response.data;
  },

  // Role assignment methods
  async assignRole(assignmentData: AssignRoleDto): Promise<RoleAssignment> {
    const response = await apiService.post<RoleAssignment>(`${API_ENDPOINT}/assignments`, assignmentData);
    return response.data;
  },

  async assignRoleToEmployee(assignmentData: AssignRoleDto): Promise<RoleAssignment> {
    const response = await apiService.post<RoleAssignment>(`${API_ENDPOINT}/assignments`, assignmentData);
    return response.data;
  },

  async revokeRoleFromEmployee(assignmentId: string): Promise<void> {
    await apiService.delete(`${API_ENDPOINT}/assignments/${assignmentId}`);
  },

  async getEmployeeRoles(employeeId: string): Promise<RoleAssignment[]> {
    const response = await apiService.get<RoleAssignment[]>(
      `${API_ENDPOINT}/employees/${employeeId}/roles`
    );
    return response.data;
  },

  async delegateRole(delegateData: DelegateRoleDto): Promise<RoleAssignment> {
    const response = await apiService.post<RoleAssignment>(`${API_ENDPOINT}/delegate`, delegateData);
    return response.data;
  },

  // Permission checking
  async checkPermission(
    resource: string,
    action: string,
    contextId?: string
  ): Promise<{ hasPermission: boolean }> {
    const params: any = { resource, action };
    if (contextId) {
      params.contextId = contextId;
    }

    const response = await apiService.get<{ hasPermission: boolean }>(
      `${API_ENDPOINT}/check-permission`, params
    );
    return response.data;
  },

  // User permission management
  async updateUserPermissions(
    employeeId: string,
    permissions: Array<{ resource: string; action: string; granted: boolean }>
  ): Promise<any> {
    const response = await apiService.post(`${API_ENDPOINT}/user-permissions`, {
      employeeId,
      permissions,
    });
    return response.data;
  },

  async getUserPermissions(employeeId: string): Promise<any[]> {
    const response = await apiService.get<any[]>(`${API_ENDPOINT}/user-permissions/${employeeId}`);
    return response.data;
  },

  async getAllUserPermissions(employeeId: string): Promise<{
    rolePermissions: Array<{ resource: string; action: string; source: string }>;
    userPermissions: Array<{ resource: string; action: string; granted: boolean }>;
  }> {
    const response = await apiService.get<{
      rolePermissions: Array<{ resource: string; action: string; source: string }>;
      userPermissions: Array<{ resource: string; action: string; granted: boolean }>;
    }>(`${API_ENDPOINT}/all-permissions/${employeeId}`);
    return response.data;
  },

  async removeUserPermission(
    employeeId: string,
    resource: string,
    action: string
  ): Promise<void> {
    await apiService.delete(`${API_ENDPOINT}/user-permissions/${employeeId}/${resource}/${action}`);
  },
}; 