import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RoleAssignment } from './entities/role-assignment.entity';
import { Employee } from '../employees/entities/employee.entity';
import { RbacGuard } from './guards/rbac.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission, RoleAssignment, Employee]),
  ],
  controllers: [RbacController],
  providers: [RbacService, RbacGuard],
  exports: [RbacService, RbacGuard],
})
export class RbacModule {} 