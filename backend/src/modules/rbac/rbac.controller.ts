import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UpdateUserPermissionsDto } from './dto/update-user-permissions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from './guards/rbac.guard';
import { RequirePermissions } from './decorators/require-permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('rbac')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  // Role endpoints
  @Post('roles')
  @UseGuards(RbacGuard)
  @RequirePermissions('rbac', 'create_role')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rbacService.createRole(createRoleDto);
  }

  @Get('roles')
  @Public()
  @ApiOperation({ summary: 'Get all roles' })
  getAllRoles() {
    return this.rbacService.getAllRoles();
  }

  @Get('roles/:id')
  @Public()
  @ApiOperation({ summary: 'Get a role by ID' })
  getRoleById(@Param('id') id: string) {
    return this.rbacService.getRoleById(id);
  }

  @Patch('roles/:id')
  @UseGuards(RbacGuard)
  @RequirePermissions('rbac', 'update_role')
  @ApiOperation({ summary: 'Update a role' })
  updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rbacService.updateRole(id, updateRoleDto);
  }

  @Delete('roles/:id')
  @UseGuards(RbacGuard)
  @RequirePermissions('rbac', 'delete_role')
  @ApiOperation({ summary: 'Delete a role' })
  deleteRole(@Param('id') id: string) {
    return this.rbacService.deleteRole(id);
  }

  @Get('roles/:id/hierarchy')
  @UseGuards(RbacGuard)
  @RequirePermissions('rbac', 'read_roles')
  @ApiOperation({ summary: 'Get role hierarchy' })
  getRoleHierarchy(@Param('id') id: string) {
    return this.rbacService.getRoleHierarchy(id);
  }

  // Permission endpoints
  @Post('permissions')
  @UseGuards(RbacGuard)
  @RequirePermissions('rbac', 'create_permission')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.rbacService.createPermission(createPermissionDto);
  }

  @Get('permissions')
  @Public()
  @ApiOperation({ summary: 'Get all permissions' })
  getAllPermissions() {
    return this.rbacService.getAllPermissions();
  }

  // Role assignment endpoints
  @Post('assignments')
  @UseGuards(RbacGuard)
  @RequirePermissions('rbac', 'assign_role')
  @ApiOperation({ summary: 'Assign a role to an employee' })
  @ApiResponse({ status: 201, description: 'Role assigned successfully' })
  assignRoleToEmployee(@Body() assignRoleDto: AssignRoleDto, @Request() req: any) {
    // Add the granter if not provided
    if (!assignRoleDto.grantedBy) {
      assignRoleDto.grantedBy = req.user.userId;
    }
    
    return this.rbacService.assignRoleToEmployee(assignRoleDto);
  }

  @Delete('assignments/:id')
  @UseGuards(RbacGuard)
  @RequirePermissions('rbac', 'revoke_role')
  @ApiOperation({ summary: 'Revoke a role from an employee' })
  revokeRoleFromEmployee(@Param('id') id: string) {
    return this.rbacService.revokeRoleFromEmployee(id);
  }

  @Get('employees/:employeeId/roles')
  @Public()
  @ApiOperation({ summary: 'Get all roles assigned to an employee' })
  getEmployeeRoles(@Param('employeeId') employeeId: string) {
    return this.rbacService.getEmployeeRoles(employeeId);
  }

  @Post('delegate')
  @UseGuards(RbacGuard)
  @RequirePermissions('rbac', 'delegate_role')
  @ApiOperation({ summary: 'Delegate a role to another employee' })
  @ApiResponse({ status: 201, description: 'Role delegated successfully' })
  delegateRole(
    @Body() delegateRoleDto: {
      toEmployeeId: string;
      roleAssignmentId: string;
      validUntil: string;
    },
    @Request() req: any
  ) {
    const { toEmployeeId, roleAssignmentId, validUntil } = delegateRoleDto;
    
    return this.rbacService.delegateRole(
      req.user.userId,
      toEmployeeId,
      roleAssignmentId,
      new Date(validUntil)
    );
  }

  // Permission check endpoint (for testing)
  @Get('check-permission')
  @ApiOperation({ summary: 'Check if current user has a specific permission' })
  async checkPermission(
    @Query('resource') resource: string,
    @Query('action') action: string,
    @Query('contextId') contextId: string,
    @Request() req: any
  ) {
    const hasPermission = await this.rbacService.hasPermission(
      req.user.userId,
      resource,
      action,
      contextId
    );
    
    return { hasPermission };
  }

  // User permission management endpoints
  @Post('user-permissions')
  @UseGuards(RbacGuard)
  @RequirePermissions('rbac', 'assign_role')
  @ApiOperation({ summary: 'Update user-specific permissions' })
  @ApiResponse({ status: 200, description: 'User permissions updated successfully' })
  async updateUserPermissions(
    @Body() updateDto: UpdateUserPermissionsDto,
    @Request() req: any
  ) {
    return this.rbacService.updateUserPermissions(updateDto, req.user.userId);
  }

  @Get('user-permissions/:employeeId')
  @UseGuards(RbacGuard)
  @RequirePermissions('rbac', 'read_roles')
  @ApiOperation({ summary: 'Get user-specific permissions' })
  getUserPermissions(@Param('employeeId') employeeId: string) {
    return this.rbacService.getUserPermissions(employeeId);
  }

  @Get('all-permissions/:employeeId')
  @Public()
  @ApiOperation({ summary: 'Get all permissions for a user (role-based and user-specific)' })
  getAllUserPermissions(@Param('employeeId') employeeId: string) {
    return this.rbacService.getAllUserPermissions(employeeId);
  }

  @Delete('user-permissions/:employeeId/:resource/:action')
  @UseGuards(RbacGuard)
  @RequirePermissions('rbac', 'revoke_role')
  @ApiOperation({ summary: 'Remove a user-specific permission' })
  removeUserPermission(
    @Param('employeeId') employeeId: string,
    @Param('resource') resource: string,
    @Param('action') action: string
  ) {
    return this.rbacService.removeUserPermission(employeeId, resource, action);
  }
} 