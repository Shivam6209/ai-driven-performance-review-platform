import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    // Check if department with same name already exists
    const existingDepartment = await this.departmentRepository.findOne({
      where: { name: createDepartmentDto.name },
    });

    if (existingDepartment) {
      throw new BadRequestException(`Department with name '${createDepartmentDto.name}' already exists`);
    }

    const department = this.departmentRepository.create(createDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async findAll(): Promise<Department[]> {
    return this.departmentRepository.find({
      relations: ['parentDepartment', 'childDepartments', 'head', 'employees'],
    });
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['parentDepartment', 'childDepartments', 'head', 'employees'],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findOne(id);

    // If name is being updated, check if it's already in use
    if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
      const existingDepartment = await this.departmentRepository.findOne({
        where: { name: updateDepartmentDto.name },
      });

      if (existingDepartment) {
        throw new BadRequestException(`Department with name '${updateDepartmentDto.name}' already exists`);
      }
    }

    // Check for circular parent-child relationship
    if (updateDepartmentDto.parentDepartmentId) {
      await this.validateParentDepartment(id, updateDepartmentDto.parentDepartmentId);
    }

    Object.assign(department, updateDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async remove(id: string): Promise<void> {
    // Check if department has child departments
    const department = await this.findOne(id);
    
    if (department.childDepartments && department.childDepartments.length > 0) {
      throw new BadRequestException('Cannot delete department with child departments');
    }

    // Check if department has employees
    if (department.employees && department.employees.length > 0) {
      throw new BadRequestException('Cannot delete department with assigned employees');
    }

    const result = await this.departmentRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
  }

  async getHierarchy(): Promise<any[]> {
    const departments = await this.departmentRepository.find({
      relations: ['parentDepartment', 'childDepartments', 'head'],
      order: { name: 'ASC' },
    });

    const buildHierarchy = (departments: Department[]): any[] => {
      return departments.map(dept => {
        const children = departments.filter(d => d.parentDepartment?.id === dept.id);
        return {
          ...dept,
          children: children.length > 0 ? buildHierarchy(children) : [],
        };
      }).filter(dept => !dept.parentDepartment); // Only return root departments
    };

    return buildHierarchy(departments);
  }

  private async validateParentDepartment(departmentId: string, parentId: string): Promise<void> {
    if (departmentId === parentId) {
      throw new BadRequestException('Department cannot be its own parent');
    }

    // Check for circular references in the hierarchy
    const checkCircularReference = async (currentId: string, targetId: string): Promise<boolean> => {
      if (currentId === targetId) {
        return true;
      }

      const department = await this.departmentRepository.findOne({
        where: { id: currentId },
        relations: ['childDepartments'],
      });

      if (!department || !department.childDepartments || department.childDepartments.length === 0) {
        return false;
      }

      for (const child of department.childDepartments) {
        if (await checkCircularReference(child.id, targetId)) {
          return true;
        }
      }

      return false;
    };

    if (await checkCircularReference(parentId, departmentId)) {
      throw new BadRequestException('Circular department hierarchy detected');
    }
  }
} 