import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ description: 'Permission name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Permission description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Resource this permission applies to (e.g., "feedback", "okr", "review")' })
  @IsString()
  @IsNotEmpty()
  resource!: string;

  @ApiProperty({ description: 'Action this permission allows (e.g., "read", "write", "delete")' })
  @IsString()
  @IsNotEmpty()
  action!: string;
} 