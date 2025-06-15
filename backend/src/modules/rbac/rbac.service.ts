import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RoleAssignment } from './entities/role-assignment.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { Employee } from '../employees/entities/employee.entity';

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
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  // Role management
  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, description } = createRoleDto;
    
    const role = this.roleRepository.create({
      name,
      description,
      is_system_role: createRoleDto.is_system_role || false,
      is_custom: createRoleDto.is_custom !== false,
      parent_role_id: createRoleDto.parent_role_id,
    });

    return await this.roleRepository.save(role);
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
    // Only return permissions that are actually assigned to roles
    return this.permissionRepository
      .createQueryBuilder('permission')
      .innerJoin('role_permissions', 'rp', 'rp.permission_id = permission.id')
      .orderBy('permission.resource', 'ASC')
      .addOrderBy('permission.action', 'ASC')
      .getMany();
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
    if (contextType) assignment.context_type = contextType;
    if (contextId) assignment.context_id = contextId;
    if (grantedBy) assignment.granted_by = grantedBy;
    if (validFrom) assignment.valid_from = new Date(validFrom);
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
} 