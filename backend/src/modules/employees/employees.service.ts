import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { User } from '../auth/entities/user.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto, organizationId?: string): Promise<Employee> {
    // Check if email already exists within the organization
    const where: FindOptionsWhere<Employee> = { email: createEmployeeDto.email };
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const existingEmployee = await this.employeeRepository.findOne({ where });

    if (existingEmployee) {
      throw new BadRequestException('Employee with this email already exists');
    }

    const employeeData = { ...createEmployeeDto };
    if (organizationId) {
      employeeData.organizationId = organizationId;
    }

    const employee = this.employeeRepository.create(employeeData);
    return this.employeeRepository.save(employee);
  }

  async findAll(query: any = {}, organizationId?: string): Promise<Employee[]> {
    const where: FindOptionsWhere<Employee> = {};
    
    // Always filter by organization if provided
    if (organizationId) {
      where.organizationId = organizationId;
    }
    
    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }
    
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }
    
    return this.employeeRepository.find({
      where,
      relations: ['department', 'manager', 'directReports'],
    });
  }

  async findOne(id: string, organizationId?: string): Promise<Employee> {
    const where: FindOptionsWhere<Employee> = { id };
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const employee = await this.employeeRepository.findOne({
      where,
      relations: ['department', 'manager', 'directReports'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async findByEmail(email: string, organizationId?: string): Promise<Employee> {
    const where: FindOptionsWhere<Employee> = { email };
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const employee = await this.employeeRepository.findOne({ where });

    if (!employee) {
      throw new NotFoundException(`Employee with email ${email} not found`);
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto, organizationId?: string): Promise<Employee> {
    const employee = await this.findOne(id, organizationId);
    
    // If email is being updated, check if it's already in use within the organization
    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const where: FindOptionsWhere<Employee> = { email: updateEmployeeDto.email };
      if (organizationId) {
        where.organizationId = organizationId;
      }

      const existingEmployee = await this.employeeRepository.findOne({ where });

      if (existingEmployee) {
        throw new BadRequestException('Email already in use by another employee');
      }
    }

    Object.assign(employee, updateEmployeeDto);
    return this.employeeRepository.save(employee);
  }

  async remove(id: string, organizationId?: string): Promise<void> {
    const where: FindOptionsWhere<Employee> = { id };
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const result = await this.employeeRepository.delete(where);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
  }

  async getDirectReports(managerId: string, organizationId?: string): Promise<Employee[]> {
    const where: FindOptionsWhere<Employee> = { managerId };
    if (organizationId) {
      where.organizationId = organizationId;
    }

    return this.employeeRepository.find({
      where,
      relations: ['department'],
    });
  }

  async getTeamMembers(managerId: string, organizationId?: string): Promise<Employee[]> {
    // Get all direct reports
    const directReports = await this.getDirectReports(managerId, organizationId);
    
    // Get all indirect reports (reports of direct reports)
    const allTeamMembers = [...directReports];
    
    for (const report of directReports) {
      const indirectReports = await this.getDirectReports(report.id, organizationId);
      allTeamMembers.push(...indirectReports);
    }
    
    return allTeamMembers;
  }

  async getDepartmentEmployees(departmentId: string, organizationId?: string): Promise<Employee[]> {
    const where: FindOptionsWhere<Employee> = { departmentId };
    if (organizationId) {
      where.organizationId = organizationId;
    }

    return this.employeeRepository.find({
      where,
      relations: ['manager'],
    });
  }

  async findByUserId(userId: string, organizationId?: string): Promise<Employee> {
    // First find the user to get the employeeId
    const userWhere: FindOptionsWhere<User> = { id: userId };
    if (organizationId) {
      userWhere.organizationId = organizationId;
    }

    const user = await this.userRepository.findOne({ where: userWhere });

    if (!user || !user.employeeId) {
      throw new NotFoundException(`No employee found for user ID ${userId}`);
    }

    return this.findOne(user.employeeId, organizationId);
  }
} 