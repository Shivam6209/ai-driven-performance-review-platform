import axios from 'axios';
import { API_URL } from '../config';
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

const API_ENDPOINT = `${API_URL}/rbac`;

export const RbacService = {
  // Role methods
  async createRole(roleData: CreateRoleDto): Promise<Role> {
    const response = await axios.post<Role>(`${API_ENDPOINT}/roles`, roleData);
    return response.data;
  },

  async getAllRoles(): Promise<Role[]> {
    const response = await axios.get<Role[]>(`${API_ENDPOINT}/roles`);
    return response.data;
  },

  async getRoleById(id: string): Promise<Role> {
    const response = await axios.get<Role>(`${API_ENDPOINT}/roles/${id}`);
    return response.data;
  },

  async updateRole(id: string, roleData: UpdateRoleDto): Promise<Role> {
    const response = await axios.patch<Role>(`${API_ENDPOINT}/roles/${id}`, roleData);
    return response.data;
  },

  async deleteRole(id: string): Promise<void> {
    await axios.delete(`${API_ENDPOINT}/roles/${id}`);
  },

  async getRoleHierarchy(id: string): Promise<Role[]> {
    const response = await axios.get<Role[]>(`${API_ENDPOINT}/roles/${id}/hierarchy`);
    return response.data;
  },

  // Permission methods
  async createPermission(permissionData: CreatePermissionDto): Promise<Permission> {
    const response = await axios.post<Permission>(`${API_ENDPOINT}/permissions`, permissionData);
    return response.data;
  },

  async getAllPermissions(): Promise<Permission[]> {
    const response = await axios.get<Permission[]>(`${API_ENDPOINT}/permissions`);
    return response.data;
  },

  // Role assignment methods
  async assignRole(assignmentData: AssignRoleDto): Promise<RoleAssignment> {
    const response = await axios.post<RoleAssignment>(`${API_ENDPOINT}/assignments`, assignmentData);
    return response.data;
  },

  async assignRoleToEmployee(assignmentData: AssignRoleDto): Promise<RoleAssignment> {
    const response = await axios.post<RoleAssignment>(`${API_ENDPOINT}/assignments`, assignmentData);
    return response.data;
  },

  async revokeRoleFromEmployee(assignmentId: string): Promise<void> {
    await axios.delete(`${API_ENDPOINT}/assignments/${assignmentId}`);
  },

  async getEmployeeRoles(employeeId: string): Promise<RoleAssignment[]> {
    const response = await axios.get<RoleAssignment[]>(
      `${API_ENDPOINT}/employees/${employeeId}/roles`
    );
    return response.data;
  },

  async delegateRole(delegateData: DelegateRoleDto): Promise<RoleAssignment> {
    const response = await axios.post<RoleAssignment>(`${API_ENDPOINT}/delegate`, delegateData);
    return response.data;
  },

  // Permission checking
  async checkPermission(
    resource: string,
    action: string,
    contextId?: string
  ): Promise<{ hasPermission: boolean }> {
    const params = new URLSearchParams();
    params.append('resource', resource);
    params.append('action', action);
    if (contextId) {
      params.append('contextId', contextId);
    }

    const response = await axios.get<{ hasPermission: boolean }>(
      `${API_ENDPOINT}/check-permission?${params.toString()}`
    );
    return response.data;
  },
}; 