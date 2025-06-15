import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Public } from '../auth/decorators/public.decorator';
import { TenantRequest } from '../../common/middleware/tenant-isolation.middleware';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto, @Request() req: TenantRequest) {
    return this.employeesService.create(createEmployeeDto, req.user?.organizationId);
  }

  @Get()
  @Public()
  findAll(@Query() query: any, @Request() req: TenantRequest) {
    return this.employeesService.findAll(query, req.user?.organizationId);
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
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto, @Request() req: TenantRequest) {
    return this.employeesService.update(id, updateEmployeeDto, req.user?.organizationId);
  }

  @Delete(':id')
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
} 