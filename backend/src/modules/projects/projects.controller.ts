import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService, CreateProjectDto, UpdateProjectDto } from './projects.service';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/guards/rbac.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @RequirePermissions('projects', 'create')
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @RequirePermissions('projects', 'read')
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  findAll() {
    return this.projectsService.findAll();
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get projects for a specific employee' })
  @ApiResponse({ status: 200, description: 'Employee projects retrieved successfully' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.projectsService.findByEmployee(employeeId);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get project analytics' })
  @ApiResponse({ status: 200, description: 'Project analytics retrieved successfully' })
  getAnalytics(@Query('employeeId') employeeId?: string) {
    return this.projectsService.getProjectAnalytics(employeeId);
  }

  @Get(':id')
  @RequirePermissions('projects', 'read')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('projects', 'update')
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @RequirePermissions('projects', 'delete')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Post(':id/members')
  @RequirePermissions('projects', 'update')
  @ApiOperation({ summary: 'Add member to project' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  addMember(@Param('id') projectId: string, @Body() body: CreateProjectMemberDto) {
    const createProjectMemberDto = { ...body, projectId };
    return this.projectsService.addMember(createProjectMemberDto);
  }

  @Delete(':id/members/:employeeId')
  @RequirePermissions('projects', 'update')
  @ApiOperation({ summary: 'Remove member from project' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  removeMember(@Param('id') projectId: string, @Param('employeeId') employeeId: string) {
    return this.projectsService.removeMember(projectId, employeeId);
  }

  @Get(':id/members')
  @RequirePermissions('projects', 'read')
  @ApiOperation({ summary: 'Get project members' })
  @ApiResponse({ status: 200, description: 'Project members retrieved successfully' })
  getMembers(@Param('id') projectId: string) {
    return this.projectsService.getProjectMembers(projectId);
  }
} 