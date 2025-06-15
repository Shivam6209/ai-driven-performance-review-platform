import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.EMPLOYEE;
} 