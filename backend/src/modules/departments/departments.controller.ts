import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Put } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createDepartmentDto: CreateDepartmentDto, @Request() req: any) {
    return this.departmentsService.create(createDepartmentDto, req.user.organizationId);
  }

  @Get()
  findAll(@Request() req: any) {
    const userRole = req.user.role;
    const userId = req.user.sub;
    const organizationId = req.user.organizationId;
    
    return this.departmentsService.findAll(organizationId, userRole, userId);
  }

  @Get('hierarchy')
  getHierarchy() {
    return this.departmentsService.getHierarchy();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.departmentsService.findOne(id, req.user.organizationId);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto, @Request() req: any) {
    return this.departmentsService.update(id, updateDepartmentDto, req.user.organizationId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.departmentsService.remove(id, req.user.organizationId);
  }

  @Post(':id/assign')
  @Roles(UserRole.ADMIN)
  assignRoles(@Param('id') id: string, @Body() assignRolesDto: AssignRolesDto, @Request() req: any) {
    return this.departmentsService.assignRoles(id, assignRolesDto, req.user.sub, req.user.organizationId);
  }

  @Get(':id/employees')
  getDepartmentEmployees(@Param('id') id: string, @Request() req: any) {
    const userRole = req.user.role;
    const userId = req.user.sub;
    const organizationId = req.user.organizationId;
    
    return this.departmentsService.getDepartmentEmployees(id, organizationId, userRole, userId);
  }
} 