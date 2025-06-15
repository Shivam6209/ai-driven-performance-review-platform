import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterAdminDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: 'admin@company.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  @IsNotEmpty()
  organizationName!: string;

  @ApiProperty({ example: 'HR Director' })
  @IsString()
  @IsNotEmpty()
  jobTitle!: string;
} 