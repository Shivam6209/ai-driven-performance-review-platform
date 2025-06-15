import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUUID, IsArray } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: 'Role name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Role description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Array of permission IDs', type: [String], required: false })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  permissionIds?: string[];

  @ApiProperty({ description: 'Parent role ID for inheritance', required: false })
  @IsUUID('4')
  @IsOptional()
  parent_role_id?: string;

  @IsBoolean()
  @IsOptional()
  is_system_role?: boolean;

  @IsBoolean()
  @IsOptional()
  is_custom?: boolean;
} 