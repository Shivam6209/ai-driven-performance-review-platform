import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AssignDepartmentDto {
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @IsOptional()
  @IsString()
  departmentId?: string; // null to remove from department
} 