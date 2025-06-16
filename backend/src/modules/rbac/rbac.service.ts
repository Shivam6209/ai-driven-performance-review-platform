import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RoleAssignment } from './entities/role-assignment.entity';
import { UserPermission } from './entities/user-permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UpdateUserPermissionsDto } from './dto/update-user-permissions.dto';
import { Employee } from '../employees/entities/employee.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);

  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(RoleAssignment)
    private roleAssignmentRepository: Repository<RoleAssignment>,
    @InjectRepository(UserPermission)
    private userPermissionRepository: Repository<UserPermission>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Role management
  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, description, permissionIds } = createRoleDto;
    
    const role = this.roleRepository.create({
      name,
      description,
      is_system_role: createRoleDto.is_system_role || false,
      is_custom: createRoleDto.is_custom !== false,
      parent_role_id: createRoleDto.parent_role_id,
    });

    // Save the role first
    const savedRole = await this.roleRepository.save(role);

    // If permissions are provided, assign them to the role
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await this.permissionRepository.find({
        where: { id: In(permissionIds) },
      });
      
      if (permissions.length > 0) {
        savedRole.permissions = permissions;
        await this.roleRepository.save(savedRole);
        this.logger.log(`Assigned ${permissions.length} permissions to role '${savedRole.name}'`);
      }
    }

    return savedRole;
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    
    if (!role) {
      throw new Error(`Role with id ${id} not found`);
    }
    
    // Prevent updating system roles
    if (role.is_system_role) {
      throw new ForbiddenException('System roles cannot be modified');
    }
    
    // Update basic properties
    if (updateRoleDto.name) role.name = updateRoleDto.name;
    if (updateRoleDto.description !== undefined) role.description = updateRoleDto.description;
    if (updateRoleDto.parentRoleId !== undefined) role.parent_role_id = updateRoleDto.parentRoleId;
    
    // Update permissions if provided
    if (updateRoleDto.permissionIds) {
      const permissions = await this.permissionRepository.find({
        where: { id: In(updateRoleDto.permissionIds) },
      });
      role.permissions = permissions;
    }
    
    return this.roleRepository.save(role);
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['assignments'],
    });
    
    if (!role) {
      throw new Error(`Role with id ${id} not found`);
    }
    
    // Prevent deleting system roles
    if (role.is_system_role) {
      throw new ForbiddenException('System roles cannot be deleted');
    }
    
    // Check if role is assigned to any users
    if (role.assignments && role.assignments.length > 0) {
      throw new ForbiddenException('Cannot delete role that is assigned to users');
    }
    
    await this.roleRepository.remove(role);
  }

  async getRoleById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    
    if (!role) {
      throw new Error(`Role with id ${id} not found`);
    }
    
    return role;
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions'],
      order: { name: 'ASC' },
    });
  }

  // Permission management
  async createPermission(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const { name, description, resource, action } = createPermissionDto;
    
    // Check if permission already exists
    const existingPermission = await this.permissionRepository.findOne({
      where: { name },
    });
    
    if (existingPermission) {
      throw new Error(`Permission with name ${name} already exists`);
    }
    
    const permission = this.permissionRepository.create({
      name,
      description,
      resource,
      action,
    });
    
    return this.permissionRepository.save(permission);
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: { 
        resource: 'ASC',
        action: 'ASC' 
      },
    });
  }

  // Role assignment
  async assignRoleToEmployee(assignRoleDto: AssignRoleDto): Promise<RoleAssignment> {
    const { roleId, employeeId, scope, contextType, contextId, validFrom, validUntil, grantedBy } = assignRoleDto;
    
    // Check if role exists
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new Error(`Role with id ${roleId} not found`);
    }
    
    // Check if employee exists
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    if (!employee) {
      throw new Error(`Employee with id ${employeeId} not found`);
    }
    
    // Check for existing assignment in the same context
    const existingAssignment = await this.roleAssignmentRepository.findOne({
      where: {
        role: { id: roleId },
        employee: { id: employeeId },
        context_type: contextType,
        context_id: contextId,
      },
    });
    
    if (existingAssignment) {
      throw new Error(`Employee already has this role in the specified context`);
    }
    
    // Create new assignment
    const assignment = new RoleAssignment();
    assignment.role = role;
    assignment.employee = employee;
    assignment.scope = scope || {};
    assignment.assigned_by_id = grantedBy || employeeId; // Use grantedBy or self-assign
    assignment.assigned_at = new Date();
    assignment.granted_by = grantedBy || employeeId; // Use grantedBy or self-assign
    assignment.valid_from = validFrom ? new Date(validFrom) : new Date();
    if (contextType) assignment.context_type = contextType;
    if (contextId) assignment.context_id = contextId;
    if (validUntil) assignment.valid_until = new Date(validUntil);
    assignment.is_active = true;

    return this.roleAssignmentRepository.save(assignment);
  }

  async revokeRoleFromEmployee(assignmentId: string): Promise<void> {
    const assignment = await this.roleAssignmentRepository.findOne({
      where: { id: assignmentId },
    });
    
    if (!assignment) {
      throw new Error(`Role assignment with id ${assignmentId} not found`);
    }
    
    await this.roleAssignmentRepository.remove(assignment);
  }

  async getEmployeeRoles(employeeId: string): Promise<RoleAssignment[]> {
    return this.roleAssignmentRepository.find({
      where: {
        employee: { id: employeeId },
        is_active: true,
      },
      relations: ['role', 'role.permissions'],
    });
  }

  // Permission checking
  async hasPermission(employeeId: string, resource: string, action: string, contextId?: string): Promise<boolean> {
    try {
      // Get all active role assignments for the employee
      const roleAssignments = await this.roleAssignmentRepository.find({
        where: {
          employee: { id: employeeId },
          is_active: true,
        },
        relations: ['role', 'role.permissions'],
      });
      
      if (!roleAssignments || roleAssignments.length === 0) {
        return false;
      }
      
      // Check each role assignment
      for (const assignment of roleAssignments) {
        // Skip if assignment has expired
        if (assignment.valid_until && new Date() > assignment.valid_until) {
          continue;
        }
        
        // Skip if assignment is not yet valid
        if (assignment.valid_from && new Date() < assignment.valid_from) {
          continue;
        }
        
        // Check context-specific permissions first
        if (contextId && assignment.context_id === contextId) {
          const hasPermission = this.checkRolePermissions(assignment.role, resource, action);
          if (hasPermission) return true;
        }
        
        // Check global permissions (no context)
        if (!assignment.context_id) {
          const hasPermission = this.checkRolePermissions(assignment.role, resource, action);
          if (hasPermission) return true;
        }
      }
      
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error checking permissions';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error checking permissions: ${errorMessage}`, errorStack);
      return false;
    }
  }

  private checkRolePermissions(role: Role, resource: string, action: string): boolean {
    if (!role.permissions) return false;
    
    return role.permissions.some(
      (permission) =>
        (permission.resource === resource || permission.resource === '*') &&
        (permission.action === action || permission.action === '*')
    );
  }

  // Role inheritance
  async getRoleHierarchy(roleId: string): Promise<Role[]> {
    const result: Role[] = [];
    await this.buildRoleHierarchy(roleId, result);
    return result;
  }

  private async buildRoleHierarchy(roleId: string, result: Role[]): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
    
    if (!role) return;
    
    result.push(role);
    
    if (role.parent_role_id) {
      await this.buildRoleHierarchy(role.parent_role_id, result);
    }
  }

  // Delegation
  async delegateRole(
    fromEmployeeId: string,
    toEmployeeId: string,
    roleAssignmentId: string,
    validUntil: Date,
  ): Promise<RoleAssignment> {
    // Get the original assignment
    const originalAssignment = await this.roleAssignmentRepository.findOne({
      where: { 
        id: roleAssignmentId,
        employee: { id: fromEmployeeId },
      },
      relations: ['role'],
    });
    
    if (!originalAssignment) {
      throw new Error('Role assignment not found or does not belong to the delegating employee');
    }
    
    // Check if the employee exists
    const toEmployee = await this.employeeRepository.findOne({
      where: { id: toEmployeeId },
    });
    
    if (!toEmployee) {
      throw new Error(`Employee with id ${toEmployeeId} not found`);
    }
    
    // Create new delegated assignment
    const delegatedAssignment = this.roleAssignmentRepository.create({
      role: originalAssignment.role,
      employee: { id: toEmployeeId },
      scope: originalAssignment.scope,
      context_type: originalAssignment.context_type,
      context_id: originalAssignment.context_id,
      valid_from: new Date(),
      valid_until: validUntil,
      granted_by: fromEmployeeId,
      is_active: true,
    });
    
    return this.roleAssignmentRepository.save(delegatedAssignment);
  }

  // User-specific permission management
  async updateUserPermissions(updateDto: UpdateUserPermissionsDto, grantedBy: string): Promise<UserPermission[]> {
    const { employeeId, permissions } = updateDto;
    
    // Check if employee exists
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    if (!employee) {
      throw new Error(`Employee with id ${employeeId} not found`);
    }

    const results: UserPermission[] = [];

    for (const permissionDto of permissions) {
      const { resource, action, granted = true } = permissionDto;

      // Check if user permission already exists
      let userPermission = await this.userPermissionRepository.findOne({
        where: {
          employee_id: employeeId,
          resource,
          action,
        },
      });

      if (userPermission) {
        // Update existing permission
        userPermission.granted = granted;
        userPermission.granted_by = grantedBy;
        userPermission = await this.userPermissionRepository.save(userPermission);
      } else {
        // Create new permission
        userPermission = this.userPermissionRepository.create({
          employee_id: employeeId,
          resource,
          action,
          granted,
          granted_by: grantedBy,
        });
        userPermission = await this.userPermissionRepository.save(userPermission);
      }

      results.push(userPermission);
    }

    return results;
  }

  async getUserPermissions(employeeId: string): Promise<UserPermission[]> {
    return this.userPermissionRepository.find({
      where: { employee_id: employeeId },
      relations: ['employee', 'granter'],
      order: { resource: 'ASC', action: 'ASC' },
    });
  }

  async removeUserPermission(employeeId: string, resource: string, action: string): Promise<void> {
    const userPermission = await this.userPermissionRepository.findOne({
      where: {
        employee_id: employeeId,
        resource,
        action,
      },
    });

    if (userPermission) {
      await this.userPermissionRepository.remove(userPermission);
    }
  }

  // Enhanced permission checking that includes user-specific permissions
  async hasPermissionEnhanced(employeeId: string, resource: string, action: string, contextId?: string): Promise<boolean> {
    try {
      // First check user-specific permissions (these override role permissions)
      const userPermission = await this.userPermissionRepository.findOne({
        where: {
          employee_id: employeeId,
          resource,
          action,
        },
      });

      // If user has explicit permission (granted or denied), use that
      if (userPermission) {
        return userPermission.granted;
      }

      // Fall back to role-based permissions
      return this.hasPermission(employeeId, resource, action, contextId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error checking enhanced permissions';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error checking enhanced permissions: ${errorMessage}`, errorStack);
      return false;
    }
  }

  // Get all permissions for a user (both role-based and user-specific)
  async getAllUserPermissions(employeeId: string): Promise<{
    rolePermissions: { resource: string; action: string; source: string }[];
    userPermissions: { resource: string; action: string; granted: boolean }[];
  }> {
    // Get role-based permissions
    const roleAssignments = await this.getEmployeeRoles(employeeId);
    const rolePermissions: { resource: string; action: string; source: string }[] = [];
    
    roleAssignments.forEach(assignment => {
      assignment.role.permissions.forEach(permission => {
        rolePermissions.push({
          resource: permission.resource,
          action: permission.action,
          source: assignment.role.name,
        });
      });
    });

    // Get user-specific permissions
    const userPermissions = await this.getUserPermissions(employeeId);
    const userPerms = userPermissions.map(up => ({
      resource: up.resource,
      action: up.action,
      granted: up.granted,
    }));

    return {
      rolePermissions,
      userPermissions: userPerms,
    };
  }

  // Auto-assign RBAC role based on user's auth role
  async syncUserRole(employeeId: string, userRole: string): Promise<void> {
    try {
      // Get the user from auth system
      const user = await this.userRepository.findOne({ 
        where: { id: employeeId },
        relations: ['employee']
      });
      
      if (!user) {
        this.logger.warn(`User with id ${employeeId} not found in auth system`);
        return;
      }

      let employee = user.employee;

      // If user doesn't have an employee record linked, check if one exists with same email
      if (!employee) {
        const existingEmployee = await this.employeeRepository.findOne({ where: { email: user.email } });
        
        if (existingEmployee) {
          // Link existing employee to user
          employee = existingEmployee;
          user.employeeId = existingEmployee.id;
          await this.userRepository.save(user);
          this.logger.log(`Linked existing employee ${existingEmployee.id} to user ${user.id}`);
        } else {
          // Only create if no employee exists with this email
          this.logger.log(`Creating new employee record for user: ${user.email}`);
          employee = this.employeeRepository.create({
            id: employeeId,
            email: user.email,
            firstName: 'User', // Default - should be updated by user later
            lastName: 'Account', // Default - should be updated by user later
            employeeCode: `EMP-${employeeId.substring(0, 8)}`,
            role: userRole as 'admin' | 'hr' | 'manager' | 'employee', // Role from auth system (UI-driven)
            isActive: true,
            hireDate: new Date(),
          });
          
          employee = await this.employeeRepository.save(employee);
          
          // Link the new employee to the user
          user.employeeId = employee.id;
          await this.userRepository.save(user);
          
          this.logger.log(`Created and linked new employee record for user: ${user.email}`);
        }
      }

      // Find the RBAC role that matches the user's auth role
      const roles = await this.getAllRoles();
      const matchingRole = roles.find(role => role.name === userRole);
      
      if (!matchingRole) {
        this.logger.warn(`No RBAC role found for user role: ${userRole}`);
        return;
      }

      // Check if user already has this role assigned
      const existingAssignments = await this.getEmployeeRoles(employee.id);
      const hasRole = existingAssignments.some(assignment => assignment.role.id === matchingRole.id);
      
      if (!hasRole) {
        // Assign the role
        await this.assignRoleToEmployee({
          roleId: matchingRole.id,
          employeeId: employee.id,
          grantedBy: employee.id, // Self-assigned during sync
        });
        
        this.logger.log(`Auto-assigned RBAC role '${matchingRole.name}' to employee ${employee.id}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error syncing user role';
      this.logger.error(`Error syncing user role: ${errorMessage}`);
    }
  }
} 