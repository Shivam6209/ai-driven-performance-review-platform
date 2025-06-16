import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AssignDepartmentDto } from './dto/assign-department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';

import { TenantRequest } from '../../common/middleware/tenant-isolation.middleware';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR)
  create(@Body() createEmployeeDto: CreateEmployeeDto, @Request() req: TenantRequest) {
    return this.employeesService.create(createEmployeeDto, req.user?.organizationId);
  }

  @Get()
  findAll(@Request() req: TenantRequest, @Query('departmentId') departmentId?: string) {
    const userRole = req.user?.role;
    const userId = req.user?.userId;
    const organizationId = req.user?.organizationId;
    
    return this.employeesService.findAll(organizationId, userRole, userId, departmentId);
  }

  @Get('unassigned')
  @Roles(UserRole.ADMIN) // Only Admin can see unassigned employees
  getUnassignedEmployees(@Request() req: TenantRequest) {
    const userRole = req.user?.role;
    const organizationId = req.user?.organizationId;
    
    return this.employeesService.getUnassignedEmployees(organizationId, userRole);
  }

  @Get('me')
  getProfile(@Request() req: TenantRequest) {
    return this.employeesService.findByUserId(req.user!.userId, req.user?.organizationId);
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string, @Request() req: TenantRequest) {
    return this.employeesService.findByEmail(email, req.user?.organizationId);
  }

  @Get('department/:departmentId')
  getDepartmentEmployees(@Param('departmentId') departmentId: string, @Request() req: TenantRequest) {
    return this.employeesService.getDepartmentEmployees(departmentId, req.user?.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: TenantRequest) {
    return this.employeesService.findOne(id, req.user?.organizationId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.HR)
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto, @Request() req: TenantRequest) {
    return this.employeesService.update(id, updateEmployeeDto, req.user?.organizationId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @Request() req: TenantRequest) {
    return this.employeesService.remove(id, req.user?.organizationId);
  }

  @Get(':id/direct-reports')
  getDirectReports(@Param('id') id: string, @Request() req: TenantRequest) {
    return this.employeesService.getDirectReports(id, req.user?.organizationId);
  }

  @Get(':id/team')
  getTeamMembers(@Param('id') id: string, @Request() req: TenantRequest) {
    return this.employeesService.getTeamMembers(id, req.user?.organizationId);
  }

  @Post('assign-department')
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  assignDepartment(@Body() assignDepartmentDto: AssignDepartmentDto, @Request() req: TenantRequest) {
    const userRole = req.user?.role;
    const userId = req.user?.userId;
    const organizationId = req.user?.organizationId;
    
    return this.employeesService.assignDepartment(
      assignDepartmentDto,
      userRole,
      userId,
      organizationId
    );
  }

  @Post(':id/remove-from-department')
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  removeFromDepartment(@Param('id') employeeId: string, @Request() req: TenantRequest) {
    const userRole = req.user?.role;
    const userId = req.user?.userId;
    const organizationId = req.user?.organizationId;
    
    return this.employeesService.removeFromDepartment(
      employeeId,
      userRole,
      userId,
      organizationId
    );
  }

  @Post('sync-roles')
  @Roles(UserRole.ADMIN) // Only Admin can trigger role sync
  syncAllRoles(@Request() req: TenantRequest) {
    const organizationId = req.user?.organizationId;
    return this.employeesService.syncAllEmployeeRoles(organizationId);
  }

  @Post(':id/sync-role')
  @Roles(UserRole.ADMIN) // Only Admin can sync individual roles
  syncEmployeeRole(@Param('id') employeeId: string) {
    return this.employeesService.syncEmployeeRoleWithUser(employeeId);
  }
} 