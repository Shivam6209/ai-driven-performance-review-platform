import { IsEmail, IsNotEmpty, IsString, IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  employeeCode!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  jobTitle?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsUUID()
  @IsOptional()
  managerId?: string;

  @IsUUID()
  @IsOptional()
  organizationId?: string;

  @IsDateString()
  @IsOptional()
  hireDate?: string;

  @IsEnum(['active', 'inactive', 'terminated'])
  @IsOptional()
  employmentStatus?: 'active' | 'inactive' | 'terminated' = 'active';

  @IsString()
  @IsOptional()
  timezone?: string;
} 