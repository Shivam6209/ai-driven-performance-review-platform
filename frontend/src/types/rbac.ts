export interface Role {
  id: string;
  name: string;
  description?: string;
  is_system_role: boolean;
  is_custom: boolean;
  parent_role_id?: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  is_system_permission: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleAssignment {
  id: string;
  role: Role;
  employee: {
    id: string;
    name: string;
    email: string;
  };
  scope?: Record<string, any>;
  context_type?: string;
  context_id?: string;
  is_active: boolean;
  granted_by?: string;
  valid_from?: string;
  valid_until?: string;
  created_at: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissionIds?: string[];
  parentRoleId?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissionIds?: string[];
  parentRoleId?: string;
}

export interface AssignRoleDto {
  roleId: string;
  employeeId: string;
  scope?: Record<string, any>;
  contextType?: string;
  contextId?: string;
  validFrom?: string;
  validUntil?: string;
  grantedBy?: string;
}

export interface DelegateRoleDto {
  toEmployeeId: string;
  roleAssignmentId: string;
  validUntil: string;
}

export interface CreatePermissionDto {
  name: string;
  description?: string;
  resource: string;
  action: string;
} 