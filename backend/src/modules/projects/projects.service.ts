import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';

export interface CreateProjectDto {
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  ownerId: string;
  departmentId?: string;
  start_date: string;
  end_date: string;
  tags?: string[];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  ownerId?: string;
  departmentId?: string;
  start_date?: string;
  end_date?: string;
  tags?: string[];
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = new Project();
    project.name = createProjectDto.name;
    project.description = createProjectDto.description;
    project.status = createProjectDto.status as ProjectStatus;
    project.priority = createProjectDto.priority as ProjectPriority;
    project.ownerId = createProjectDto.ownerId;
    project.departmentId = createProjectDto.departmentId;
    project.start_date = new Date(createProjectDto.start_date);
    project.end_date = new Date(createProjectDto.end_date);
    project.tags = createProjectDto.tags;
    
    return await this.projectRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return await this.projectRepository.find({
      relations: ['owner', 'department'],
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['owner', 'department'],
    });
    
    if (!project) {
      throw new Error(`Project with ID ${id} not found`);
    }
    
    return project;
  }

  async findByEmployee(employeeId: string): Promise<Project[]> {
    return this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.members', 'member')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndSelect('project.department', 'department')
      .where('member.employeeId = :employeeId', { employeeId })
      .getMany();
  }

  async findByEmployeeAndDateRange(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Project[]> {
    return this.projectRepository
      .createQueryBuilder('project')
      .leftJoin('project_members', 'pm', 'pm.project_id = project.id')
      .where('project.owner_id = :employeeId OR pm.employee_id = :employeeId', { employeeId })
      .andWhere('pm.is_active = true OR project.owner_id = :employeeId', { employeeId })
      .andWhere(
        '(project.start_date BETWEEN :startDate AND :endDate OR project.end_date BETWEEN :startDate AND :endDate OR project.updated_at BETWEEN :startDate AND :endDate)',
        { startDate, endDate },
      )
      .getMany();
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const updateData: any = { ...updateProjectDto };
    
    // Convert string status to enum if provided
    if (updateData.status) {
      updateData.status = updateData.status as ProjectStatus;
    }
    
    // Convert string priority to enum if provided
    if (updateData.priority) {
      updateData.priority = updateData.priority as ProjectPriority;
    }
    
    await this.projectRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`Project with ID ${id} not found`);
    }
  }

  // Project Members
  async addMember(createProjectMemberDto: CreateProjectMemberDto): Promise<ProjectMember> {
    const member = this.projectMemberRepository.create(createProjectMemberDto);
    return await this.projectMemberRepository.save(member);
  }

  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    return await this.projectMemberRepository.find({
      where: { projectId, is_active: true },
      relations: ['employee', 'project'],
    });
  }

  async removeMember(projectId: string, employeeId: string): Promise<void> {
    await this.projectMemberRepository.update(
      { projectId, employeeId },
      { is_active: false, left_date: new Date() }
    );
  }

  async getProjectsByStatus(status: ProjectStatus): Promise<Project[]> {
    return await this.projectRepository.find({
      where: { status },
      relations: ['owner', 'department'],
    });
  }

  async getProjectProgress(projectId: string): Promise<{ progress: number; status: string }> {
    const project = await this.findOne(projectId);
    
    // Calculate progress based on project status and other factors
    let progress = project.progress;
    
    if (project.status === ProjectStatus.COMPLETED) {
      progress = 100;
    }
    
    return {
      progress,
      status: project.status,
    };
  }

  async getProjectAnalytics(employeeId?: string) {
    const queryBuilder = this.projectRepository.createQueryBuilder('project');
    
    if (employeeId) {
      queryBuilder
        .leftJoin('project_members', 'pm', 'pm.project_id = project.id')
        .where('project.owner_id = :employeeId OR pm.employee_id = :employeeId', { employeeId })
        .andWhere('pm.is_active = true OR project.owner_id = :employeeId', { employeeId });
    }

    const projects = await queryBuilder.getMany();

    const analytics = {
      total: projects.length,
      byStatus: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      averageProgress: 0,
      completedOnTime: 0,
      overdue: 0,
    };

    let totalProgress = 0;
    const now = new Date();

    projects.forEach(project => {
      // Count by status
      analytics.byStatus[project.status] = (analytics.byStatus[project.status] || 0) + 1;
      
      // Count by priority
      analytics.byPriority[project.priority] = (analytics.byPriority[project.priority] || 0) + 1;
      
      // Calculate progress
      totalProgress += Number(project.progress);
      
      // Check completion status
      if (project.status === ProjectStatus.COMPLETED) {
        if (project.actual_end_date && project.end_date && project.actual_end_date <= project.end_date) {
          analytics.completedOnTime++;
        }
      } else if (project.end_date && project.end_date < now) {
        analytics.overdue++;
      }
    });

    analytics.averageProgress = projects.length > 0 ? totalProgress / projects.length : 0;

    return analytics;
  }
} 