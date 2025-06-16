import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { Employee } from '../employees/entities/employee.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto, organizationId: string): Promise<Department> {
    // Check if department with same name already exists in the organization
    const existingDepartment = await this.departmentRepository.findOne({
      where: { 
        name: createDepartmentDto.name,
        organization: { id: organizationId }
      },
    });

    if (existingDepartment) {
      throw new BadRequestException(`Department with name '${createDepartmentDto.name}' already exists`);
    }

    const department = this.departmentRepository.create({
      ...createDepartmentDto,
      organization: { id: organizationId }
    });
    return this.departmentRepository.save(department);
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



  async findAll(organizationId: string, userRole: string, userId: string): Promise<any[]> {
    let departments: Department[];

    if (userRole === 'admin') {
      // Admin can see all departments
      departments = await this.departmentRepository.find({
        where: { organization: { id: organizationId } },
        relations: ['manager', 'hrPersonnel', 'employees'],
      });
    } else if (userRole === 'hr') {
      // HR can see departments they're assigned to
      departments = await this.departmentRepository.find({
        where: { 
          organization: { id: organizationId },
          hrPersonnel: { id: userId }
        },
        relations: ['manager', 'hrPersonnel', 'employees'],
      });
    } else if (userRole === 'manager') {
      // Manager can see their department
      departments = await this.departmentRepository.find({
        where: { 
          organization: { id: organizationId },
          manager: { id: userId }
        },
        relations: ['manager', 'hrPersonnel', 'employees'],
      });
    } else {
      // Employees can see their department
      const employee = await this.employeeRepository.findOne({
        where: { user: { id: userId } },
        relations: ['department'],
      });
      
      if (employee?.department) {
        const dept = await this.departmentRepository.findOne({
          where: { id: employee.department.id },
          relations: ['manager', 'hrPersonnel', 'employees'],
        });
        departments = dept ? [dept] : [];
      } else {
        departments = [];
      }
    }

    // Format the response
    return departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      description: dept.description,
      managerId: dept.manager?.id,
      managerName: dept.manager ? `${dept.manager.firstName} ${dept.manager.lastName}` : null,
      hrIds: dept.hrPersonnel?.map(hr => hr.id) || [],
      hrNames: dept.hrPersonnel?.map(hr => `${hr.firstName} ${hr.lastName}`) || [],
      employeeCount: dept.employees?.length || 0,
      createdAt: dept.createdAt,
    }));
  }

  async findOne(id: string, organizationId: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { 
        id,
        organization: { id: organizationId }
      },
      relations: ['parentDepartment', 'childDepartments', 'manager', 'employees', 'hrPersonnel'],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto, organizationId: string): Promise<Department> {
    const department = await this.findOne(id, organizationId);

    // If name is being updated, check if it's already in use
    if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
      const existingDepartment = await this.departmentRepository.findOne({
        where: { 
          name: updateDepartmentDto.name,
          organization: { id: organizationId }
        },
      });

      if (existingDepartment) {
        throw new BadRequestException(`Department with name '${updateDepartmentDto.name}' already exists`);
      }
    }

    Object.assign(department, updateDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const department = await this.findOne(id, organizationId);
    
    // Check if department has employees
    if (department.employees && department.employees.length > 0) {
      throw new BadRequestException('Cannot delete department with assigned employees');
    }

    const result = await this.departmentRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
  }

  async assignRoles(departmentId: string, assignRolesDto: AssignRolesDto, _adminId: string, organizationId: string): Promise<void> {
    const department = await this.findOne(departmentId, organizationId);

    // Handle manager assignment
    if (assignRolesDto.managerId) {
      const manager = await this.employeeRepository.findOne({
        where: { 
          id: assignRolesDto.managerId,
          role: 'manager',
          organization: { id: organizationId }
        },
        relations: ['user'],
      });

      if (!manager) {
        throw new NotFoundException('Manager not found');
      }

      // Check if manager is already assigned to another department
      const existingAssignment = await this.departmentRepository.findOne({
        where: { 
          manager: { id: assignRolesDto.managerId },
          organization: { id: organizationId }
        },
      });

      if (existingAssignment && existingAssignment.id !== departmentId) {
        throw new BadRequestException('Manager is already assigned to another department');
      }

      department.manager = manager;

      // Send notification to manager
      if (manager.user) {
        await this.notificationsService.sendNotificationToUser(manager.user.id, {
          type: 'user_joined',
          title: '🎯 Department Assignment',
          message: `You have been assigned as manager of ${department.name} department.`,
          data: {
            departmentId: department.id,
            departmentName: department.name,
            action: 'manager_assigned'
          }
        });
      }
    } else {
      department.manager = undefined;
    }

    // Handle HR assignments
    if (assignRolesDto.hrIds && assignRolesDto.hrIds.length > 0) {
      const hrPersonnel = await this.employeeRepository.find({
        where: { 
          id: { $in: assignRolesDto.hrIds } as any,
          role: 'hr',
          organization: { id: organizationId }
        },
        relations: ['user'],
      });

      if (hrPersonnel.length !== assignRolesDto.hrIds.length) {
        throw new NotFoundException('Some HR personnel not found');
      }

      department.hrPersonnel = hrPersonnel;

      // Send notifications to HR personnel
      for (const hr of hrPersonnel) {
        if (hr.user) {
          await this.notificationsService.sendNotificationToUser(hr.user.id, {
            type: 'user_joined',
            title: '🏢 Department Assignment',
            message: `You have been assigned to ${department.name} department as HR personnel.`,
            data: {
              departmentId: department.id,
              departmentName: department.name,
              action: 'hr_assigned'
            }
          });
        }
      }
    } else {
      department.hrPersonnel = [];
    }

    await this.departmentRepository.save(department);
  }

  async getDepartmentEmployees(departmentId: string, organizationId: string, userRole: string, userId: string): Promise<Employee[]> {
    // Check if user has access to this department
    const hasAccess = await this.checkDepartmentAccess(departmentId, organizationId, userRole, userId);
    
    if (!hasAccess) {
      throw new BadRequestException('You do not have access to this department');
    }

    return this.employeeRepository.find({
      where: { 
        department: { id: departmentId },
        organization: { id: organizationId }
      },
      relations: ['user', 'department'],
    });
  }

  private async checkDepartmentAccess(departmentId: string, organizationId: string, userRole: string, userId: string): Promise<boolean> {
    if (userRole === 'admin') {
      return true;
    }

    const department = await this.departmentRepository.findOne({
      where: { 
        id: departmentId,
        organization: { id: organizationId }
      },
      relations: ['manager', 'hrPersonnel'],
    });

    if (!department) {
      return false;
    }

    if (userRole === 'manager' && department.manager?.id === userId) {
      return true;
    }

    if (userRole === 'hr' && department.hrPersonnel?.some(hr => hr.id === userId)) {
      return true;
    }

    return false;
  }
} 