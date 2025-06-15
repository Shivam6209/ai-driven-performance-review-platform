import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({ description: 'Role name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

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
  parentRoleId?: string;
} 