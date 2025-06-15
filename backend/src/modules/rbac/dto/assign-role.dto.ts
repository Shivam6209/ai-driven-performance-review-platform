import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsDateString, IsObject } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ description: 'Role ID to assign' })
  @IsUUID()
  @IsNotEmpty()
  roleId!: string;

  @ApiProperty({ description: 'Employee ID to assign role to' })
  @IsUUID()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty({ description: 'Additional scope data for the role assignment', required: false })
  @IsObject()
  @IsOptional()
  scope?: Record<string, any>;

  @ApiProperty({ description: 'Context type (e.g., "department", "team", "project")', required: false })
  @IsString()
  @IsOptional()
  contextType?: string;

  @ApiProperty({ description: 'Context ID (e.g., department ID, team ID)', required: false })
  @IsUUID('4')
  @IsOptional()
  contextId?: string;

  @ApiProperty({ description: 'Date from which the role assignment is valid', required: false })
  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @ApiProperty({ description: 'Date until which the role assignment is valid', required: false })
  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @ApiProperty({ description: 'ID of the employee who granted this role', required: false })
  @IsUUID('4')
  @IsOptional()
  grantedBy?: string;
} 