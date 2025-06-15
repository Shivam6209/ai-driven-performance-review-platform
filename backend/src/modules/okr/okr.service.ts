import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
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
  ) {}

  // Objective methods
  async createObjective(createObjectiveDto: CreateObjectiveDto): Promise<Objective> {
    const objective = this.objectiveRepository.create(createObjectiveDto);
    return this.objectiveRepository.save(objective);
  }

  async findAllObjectives(query: any = {}): Promise<Objective[]> {
    const where: any = {};
    
    if (query.ownerId) {
      where.ownerId = query.ownerId;
    }
    
    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }
    
    if (query.level) {
      where.level = query.level;
    }
    
    if (query.status) {
      where.status = query.status;
    }
    
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    
    if (query.isArchived !== undefined) {
      where.isArchived = query.isArchived;
    }
    
    if (query.startDate && query.endDate) {
      where.startDate = Between(new Date(query.startDate), new Date(query.endDate));
    }
    
    return this.objectiveRepository.find({
      where,
      relations: ['owner', 'department', 'parentObjective', 'childObjectives', 'keyResults', 'category'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findObjectiveById(id: string): Promise<Objective> {
    const objective = await this.objectiveRepository.findOne({
      where: { id },
      relations: ['owner', 'department', 'parentObjective', 'childObjectives', 'keyResults', 'category'],
    });

    if (!objective) {
      throw new NotFoundException(`Objective with ID ${id} not found`);
    }

    return objective;
  }

  async updateObjective(id: string, updateObjectiveDto: UpdateObjectiveDto): Promise<Objective> {
    const objective = await this.findObjectiveById(id);
    
    // Prevent circular parent-child relationships
    if (updateObjectiveDto.parentObjectiveId && updateObjectiveDto.parentObjectiveId === id) {
      throw new BadRequestException('An objective cannot be its own parent');
    }
    
    Object.assign(objective, updateObjectiveDto);
    return this.objectiveRepository.save(objective);
  }

  async removeObjective(id: string): Promise<void> {
    const objective = await this.findObjectiveById(id);
    
    // Check if objective has child objectives
    if (objective.childObjectives && objective.childObjectives.length > 0) {
      throw new BadRequestException('Cannot delete objective with child objectives');
    }
    
    // Delete associated key results
    if (objective.keyResults && objective.keyResults.length > 0) {
      await this.keyResultRepository.delete({ objectiveId: id });
    }
    
    await this.objectiveRepository.delete(id);
  }

  // Key Result methods
  async createKeyResult(createKeyResultDto: CreateKeyResultDto): Promise<KeyResult> {
    // Verify objective exists
    await this.findObjectiveById(createKeyResultDto.objectiveId);
    
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
  async createCategory(createCategoryDto: CreateOkrCategoryDto): Promise<OkrCategory> {
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new BadRequestException(`Category with name '${createCategoryDto.name}' already exists`);
    }
    
    const category = this.categoryRepository.create(createCategoryDto);
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

  async updateCategory(id: string, updateCategoryDto: UpdateOkrCategoryDto): Promise<OkrCategory> {
    const category = await this.findCategoryById(id);
    
    // Check if name is being changed and if it already exists
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name },
      });

      if (existingCategory) {
        throw new BadRequestException(`Category with name '${updateCategoryDto.name}' already exists`);
      }
    }
    
    Object.assign(category, updateCategoryDto);
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
    const objective = await this.findObjectiveById(objectiveId);
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

  async getAlignmentData(objectiveId: string): Promise<any> {
    const objective = await this.findObjectiveById(objectiveId);
    
    // Get all parent objectives up the chain
    const parents = [];
    let currentParentId = objective.parentObjectiveId;
    
    while (currentParentId) {
      const parent = await this.findObjectiveById(currentParentId);
      parents.unshift({
        id: parent.id,
        title: parent.title,
        progress: parent.progress,
        level: parent.level,
      });
      currentParentId = parent.parentObjectiveId;
    }
    
    // Get all child objectives down the chain
    const getChildren = async (parentId: string): Promise<any[]> => {
      const children = await this.objectiveRepository.find({
        where: { parentObjectiveId: parentId },
        relations: ['owner'],
      });
      
      const result = [];
      
      for (const child of children) {
        result.push({
          id: child.id,
          title: child.title,
          progress: child.progress,
          level: child.level,
          owner: child.owner ? {
            id: child.owner.id,
            name: child.owner.fullName,
          } : null,
          children: await getChildren(child.id),
        });
      }
      
      return result;
    };
    
    const children = await getChildren(objectiveId);
    
    return {
      objective: {
        id: objective.id,
        title: objective.title,
        progress: objective.progress,
        level: objective.level,
      },
      parents,
      children,
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
} 