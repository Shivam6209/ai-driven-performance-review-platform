import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { Invitation, InvitationStatus } from '../invitations/entities/invitation.entity';

export interface CreateOrganizationDto {
  name: string;
  domain: string;
}

export interface OrganizationStats {
  totalEmployees: number;
  totalInvitations: number;
  pendingInvitations: number;
  totalDepartments: number;
}

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    const organization = this.organizationRepository.create(createOrganizationDto);
    return this.organizationRepository.save(organization);
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationRepository.find();
  }

  async findOne(id: string): Promise<Organization | null> {
    return this.organizationRepository.findOne({ where: { id } });
  }

  async findByDomain(domain: string): Promise<Organization | null> {
    return this.organizationRepository.findOne({ where: { domain } });
  }

  async update(id: string, updateData: Partial<CreateOrganizationDto>): Promise<Organization> {
    await this.organizationRepository.update(id, updateData);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new Error('Organization not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.organizationRepository.delete(id);
  }

  async getOrganizationStats(organizationId: string): Promise<OrganizationStats> {
    const [totalEmployees, totalInvitations, pendingInvitations, totalDepartments] = await Promise.all([
      this.employeeRepository.count({ where: { organizationId } }),
      this.invitationRepository.count({ where: { organizationId } }),
      this.invitationRepository.count({ where: { organizationId, status: InvitationStatus.PENDING } }),
      this.departmentRepository.count({ where: { organizationId } }),
    ]);

    return {
      totalEmployees,
      totalInvitations,
      pendingInvitations,
      totalDepartments,
    };
  }
} 