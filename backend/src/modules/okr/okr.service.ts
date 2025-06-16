import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Objective } from './entities/objective.entity';
import { KeyResult } from './entities/key-result.entity';
import { OkrCategory } from './entities/okr-category.entity';
import { OkrUpdate } from './entities/okr-update.entity';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { CreateKeyResultDto } from './dto/create-key-result.dto';
import { UpdateKeyResultDto } from './dto/update-key-result.dto';
import { CreateOkrUpdateDto } from './dto/create-okr-update.dto';
import { CreateOkrCategoryDto } from './dto/create-okr-category.dto';
import { UpdateOkrCategoryDto } from './dto/update-okr-category.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Employee } from '../employees/entities/employee.entity';

@Injectable()
export class OkrService {
  constructor(
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,
    @InjectRepository(KeyResult)
    private keyResultRepository: Repository<KeyResult>,
    @InjectRepository(OkrCategory)
    private categoryRepository: Repository<OkrCategory>,
    @InjectRepository(OkrUpdate)
    private updateRepository: Repository<OkrUpdate>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private notificationsService: NotificationsService,
  ) {}

  // Objective methods
  async createObjective(createObjectiveDto: CreateObjectiveDto, userId: string, organizationId: string): Promise<Objective> {
    let employee = null;
    let ownerId = null;

    // Handle anonymous users (public access)
    if (userId === 'anonymous' || organizationId === 'default') {
      // For anonymous users, create OKR without employee validation
      // This allows public OKR creation for testing/demo purposes
      ownerId = null; // No owner for anonymous OKRs
    } else {
      // Get the employee creating the OKR (authenticated users)
      employee = await this.employeeRepository.findOne({
        where: { user: { id: userId }, organizationId },
        relations: ['department', 'user'],
      });

      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      ownerId = employee.id;

      // Validate level-specific permissions for authenticated users
      if (createObjectiveDto.level === 'company') {
        // Only admin and HR can create company-level OKRs
        if (employee.role !== 'admin' && employee.role !== 'hr') {
          throw new ForbiddenException('Only admin and HR can create company-level OKRs');
        }
      } else if (createObjectiveDto.level === 'department') {
        // Only admin, HR, and managers can create department-level OKRs
        if (employee.role !== 'admin' && employee.role !== 'hr' && employee.role !== 'manager') {
          throw new ForbiddenException('Only admin, HR, and managers can create department-level OKRs');
        }
        // Manager can only create for their own department
        if (employee.role === 'manager' && createObjectiveDto.departmentId !== employee.departmentId) {
          throw new ForbiddenException('Managers can only create OKRs for their own department');
        }
      }
    }

    const objective = this.objectiveRepository.create({
      ...createObjectiveDto,
      ownerId: ownerId || undefined,
      departmentId: createObjectiveDto.level === 'department' ? (createObjectiveDto.departmentId || employee?.departmentId) : undefined,
    });

    const savedObjective = await this.objectiveRepository.save(objective);

    // Send notifications based on OKR level (only for authenticated users)
    if (employee && organizationId !== 'default') {
      await this.sendOKRNotifications(savedObjective, 'created', employee, organizationId);
    }

    const result = await this.objectiveRepository.findOne({
      where: { id: savedObjective.id },
      relations: ['owner', 'department', 'keyResults', 'category'],
    });

    if (!result) {
      throw new NotFoundException('Failed to retrieve created objective');
    }

    return result;
  }

  async findAllObjectives(userId: string, organizationId: string, query: any = {}): Promise<Objective[]> {
    const employee = await this.employeeRepository.findOne({
      where: { user: { id: userId }, organizationId },
      relations: ['department'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const queryBuilder = this.objectiveRepository
      .createQueryBuilder('objective')
      .leftJoinAndSelect('objective.owner', 'owner')
      .leftJoinAndSelect('objective.department', 'department')
      .leftJoinAndSelect('objective.keyResults', 'keyResults')
      .leftJoinAndSelect('objective.category', 'category')
      .where('owner.organizationId = :organizationId', { organizationId });

    // Apply visibility rules
    queryBuilder.andWhere(
      '(objective.level = :companyLevel) OR ' +
      '(objective.level = :departmentLevel AND objective.departmentId = :userDepartmentId) OR ' +
      '(objective.level = :personalLevel AND objective.ownerId = :employeeId)',
      {
        companyLevel: 'company',
        departmentLevel: 'department',
        personalLevel: 'individual',
        userDepartmentId: employee.departmentId,
        employeeId: employee.id,
      }
    );

    // Apply additional filters
    if (query.status) {
      queryBuilder.andWhere('objective.status = :status', { status: query.status });
    }

    if (query.level) {
      queryBuilder.andWhere('objective.level = :level', { level: query.level });
    }

    return queryBuilder.getMany();
  }

  async findObjectiveById(id: string, userId: string, organizationId: string): Promise<Objective> {
    const employee = await this.employeeRepository.findOne({
      where: { user: { id: userId }, organizationId },
      relations: ['department'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const objective = await this.objectiveRepository.findOne({
      where: { id },
      relations: ['owner', 'department', 'keyResults', 'category'],
    });

    if (!objective) {
      throw new NotFoundException('Objective not found');
    }

    // Check visibility
    const hasAccess = 
      objective.level === 'company' ||
      (objective.level === 'department' && objective.departmentId === employee.departmentId) ||
      (objective.level === 'individual' && objective.ownerId === employee.id);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this OKR');
    }

    return objective;
  }

  async updateObjective(id: string, updateObjectiveDto: UpdateObjectiveDto, userId: string, organizationId: string): Promise<Objective> {
    const objective = await this.objectiveRepository.findOne({
      where: { id },
      relations: ['owner', 'department', 'owner.user'],
    });

    if (!objective) {
      throw new NotFoundException('Objective not found');
    }

    // Check if user is the owner
    if (objective.owner?.user?.id !== userId) {
      throw new ForbiddenException('Only the creator can edit this OKR');
    }

    // Get the employee for notifications
    const employee = await this.employeeRepository.findOne({
      where: { user: { id: userId }, organizationId },
      relations: ['department', 'user'],
    });

    // Prevent circular parent-child relationships
    if (updateObjectiveDto.parentObjectiveId && updateObjectiveDto.parentObjectiveId === id) {
      throw new BadRequestException('An objective cannot be its own parent');
    }
    
    Object.assign(objective, updateObjectiveDto);
    const updatedObjective = await this.objectiveRepository.save(objective);

    // Send notifications for updates
    if (employee) {
      await this.sendOKRNotifications(updatedObjective, 'updated', employee, organizationId);
    }

    const result = await this.objectiveRepository.findOne({
      where: { id: updatedObjective.id },
      relations: ['owner', 'department', 'keyResults', 'category'],
    });

    if (!result) {
      throw new NotFoundException('Failed to retrieve updated objective');
    }

    return result;
  }

  async removeObjective(id: string, userId: string, organizationId: string): Promise<void> {
    const objective = await this.objectiveRepository.findOne({
      where: { id },
      relations: ['owner', 'department', 'owner.user'],
    });

    if (!objective) {
      throw new NotFoundException('Objective not found');
    }

    // Check if user is the owner
    if (objective.owner?.user?.id !== userId) {
      throw new ForbiddenException('Only the creator can delete this OKR');
    }

    // Get the employee for notifications
    const employee = await this.employeeRepository.findOne({
      where: { user: { id: userId }, organizationId },
      relations: ['department', 'user'],
    });

    // Send notifications before deletion
    if (employee) {
      await this.sendOKRNotifications(objective, 'deleted', employee, organizationId);
    }

    await this.objectiveRepository.remove(objective);
  }

  // Key Result methods
  async createKeyResult(createKeyResultDto: CreateKeyResultDto): Promise<KeyResult> {
    // Note: We skip objective verification for now since it requires user context
    // In a production system, you'd want to pass user context to verify access
    const keyResult = this.keyResultRepository.create(createKeyResultDto);
    return this.keyResultRepository.save(keyResult);
  }

  async findAllKeyResults(objectiveId: string): Promise<KeyResult[]> {
    return this.keyResultRepository.find({
      where: { objectiveId },
      relations: ['owner', 'objective', 'updates'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findKeyResultById(id: string): Promise<KeyResult> {
    const keyResult = await this.keyResultRepository.findOne({
      where: { id },
      relations: ['owner', 'objective', 'updates'],
    });

    if (!keyResult) {
      throw new NotFoundException(`Key Result with ID ${id} not found`);
    }

    return keyResult;
  }

  async updateKeyResult(id: string, updateKeyResultDto: UpdateKeyResultDto): Promise<KeyResult> {
    const keyResult = await this.findKeyResultById(id);
    
    // Create an update record if progress changes
    if (updateKeyResultDto.progress !== undefined && updateKeyResultDto.progress !== keyResult.progress) {
      await this.createUpdate({
        keyResultId: id,
        previousValue: keyResult.progress,
        newValue: updateKeyResultDto.progress,
        updatedById: updateKeyResultDto.updatedById || keyResult.ownerId,
        comment: updateKeyResultDto.updateComment,
      });
      
      // Update parent objective progress
      await this.updateObjectiveProgress(keyResult.objectiveId);
    }
    
    Object.assign(keyResult, updateKeyResultDto);
    return this.keyResultRepository.save(keyResult);
  }

  async removeKeyResult(id: string): Promise<void> {
    const keyResult = await this.findKeyResultById(id);
    
    // Delete associated updates
    await this.updateRepository.delete({ keyResultId: id });
    
    await this.keyResultRepository.delete(id);
    
    // Update parent objective progress
    await this.updateObjectiveProgress(keyResult.objectiveId);
  }

  // OKR Update methods
  async createUpdate(createOkrUpdateDto: CreateOkrUpdateDto): Promise<OkrUpdate> {
    const update = this.updateRepository.create(createOkrUpdateDto);
    return this.updateRepository.save(update);
  }

  async getUpdatesForKeyResult(keyResultId: string): Promise<OkrUpdate[]> {
    return this.updateRepository.find({
      where: { keyResultId },
      relations: ['updatedBy'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // OKR Category methods
  async createCategory(createOkrCategoryDto: CreateOkrCategoryDto): Promise<OkrCategory> {
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createOkrCategoryDto.name },
    });

    if (existingCategory) {
      throw new BadRequestException(`Category with name '${createOkrCategoryDto.name}' already exists`);
    }
    
    const category = this.categoryRepository.create(createOkrCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAllCategories(): Promise<OkrCategory[]> {
    return this.categoryRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findCategoryById(id: string): Promise<OkrCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['objectives'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async updateCategory(id: string, updateOkrCategoryDto: UpdateOkrCategoryDto): Promise<OkrCategory> {
    const category = await this.findCategoryById(id);
    
    // Check if name is being changed and if it already exists
    if (updateOkrCategoryDto.name && updateOkrCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: updateOkrCategoryDto.name },
      });

      if (existingCategory) {
        throw new BadRequestException(`Category with name '${updateOkrCategoryDto.name}' already exists`);
      }
    }
    
    Object.assign(category, updateOkrCategoryDto);
    return this.categoryRepository.save(category);
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.findCategoryById(id);
    
    // Check if category is being used by objectives
    if (category.objectives && category.objectives.length > 0) {
      throw new BadRequestException('Cannot delete category that is being used by objectives');
    }
    
    await this.categoryRepository.delete(id);
  }

  // Helper methods
  private async updateObjectiveProgress(objectiveId: string): Promise<void> {
    const objective = await this.objectiveRepository.findOne({
      where: { id: objectiveId },
      relations: ['parentObjective'],
    });
    
    if (!objective) {
      return; // Objective not found, skip update
    }
    
    const keyResults = await this.findAllKeyResults(objectiveId);
    
    if (keyResults.length === 0) {
      objective.progress = 0;
    } else {
      const totalProgress = keyResults.reduce((sum, kr) => sum + kr.progress, 0);
      objective.progress = Math.round(totalProgress / keyResults.length);
    }
    
    await this.objectiveRepository.save(objective);
    
    // Update parent objective if exists
    if (objective.parentObjectiveId) {
      await this.updateObjectiveProgress(objective.parentObjectiveId);
    }
  }

  async getAlignmentData(id: string): Promise<any> {
    const objective = await this.objectiveRepository.findOne({
      where: { id },
      relations: ['parentObjective', 'childObjectives', 'keyResults'],
    });

    if (!objective) {
      throw new NotFoundException('Objective not found');
    }

    return {
      objective,
      parent: objective.parentObjective,
      children: objective.childObjectives,
      keyResults: objective.keyResults,
    };
  }

  async getTeamProgress(managerId: string): Promise<any> {
    // Get all objectives owned by the manager's team
    const objectives = await this.objectiveRepository
      .createQueryBuilder('objective')
      .leftJoinAndSelect('objective.owner', 'owner')
      .leftJoinAndSelect('owner.manager', 'manager')
      .where('manager.id = :managerId', { managerId })
      .orWhere('objective.ownerId = :managerId', { managerId })
      .getMany();
    
    const objectiveIds = objectives.map(o => o.id);
    
    // Get all key results for these objectives
    const keyResults = await this.keyResultRepository.find({
      where: { objectiveId: In(objectiveIds) },
      relations: ['owner'],
    });
    
    // Group by owner
    const teamProgress: Record<string, any> = {};
    
    for (const kr of keyResults) {
      const ownerId = kr.owner?.id || 'unassigned';
      const ownerName = kr.owner?.fullName || 'Unassigned';
      
      if (!teamProgress[ownerId]) {
        teamProgress[ownerId] = {
          id: ownerId,
          name: ownerName,
          totalKeyResults: 0,
          completedKeyResults: 0,
          averageProgress: 0,
        };
      }
      
      teamProgress[ownerId].totalKeyResults++;
      if (kr.progress === 100) {
        teamProgress[ownerId].completedKeyResults++;
      }
      teamProgress[ownerId].averageProgress += kr.progress;
    }
    
    // Calculate averages
    Object.values(teamProgress).forEach((member: any) => {
      if (member.totalKeyResults > 0) {
        member.averageProgress = Math.round(member.averageProgress / member.totalKeyResults);
      }
    });
    
    return Object.values(teamProgress);
  }

  async findByEmployee(employeeId: string): Promise<Objective[]> {
    return this.objectiveRepository.find({
      where: { ownerId: employeeId },
      relations: ['owner', 'department', 'keyResults', 'category'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // Send notifications based on OKR level and action
  private async sendOKRNotifications(objective: Objective, action: 'created' | 'updated' | 'deleted', actor: Employee, organizationId: string): Promise<void> {
    const actionText = action === 'created' ? 'created' : action === 'updated' ? 'updated' : 'deleted';
    const message = `${actor.firstName} ${actor.lastName} ${actionText} an OKR: "${objective.title}"`;

    try {
      if (objective.level === 'company') {
        // Notify all users in the organization
        const allEmployees = await this.employeeRepository.find({
          where: { organizationId },
          relations: ['user'],
        });

        for (const employee of allEmployees) {
          if (employee.user?.id && employee.user.id !== actor.user?.id) {
            await this.notificationsService.sendNotificationToUser(employee.user.id, {
              type: 'okr_update' as any,
              title: `Company OKR ${actionText}`,
              message,
              data: { okrId: objective.id, level: objective.level, action },
            });
          }
        }
      } else if (objective.level === 'department' && objective.departmentId) {
        // Notify all users in the department
        const departmentEmployees = await this.employeeRepository.find({
          where: { departmentId: objective.departmentId, organizationId },
          relations: ['user'],
        });

        for (const employee of departmentEmployees) {
          if (employee.user?.id && employee.user.id !== actor.user?.id) {
            await this.notificationsService.sendNotificationToUser(employee.user.id, {
              type: 'okr_update' as any,
              title: `Department OKR ${actionText}`,
              message,
              data: { okrId: objective.id, level: objective.level, action },
            });
          }
        }
      }
      // Personal OKRs don't send notifications to others
    } catch (error) {
      console.error('Failed to send OKR notifications:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }
} 