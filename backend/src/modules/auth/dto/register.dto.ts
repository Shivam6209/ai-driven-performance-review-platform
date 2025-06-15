import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.EMPLOYEE;

  @IsString()
  @IsOptional()
  jobTitle?: string;

  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsUUID()
  @IsOptional()
  managerId?: string;
} 