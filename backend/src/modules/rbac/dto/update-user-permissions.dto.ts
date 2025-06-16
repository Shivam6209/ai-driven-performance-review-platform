import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserPermissionDto {
  @ApiProperty({ description: 'Resource name' })
  @IsString()
  resource!: string;

  @ApiProperty({ description: 'Action name' })
  @IsString()
  action!: string;

  @ApiProperty({ description: 'Whether the permission is granted', default: true })
  @IsOptional()
  granted?: boolean;
}

export class UpdateUserPermissionsDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsString()
  employeeId!: string;

  @ApiProperty({ 
    description: 'Array of permissions to update',
    type: [UserPermissionDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserPermissionDto)
  permissions!: UserPermissionDto[];
} 