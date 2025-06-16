import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, IsNull, Not } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AssignDepartmentDto } from './dto/assign-department.dto';
import { UserRole } from '../auth/enums/user-role.enum';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    private notificationsService: NotificationsService,
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

  async findAll(organizationId?: string, userRole?: string, userId?: string, departmentId?: string): Promise<Employee[]> {
    if (!organizationId) {
      return [];
    }

    // Role-based filtering logic
    if (userRole === UserRole.ADMIN) {
      // Admin sees all users from organization EXCEPT other admin users
      let where: FindOptionsWhere<Employee> = { 
        organizationId,
        role: Not(UserRole.ADMIN) // Exclude admin users from employee management
      };
      
      if (departmentId) {
        where.departmentId = departmentId;
      }

      return this.employeeRepository.find({
        where,
        relations: ['department', 'manager', 'directReports'],
      });
    } else if (userRole === UserRole.HR && userId) {
      // HR sees employees from their assigned departments only
      // First, find the HR employee record using the User ID
      const hrEmployee = await this.findByUserId(userId, organizationId);
      
      if (!hrEmployee) {
        return []; // HR employee not found
      }

      // Get HR employee with department relations
      const hrEmployeeWithDepts = await this.employeeRepository.findOne({
        where: { id: hrEmployee.id, organizationId },
        relations: ['hrDepartments'],
      });

      if (!hrEmployeeWithDepts || !hrEmployeeWithDepts.hrDepartments?.length) {
        return []; // HR has no assigned departments
      }

      const departmentIds = hrEmployeeWithDepts.hrDepartments.map(dept => dept.id);
      // Use query builder for IN clause and exclude admin users
      return this.employeeRepository
        .createQueryBuilder('employee')
        .leftJoinAndSelect('employee.department', 'department')
        .leftJoinAndSelect('employee.manager', 'manager')
        .where('employee.organizationId = :organizationId', { organizationId })
        .andWhere('employee.departmentId IN (:...departmentIds)', { departmentIds })
        .andWhere('employee.role != :adminRole', { adminRole: UserRole.ADMIN })
        .getMany();
    } else if (userRole === UserRole.MANAGER && userId) {
      // Manager sees only their department employees
      // First, find the Manager employee record using the User ID
      const managerEmployee = await this.findByUserId(userId, organizationId);
      
      if (!managerEmployee || !managerEmployee.departmentId) {
        return []; // Manager has no department
      }

      let where: FindOptionsWhere<Employee> = { 
        organizationId,
        departmentId: managerEmployee.departmentId,
        role: Not(UserRole.ADMIN) // Exclude admin users
      };

      return this.employeeRepository.find({
        where,
        relations: ['department', 'manager', 'directReports'],
      });
    }

    // Default: return empty array for other roles
    return [];
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
    // Find employee by user relationship
    const employees = await this.employeeRepository.find({
      where: { organizationId },
      relations: ['user'],
    });

    const employee_found = employees.find(emp => emp.user?.id === userId);

    if (!employee_found) {
      throw new NotFoundException(`No employee found for user ID ${userId}`);
    }

    // Automatically sync role before returning
    await this.syncEmployeeRoleWithUser(employee_found.id);

    return this.findOne(employee_found.id, organizationId);
  }

  async getUnassignedEmployees(organizationId?: string, userRole?: string): Promise<Employee[]> {
    if (!organizationId) {
      throw new BadRequestException('Organization ID is required');
    }

    // Only Admin can see unassigned employees
    if (userRole !== UserRole.ADMIN) {
      return [];
    }

    let where: FindOptionsWhere<Employee> = {
      organizationId,
      departmentId: IsNull(),
      role: Not(UserRole.ADMIN), // Exclude admin users, include all other roles (HR, Manager, Employee)
    };

    return this.employeeRepository.find({
      where,
      relations: ['department'],
    });
  }

  async assignDepartment(
    assignDepartmentDto: AssignDepartmentDto,
    userRole?: string,
    userId?: string,
    organizationId?: string
  ): Promise<Employee> {
    if (!organizationId) {
      throw new BadRequestException('Organization ID is required');
    }

    const { employeeId, departmentId } = assignDepartmentDto;

    // Find the employee to be assigned (with user relation to get user ID)
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId, organizationId },
      relations: ['department', 'user'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Find the person performing the assignment (for notification)
    const assigningUser = userId ? await this.findByUserId(userId, organizationId) : null;

    // Validate permissions based on user role
    if (userRole === UserRole.HR && userId) {
      // Get the HR employee record first
      const hrEmployee = await this.findByUserId(userId, organizationId);
      await this.validateHRPermissions(hrEmployee.id, departmentId, organizationId);
      
      // HR cannot assign managers
      if (employee.role === UserRole.MANAGER) {
        throw new ForbiddenException('HR cannot assign managers to departments');
      }
    }

    let department = null;
    const previousDepartment = employee.department;

    // If assigning to a department
    if (departmentId) {
      department = await this.departmentRepository.findOne({
        where: { id: departmentId, organizationId },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }

      // Check if employee/manager already has a department (they can only have one)
      if (employee.departmentId && (employee.role === UserRole.EMPLOYEE || employee.role === UserRole.MANAGER)) {
        throw new BadRequestException(`${employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}s can only be assigned to one department. Please remove from current department first.`);
      }

      employee.departmentId = departmentId;
    } else {
      // Removing from department
      employee.departmentId = undefined;
    }

    const updatedEmployee = await this.employeeRepository.save(employee);

    // Send notification to the employee (if they have a user account)
    if (employee.user?.id) {
      const assignedByName = assigningUser ? `${assigningUser.firstName} ${assigningUser.lastName}` : 'System Admin';
      
      if (departmentId && department) {
        // Assignment notification
        await this.notificationsService.sendDepartmentAssignedNotification(
          employee.user.id,
          department.name,
          assignedByName
        );
      } else if (previousDepartment) {
        // Removal notification
        await this.notificationsService.sendDepartmentRemovedNotification(
          employee.user.id,
          previousDepartment.name,
          assignedByName
        );
      }
    }

    return updatedEmployee;
  }

  async removeFromDepartment(
    employeeId: string,
    userRole?: string,
    userId?: string,
    organizationId?: string
  ): Promise<Employee> {
    if (!organizationId) {
      throw new BadRequestException('Organization ID is required');
    }

    // Find the employee (with user relation to get user ID)
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId, organizationId },
      relations: ['department', 'user'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Find the person performing the removal (for notification)
    const removingUser = userId ? await this.findByUserId(userId, organizationId) : null;

    // Validate permissions - Manager can only remove from their own department
    if (userRole === UserRole.MANAGER && userId) {
      const managerEmployee = await this.findByUserId(userId, organizationId);

      if (!managerEmployee || managerEmployee.departmentId !== employee.departmentId) {
        throw new ForbiddenException('You can only remove employees from your own department');
      }
    }

    const previousDepartment = employee.department;
    employee.departmentId = undefined;

    const updatedEmployee = await this.employeeRepository.save(employee);

    // Send notification to the employee (if they have a user account)
    if (employee.user?.id && previousDepartment) {
      const removedByName = removingUser ? `${removingUser.firstName} ${removingUser.lastName}` : 'System Admin';
      
      await this.notificationsService.sendDepartmentRemovedNotification(
        employee.user.id,
        previousDepartment.name,
        removedByName
      );
    }

    return updatedEmployee;
  }

  private async validateHRPermissions(userId: string, departmentId: string | undefined, organizationId: string): Promise<void> {
    if (!departmentId) return; // No validation needed for removal

    const hrEmployee = await this.employeeRepository.findOne({
      where: { id: userId, organizationId },
      relations: ['hrDepartments'],
    });

    if (!hrEmployee) {
      throw new NotFoundException('HR employee not found');
    }

    const hasPermission = hrEmployee.hrDepartments?.some(dept => dept.id === departmentId);
    if (!hasPermission) {
      throw new ForbiddenException('You can only assign employees to your assigned departments');
    }
  }

  /**
   * Synchronize Employee role with User role
   * This ensures Employee.role matches User.role
   */
  async syncEmployeeRoleWithUser(employeeId: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
      relations: ['user'],
    });

    if (!employee || !employee.user) {
      throw new NotFoundException('Employee or associated user not found');
    }

    // Map User role to Employee role
    const userRole = employee.user.role;
    let employeeRole: 'admin' | 'hr' | 'manager' | 'employee';

    switch (userRole) {
      case UserRole.ADMIN:
        employeeRole = 'admin';
        break;
      case UserRole.HR:
        employeeRole = 'hr';
        break;
      case UserRole.MANAGER:
        employeeRole = 'manager';
        break;
      case UserRole.EMPLOYEE:
        employeeRole = 'employee';
        break;
      default:
        employeeRole = 'employee';
    }

    // Update employee role if it doesn't match
    if (employee.role !== employeeRole) {
      employee.role = employeeRole;
      await this.employeeRepository.save(employee);
      console.log(`✅ Synced role for ${employee.email}: ${userRole} -> ${employeeRole}`);
    }

    return employee;
  }

  /**
   * Sync all employee roles with their user roles
   * This is a utility method to fix existing data
   */
  async syncAllEmployeeRoles(organizationId?: string): Promise<void> {
    const where: FindOptionsWhere<Employee> = {};
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const employees = await this.employeeRepository.find({
      where,
      relations: ['user'],
    });

    console.log(`🔄 Syncing roles for ${employees.length} employees...`);

    for (const employee of employees) {
      if (employee.user) {
        await this.syncEmployeeRoleWithUser(employee.id);
      }
    }

    console.log('✅ All employee roles synchronized');
  }
} 