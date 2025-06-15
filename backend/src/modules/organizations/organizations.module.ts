import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, Employee, Department, Invitation])],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {} 