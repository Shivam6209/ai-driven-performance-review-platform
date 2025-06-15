import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { Employee } from './entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, Department, User]),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {} 